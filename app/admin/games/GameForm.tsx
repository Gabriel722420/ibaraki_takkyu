'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { createGame, updateGame, type GameInput } from './actions'
import {
  Field,
  CheckboxField,
  SaveBar,
  inputClass,
  useSaveState,
  toLocalInput,
  fromLocalInput,
} from '@/components/admin/FormKit'
import type { Division, Game } from '@/lib/types'

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
  const [publishAt, setPublishAt] = useState(toLocalInput(game?.publish_at))

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
      publish_at: fromLocalInput(publishAt),
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

      <Field label="概要・本文" hint="任意・太字・色・見出し・箇条書き・リンク・画像が使えます">
        <RichTextEditor
          value={summary}
          onChange={setSummary}
          imagePrefix="games"
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
