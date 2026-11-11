// 旧サイトの静的資産（クロール済み ~/takkyu-crawl/takkyu.ibaraki.jp/）を
// Supabase Storage バケット `archive` へ一括アップロード（冪等・再開可能）。
//
//   住吉PCで実行（2.7GB/約7,808件はローカルにしか無い＝クラウドからは不可視）:
//     node scripts/upload-archive.mjs [クロールルート] [--dry-run] [--force] [--concurrency=6]
//   既定ルート: ~/takkyu-crawl/takkyu.ibaraki.jp
//
// - 対象＝クロールフォルダ全体から「配信すべき資料ファイル」を拡張子ベースで漏れなく収集
//   （PDF / 画像 / Office文書 / zip）。.html,.css,.js,.xml,.json,.txt 等のページ残渣は除外。
//   ※以前は pdf/** と wp-content/uploads/** のみ対象で uploads/** (1,424 PDF)・old_uploads/** (306 PDF)
//     を取りこぼしていた。全PDF 3,847 件を漏れなく拾う。
// - キー＝クロールルートからの相対パス（= 現行URLパス）。pdf/・uploads/・old_uploads/・wp-content/uploads/
//   いずれも相対パス保持でアップ＝現行URLが生きる（各プレフィックスの Route Handler が配信）。
// - キー符号化（ASCII制約・NFC）は toKeySegment で proxy と一致。大小文字・日本語を保持。
// - Content-Type を拡張子から明示（未設定だと octet-stream＝PDFが開けない）。
// - 冪等/再開：進捗を .upload-archive.manifest（アップ済みキー）に追記。再実行で続きから。
//   `--force` で manifest 無視＋上書き(upsert)。
// - `--dry-run`：アップロードせず、対象ファイル数を種類別(PDF/画像/Office/その他)＋
//   PDFのトップ階層別＋配信経路(Route Handler)の被覆＋除外(残渣)内訳 を出力して検証する。
// - 依存追加なし：グローバル fetch と service_role（.env.local、RLSバイパス書込）を使用。
//
// ※ 本スクリプトは資材用意。実アップロードは実装・検証OK後に住吉PCで実行する。

import { readFileSync, appendFileSync, existsSync, statSync, readdirSync } from 'node:fs'
import { join, relative, sep, extname } from 'node:path'
import { homedir } from 'node:os'

// ---- 引数 ----
const args = process.argv.slice(2)
const FORCE = args.includes('--force')
const DRY_RUN = args.includes('--dry-run')
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

// ---- 配信対象の拡張子（カテゴリ別・小文字・ドット付き）----
const IMAGE = new Set([
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tif', '.tiff', '.svg', '.heic',
])
const OFFICE = new Set([
  '.xls', '.xlsx', '.xlsm', '.doc', '.docx', '.docm', '.ppt', '.pptx', '.pps', '.ppsx',
  '.csv', '.rtf', '.odt', '.ods', '.odp',
])
const OTHER = new Set(['.zip']) // 申込書一式等の配布アーカイブ
// 上記以外（.html,.htm,.css,.js,.xml,.json,.txt,フォント,.ico 等）はページ残渣として除外。
function categoryOf(abs) {
  const e = extname(abs).toLowerCase()
  if (e === '.pdf') return 'pdf'
  if (IMAGE.has(e)) return 'image'
  if (OFFICE.has(e)) return 'office'
  if (OTHER.has(e)) return 'other'
  return null // 除外（残渣）
}

const MIME = {
  '.pdf': 'application/pdf',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.png': 'image/png', '.gif': 'image/gif', '.webp': 'image/webp',
  '.svg': 'image/svg+xml', '.bmp': 'image/bmp', '.tif': 'image/tiff', '.tiff': 'image/tiff',
  '.heic': 'image/heic',
  '.zip': 'application/zip', '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.docm': 'application/vnd.ms-word.document.macroEnabled.12',
  '.xls': 'application/vnd.ms-excel', '.xlsm': 'application/vnd.ms-excel.sheet.macroEnabled.12',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.ppt': 'application/vnd.ms-powerpoint', '.pps': 'application/vnd.ms-powerpoint',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.ppsx': 'application/vnd.openxmlformats-officedocument.presentationml.slideshow',
  '.csv': 'text/csv', '.rtf': 'application/rtf',
  '.odt': 'application/vnd.oasis.opendocument.text',
  '.ods': 'application/vnd.oasis.opendocument.spreadsheet',
  '.odp': 'application/vnd.oasis.opendocument.presentation',
}
const mimeOf = (p) => MIME[extname(p).toLowerCase()] || 'application/octet-stream'

// 現行URLで配信可能（Route Handler が存在する）プレフィックス。dry-run の被覆チェック用。
const SERVED_PREFIXES = ['pdf/', 'uploads/', 'old_uploads/', 'wp-content/uploads/']
const isServed = (key) => SERVED_PREFIXES.some((p) => key.startsWith(p))

