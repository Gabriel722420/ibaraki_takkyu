// Supabase Storage の public オブジェクトを「自ドメインの現行パス」で透過プロキシする共通処理。
// （Route Handler＝サーバ専用からのみ import する）
// Route Handler（/pdf・/wp-content/uploads・/documents）から呼ぶ。
//
// 設計の要点：
// - パス不変：リダイレクトせず body をストリーム透過（URLは一切変えない）。
// - 日本語名・大文字拡張子(.PDF)：Next が復号したセグメントを encodeURIComponent で
//   「単一の正しいエンコード」に再構成 → 二重エンコード/文字化けによる 404 を排除。
// - ⑥ noindex：.pdf レスポンスに X-Robots-Tag: noindex, noarchive を明示付与（確実に継続）。
// - Cache-Control 長期固定：アーカイブ/確定PDFは不変 → Vercel CDN で実効 egress を最小化。
// - Range 透過：PDFビューア等の部分取得に対応。

const SUPABASE = process.env.NEXT_PUBLIC_SUPABASE_URL

// Supabase Storage のキーは ASCII の限定文字のみ（非ASCII・"%" は不可、"=" は可）。
// 任意のパスセグメントを許可文字へ写す決定論的エンコード：
//   encodeURIComponent 後に "%"→"=" に置換（"="は許可）、"~" だけ素通しされるので明示エスケープ。
//   NFC 正規化で mac(NFD)/URL(NFC) のバイト差を吸収。ASCII安全名は恒等（＝キーは現行パスのまま読める）。
// ★ scripts/upload-archive.mjs の toKeySegment と完全一致させること（アップ側とキーが一致する必要）。
export function toKeySegment(seg: string): string {
  return encodeURIComponent(seg.normalize('NFC'))
    .replace(/%/g, '=')
    .replace(/~/g, '=7E')
}

// upstream から素通しするレスポンスヘッダ（Content-Type・サイズ・Disposition・検証子）。
const PASS_HEADERS = [
  'content-type',
  'content-length',
  'content-range',
  'accept-ranges',
  'content-disposition',
  'etag',
  'last-modified',
]

export async function proxyStorageObject(
  req: Request,
  bucket: string,
  keySegments: string[], // prefix 込みの全セグメント（Next により復号済み）
): Promise<Response> {
  if (!SUPABASE) {
    return new Response('storage not configured', { status: 500 })
  }
  // 1) 各セグメントを Supabase-valid なキー文字へ（= 実際の Storage キー）。
  // 2) それを URL 用に encodeURIComponent（"=" 等を安全化）。Supabase が復号してキーと一致。
  const keyPath = keySegments
    .filter((s) => s.length > 0)
    .map(toKeySegment)
    .map(encodeURIComponent)
    .join('/')
  const search = new URL(req.url).search // ?download=表示名.pdf 等を透過（Supabase が Content-Disposition 付与）
  const upstreamUrl = `${SUPABASE}/storage/v1/object/public/${bucket}/${keyPath}${search}`

  const range = req.headers.get('range')
  let upstream: Response
  try {
    upstream = await fetch(upstreamUrl, {
      headers: range ? { range } : {},
      redirect: 'follow',
    })
  } catch {
    return new Response('upstream fetch failed', { status: 502 })
  }

  const isPdf = /\.pdf$/i.test(new URL(req.url).pathname)

  // 未存在/不正キー等：Supabase の生エラーJSONを晒さず、クリーンな 404 に正規化。
  // 長期キャッシュしない（後からアップロードされた場合に 404 が焼き付くのを防ぐ）。
  if (!upstream.ok) {
    const h = new Headers({ 'cache-control': 'public, max-age=60' })
    if (isPdf) h.set('x-robots-tag', 'noindex, noarchive')
    return new Response('Not Found', { status: 404, headers: h })
  }

  const headers = new Headers()
  for (const h of PASS_HEADERS) {
    const v = upstream.headers.get(h)
    if (v) headers.set(h, v)
  }
  // 不変アセット：長期キャッシュ（CDN/ブラウザ）。年度別PDF/画像は更新されない前提。
  headers.set('cache-control', 'public, max-age=31536000, immutable')
  // ⑥ noindex：.pdf のみ（受信パス基準・大小文字対応）。
  if (isPdf) headers.set('x-robots-tag', 'noindex, noarchive')

  // 本文はストリーム透過（メモリ非バッファ）。200/206 の status をそのまま返す。
  return new Response(upstream.body, { status: upstream.status, headers })
}
