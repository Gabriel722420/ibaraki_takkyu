import type { Category, DocType } from './types'

// カテゴリの自身＋全子孫のIDを集める（純粋関数・親カテゴリ選択時に子記事も含めるため）
export function collectCategoryIds(
  categories: Category[],
  rootId: string,
): string[] {
  const children = new Map<string, string[]>()
  for (const c of categories) {
    if (c.parent_id) {
      const arr = children.get(c.parent_id) ?? []
      arr.push(c.id)
      children.set(c.parent_id, arr)
    }
  }
  const out: string[] = []
  const stack = [rootId]
  while (stack.length) {
    const id = stack.pop()!
    out.push(id)
    for (const ch of children.get(id) ?? []) stack.push(ch)
  }
  return out
}

// 要項→組合せ→結果→連絡 の固定表示順
export const DOC_ORDER: DocType[] = ['要項', '組合せ', '結果', '連絡']

// Storage/外部リンクを持つもの共通の構造的型（GameDocument・Resource 双方が満たす）
type LinkedDoc = {
  title: string
  file_path: string | null
  external_url: string | null
}

// 本文の表示/編集用HTML化（純粋関数・クライアント可）。
// リッチエディタHTMLはそのまま、旧プレーンテキストは改行を <br>/<p> に救済して崩れを防ぐ。
export function toContentHtml(value: string | null | undefined): string {
  const s = (value ?? '').trim()
  if (!s) return ''
  if (/<\/?[a-z][\s\S]*>/i.test(s)) return s // 既にHTMLとみなす
  const esc = s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  return esc
    .split(/\n{2,}/)
    .map((p) => `<p>${p.replace(/\n/g, '<br>')}</p>`)
    .join('')
}

// 大会の状態（年間一覧の自動判定・純粋関数）
export type GameStatus = 'scheduled' | 'awaiting' | 'published'

export function gameStatus(opts: {
  eventDate: string | null
  hasResult: boolean
  today: string // 'YYYY-MM-DD'
}): GameStatus {
  if (opts.hasResult) return 'published' // 結果添付済み
  if (opts.eventDate && opts.eventDate < opts.today) return 'awaiting' // 過去かつ結果未添付
  return 'scheduled' // 予定（未来 or 未定 or 結果未添付）
}

export const GAME_STATUS_LABEL: Record<GameStatus, string> = {
  scheduled: '予定',
  awaiting: '結果待ち',
  published: '結果掲載済み',
}

// images バケットの公開URL解決（クライアント可・純粋関数）
export function resolveImageUrl(path: string | null): string | null {
  if (!path) return null
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/${path}`
}

// Supabase Storage / 外部リンクの URL 解決
export function resolveDocUrl(
  doc: LinkedDoc,
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
