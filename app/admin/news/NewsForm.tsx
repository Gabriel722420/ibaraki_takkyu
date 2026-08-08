'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import {
  createAnnouncement,
  updateAnnouncement,
  type AnnouncementInput,
} from './actions'
import {
  Field,
  CheckboxField,
  SaveBar,
  inputClass,
  useSaveState,
  toLocalInput,
  fromLocalInput,
} from '@/components/admin/FormKit'
import type { Announcement, Category } from '@/lib/types'

// SSR事故回避のため動的import(ssr:false)でエディタを読み込む
const RichTextEditor = dynamic(
  () => import('@/components/admin/RichTextEditor').then((m) => m.RichTextEditor),
  {
    ssr: false,
    loading: () => (
      <div className="rounded border p-3 text-sm text-gray-500">
        エディタを読み込み中…
      </div>
    ),
  },
)

// トップ→子の順に並べ、子は接頭辞付きで表示
function orderedCategoryOptions(
  categories: Category[],
): { id: string; label: string }[] {
  const tops = categories.filter((c) => !c.parent_id)
  const out: { id: string; label: string }[] = []
  for (const t of tops) {
    out.push({ id: t.id, label: t.name })
    for (const c of categories.filter((x) => x.parent_id === t.id)) {
      out.push({ id: c.id, label: `　└ ${c.name}` })
    }
  }
  // 親が見つからない孤児も末尾に
  for (const c of categories) {
    if (c.parent_id && !categories.some((p) => p.id === c.parent_id)) {
      out.push({ id: c.id, label: c.name })
    }
  }
  return out
}

export function NewsForm({
  announcement,
  today,
  categories,
}: {
  announcement?: Announcement
  today: string
  categories: Category[]
}) {
  const router = useRouter()
  const editing = !!announcement
  const { saving, error, run } = useSaveState()

  const [title, setTitle] = useState(announcement?.title ?? '')
  const [categoryId, setCategoryId] = useState(
    announcement?.category_id ?? '',
  )
  const [body, setBody] = useState(announcement?.body ?? '')
  const [publishedAt, setPublishedAt] = useState(
    (announcement?.published_at ?? today).slice(0, 10),
  )
  const [isPublished, setIsPublished] = useState(
    announcement?.is_published ?? false,
  )
  const [isPinned, setIsPinned] = useState(announcement?.is_pinned ?? false)
  const [publishAt, setPublishAt] = useState(
    toLocalInput(announcement?.publish_at),
  )

  const canSave = title.trim().length > 0 && publishedAt.length > 0

  function save() {
    const values: AnnouncementInput = {
      title,
      body,
      published_at: publishedAt,
      is_published: isPublished,
      is_pinned: isPinned,
      publish_at: fromLocalInput(publishAt),
      category_id: categoryId || null,
    }
    run(async () => {
      if (editing) {
        await updateAnnouncement({ id: announcement!.id, values })
      } else {
        await createAnnouncement(values)
      }
      router.push('/admin/news')
      router.refresh()
    }, true)
  }

  return (
    <div className="space-y-5">
      <Field label="タイトル（必須）">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClass}
        />
      </Field>

      <Field label="カテゴリー">
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className={inputClass}
        >
          <option value="">（未分類）</option>
          {orderedCategoryOptions(categories).map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label="本文" hint="太字・色・見出し・箇条書き・リンク・画像が使えます">
        <RichTextEditor value={body} onChange={setBody} imagePrefix="news" />
      </Field>

      <Field label="掲載日（必須）">
        <input
          type="date"
          value={publishedAt}
          onChange={(e) => setPublishedAt(e.target.value)}
          className={inputClass}
        />
      </Field>

      <Field label="予約日時" hint="未指定なら即時公開／指定すると到来後に自動公開">
        <input
          type="datetime-local"
          value={publishAt}
          onChange={(e) => setPublishAt(e.target.value)}
          className={inputClass}
        />
      </Field>

      <CheckboxField checked={isPinned} onChange={setIsPinned}>
        重要（上部に固定表示）
      </CheckboxField>

      <CheckboxField checked={isPublished} onChange={setIsPublished}>
        公開する（チェックを外すと下書き）
      </CheckboxField>

      <SaveBar
        onSave={save}
        canSave={canSave}
        saving={saving}
        error={error}
        editing={editing}
        cancelHref="/admin/news"
      />
    </div>
  )
}
