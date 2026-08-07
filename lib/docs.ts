import type { TournamentDocument, DocType } from './types'

// 要項→組合せ→結果→連絡 の固定表示順
export const DOC_ORDER: DocType[] = ['要項', '組合せ', '結果', '連絡']

// Supabase Storage / 外部リンクの URL 解決
export function resolveDocUrl(
  doc: TournamentDocument,
  opts: { download?: boolean } = {},
): string | null {
  if (doc.external_url) return doc.external_url
  if (doc.file_path) {
    const base = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/documents/${doc.file_path}`
    if (opts.download) {
      const ext = doc.file_path.split('.').pop() || 'pdf'
      return `${base}?download=${encodeURIComponent(doc.title)}.${ext}` // DLファイル名=表示名
    }
    return base
  }
  return null
}
