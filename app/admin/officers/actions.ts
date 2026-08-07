'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin'

export type OfficerInput = {
  role: string
  name: string
  note: string | null
  sort_order: number
  is_published: boolean
}

function revalidateAll() {
  revalidatePath('/admin/officers')
  revalidatePath('/about')
}

function normalize(input: OfficerInput): OfficerInput {
  return {
    role: input.role.trim(),
    name: input.name.trim(),
    note: input.note?.trim() || null,
    sort_order: input.sort_order,
    is_published: input.is_published,
  }
}

export async function createOfficer(input: OfficerInput) {
  await requireAdmin()
  const supabase = await createClient()
  const { error } = await supabase.from('officers').insert(normalize(input))
  if (error) throw error
  revalidateAll()
}

export async function updateOfficer(input: {
  id: string
  values: OfficerInput
}) {
  await requireAdmin()
  const supabase = await createClient()
  const { error } = await supabase
    .from('officers')
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
    .from('officers')
    .update({ is_published: input.isPublished })
    .eq('id', input.id)
  if (error) throw error
  revalidateAll()
}

export async function deleteOfficer(input: { id: string }) {
  await requireAdmin()
  const supabase = await createClient()
  const { error } = await supabase.from('officers').delete().eq('id', input.id)
  if (error) throw error
  revalidateAll()
}

// 上下入れ替え（sort_order をスワップ）
export async function moveOfficer(input: { id: string; dir: 'up' | 'down' }) {
  await requireAdmin()
  const supabase = await createClient()
  const { data: list } = await supabase
    .from('officers')
    .select('id, sort_order')
    .order('sort_order', { ascending: true })
  const arr = list ?? []
  const idx = arr.findIndex((r) => r.id === input.id)
  const swapIdx = input.dir === 'up' ? idx - 1 : idx + 1
  if (idx < 0 || swapIdx < 0 || swapIdx >= arr.length) return

  const a = arr[idx]
  const b = arr[swapIdx]
  const aOrder = a.sort_order
  const bOrder =
    b.sort_order === aOrder ? aOrder + (input.dir === 'up' ? -1 : 1) : b.sort_order
  await supabase.from('officers').update({ sort_order: bOrder }).eq('id', a.id)
  await supabase.from('officers').update({ sort_order: aOrder }).eq('id', b.id)
  revalidateAll()
}
