// サーバー専用：本文HTMLを表示前にサニタイズ（XSS対策）。
// 装飾に必要な範囲だけタグ/属性を許可。公開側の詳細ページから使用する。
import DOMPurify from 'isomorphic-dompurify'

const ALLOWED_TAGS = [
  'p',
  'br',
  'strong',
  'b',
  'em',
  'i',
  'u',
  's',
  'h2',
  'h3',
  'ul',
  'ol',
  'li',
  'a',
  'img',
  'span',
]
const ALLOWED_ATTR = ['href', 'target', 'rel', 'src', 'alt', 'style']

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    // javascript:/data: 由来の src/href は既定でブロックされる
  })
}
