'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { togglePublish, deleteResource, moveResource } from './actions'

export function ResourceRowActions({
  id,
  isPublished,
}: {
  id: string
  isPublished: boolean
}) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  async function run(fn: () => Promise<void>) {
    setBusy(true)
    try {
      await fn()
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => run(() => moveResource({ id, dir: 'up' }))}
        disabled={busy}
        className="rounded border px-3 py-1.5 text-sm disabled:opacity-50"
        aria-label="上へ移動"
      >
        ↑
      </button>
      <button
        onClick={() => run(() => moveResource({ id, dir: 'down' }))}
        disabled={busy}
        className="rounded border px-3 py-1.5 text-sm disabled:opacity-50"
        aria-label="下へ移動"
      >
        ↓
      </button>
      <button
        onClick={() =>
          run(() => togglePublish({ id, isPublished: !isPublished }))
        }
        disabled={busy}
        className="rounded border px-3 py-1.5 text-sm disabled:opacity-50"
      >
        {isPublished ? '非公開にする' : '公開する'}
      </button>
      <button
        onClick={() => {
          if (!confirm('この資料を削除します。よろしいですか？')) return
          run(() => deleteResource({ id }))
        }}
        disabled={busy}
        className="rounded border px-3 py-1.5 text-sm text-red-600 disabled:opacity-50"
      >
        削除
      </button>
    </div>
  )
}
