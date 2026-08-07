import { createClient } from './supabase/server'
import { DOC_ORDER } from './docs'
import type { Tournament, TournamentDocument } from './types'

export async function getRetentionYears(): Promise<number> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'record_retention_years')
    .single()
  return Number(data?.value ?? 5)
}

export async function listTournaments(
  opts: { fiscalYear?: number; divisionId?: string } = {},
): Promise<Tournament[]> {
  const supabase = await createClient()
  const years = await getRetentionYears()
  const cutoff = new Date()
  cutoff.setFullYear(cutoff.getFullYear() - years)
  const cutoffStr = cutoff.toISOString().slice(0, 10)

  let q = supabase
    .from('tournaments')
    .select('*, division:divisions(*)')
    .eq('is_published', true)
    .or(`event_date.is.null,event_date.gte.${cutoffStr}`)
    .order('event_date', { ascending: false, nullsFirst: true })

  if (opts.fiscalYear) q = q.eq('fiscal_year', opts.fiscalYear)
  if (opts.divisionId) q = q.eq('division_id', opts.divisionId)

  const { data, error } = await q
  if (error) throw error
  return (data ?? []) as unknown as Tournament[]
}

export async function getTournament(id: string): Promise<{
  tournament: Tournament | null
  documents: TournamentDocument[]
}> {
  const supabase = await createClient()
  const [{ data: t }, { data: docs }] = await Promise.all([
    supabase
      .from('tournaments')
      .select('*, division:divisions(*)')
      .eq('id', id)
      .eq('is_published', true)
      .single(),
    supabase
      .from('tournament_documents')
      .select('*')
      .eq('tournament_id', id)
      .eq('is_published', true)
      .order('sort_order'),
  ])
  const documents = ((docs ?? []) as TournamentDocument[]).sort(
    (a, b) =>
      DOC_ORDER.indexOf(a.doc_type) - DOC_ORDER.indexOf(b.doc_type) ||
      a.sort_order - b.sort_order,
  )
  return { tournament: (t ?? null) as Tournament | null, documents }
}

export async function getTournamentAdmin(id: string): Promise<{
  tournament: Tournament | null
  documents: TournamentDocument[]
}> {
  const supabase = await createClient()
  const [{ data: t }, { data: docs }] = await Promise.all([
    supabase
      .from('tournaments')
      .select('*, division:divisions(*)')
      .eq('id', id)
      .single(),
    supabase
      .from('tournament_documents')
      .select('*')
      .eq('tournament_id', id)
      .order('sort_order'),
  ])
  const documents = ((docs ?? []) as TournamentDocument[]).sort(
    (a, b) =>
      DOC_ORDER.indexOf(a.doc_type) - DOC_ORDER.indexOf(b.doc_type) ||
      a.sort_order - b.sort_order,
  )
  return { tournament: (t ?? null) as Tournament | null, documents }
}
