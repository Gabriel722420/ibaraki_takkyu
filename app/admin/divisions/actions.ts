'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin'

function revalidateAll() {
  revalidatePath('/admin/divisions')
  revalidatePath('/admin/games') // 部門名を表示
  revalidatePath('/games') // 公開側も部門名を表示
}

// slug は unique not null。未入力ならランダム生成で衝突回避。
function slugFor(name: string, slug?: string): string {
  const s = (slug ?? '').trim()
  if (s) return s
  const base = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return base || `division-${crypto.randomUUID().slice(0, 8)}`
}

export async function createDivision(input: {
  name: string
  slug?: string
  sort_order: number
}) {
  await requireAdmin()
  const supabase = await createClient()
  const { error } = await supabase.from('divisions').insert({
    name: input.name.trim(),
    slug: slugFor(input.name, input.slug),
    sort_order: input.sort_order,
  })
  if (error) throw error
  revalidateAll()
}

export async function updateDivision(input: {
  id: string
  name: string
  slug: string
  sort_order: number
}) {
  await requireAdmin()
  const supabase = await createClient()
  const { error } = await supabase
    .from('divisions')
    .update({
      name: input.name.trim(),
      slug: slugFor(input.name, input.slug),
      sort_order: input.sort_order,
    })
    .eq('id', input.id)
  if (error) throw error
  revalidateAll()
}

// 部門削除。紐づく大会の division_id は ON DELETE SET NULL なので許容（大会は残る）。
export async function deleteDivision(input: { id: string }) {
  await requireAdmin()
  const supabase = await createClient()
  const { error } = await supabase
    .from('divisions')
    .delete()
    .eq('id', input.id)
  if (error) throw error
  revalidateAll()
}
