import { createClient } from './supabase/server'
import { DOC_ORDER } from './docs'
import type { Division, Game, GameDocument } from './types'

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
  const years = await getRetentionYears()
  const cutoff = new Date()
  cutoff.setFullYear(cutoff.getFullYear() - years)
  const cutoffStr = cutoff.toISOString().slice(0, 10)

  let q = supabase
    .from('games')
    .select('*, division:divisions(*)')
    .eq('is_published', true)
    .or(`event_date.is.null,event_date.gte.${cutoffStr}`)
    .order('event_date', { ascending: false, nullsFirst: true })

  if (opts.fiscalYear) q = q.eq('fiscal_year', opts.fiscalYear)
  if (opts.divisionId) q = q.eq('division_id', opts.divisionId)

  const { data, error } = await q
  if (error) throw error
  return (data ?? []) as unknown as Game[]
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
