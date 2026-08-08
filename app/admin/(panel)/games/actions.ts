'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin'

export type GameInput = {
  division_id: string | null
  fiscal_year: number
  title: string
  event_date: string | null
  venue: string | null
  summary: string | null
  is_published: boolean
  publish_at: string | null // ISO or null（null=即時公開）
}

function revalidateAll(id?: string) {
  revalidatePath('/admin/games')
  revalidatePath('/games') // 公開一覧
  if (id) revalidatePath(`/games/${id}`) // 公開詳細
}

// 入力を正規化（空文字は null に）
function normalize(input: GameInput): GameInput {
  return {
    division_id: input.division_id || null,
    fiscal_year: input.fiscal_year,
    title: input.title.trim(),
    event_date: input.event_date || null,
    venue: input.venue?.trim() || null,
    summary: input.summary?.trim() || null,
    is_published: input.is_published,
    publish_at: input.publish_at || null,
  }
}

export async function createGame(
  input: GameInput,
): Promise<{ id: string }> {
  await requireAdmin()
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('games')
    .insert(normalize(input))
    .select('id')
    .single()
  if (error) throw error
  revalidateAll(data.id)
  return { id: data.id as string }
}

export async function updateGame(input: {
  id: string
  values: GameInput
}) {
  await requireAdmin()
  const supabase = await createClient()
  const { error } = await supabase
    .from('games')
    .update(normalize(input.values))
    .eq('id', input.id)
  if (error) throw error
  revalidateAll(input.id)
}

export async function togglePublish(input: {
  id: string
  isPublished: boolean
}) {
  await requireAdmin()
  const supabase = await createClient()
  const { error } = await supabase
    .from('games')
    .update({ is_published: input.isPublished })
    .eq('id', input.id)
  if (error) throw error
  revalidateAll(input.id)
}

// 大会削除。game_documents は CASCADE で消えるが、Storage 実体は別途削除する。
export async function deleteGame(input: { id: string }) {
  await requireAdmin()
  const supabase = await createClient()

  // 紐づく PDF の物理パスを集めて Storage から削除
  const { data: docs } = await supabase
    .from('game_documents')
    .select('file_path')
    .eq('game_id', input.id)
  const paths = (docs ?? [])
    .map((d) => d.file_path as string | null)
    .filter((p): p is string => !!p)
  if (paths.length > 0) {
    await supabase.storage.from('documents').remove(paths)
  }

  const { error } = await supabase
    .from('games')
    .delete()
    .eq('id', input.id)
  if (error) throw error
  revalidateAll(input.id)
}
