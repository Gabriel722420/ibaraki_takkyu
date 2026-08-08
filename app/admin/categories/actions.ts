'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin'

function revalidateAll() {
  revalidatePath('/admin/categories')
  revalidatePath('/admin/news')
  revalidatePath('/news') // 公開の絞り込み
}

// slug は unique not null。未入力は英数字化、不能ならランダム。
function slugFor(name: string, slug?: string): string {
  const s = (slug ?? '').trim()
  if (s) return s
  const base = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return base || `category-${crypto.randomUUID().slice(0, 8)}`
}

export async function createCategory(input: {
  name: string
  slug?: string
  parent_id: string | null
  sort_order: number
}) {
  await requireAdmin()
  const supabase = await createClient()
  const { error } = await supabase.from('categories').insert({
    name: input.name.trim(),
    slug: slugFor(input.name, input.slug),
    parent_id: input.parent_id || null,
    sort_order: input.sort_order,
  })
  if (error) throw error
  revalidateAll()
}

export async function updateCategory(input: {
  id: string
  name: string
  slug: string
  parent_id: string | null
  sort_order: number
}) {
  await requireAdmin()
  const supabase = await createClient()
  // 自分自身を親にしない
  const parent = input.parent_id === input.id ? null : input.parent_id || null
  const { error } = await supabase
    .from('categories')
    .update({
      name: input.name.trim(),
      slug: slugFor(input.name, input.slug),
      parent_id: parent,
      sort_order: input.sort_order,
    })
    .eq('id', input.id)
  if (error) throw error
  revalidateAll()
}

// 削除：子は親なし化、記事は未分類化（ともに ON DELETE SET NULL）
export async function deleteCategory(input: { id: string }) {
  await requireAdmin()
  const supabase = await createClient()
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', input.id)
  if (error) throw error
  revalidateAll()
}
