import { createClient } from './supabase/server'
import { DOC_ORDER } from './docs'
import type {
  Announcement,
  Division,
  Game,
  GameDocument,
  Officer,
  Resource,
} from './types'

// 予約投稿の公開ゲート：publish_at 未設定 or 到来済みのみ公開。
// 使い方: query.or(scheduledOr())（is_published=true とAND結合される）
function scheduledOr(): string {
  return `publish_at.is.null,publish_at.lte.${new Date().toISOString()}`
}

// ── 設定値（settings, key→string）をまとめて取得 ──
export async function getSettings(
  keys: string[],
): Promise<Record<string, string>> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('settings')
    .select('key, value')
    .in('key', keys)
  const out: Record<string, string> = {}
  for (const row of data ?? []) {
    const v = (row as { key: string; value: unknown }).value
    out[(row as { key: string }).key] = typeof v === 'string' ? v : String(v ?? '')
  }
  return out
}

// ── 連盟情報(/about) ──
export async function getAboutSettings(): Promise<{
  greeting: string
  sign: string
  image: string
}> {
  const s = await getSettings([
    'about_greeting',
    'about_greeting_sign',
    'about_greeting_image',
  ])
  return {
    greeting: s.about_greeting ?? '',
    sign: s.about_greeting_sign ?? '',
    image: s.about_greeting_image ?? '',
  }
}

// 役員（公開側・sort_order 昇順）
export async function listOfficers(): Promise<Officer[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('officers')
    .select('*')
    .eq('is_published', true)
    .order('sort_order', { ascending: true })
  if (error) throw error
  return (data ?? []) as Officer[]
}

// 役員（管理側・全件）
export async function listOfficersAdmin(): Promise<Officer[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('officers')
    .select('*')
    .order('sort_order', { ascending: true })
  if (error) throw error
  return (data ?? []) as Officer[]
}

export async function getOfficerAdmin(id: string): Promise<Officer | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('officers')
    .select('*')
    .eq('id', id)
    .single()
  return (data ?? null) as Officer | null
}

// ── サイトポリシー(/policy) ──
export async function getPolicySettings(): Promise<{
  copyright: string
  trademark: string
  disclaimer: string
  contact: string
}> {
  const s = await getSettings([
    'policy_copyright',
    'policy_trademark',
    'policy_disclaimer',
    'policy_contact',
  ])
  return {
    copyright: s.policy_copyright ?? '',
    trademark: s.policy_trademark ?? '',
    disclaimer: s.policy_disclaimer ?? '',
    contact: s.policy_contact ?? '',
  }
}

// category 指定で公開 resources を取得（規程・個人情報保護 等）
export async function getResourcesByCategory(
  category: string,
): Promise<Resource[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .eq('is_published', true)
    .eq('category', category)
    .order('sort_order', { ascending: true })
  if (error) throw error
  return (data ?? []) as Resource[]
}

// ── お知らせ（公開側） ──
// 一覧：公開のみ・固定を上部・公開日降順
export async function listAnnouncements(): Promise<Announcement[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .eq('is_published', true)
    .or(scheduledOr())
    .order('is_pinned', { ascending: false })
    .order('published_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as Announcement[]
}

// 詳細：公開のみ
export async function getAnnouncement(id: string): Promise<Announcement | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('announcements')
    .select('*')
    .eq('id', id)
    .eq('is_published', true)
    .or(scheduledOr())
    .single()
  return (data ?? null) as Announcement | null
}

// ── お知らせ（管理側・is_published で絞らない） ──
export async function listAnnouncementsAdmin(): Promise<Announcement[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .order('is_pinned', { ascending: false })
    .order('published_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as Announcement[]
}

export async function getAnnouncementAdmin(
  id: string,
): Promise<Announcement | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('announcements')
    .select('*')
    .eq('id', id)
    .single()
  return (data ?? null) as Announcement | null
}

// ── 登録・資格情報（公開側） ──
// 公開のみ・sort_order 昇順（ページ側で category グルーピング）
export async function listResources(): Promise<Resource[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .eq('is_published', true)
    .order('sort_order', { ascending: true })
    .order('title', { ascending: true })
  if (error) throw error
  return (data ?? []) as Resource[]
}

// ── 登録・資格情報（管理側） ──
export async function listResourcesAdmin(): Promise<Resource[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .order('category', { ascending: true })
    .order('sort_order', { ascending: true })
  if (error) throw error
  return (data ?? []) as Resource[]
}

export async function getResourceAdmin(id: string): Promise<Resource | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('resources')
    .select('*')
    .eq('id', id)
    .single()
  return (data ?? null) as Resource | null
}

