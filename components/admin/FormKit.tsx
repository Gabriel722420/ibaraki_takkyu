'use client'
import { useState, type ReactNode } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

// 管理フォーム共通のUI部品（shadcn ベース・API は従来どおり）

// 素の input/select/textarea に付与して shadcn 風の見た目に揃えるクラス
export const inputClass =
  'w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50'

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
    <div className="space-y-1.5">
      <Label>
        {label}
        {hint && (
          <span className="ml-1 font-normal text-muted-foreground">{hint}</span>
        )}
      </Label>
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
    <label className="flex items-center gap-2 text-sm">
      <Switch checked={checked} onCheckedChange={onChange} />
      <span>{children}</span>
    </label>
  )
}

// 保存状態（保存中/成功/失敗）を統一管理
export function useSaveState() {
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
      {error && <p className="text-sm text-destructive">{error}</p>}
      {done && <p className="text-sm text-green-700">保存しました。</p>}
      <div className="flex flex-wrap gap-2">
        <Button onClick={onSave} disabled={saving || !canSave}>
          {saving ? '保存中…' : editing ? '更新する' : '作成する'}
        </Button>
        {cancelHref && (
          <Button variant="outline" asChild>
            <Link href={cancelHref}>キャンセル</Link>
          </Button>
        )}
        {extra}
      </div>
    </div>
  )
}

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
