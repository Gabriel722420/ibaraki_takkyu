export type Division = {
  id: string
  name: string
  slug: string
  sort_order: number
}

// ── 申込フォーム ──
export type FormFieldType =
  | 'text'
  | 'textarea'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'number'
  | 'date'
  | 'email'

export type FormStatus = 'draft' | 'published'

export type FormField = {
  id: string
  form_id: string
  field_type: FormFieldType
  label: string
  placeholder: string | null
  required: boolean
  options: string[]
  sort_order: number
}

export type Form = {
  id: string
  game_id: string | null
  title: string
  description: string | null
  slug: string
  status: FormStatus
  open_at: string | null
  close_at: string | null
  created_at: string
  updated_at: string
  game?: { id: string; title: string } | null
}

// '結果' はレガシー（2026以前・WP移行分）。2027大会〜は '上位結果'(永続)/'詳細結果'(365日で非表示)。
// '連絡' は表示上「お知らせ」（DOC_LABEL で読み替え）。
export type DocType =
  | '要項'
  | '組合せ'
  | '上位結果'
  | '詳細結果'
  | '結果'
  | '連絡'

export type Category = {
  id: string
  name: string
  slug: string
  parent_id: string | null
  sort_order: number
  wp_term_id: number | null
}

export type Announcement = {
  id: string
  wp_post_id: number | null // WP移行記事の連番（公開URL /news/[wp_post_id] の正規キー）
  title: string
  body: string | null
  published_at: string
  is_published: boolean
  is_pinned: boolean
  image_path: string | null
  publish_at: string | null
  category_id: string | null
  category?: Category | null
}

export type Resource = {
  id: string
  category: string
  title: string
  file_path: string | null
  external_url: string | null
  sort_order: number
  is_published: boolean
}

export type Officer = {
  id: string
  role: string
  name: string
  note: string | null
  sort_order: number
  is_published: boolean
}

export type Game = {
  id: string
  division_id: string | null
  fiscal_year: number
  title: string
  event_date: string | null
  venue: string | null
  summary: string | null
  is_published: boolean
  archived_at: string | null
  image_path: string | null
  publish_at: string | null
  division?: Division | null
}

export type GameDocument = {
  id: string
  game_id: string
  doc_type: DocType
  title: string
  file_path: string | null
  external_url: string | null
  sort_order: number
  is_published: boolean
  created_at: string // 掲載日の基点（詳細結果の365日非表示に使用）
}

// ④ 大会情報更新履歴（手入力メッセージ＋部門タグ＋掲載日）。TOP表示は掲載30日で非表示。
export type GameUpdate = {
  id: string
  game_id: string | null
  division_id: string | null
  body: string
  posted_at: string // 'YYYY-MM-DD'
  is_published: boolean
  publish_at: string | null
  created_at: string
  division?: Division | null
  game?: { id: string; title: string } | null
}
