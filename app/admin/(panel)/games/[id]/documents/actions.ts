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

// ④ docアップ動線からの半自動起票：この大会の「大会情報更新履歴」を1件作成。
// 部門(division)は大会から自動補完。TOP(④)と管理一覧を revalidate。
export async function addGameUpdate(input: { gameId: string; body: string }) {
  await requireAdmin()
  const body = input.body.trim()
  if (!body) return
  const supabase = await createClient()
  const { data: g } = await supabase
    .from('games')
    .select('division_id')
    .eq('id', input.gameId)
    .single()
  const { error } = await supabase.from('game_updates').insert({
    game_id: input.gameId,
    division_id: g?.division_id ?? null,
    body,
  })
  if (error) throw error
  revalidatePath('/')
  revalidatePath('/admin/game-updates')
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