// TOP用：最新のお知らせ（公開のみ・固定を優先し公開日降順）
export async function listLatestAnnouncements(
  limit = 5,
): Promise<Announcement[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .eq('is_published', true)
    .or(scheduledOr())
    .order('is_pinned', { ascending: false })
    .order('published_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data ?? []) as Announcement[]
}

// TOP用：近日の大会（公開のみ・今日以降を event_date 昇順）
export async function listUpcomingGames(limit = 5): Promise<Game[]> {
  const supabase = await createClient()
  const today = new Date().toISOString().slice(0, 10)
  const { data, error } = await supabase
    .from('games')
    .select('*, division:divisions(*)')
    .eq('is_published', true)
    .or(scheduledOr())
    .gte('event_date', today)
    .order('event_date', { ascending: true })
    .limit(limit)
  if (error) throw error
  return (data ?? []) as unknown as Game[]
}

// 部門一覧（公開/管理共通・sort_order 順）。divisions は公開読取可。
export async function listDivisions(): Promise<Division[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('divisions')
    .select('*')
    .order('sort_order')
    .order('name')
  if (error) throw error
  return (data ?? []) as Division[]
}

// 管理用の大会一覧（is_published で絞らない＝下書きも表示）。
export async function listGamesAdmin(): Promise<Game[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('games')
    .select('*, division:divisions(*)')
    .order('fiscal_year', { ascending: false })
    .order('event_date', { ascending: false, nullsFirst: true })
  if (error) throw error
  return (data ?? []) as unknown as Game[]
}

// 掲載期間（年）。現運用は全期間公開のため games 公開クエリからは未参照だが、
// settings.record_retention_years は残置し、理事会決定で retention を再導入する際に再利用する。
export async function getRetentionYears(): Promise<number> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'record_retention_years')
    .single()
  return Number(data?.value ?? 5)
}

export async function listGames(
  opts: { fiscalYear?: number; divisionId?: string } = {},
): Promise<Game[]> {
  const supabase = await createClient()
  // ※ 現運用は全期間公開（掲載期間フィルタは撤廃）。
  //   retention 再導入時は getRetentionYears() による event_date 下限をここで再適用する。
  let q = supabase
    .from('games')
    .select('*, division:divisions(*)')
    .eq('is_published', true)
    .or(scheduledOr())
    .order('event_date', { ascending: false, nullsFirst: true })

  if (opts.fiscalYear) q = q.eq('fiscal_year', opts.fiscalYear)
  if (opts.divisionId) q = q.eq('division_id', opts.divisionId)

  const { data, error } = await q
  if (error) throw error
  return (data ?? []) as unknown as Game[]
}

// 年間大会一覧用：公開＋予約ゲートを満たす全大会に、
// 結果(doc_type='結果')添付有無フラグを付与して返す。
// ※ 現運用は全期間公開（掲載期間フィルタは撤廃）。理事会決定で retention を
//   再導入する場合は、ここで getRetentionYears() による event_date 下限を再適用する。
export async function listGamesForYearList(): Promise<
  (Game & { hasResult: boolean })[]
> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('games')
    .select('*, division:divisions(*)')
    .eq('is_published', true)
    .or(scheduledOr())
    .order('fiscal_year', { ascending: false })
    .order('event_date', { ascending: true, nullsFirst: false })
  if (error) throw error
  const games = (data ?? []) as unknown as Game[]
  if (games.length === 0) return []

  const ids = games.map((g) => g.id)
  const { data: rdocs } = await supabase
    .from('game_documents')
    .select('game_id')
    .eq('doc_type', '結果')
    .eq('is_published', true)
    .in('game_id', ids)
  const resultSet = new Set((rdocs ?? []).map((r) => r.game_id as string))

  return games.map((g) => ({ ...g, hasResult: resultSet.has(g.id) }))
}

export async function getGame(id: string): Promise<{
  game: Game | null
  documents: GameDocument[]
}> {
  const supabase = await createClient()
  const [{ data: t }, { data: docs }] = await Promise.all([
    supabase
      .from('games')
      .select('*, division:divisions(*)')
      .eq('id', id)
      .eq('is_published', true)
      .or(scheduledOr())
      .single(),
    supabase
      .from('game_documents')
      .select('*')
      .eq('game_id', id)
      .eq('is_published', true)
      .order('sort_order'),
  ])
  const documents = ((docs ?? []) as GameDocument[]).sort(
    (a, b) =>
      DOC_ORDER.indexOf(a.doc_type) - DOC_ORDER.indexOf(b.doc_type) ||
      a.sort_order - b.sort_order,
  )
  return { game: (t ?? null) as Game | null, documents }
}

export async function getGameAdmin(id: string): Promise<{
  game: Game | null
  documents: GameDocument[]
}> {
  const supabase = await createClient()
  const [{ data: t }, { data: docs }] = await Promise.all([
    supabase
      .from('games')
      .select('*, division:divisions(*)')
      .eq('id', id)
      .single(),
    supabase
      .from('game_documents')
      .select('*')
      .eq('game_id', id)
      .order('sort_order'),
  ])
  const documents = ((docs ?? []) as GameDocument[]).sort(
    (a, b) =>
      DOC_ORDER.indexOf(a.doc_type) - DOC_ORDER.indexOf(b.doc_type) ||
      a.sort_order - b.sort_order,
  )
  return { game: (t ?? null) as Game | null, documents }
}
