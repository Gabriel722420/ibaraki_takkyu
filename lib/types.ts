export type Division = {
  id: string
  name: string
  slug: string
  sort_order: number
}

export type DocType = '要項' | '組合せ' | '結果' | '連絡'

export type Announcement = {
  id: string
  title: string
  body: string | null
  published_at: string
  is_published: boolean
  is_pinned: boolean
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
