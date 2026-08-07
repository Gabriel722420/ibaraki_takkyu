'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin'
import type { DocType } from '@/lib/types'

function revalidate(gameId: string) {
  revalidatePath(`/admin/games/${gameId}/documents`)
  revalidatePath(`/games/${gameId}`)
}

export async function addDocument(input: {
  gameId: string
  docType: DocType
  title: string
  filePath: string
}) {
  await requireAdmin()
  const supabase = await createClient()
  const { error } = await supabase.from('game_documents').insert({
    game_id: input.gameId,
    doc_type: input.docType,
    title: input.title,
    file_path: input.filePath,
  })
  if (error) throw error
  revalidate(input.gameId)
}

export async function renameDocument(input: {
  id: string
  gameId: string
  title: string
}) {
  await requireAdmin()
  const supabase = await createClient()
  const { error } = await supabase
    .from('game_documents')
    .update({ title: input.title })
    .eq('id', input.id)
  if (error) throw error
  revalidate(input.gameId)
}

export async function updateDocType(input: {
  id: string
  gameId: string
  docType: DocType
}) {
  await requireAdmin()
  const supabase = await createClient()
  const { error } = await supabase
    .from('game_documents')
    .update({ doc_type: input.docType })
    .eq('id', input.id)
  if (error) throw error
  revalidate(input.gameId)
}

export async function deleteDocument(input: {
  id: string
  gameId: string
  filePath: string | null
}) {
  await requireAdmin()
  const supabase = await createClient()
  const { error } = await supabase
    .from('game_documents')
    .delete()
    .eq('id', input.id)
  if (error) throw error
  if (input.filePath)
    await supabase.storage.from('documents').remove([input.filePath])
  revalidate(input.gameId)
}
