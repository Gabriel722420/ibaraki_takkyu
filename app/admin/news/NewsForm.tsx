'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  createAnnouncement,
  updateAnnouncement,
  type AnnouncementInput,
} from './actions'
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

  const [title, setTitle] = useState(announcement?.title ?? '')
  const [body, setBody] = useState(announcement?.body ?? '')
  const [publishedAt, setPublishedAt] = useState(
    (announcement?.published_at ?? today).slice(0, 10),
  )
  const [isPublished, setIsPublished] = useState(
    announcement?.is_published ?? false,
  )
  const [isPinned, setIsPinned] = useState(announcement?.is_pinned ?? false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSave = title.trim().length > 0 && publishedAt.length > 0

  async function save() {
    setSaving(true)
    setError(null)
    const values: AnnouncementInput = {
      title,
      body,
      published_at: publishedAt,
      is_published: isPublished,
      is_pinned: isPinned,
    }
    try {
      if (editing) {
        await updateAnnouncement({ id: announcement!.id, values })
      } else {
        await createAnnouncement(values)
      }
      router.push('/admin/news')
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : '保存に失敗しました。')
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="mb-1 block text-sm text-gray-600">
          タイトル（必須）
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded border px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-gray-600">
          本文（任意・改行可）
        </label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={8}
          className="w-full rounded border px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-gray-600">
          掲載日（必須）
        </label>
        <input
          type="date"
          value={publishedAt}
          onChange={(e) => setPublishedAt(e.target.value)}
          className="w-full rounded border px-3 py-2"
        />
      </div>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={isPinned}
          onChange={(e) => setIsPinned(e.target.checked)}
          className="h-5 w-5"
        />
        <span>重要（上部に固定表示）</span>
      </label>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={isPublished}
          onChange={(e) => setIsPublished(e.target.checked)}
          className="h-5 w-5"
        />
        <span>公開する（チェックを外すと下書き）</span>
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex flex-wrap gap-2">
        <button
          onClick={save}
          disabled={saving || !canSave}
          className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {saving ? '保存中…' : editing ? '更新する' : '作成する'}
        </button>
        <Link href="/admin/news" className="rounded border px-4 py-2">
          一覧へ戻る
        </Link>
      </div>
    </div>
  )
}
