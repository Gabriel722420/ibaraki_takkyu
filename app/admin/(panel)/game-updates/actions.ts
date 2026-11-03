'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin'

export type GameUpdateInput = {
  game_id: string | null
  division_id: string | null
  body: string
  posted_at: string // 'YYYY-MM-DD'
  is_published: boolean
  publish_at: string | null
}

function revalidateAll() {
  revalidatePath('/admin/game-updates')
  revalidatePath('/') // TOP ④ 大会情報更新履歴
}

function normalize(i: GameUpdateInput): GameUpdateInput {
  return {
    game_id: i.game_id || null,
    division_id: i.division_id || null,
    body: i.body.trim(),
    posted_at: i.posted_at,
    is_published: i.is_published,
    publish_at: i.publish_at,
  }
}

export async function createGameUpdate(input: GameUpdateInput) {
  await requireAdmin()
  const supabase = await createClient()
  const { error } = await supabase
    .from('game_updates')
    .insert(normalize(input))
  if (error) throw error
  revalidateAll()
}

export async function updateGameUpdate(input: {
  id: string
  values: GameUpdateInput
}) {
  await requireAdmin()
  const supabase = await createClient()
  const { error } = await supabase
    .from('game_updates')
    .update(normalize(input.values))
    .eq('id', input.id)
  if (error) throw error
  revalidateAll()
}

export async function togglePublish(input: {
  id: string
  isPublished: boolean
}) {
  await requireAdmin()
  const supabase = await createClient()
  const { error } = await supabase
    .from('game_updates')
    .update({ is_published: input.isPublished })
    .eq('id', input.id)
  if (error) throw error
  revalidateAll()
}

export async function deleteGameUpdate(input: { id: string }) {
  await requireAdmin()
  const supabase = await createClient()
  const { error } = await supabase
    .from('game_updates')
    .delete()
    .eq('id', input.id)
  if (error) throw error
  revalidateAll()
}
