'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin'
import type { FormFieldType, FormStatus } from '@/lib/types'

function revalidate(id?: string) {
  revalidatePath('/admin/forms')
  if (id) revalidatePath(`/admin/forms/${id}/edit`)
}

function slugify(title: string): string {
  const base = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  const rand = crypto.randomUUID().slice(0, 6)
  return `${base || 'form'}-${rand}`
}

export type FormValues = {
  title: string
  description: string | null
  game_id: string | null
  slug: string
  status: FormStatus
  open_at: string | null
  close_at: string | null
}

export async function createForm(input: {
  title: string
}): Promise<{ id: string }> {
  await requireAdmin()
  const supabase = await createClient()
  const title = input.title.trim() || '無題のフォーム'
  const { data, error } = await supabase
    .from('forms')
    .insert({ title, slug: slugify(title) })
    .select('id')
    .single()
  if (error) throw error
  revalidate(data.id)
  return { id: data.id as string }
}

export async function updateForm(input: { id: string; values: FormValues }) {
  await requireAdmin()
  const supabase = await createClient()
  const v = input.values
  const { error } = await supabase
    .from('forms')
    .update({
      title: v.title.trim(),
      description: v.description?.trim() || null,
      game_id: v.game_id || null,
      slug: v.slug.trim(),
      status: v.status,
      open_at: v.open_at || null,
      close_at: v.close_at || null,
    })
    .eq('id', input.id)
  if (error) throw error
  revalidate(input.id)
}

export async function togglePublish(input: {
  id: string
  isPublished: boolean
}) {
  await requireAdmin()
  const supabase = await createClient()
  const { error } = await supabase
    .from('forms')
    .update({ status: input.isPublished ? 'published' : 'draft' })
    .eq('id', input.id)
  if (error) throw error
  revalidate(input.id)
}

export async function deleteForm(input: { id: string }) {
  await requireAdmin()
  const supabase = await createClient()
  const { error } = await supabase.from('forms').delete().eq('id', input.id)
  if (error) throw error
  revalidate()
}

export async function duplicateForm(input: { id: string }) {
  await requireAdmin()
  const supabase = await createClient()
  const { data: src } = await supabase
    .from('forms')
    .select('*')
    .eq('id', input.id)
    .single()
  if (!src) return
  const { data: created, error } = await supabase
    .from('forms')
    .insert({
      game_id: src.game_id,
      title: `${src.title}（コピー）`,
      description: src.description,
      slug: slugify(src.title),
      status: 'draft', // 複製は下書き
      open_at: src.open_at,
      close_at: src.close_at,
    })
    .select('id')
    .single()
  if (error) throw error

  const { data: fields } = await supabase
    .from('form_fields')
    .select('field_type, label, placeholder, required, options, sort_order')
    .eq('form_id', input.id)
  if (fields && fields.length > 0) {
    await supabase
      .from('form_fields')
      .insert(fields.map((f) => ({ ...f, form_id: created.id })))
  }
  revalidate()
}

// ── 項目 ──
export async function addField(input: {
  formId: string
  fieldType: FormFieldType
}) {
  await requireAdmin()
  const supabase = await createClient()
  const { data: rows } = await supabase
    .from('form_fields')
    .select('sort_order')
    .eq('form_id', input.formId)
    .order('sort_order', { ascending: false })
    .limit(1)
  const next = (rows?.[0]?.sort_order ?? 0) + 10
  const { error } = await supabase.from('form_fields').insert({
    form_id: input.formId,
    field_type: input.fieldType,
    sort_order: next,
  })
  if (error) throw error
  revalidate(input.formId)
}

export async function updateField(input: {
  id: string
  formId: string
  values: {
    label: string
    placeholder: string | null
    required: boolean
    options: string[]
  }
}) {
  await requireAdmin()
  const supabase = await createClient()
  const { error } = await supabase
    .from('form_fields')
    .update({
      label: input.values.label.trim() || '項目',
      placeholder: input.values.placeholder?.trim() || null,
      required: input.values.required,
      options: input.values.options,
    })
    .eq('id', input.id)
  if (error) throw error
  revalidate(input.formId)
}

export async function deleteField(input: { id: string; formId: string }) {
  await requireAdmin()
  const supabase = await createClient()
  const { error } = await supabase
    .from('form_fields')
    .delete()
    .eq('id', input.id)
  if (error) throw error
  revalidate(input.formId)
}

// dnd-kit のドラッグ結果を永続化（並び順を index*10 で確定）
export async function reorderFields(input: {
  formId: string
  orderedIds: string[]
}) {
  await requireAdmin()
  const supabase = await createClient()
  await Promise.all(
    input.orderedIds.map((id, i) =>
      supabase
        .from('form_fields')
        .update({ sort_order: (i + 1) * 10 })
        .eq('id', id)
        .eq('form_id', input.formId),
    ),
  )
  revalidate(input.formId)
}

// 同一フォーム内で上下入れ替え
export async function moveField(input: {
  id: string
  formId: string
  dir: 'up' | 'down'
}) {
  await requireAdmin()
  const supabase = await createClient()
  const { data: list } = await supabase
    .from('form_fields')
    .select('id, sort_order')
    .eq('form_id', input.formId)
    .order('sort_order', { ascending: true })
  const arr = list ?? []
  const idx = arr.findIndex((r) => r.id === input.id)
  const swap = input.dir === 'up' ? idx - 1 : idx + 1
  if (idx < 0 || swap < 0 || swap >= arr.length) return
  const a = arr[idx]
  const b = arr[swap]
  const bOrder =
    b.sort_order === a.sort_order
      ? a.sort_order + (input.dir === 'up' ? -1 : 1)
      : b.sort_order
  await supabase
    .from('form_fields')
    .update({ sort_order: bOrder })
    .eq('id', a.id)
  await supabase
    .from('form_fields')
    .update({ sort_order: a.sort_order })
    .eq('id', b.id)
  revalidate(input.formId)
}
