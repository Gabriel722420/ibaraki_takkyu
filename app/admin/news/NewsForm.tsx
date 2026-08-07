'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
} from '@/components/admin/FormKit'
import type { Announcement } from '@/lib/types'

export function NewsForm({
  announcement,
  today,
}: {
  announcement?: Announcement
  today: string
}) {
  const router = useRouter()
  const editing = !!announcement
  const { saving, error, run } = useSaveState()

  const [title, setTitle] = useState(announcement?.title ?? '')
  const [body, setBody] = useState(announcement?.body ?? '')
  const [publishedAt, setPublishedAt] = useState(
    (announcement?.published_at ?? today).slice(0, 10),
  )
  const [isPublished, setIsPublished] = useState(
    announcement?.is_published ?? false,
  )
  const [isPinned, setIsPinned] = useState(announcement?.is_pinned ?? false)

  const canSave = title.trim().length > 0 && publishedAt.length > 0

  function save() {
    const values: AnnouncementInput = {
      title,
      body,
      published_at: publishedAt,
      is_published: isPublished,
      is_pinned: isPinned,
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

      <Field label="本文" hint="改行できます">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={8}
          className={inputClass}
        />
      </Field>

      <Field label="掲載日（必須）">
        <input
          type="date"
          value={publishedAt}
          onChange={(e) => setPublishedAt(e.target.value)}
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
