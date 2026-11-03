'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  createGameUpdate,
  updateGameUpdate,
  type GameUpdateInput,
} from './actions'
import { toLocalInput, fromLocalInput, inputClass } from '@/components/admin/FormKit'
import type { GameUpdate, Division, Game } from '@/lib/types'

// 'YYYY-MM-DD'（JST今日）。date input の既定値用。
function todayJst(): string {
  return new Date(Date.now() + 9 * 3600_000).toISOString().slice(0, 10)
}

export function GameUpdateForm({
  update,
  divisions,
  games,
}: {
  update?: GameUpdate
  divisions: Division[]
  games: Game[]
}) {
  const router = useRouter()
  const editing = !!update

  const [body, setBody] = useState(update?.body ?? '')
  const [gameId, setGameId] = useState(update?.game_id ?? '')
  const [divisionId, setDivisionId] = useState(update?.division_id ?? '')
  const [postedAt, setPostedAt] = useState(update?.posted_at ?? todayJst())
  const [isPublished, setIsPublished] = useState(update?.is_published ?? true)
  const [publishAt, setPublishAt] = useState(toLocalInput(update?.publish_at))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSave = body.trim().length > 0 && !!postedAt

  // 大会を選ぶと部門が空なら自動補完（運用の手間を減らす）
  function onSelectGame(id: string) {
    setGameId(id)
    if (!divisionId && id) {
      const g = games.find((x) => x.id === id)
      if (g?.division_id) setDivisionId(g.division_id)
    }
  }

  async function save() {
    setSaving(true)
    setError(null)
    const values: GameUpdateInput = {
      body,
      game_id: gameId || null,
      division_id: divisionId || null,
      posted_at: postedAt,
      is_published: isPublished,
      publish_at: fromLocalInput(publishAt),
    }
    try {
      if (editing) await updateGameUpdate({ id: update!.id, values })
      else await createGameUpdate(values)
      router.push('/admin/game-updates')
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
          更新メッセージ（必須・例：〜の要項と申込書をアップしました。）
        </label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          className={inputClass}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-gray-600">
          紐づける大会（任意・選ぶと「詳細へ」リンクが付きます）
        </label>
        <select
          value={gameId}
          onChange={(e) => onSelectGame(e.target.value)}
          className={inputClass}
        >
          <option value="">（紐づけない）</option>
          {games.map((g) => (
            <option key={g.id} value={g.id}>
              {g.fiscal_year}年度 / {g.title}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm text-gray-600">
          部門タグ（任意・大会選択時は自動補完）
        </label>
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
      </div>

      <div>
        <label className="mb-1 block text-sm text-gray-600">
          掲載日（この日から30日でTOPから自動的に消えます）
        </label>
        <input
          type="date"
          value={postedAt}
          onChange={(e) => setPostedAt(e.target.value)}
          className="rounded border px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-gray-600">
          公開予約日時（任意・指定するとその時刻まで非表示）
        </label>
        <input
          type="datetime-local"
          value={publishAt}
          onChange={(e) => setPublishAt(e.target.value)}
          className="rounded border px-3 py-2"
        />
      </div>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={isPublished}
          onChange={(e) => setIsPublished(e.target.checked)}
          className="h-5 w-5"
        />
        <span>公開する（チェックを外すと非公開）</span>
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex flex-wrap gap-2">
        <button
          onClick={save}
          disabled={saving || !canSave}
          className="rounded bg-primary px-4 py-2 text-white transition-colors hover:bg-[#0f3277] disabled:opacity-50"
        >
          {saving ? '保存中…' : editing ? '更新する' : '作成する'}
        </button>
        <Link href="/admin/game-updates" className="rounded border px-4 py-2">
          一覧へ戻る
        </Link>
      </div>
    </div>
  )
}
