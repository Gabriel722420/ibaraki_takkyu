// サーバー専用：本文HTMLを表示前にサニタイズ（XSS対策）。
// 装飾に必要な範囲だけタグ/属性を許可。公開側の詳細ページから使用する。
import DOMPurify from 'isomorphic-dompurify'

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
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    // javascript:/data: 由来の src/href は既定でブロックされる
  })
}
