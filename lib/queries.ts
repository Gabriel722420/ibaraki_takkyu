import { createClient } from './supabase/server'
import { DOC_ORDER, RESULT_DETAIL_RETENTION_DAYS } from './docs'
import type {
  Announcement,
  Category,
  Division,
  Form,
  FormField,
  Game,
  GameDocument,
  GameUpdate,
  Officer,
  Resource,
} from './types'

// ── 申込フォーム（管理側） ──
export async function listFormsAdmin(): Promise<Form[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('forms')
    .select('*, game:games(id, title)')
    .order('updated_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as unknown as Form[]
}

export async function getFormAdmin(id: string): Promise<{
  form: Form | null
  fields: FormField[]
}> {
  const supabase = await createClient()
  const [{ data: form }, { data: fields }] = await Promise.all([
    supabase.from('forms').select('*, game:games(id, title)').eq('id', id).single(),
    supabase
      .from('form_fields')
      .select('*')
      .eq('form_id', id)
      .order('sort_order', { ascending: true }),
  ])
  return {
    form: (form ?? null) as unknown as Form | null,
    fields: (fields ?? []) as FormField[],
  }
}

export type Paged<T> = {
  items: T[]
  total: number
  page: number
  perPage: number
}

// 予約投稿の公開ゲート：publish_at 未設定 or 到来済みのみ公開。
// 使い方: query.or(scheduledOr())（is_published=true とAND結合される）
function scheduledOr(): string {
  return `publish_at.is.null,publish_at.lte.${new Date().toISOString()}`
}

// 掲載から N 日で非表示：JST基準の「今日−N日」を下限日付(YYYY-MM-DD)で返す。
// scheduledOr()（秒単位の予約ゲート）と併用し .gte('<日付列>', retentionCutoff(N)) で効かせる。cron不要。
// 日単位の境界はJSTで切る（UTC toISOString だと深夜帯で±1日ずれるため）。
function retentionCutoff(days: number): string {
  const jst = new Date(Date.now() + 9 * 3600_000)
  jst.setUTCDate(jst.getUTCDate() - days)
  return jst.toISOString().slice(0, 10)
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

// ── カテゴリ（お知らせ分類・公開/管理共通） ──
export async function listCategories(): Promise<Category[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })
  if (error) throw error
  return (data ?? []) as Category[]
}

export async function getCategoryAdmin(id: string): Promise<Category | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single()
  return (data ?? null) as Category | null
}

// ── お知らせ（公開側・ページング＋カテゴリ絞り込み） ──
// 公開のみ・固定を上部・公開日降順。categoryIds 指定時は当該＋子孫で絞る（呼び出し側で展開）。
export async function listAnnouncements(
  opts: { categoryIds?: string[]; page?: number; perPage?: number } = {},
): Promise<Paged<Announcement>> {
  const supabase = await createClient()
  const perPage = opts.perPage ?? 30
  const page = Math.max(1, opts.page ?? 1)
  const from = (page - 1) * perPage
  let q = supabase
    .from('announcements')
    .select('*, category:categories(*)', { count: 'exact' })
    .eq('is_published', true)
    .or(scheduledOr())
  if (opts.categoryIds && opts.categoryIds.length > 0)
    q = q.in('category_id', opts.categoryIds)
  q = q
    .order('is_pinned', { ascending: false })
    .order('published_at', { ascending: false })
    .range(from, from + perPage - 1)
  const { data, count, error } = await q
  if (error) throw error
  return {
    items: (data ?? []) as unknown as Announcement[],
    total: count ?? 0,
    page,
    perPage,
  }
}

// 詳細：公開のみ
// id は wp_post_id（数字のみ＝正規の短縮URL）または UUID（旧URL・新規投稿）を受け付ける。
export async function getAnnouncement(id: string): Promise<Announcement | null> {
  const supabase = await createClient()
  const byWpId = /^\d+$/.test(id)
  const { data } = await supabase
    .from('announcements')
    .select('*, category:categories(*)')
    .eq(byWpId ? 'wp_post_id' : 'id', byWpId ? Number(id) : id)
    .eq('is_published', true)
    .or(scheduledOr())
    .single()
  return (data ?? null) as unknown as Announcement | null
}

