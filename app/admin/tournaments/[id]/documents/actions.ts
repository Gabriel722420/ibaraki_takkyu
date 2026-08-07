'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin'
import type { DocType } from '@/lib/types'

function revalidate(tournamentId: string) {
  revalidatePath(`/admin/tournaments/${tournamentId}/documents`)
  revalidatePath(`/tournaments/${tournamentId}`)
}

export async function addDocument(input: {
  tournamentId: string
  docType: DocType
  title: string
  filePath: string
}) {
  await requireAdmin()
  const supabase = await createClient()
  const { error } = await supabase.from('tournament_documents').insert({
    tournament_id: input.tournamentId,
    doc_type: input.docType,
    title: input.title,
    file_path: input.filePath,
  })
  if (error) throw error
  revalidate(input.tournamentId)
}

export async function renameDocument(input: {
  id: string
  tournamentId: string
  title: string
}) {
  await requireAdmin()
  const supabase = await createClient()
  const { error } = await supabase
    .from('tournament_documents')
    .update({ title: input.title })
    .eq('id', input.id)
  if (error) throw error
  revalidate(input.tournamentId)
}

export async function updateDocType(input: {
  id: string
  tournamentId: string
  docType: DocType
}) {
  await requireAdmin()
  const supabase = await createClient()
  const { error } = await supabase
    .from('tournament_documents')
    .update({ doc_type: input.docType })
    .eq('id', input.id)
  if (error) throw error
  revalidate(input.tournamentId)
}

export async function deleteDocument(input: {
  id: string
  tournamentId: string
  filePath: string | null
}) {
  await requireAdmin()
  const supabase = await createClient()
  const { error } = await supabase
    .from('tournament_documents')
    .delete()
    .eq('id', input.id)
  if (error) throw error
  if (input.filePath)
    await supabase.storage.from('documents').remove([input.filePath])
  revalidate(input.tournamentId)
}
