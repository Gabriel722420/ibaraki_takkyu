'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin'

export type AnnouncementInput = {
  title: string
  body: string | null
  published_at: string // YYYY-MM-DD（timestamptz へキャスト）
  is_published: boolean
  is_pinned: boolean
  publish_at: string | null // ISO or null（null=即時公開）
  category_id: string | null
}

function revalidateAll(id?: string) {
  revalidatePath('/admin/news')
  revalidatePath('/news') // 公開一覧
  revalidatePath('/') // TOP の最新お知らせ
  if (id) revalidatePath(`/news/${id}`) // 公開詳細
}

function normalize(input: AnnouncementInput): AnnouncementInput {
  return {
    title: input.title.trim(),
    body: input.body?.trim() || null,
    published_at: input.published_at,
    is_published: input.is_published,
    is_pinned: input.is_pinned,
    publish_at: input.publish_at || null,
    category_id: input.category_id || null,
  }
}

export async function createAnnouncement(
  input: AnnouncementInput,
): Promise<{ id: string }> {
  await requireAdmin()
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('announcements')
    .insert(normalize(input))
    .select('id')
    .single()
  if (error) throw error
  revalidateAll(data.id)
  return { id: data.id as string }
}

export async function updateAnnouncement(input: {
  id: string
  values: AnnouncementInput
}) {
  await requireAdmin()
  const supabase = await createClient()
  const { error } = await supabase
    .from('announcements')
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
    .from('announcements')
    .update({ is_published: input.isPublished })
    .eq('id', input.id)
  if (error) throw error
  revalidateAll(input.id)
}

export async function deleteAnnouncement(input: { id: string }) {
  await requireAdmin()
  const supabase = await createClient()
  const { error } = await supabase
    .from('announcements')
    .delete()
    .eq('id', input.id)
  if (error) throw error
  revalidateAll(input.id)
}
