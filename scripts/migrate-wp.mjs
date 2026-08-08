// WordPress(takkyu.ibaraki.jp) → Supabase 移行スクリプト（冪等・再実行可能）
//
//   node scripts/migrate-wp.mjs
//
// - WPカテゴリ → categories（親子・slug保持、wp_term_id を安定キーに upsert）
// - WP記事     → announcements（本文HTMLは verbatim＝パス書き換えしない、
//                published_at=投稿日, is_published=true, category_id 紐付け,
//                wp_post_id を安定キーに upsert）
// 依存追加なし：グローバル fetch と既存 @supabase/supabase-js を使用。
// service_role を .env.local から読む（RLSをバイパスして書込）。

import { readFileSync } from 'node:fs'

const WP = 'https://takkyu.ibaraki.jp/wp-json/wp/v2'
const PER_PAGE = 100

// ---- .env.local を読み込み ----
function loadEnv() {
  const env = {}
  try {
    for (const line of readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split('\n')) {
      const m = line.match(/^([A-Z_]+)=(.*)$/)
      if (m) env[m[1]] = m[2].trim()
    }
  } catch {}
  return env
}
const env = loadEnv()
const URL_ = env.NEXT_PUBLIC_SUPABASE_URL
const KEY = env.SUPABASE_SERVICE_ROLE_KEY
if (!URL_ || !KEY) {
  console.error('環境変数が不足：NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// ---- PostgREST を直接叩く（supabase-js の realtime 依存を回避）----
const REST = `${URL_}/rest/v1`
const authHeaders = {
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
  'Content-Type': 'application/json',
}
async function sbUpsert(table, rows, onConflict) {
  const res = await fetch(`${REST}/${table}?on_conflict=${onConflict}`, {
    method: 'POST',
    headers: { ...authHeaders, Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify(rows),
  })
  if (!res.ok) throw new Error(`${table} upsert ${res.status}: ${await res.text()}`)
}
async function sbSelect(table, query) {
  const res = await fetch(`${REST}/${table}?${query}`, { headers: authHeaders })
  if (!res.ok) throw new Error(`${table} select ${res.status}: ${await res.text()}`)
  return res.json()
}
async function sbUpdate(table, filter, patch) {
  const res = await fetch(`${REST}/${table}?${filter}`, {
    method: 'PATCH',
    headers: { ...authHeaders, Prefer: 'return=minimal' },
    body: JSON.stringify(patch),
  })
  if (!res.ok) throw new Error(`${table} update ${res.status}: ${await res.text()}`)
}

// ---- HTMLエンティティ簡易デコード＋タグ除去（タイトル用） ----
function decodeEntities(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&#x27;|&apos;/g, "'")
    .replace(/&#8217;/g, '’')
    .replace(/&#8216;/g, '‘')
    .replace(/&#8220;/g, '“')
    .replace(/&#8221;/g, '”')
    .replace(/&#8230;/g, '…')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
}
const plainTitle = (html) => decodeEntities(String(html || '').replace(/<[^>]+>/g, '')).trim()

async function fetchJson(url) {
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(url)
    if (res.ok) return { data: await res.json(), res }
    if (attempt >= 4) throw new Error(`fetch failed ${res.status}: ${url}`)
    await new Promise((r) => setTimeout(r, 500 * attempt))
  }
}

async function migrateCategories() {
  const { data: cats } = await fetchJson(`${WP}/categories?per_page=${PER_PAGE}&_fields=id,name,slug,parent`)
  console.log(`WPカテゴリ: ${cats.length}件`)

  // pass1: parent なしで upsert（sort_order は wp id を流用＝サイトの自然順）
  const rows = cats.map((c) => ({
    name: c.name,
    slug: c.slug,
    wp_term_id: c.id,
    sort_order: c.id,
  }))
  await sbUpsert('categories', rows, 'wp_term_id')

  // 現在の wp_term_id → uuid マップ
  const dbCats = await sbSelect('categories', 'select=id,wp_term_id')
  const map = new Map(dbCats.map((c) => [c.wp_term_id, c.id]))

  // pass2: 親子を解決して parent_id を更新
  let linked = 0
  for (const c of cats) {
    if (c.parent && map.has(c.parent)) {
      await sbUpdate('categories', `wp_term_id=eq.${c.id}`, { parent_id: map.get(c.parent) })
      linked++
    }
  }
  console.log(`categories upsert 完了（親子リンク: ${linked}件）`)
  return { map, cats }
}

// 記事の複数カテゴリから最も具体的（子＝parent!=0）を選ぶ
function pickCategory(postCatIds, wpCatById) {
  if (!postCatIds || postCatIds.length === 0) return null
  const child = postCatIds.find((id) => (wpCatById.get(id)?.parent ?? 0) !== 0)
  return child ?? postCatIds[0]
}

async function migratePosts(catMap, wpCats) {
  const wpCatById = new Map(wpCats.map((c) => [c.id, c]))
  let page = 1
  let total = 0
  let multiCat = 0
  const CHUNK = 200
  let buffer = []

  async function flush() {
    if (buffer.length === 0) return
    await sbUpsert('announcements', buffer, 'wp_post_id')
    total += buffer.length
    console.log(`  upsert: 累計 ${total}件`)
    buffer = []
  }

  while (true) {
    const url = `${WP}/posts?per_page=${PER_PAGE}&page=${page}&_fields=id,date,date_gmt,status,title,content,categories`
    let data
    try {
      ;({ data } = await fetchJson(url))
    } catch (e) {
      // 最終ページ超過時などは 400 が返る → 終了
      if (String(e).includes('400')) break
      throw e
    }
    if (!Array.isArray(data) || data.length === 0) break

    for (const p of data) {
      if (p.categories && p.categories.length > 1) multiCat++
      const wpCat = pickCategory(p.categories, wpCatById)
      buffer.push({
        wp_post_id: p.id,
        title: plainTitle(p.title?.rendered),
        body: p.content?.rendered ?? '', // ★verbatim：パス書き換えしない
        published_at: p.date_gmt ? `${p.date_gmt}Z` : p.date,
        is_published: p.status === 'publish',
        category_id: wpCat ? (catMap.get(wpCat) ?? null) : null,
      })
      if (buffer.length >= CHUNK) await flush()
    }
    console.log(`page ${page} 取得: ${data.length}件`)
    if (data.length < PER_PAGE) break
    page++
    await new Promise((r) => setTimeout(r, 150)) // レート配慮
  }
  await flush()
  console.log(`記事 upsert 完了：${total}件（複数カテゴリ記事: ${multiCat}件）`)
  return total
}

async function main() {
  console.log('=== WP → Supabase 移行開始 ===')
  const { map, cats } = await migrateCategories()
  await migratePosts(map, cats)
  console.log('=== 完了 ===')
}
main().catch((e) => {
  console.error('移行エラー:', e)
  process.exit(1)
})
