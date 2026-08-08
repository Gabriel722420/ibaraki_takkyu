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

export type DocType = '要項' | '組合せ' | '結果' | '連絡'

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
}