// Supabase Storage キーは ASCII 限定（非ASCII・"%" 不可、"=" 可）。lib/storage-proxy.ts の
// toKeySegment と完全一致させること（プロキシ側と同じキーに揃える必要）。NFCで mac(NFD)差を吸収。
const toKeySegment = (seg) =>
  encodeURIComponent(seg.normalize('NFC')).replace(/%/g, '=').replace(/~/g, '=7E')

// ---- クロールフォルダ全体を走査し、配信対象を拡張子で選別 ----
function walk(dir, out) {
  let entries
  try {
    entries = readdirSync(dir, { withFileTypes: true })
  } catch {
    return
  }
  for (const ent of entries) {
    if (ent.name.startsWith('.')) continue // ドットファイル（.DS_Store 等）除外
    const full = join(dir, ent.name)
    if (ent.isDirectory()) walk(full, out)
    else if (ent.isFile()) out.push(full)
  }
}
// キー＝ルートからの相対パス（POSIX区切り）
const toKey = (abs) => relative(ROOT, abs).split(sep).join('/')

const allFiles = []
walk(ROOT, allFiles)
const targets = []
const excludedByExt = {} // 残渣の拡張子別件数
for (const abs of allFiles) {
  if (categoryOf(abs)) targets.push(abs)
  else {
    const e = extname(abs).toLowerCase() || '(拡張子なし)'
    excludedByExt[e] = (excludedByExt[e] || 0) + 1
  }
}

// ---- --dry-run：数で検証（アップロードしない）----
if (DRY_RUN) {
  const cat = { pdf: 0, image: 0, office: 0, other: 0 }
  const pdfByTop = {} // PDFのトップ階層別
  const unserved = [] // 現行URLで配信できない対象（Route Handler 無し）
  for (const abs of targets) {
    const c = categoryOf(abs)
    cat[c]++
    const key = toKey(abs)
    if (c === 'pdf') {
      const top = key.includes('/') ? key.slice(0, key.indexOf('/')) : '(直下)'
      pdfByTop[top] = (pdfByTop[top] || 0) + 1
    }
    if (!isServed(key)) unserved.push(key)
  }
  const n = (x) => String(x).padStart(6)
  console.log(`ルート: ${ROOT}`)
  console.log(`走査ファイル総数: ${allFiles.length}`)
  console.log('\n── 対象（アップロード）種類別 ──')
  console.log(`  PDF    :${n(cat.pdf)}`)
  console.log(`  画像   :${n(cat.image)}`)
  console.log(`  Office :${n(cat.office)}`)
  console.log(`  その他 :${n(cat.other)}  (zip等)`)
  console.log(`  合計   :${n(targets.length)}`)
  console.log('\n── PDF トップ階層別（取りこぼし確認用）──')
  for (const [k, v] of Object.entries(pdfByTop).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${(k + '/').padEnd(22)}:${n(v)}`)
  }
  console.log('\n── 配信経路（Route Handler）被覆 ──')
  console.log(`  配信可能(pdf/・uploads/・old_uploads/・wp-content/uploads/) :${n(targets.length - unserved.length)}`)
  console.log(`  配信不可(上記以外のパス＝要Route追加 or 対象外)            :${n(unserved.length)}`)
  if (unserved.length) {
    const byTop = {}
    for (const k of unserved) {
      const top = k.includes('/') ? k.slice(0, k.indexOf('/')) : '(直下)'
      byTop[top] = (byTop[top] || 0) + 1
    }
    for (const [k, v] of Object.entries(byTop).sort((a, b) => b[1] - a[1]).slice(0, 15)) {
      console.log(`    ${(k + '/').padEnd(24)}:${n(v)}`)
    }
    console.log('  ※ 配信不可が資料なら Route Handler 追加が必要。テーマ/コア画像等なら無視可。')
  }
  console.log('\n── 除外（ページ残渣）拡張子別 上位 ──')
  for (const [e, v] of Object.entries(excludedByExt).sort((a, b) => b[1] - a[1]).slice(0, 15)) {
    console.log(`  ${e.padEnd(14)}:${n(v)}`)
  }
  console.log('\n(--dry-run：アップロードは実行していません)')
  process.exit(0)
}

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
console.log(`対象: ${targets.length} 件（PDF/画像/Office/zip をクロール全体から収集）  並列=${CONCURRENCY}  force=${FORCE}`)
await Promise.all(Array.from({ length: CONCURRENCY }, worker))
console.log(`\n完了：ok=${ok} skip=${skip} too_large=${big} fail=${fail}`)
if (failures.length) {
  console.log('--- 失敗/要対応（TUS resumable が必要な 100MB 超含む）---')
  for (const f of failures.slice(0, 50)) console.log(f)
  if (failures.length > 50) console.log(`…ほか ${failures.length - 50} 件`)
  process.exit(1)
}
