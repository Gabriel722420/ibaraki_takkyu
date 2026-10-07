// サーバー専用：本文HTMLを表示前にサニタイズ（XSS対策）。
// jsdom 非依存の sanitize-html を使用（isomorphic-dompurify の jsdom 依存が
// Vercel serverless で ERR_REQUIRE_ESM（@exodus/bytes の ESM化）を起こし
// 詳細ページ全滅になったため置換。htmlparser2 ベースで serverless 安全）。
import sanitizeHtmlLib from 'sanitize-html'

// 装飾＋WP移行記事の構造を保持できる範囲（script/style/iframe/object/form 等は不許可）
const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'sub', 'sup', 'small', 'mark',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'dl', 'dt', 'dd',
  'a', 'img', 'span', 'div',
  'figure', 'figcaption', 'blockquote', 'hr', 'pre', 'code',
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'colgroup', 'col',
]
const ALLOWED_ATTR = [
  'href', 'target', 'rel', 'src', 'alt', 'title', 'style', 'class',
  'width', 'height', 'colspan', 'rowspan', 'scope', 'srcset', 'sizes', 'loading',
]

export function sanitizeHtml(html: string): string {
  return sanitizeHtmlLib(html, {
    allowedTags: ALLOWED_TAGS,
    // 上記属性を全タグで許可（従来の DOMPurify ALLOWED_ATTR と同等）。
    allowedAttributes: { '*': ALLOWED_ATTR },
    // href/src のスキームを制限：javascript:/data: 等をブロック（既定踏襲＋tel/mailto）。
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowProtocolRelative: true,
    // style は属性として許可（WP移行本文のインライン装飾を保持）。allowedStyles は
    // 未指定＝全プロパティ通過（従来 DOMPurify と同等）。on* ハンドラや許可外タグは除去。
    // 許可外タグは中身を残して破棄（従来挙動に合わせる）。
    disallowedTagsMode: 'discard',
  })
}