// 関連おしらせ（同カテゴリの最近記事・現記事を除く）。詳細ページの回遊導線用。
// カテゴリ未設定/同カテゴリが少数の場合は最新のおしらせで補完する。
export async function listRelatedAnnouncements(
  current: Pick<Announcement, 'id' | 'category_id'>,
  limit = 5,
): Promise<Announcement[]> {
  const supabase = await createClient()
  const base = () =>
    supabase
      .from('announcements')
      .select('*, category:categories(*)')
      .eq('is_published', true)
      .or(scheduledOr())
      .neq('id', current.id)
      .order('published_at', { ascending: false })

  const results: Announcement[] = []
  const seen = new Set<string>([current.id])
  const take = (rows: Announcement[]) => {
    for (const a of rows) {
      if (results.length >= limit) break
      if (!seen.has(a.id)) {
        results.push(a)
        seen.add(a.id)
      }
    }
  }

  if (current.category_id) {
    const { data } = await base()
      .eq('category_id', current.category_id)
      .limit(limit)
    take((data ?? []) as unknown as Announcement[])
  }
  if (results.length < limit) {
    const { data } = await base().limit(limit * 2)
    take((data ?? []) as unknown as Announcement[])
  }
  return results
}

// ── お知らせ（管理側・is_published で絞らない・ページング） ──
export async function listAnnouncementsAdmin(
  opts: { page?: number; perPage?: number } = {},
): Promise<Paged<Announcement>> {
  const supabase = await createClient()
  const perPage = opts.perPage ?? 30
  const page = Math.max(1, opts.page ?? 1)
  const from = (page - 1) * perPage
  const { data, count, error } = await supabase
    .from('announcements')
    .select('*, category:categories(*)', { count: 'exact' })
    .order('is_pinned', { ascending: false })
    .order('published_at', { ascending: false })
    .range(from, from + perPage - 1)
  if (error) throw error
  return {
    items: (data ?? []) as unknown as Announcement[],
    total: count ?? 0,
    page,
    perPage,
  }
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

// ⑤ TOP「NEWS（連盟のお知らせ）」：2027以降の“新規”お知らせのみ。
// 新規＝wp_post_id が NULL（WP移行2049件は必ず wp_post_id を持つ＝構造的に混ざらない）。
// 掲載から365日で非表示（published_at 基準・動的）。固定を優先し公開日降順。
export async function listTopNews(limit = 6): Promise<Announcement[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('announcements')
    .select('*, category:categories(*)')
    .eq('is_published', true)
    .or(scheduledOr())
    .is('wp_post_id', null)
    .gte('published_at', retentionCutoff(365))
    .order('is_pinned', { ascending: false })
    .order('published_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data ?? []) as unknown as Announcement[]
}

// ④ TOP「大会情報更新履歴」：掲載から30日で非表示（posted_at 基準・動的）。新しい順。
// game_updates 未適用（マイグレ前）でもTOPを壊さないよう、エラー時は空で縮退する。
export async function listGameUpdates(limit = 10): Promise<GameUpdate[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('game_updates')
    .select('*, division:divisions(*), game:games(id, title)')
    .eq('is_published', true)
    .or(scheduledOr())
    .gte('posted_at', retentionCutoff(30))
    .order('posted_at', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) return []
  return (data ?? []) as unknown as GameUpdate[]
}

// ④ 管理側：全件（is_published/期間で絞らない）。未適用時は空で縮退。
export async function listGameUpdatesAdmin(): Promise<GameUpdate[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('game_updates')
    .select('*, division:divisions(*), game:games(id, title)')
    .order('posted_at', { ascending: false })
    .order('created_at', { ascending: false })
  if (error) return []
  return (data ?? []) as unknown as GameUpdate[]
}

export async function getGameUpdateAdmin(id: string): Promise<GameUpdate | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('game_updates')
    .select('*, division:divisions(*), game:games(id, title)')
    .eq('id', id)
    .single()
  return (data ?? null) as unknown as GameUpdate | null
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

  // 「結果あり」＝永続記録(上位結果 / レガシー結果) か、まだ有効な詳細結果(365日内)。
  const ids = games.map((g) => g.id)
  const { data: rdocs } = await supabase
    .from('game_documents')
    .select('game_id, doc_type, created_at')
    .in('doc_type', ['結果', '上位結果', '詳細結果'])
    .eq('is_published', true)
    .in('game_id', ids)
  const cutoff = retentionCutoff(RESULT_DETAIL_RETENTION_DAYS)
  const resultSet = new Set(
    (rdocs ?? [])
      .filter(
        (r) =>
          r.doc_type !== '詳細結果' ||
          String(r.created_at).slice(0, 10) >= cutoff,
      )
      .map((r) => r.game_id as string),
  )

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
  // ③ 詳細結果は掲載から365日で非表示（created_at 基準・動的）。上位結果/レガシー結果は永続。
  const cutoff = retentionCutoff(RESULT_DETAIL_RETENTION_DAYS)
  const documents = ((docs ?? []) as GameDocument[])
    .filter(
      (d) =>
        d.doc_type !== '詳細結果' ||
        String(d.created_at).slice(0, 10) >= cutoff,
    )
    .sort(
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
