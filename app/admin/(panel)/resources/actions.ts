'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin'

export type ResourceInput = {
  category: string
  title: string
  file_path: string | null
  external_url: string | null
  sort_order: number
  is_published: boolean
}

function revalidateAll() {
  revalidatePath('/admin/resources')
  revalidatePath('/registration') // 公開一覧
}

function normalize(input: ResourceInput): ResourceInput {
  return {
    category: input.category.trim() || 'その他',
    title: input.title.trim(),
    file_path: input.file_path || null,
    external_url: input.external_url?.trim() || null,
    sort_order: input.sort_order,
    is_published: input.is_published,
  }
}

async function removeStorage(paths: (string | null)[]) {
  const list = paths.filter((p): p is string => !!p)
  if (list.length === 0) return
  const supabase = await createClient()
  await supabase.storage.from('documents').remove(list)
}

export async function createResource(input: ResourceInput) {
  await requireAdmin()
  const supabase = await createClient()
  const { error } = await supabase.from('resources').insert(normalize(input))
  if (error) throw error
  revalidateAll()
}

export async function updateResource(input: {
  id: string
  values: ResourceInput
}) {
  await requireAdmin()
  const supabase = await createClient()

  // PDF を差し替えた場合は旧ファイルを Storage から掃除
  const { data: prev } = await supabase
    .from('resources')
    .select('file_path')
    .eq('id', input.id)
    .single()
  const oldPath = (prev?.file_path as string | null) ?? null
  const newPath = input.values.file_path || null
  if (oldPath && oldPath !== newPath) await removeStorage([oldPath])

  const { error } = await supabase
    .from('resources')
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
    .from('resources')
    .update({ is_published: input.isPublished })
    .eq('id', input.id)
  if (error) throw error
  revalidateAll()
}

export async function deleteResource(input: { id: string }) {
  await requireAdmin()
  const supabase = await createClient()
  const { data: prev } = await supabase
    .from('resources')
    .select('file_path')
    .eq('id', input.id)
    .single()
  await removeStorage([prev?.file_path ?? null])

  const { error } = await supabase
    .from('resources')
    .delete()
    .eq('id', input.id)
  if (error) throw error
  revalidateAll()
}

// 同一 category 内で上下入れ替え（sort_order をスワップ）
export async function moveResource(input: { id: string; dir: 'up' | 'down' }) {
  await requireAdmin()
  const supabase = await createClient()

  const { data: cur } = await supabase
    .from('resources')
    .select('id, category, sort_order')
    .eq('id', input.id)
    .single()
  if (!cur) return

  const { data: siblings } = await supabase
    .from('resources')
    .select('id, sort_order')
    .eq('category', cur.category)
    .order('sort_order', { ascending: true })
    .order('title', { ascending: true })
  const list = siblings ?? []
  const idx = list.findIndex((r) => r.id === cur.id)
  const swapIdx = input.dir === 'up' ? idx - 1 : idx + 1
  if (idx < 0 || swapIdx < 0 || swapIdx >= list.length) return

  const a = list[idx]
  const b = list[swapIdx]
  // sort_order をスワップ（同値の場合もインデックス差でずらす）
  const aOrder = a.sort_order
  const bOrder = b.sort_order === aOrder ? aOrder + (input.dir === 'up' ? -1 : 1) : b.sort_order
  await supabase.from('resources').update({ sort_order: bOrder }).eq('id', a.id)
  await supabase.from('resources').update({ sort_order: aOrder }).eq('id', b.id)
  revalidateAll()
}
