'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createGame, updateGame, type GameInput } from './actions'
import {
  Field,
  CheckboxField,
  SaveBar,
  inputClass,
  useSaveState,
} from '@/components/admin/FormKit'
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
  const { saving, error, run } = useSaveState()

  const [divisionId, setDivisionId] = useState(game?.division_id ?? '')
  const [fiscalYear, setFiscalYear] = useState(
    String(game?.fiscal_year ?? defaultFiscalYear),
  )
  const [title, setTitle] = useState(game?.title ?? '')
  const [eventDate, setEventDate] = useState(game?.event_date ?? '')
  const [venue, setVenue] = useState(game?.venue ?? '')
  const [summary, setSummary] = useState(game?.summary ?? '')
  const [isPublished, setIsPublished] = useState(game?.is_published ?? false)

  const canSave = title.trim().length > 0 && Number(fiscalYear) > 0

  function save() {
    const values: GameInput = {
      division_id: divisionId || null,
      fiscal_year: Number(fiscalYear),
      title,
      event_date: eventDate || null,
      venue,
      summary,
      is_published: isPublished,
    }
    run(async () => {
      if (editing) {
        await updateGame({ id: game!.id, values })
      } else {
        await createGame(values)
      }
      router.push('/admin/games')
      router.refresh()
    }, true)
  }

  return (
    <div className="space-y-5">
      <Field label="部門">
        <select
          value={divisionId}
          onChange={(e) => setDivisionId(e.target.value)}
          className={inputClass}
        >
          <option value="">（部門なし）</option>
          {divisions.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="年度（必須）">
        <input
          type="number"
          value={fiscalYear}
          onChange={(e) => setFiscalYear(e.target.value)}
          className={inputClass}
        />
      </Field>

      <Field label="大会名（必須）">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClass}
        />
      </Field>

      <Field label="開催日" hint="未定なら空欄でOK">
        <input
          type="date"
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
          className={inputClass}
        />
      </Field>

      <Field label="会場" hint="任意">
        <input
          value={venue}
          onChange={(e) => setVenue(e.target.value)}
          className={inputClass}
        />
      </Field>

      <Field label="概要" hint="任意・改行できます">
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          rows={4}
          className={inputClass}
        />
      </Field>

      <CheckboxField checked={isPublished} onChange={setIsPublished}>
        公開する（チェックを外すと下書き）
      </CheckboxField>

      <SaveBar
        onSave={save}
        canSave={canSave}
        saving={saving}
        error={error}
        editing={editing}
        cancelHref="/admin/games"
        extra={
          editing ? (
            <Link
              href={`/admin/games/${game!.id}/documents`}
              className="rounded border px-4 py-2"
            >
              資料(PDF)の管理
            </Link>
          ) : null
        }
      />
    </div>
  )
}
