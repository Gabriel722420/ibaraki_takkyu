'use client'
import { useState, type ReactNode } from 'react'
import Link from 'next/link'

// 管理フォーム共通のUI部品（news/games/その他で統一した投稿体験を提供）

export const inputClass = 'w-full rounded border px-3 py-2'

// timestamptz(ISO) ↔ datetime-local(ローカル) 変換（予約投稿の日時入力用）
export function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`
}

export function fromLocalInput(local: string): string | null {
  if (!local) return null
  return new Date(local).toISOString()
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: ReactNode
}) {
  return (
    <div>
      <label className="mb-1 block text-sm text-gray-600">
        {label}
        {hint && <span className="ml-1 text-gray-400">{hint}</span>}
      </label>
      {children}
    </div>
  )
}

export function CheckboxField({
  checked,
  onChange,
  children,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  children: ReactNode
}) {
  return (
    <label className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-5 w-5"
      />
      <span>{children}</span>
    </label>
  )
}

// 保存状態（保存中/成功/失敗）を統一管理
export function useSaveState() {
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // navigateAway=true の場合、成功後は呼び出し側が遷移する想定で saving を維持
  async function run(fn: () => Promise<void>, navigateAway = false) {
    setSaving(true)
    setError(null)
    setDone(false)
    try {
      await fn()
      if (navigateAway) return
      setDone(true)
      setSaving(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : '保存に失敗しました。')
      setSaving(false)
    }
  }

  return { saving, done, error, run }
}

// 保存ボタン＋キャンセル＋状態表示のバー
export function SaveBar({
  onSave,
  canSave,
  saving,
  done,
  error,
  editing = false,
  cancelHref,
  extra,
}: {
  onSave: () => void
  canSave: boolean
  saving: boolean
  done?: boolean
  error?: string | null
  editing?: boolean
  cancelHref?: string
  extra?: ReactNode
}) {
  return (
    <div className="space-y-2">
      {error && <p className="text-sm text-red-600">{error}</p>}
      {done && <p className="text-sm text-green-700">保存しました。</p>}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={onSave}
          disabled={saving || !canSave}
          className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {saving ? '保存中…' : editing ? '更新する' : '作成する'}
        </button>
        {cancelHref && (
          <Link href={cancelHref} className="rounded border px-4 py-2">
            キャンセル
          </Link>
        )}
        {extra}
      </div>
    </div>
  )
}
