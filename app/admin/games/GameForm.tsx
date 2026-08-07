'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  createGame,
  updateGame,
  type GameInput,
} from './actions'
import type { Division, Game } from '@/lib/types'

export function GameForm({
  divisions,
  game,
  defaultFiscalYear,
}: {
  divisions: Division[]
  game?: Game
  defaultFiscalYear: number
}) {
  const router = useRouter()
  const editing = !!game

  const [divisionId, setDivisionId] = useState(game?.division_id ?? '')
  const [fiscalYear, setFiscalYear] = useState(
    String(game?.fiscal_year ?? defaultFiscalYear),
  )
  const [title, setTitle] = useState(game?.title ?? '')
  const [eventDate, setEventDate] = useState(game?.event_date ?? '')
  const [venue, setVenue] = useState(game?.venue ?? '')
  const [summary, setSummary] = useState(game?.summary ?? '')
  const [isPublished, setIsPublished] = useState(
    game?.is_published ?? false,
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSave = title.trim().length > 0 && Number(fiscalYear) > 0

  async function save() {
    setSaving(true)
    setError(null)
    const values: GameInput = {
      division_id: divisionId || null,
      fiscal_year: Number(fiscalYear),
      title,
      event_date: eventDate || null,
      venue,
      summary,
      is_published: isPublished,
    }
    try {
      if (editing) {
        await updateGame({ id: game!.id, values })
      } else {
        await createGame(values)
      }
      router.push('/admin/games')
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : '保存に失敗しました。')
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="mb-1 block text-sm text-gray-600">部門</label>
        <select
          value={divisionId}
          onChange={(e) => setDivisionId(e.target.value)}
          className="w-full rounded border px-3 py-2"
        >
          <option value="">（部門なし）</option>
          {divisions.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm text-gray-600">年度（必須）</label>
        <input
          type="number"
          value={fiscalYear}
          onChange={(e) => setFiscalYear(e.target.value)}
          className="w-full rounded border px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-gray-600">
          大会名（必須）
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded border px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-gray-600">
          開催日（未定なら空欄でOK）
        </label>
        <input
          type="date"
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
          className="w-full rounded border px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-gray-600">会場（任意）</label>
        <input
          value={venue}
          onChange={(e) => setVenue(e.target.value)}
          className="w-full rounded border px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-gray-600">
          概要（任意・改行可）
        </label>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          rows={4}
          className="w-full rounded border px-3 py-2"
        />
      </div>

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
        <Link href="/admin/games" className="rounded border px-4 py-2">
          一覧へ戻る
        </Link>
        {editing && (
          <Link
            href={`/admin/games/${game!.id}/documents`}
            className="rounded border px-4 py-2"
          >
            資料(PDF)の管理
          </Link>
        )}
      </div>
    </div>
  )
}
