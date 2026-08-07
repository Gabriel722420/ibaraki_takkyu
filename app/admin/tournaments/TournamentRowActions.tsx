'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { togglePublish, deleteTournament } from './actions'

export function TournamentRowActions({
  id,
  isPublished,
}: {
  id: string
  isPublished: boolean
}) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  async function toggle() {
    setBusy(true)
    try {
      await togglePublish({ id, isPublished: !isPublished })
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  async function remove() {
    if (
      !confirm(
        'この大会を削除します。添付PDFもすべて削除されます。よろしいですか？',
      )
    )
      return
    setBusy(true)
    try {
      await deleteTournament({ id })
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={toggle}
        disabled={busy}
        className="rounded border px-3 py-1.5 text-sm disabled:opacity-50"
      >
        {isPublished ? '非公開にする' : '公開する'}
      </button>
      <button
        onClick={remove}
        disabled={busy}
        className="rounded border px-3 py-1.5 text-sm text-red-600 disabled:opacity-50"
      >
        削除
      </button>
    </div>
  )
}
