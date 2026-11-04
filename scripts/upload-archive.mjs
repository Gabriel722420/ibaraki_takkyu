// 旧サイトの静的資産（クロール済み ~/takkyu-crawl/takkyu.ibaraki.jp/）を
// Supabase Storage バケット `archive` へ一括アップロード（冪等・再開可能）。
//
//   住吉PCで実行（2.7GB/約7,808件はローカルにしか無い＝クラウドからは不可視）:
//     node scripts/upload-archive.mjs [クロールルート] [--force] [--concurrency=6]
//   既定ルート: ~/takkyu-crawl/takkyu.ibaraki.jp
//
// - 対象は pdf/** と wp-content/uploads/** のみ（HTML等クロール残渣は除外）。
// - キー＝クロールルートからの相対パス（= 現行URLパス）。大小文字・日本語をそのまま保持。
// - Content-Type を拡張子から明示（未設定だと octet-stream＝PDFが開けない）。
// - 冪等/再開：進捗を .upload-archive.manifest（アップ済みキー）に追記。再実行で続きから。
//   `--force` で manifest 無視＋上書き(upsert)。
// - 依存追加なし：グローバル fetch と service_role（.env.local、RLSバイパス書込）を使用。
//
// ※ 本スクリプトは資材用意。実アップロードは実装・検証OK後に住吉PCで実行する。

import { readFileSync, appendFileSync, existsSync, statSync, readdirSync } from 'node:fs'
import { join, relative, sep, extname } from 'node:path'
import { homedir } from 'node:os'

// ---- 引数 ----
const args = process.argv.slice(2)
const FORCE = args.includes('--force')
const concArg = args.find((a) => a.startsWith('--concurrency='))
const CONCURRENCY = concArg ? Math.max(1, Number(concArg.split('=')[1]) || 6) : 6
const ROOT = (args.find((a) => !a.startsWith('--')) ||
  join(homedir(), 'takkyu-crawl', 'takkyu.ibaraki.jp')).replace(/\/$/, '')

// ---- .env.local ----
function loadEnv() {
  const env = {}
  try {
    for (const line of readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split('\n')) {
      const m = line.match(/^([A-Z_]+)=(.*)$/)
      if (m) env[m[1]] = m[2].trim().replace(/^"|"$/g, '')
    }
  } catch {}
  return env
}
const env = loadEnv()
const URL_ = env.NEXT_PUBLIC_SUPABASE_URL
const KEY = env.SUPABASE_SERVICE_ROLE_KEY
if (!URL_ || !KEY) {
  console.error('環境変数が不足：NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY（.env.local）')
  process.exit(1)
}
if (!existsSync(ROOT)) {
  console.error(`クロールルートが見つかりません：${ROOT}`)
  process.exit(1)
}

const BUCKET = 'archive'
const OBJECT = `${URL_}/storage/v1/object/${BUCKET}`
const MANIFEST = new URL('../.upload-archive.manifest', import.meta.url)
const MAX_BYTES = 104857600 // bucket file_size_limit=100MB（超過は TUS resumable が必要）

const MIME = {
  '.pdf': 'application/pdf',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.png': 'image/png', '.gif': 'image/gif', '.webp': 'image/webp',
  '.svg': 'image/svg+xml', '.bmp': 'image/bmp', '.tif': 'image/tiff', '.tiff': 'image/tiff',
  '.zip': 'application/zip', '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
}
const mimeOf = (p) => MIME[extname(p).toLowerCase()] || 'application/octet-stream'

// Supabase Storage キーは ASCII 限定（非ASCII・"%" 不可、"=" 可）。lib/storage-proxy.ts の
// toKeySegment と完全一致させること（プロキシ側と同じキーに揃える必要）。NFCで mac(NFD)差を吸収。
const toKeySegment = (seg) =>
  encodeURIComponent(seg.normalize('NFC')).replace(/%/g, '=').replace(/~/g, '=7E')

// ---- 対象ファイル収集（pdf/** と wp-content/uploads/** のみ）----
function walk(dir, out) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    const st = statSync(full)
    if (st.isDirectory()) walk(full, out)
    else out.push(full)
  }
}
const targets = []
for (const sub of ['pdf', join('wp-content', 'uploads')]) {
  const base = join(ROOT, sub)
  if (existsSync(base)) walk(base, targets)
}
// キー＝ルートからの相対パス（POSIX区切り）
const toKey = (abs) => relative(ROOT, abs).split(sep).join('/')

// ---- 再開用 manifest ----
const done = new Set()
if (!FORCE && existsSync(MANIFEST)) {
  for (const line of readFileSync(MANIFEST, 'utf8').split('\n')) if (line) done.add(line)
}

// ---- アップロード（キーはセグメント単位で単一エンコード）----
async function upload(abs) {
  const key = toKey(abs)
  if (!FORCE && done.has(key)) return 'skip'
  const size = statSync(abs).size
  if (size > MAX_BYTES) return `TOO_LARGE(${(size / 1048576).toFixed(1)}MB)`
  // Storageキー＝各セグメントを toKeySegment（proxyと一致）→ さらに URL 用に encodeURIComponent
  const urlPath = key.split('/').map(toKeySegment).map(encodeURIComponent).join('/')
  const body = readFileSync(abs)
  const res = await fetch(`${OBJECT}/${urlPath}`, {
    method: 'POST',
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
      'Content-Type': mimeOf(abs),
      'Cache-Control': 'public, max-age=31536000, immutable',
      'x-upsert': 'true', // 冪等（既存は上書き）
    },
    body,
  })
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`)
  appendFileSync(MANIFEST, key + '\n')
  return 'ok'
}

// ---- 並列実行 ----
let ok = 0, skip = 0, fail = 0, big = 0
const failures = []
let idx = 0
async function worker() {
  while (idx < targets.length) {
    const i = idx++
    const abs = targets[i]
    try {
      const r = await upload(abs)
      if (r === 'ok') ok++
      else if (r === 'skip') skip++
      else { big++; failures.push(`${toKey(abs)} : ${r}`) }
    } catch (e) {
      fail++
      failures.push(`${toKey(abs)} : ${e.message}`)
    }
    const total = ok + skip + fail + big
    if (total % 50 === 0 || total === targets.length) {
      process.stdout.write(`\r進捗 ${total}/${targets.length}  ok=${ok} skip=${skip} too_large=${big} fail=${fail}`)
    }
  }
}

console.log(`ルート: ${ROOT}`)
console.log(`対象: ${targets.length} 件（pdf/** + wp-content/uploads/**）  並列=${CONCURRENCY}  force=${FORCE}`)
await Promise.all(Array.from({ length: CONCURRENCY }, worker))
console.log(`\n完了：ok=${ok} skip=${skip} too_large=${big} fail=${fail}`)
if (failures.length) {
  console.log('--- 失敗/要対応（TUS resumable が必要な 100MB 超含む）---')
  for (const f of failures.slice(0, 50)) console.log(f)
  if (failures.length > 50) console.log(`…ほか ${failures.length - 50} 件`)
  process.exit(1)
}
