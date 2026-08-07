'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createOfficer, updateOfficer, type OfficerInput } from './actions'
import type { Officer } from '@/lib/types'

export function OfficerForm({ officer }: { officer?: Officer }) {
  const router = useRouter()
  const editing = !!officer

  const [role, setRole] = useState(officer?.role ?? '')
  const [name, setName] = useState(officer?.name ?? '')
  const [note, setNote] = useState(officer?.note ?? '')
  const [sortOrder, setSortOrder] = useState(String(officer?.sort_order ?? 0))
  const [isPublished, setIsPublished] = useState(officer?.is_published ?? true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSave = role.trim().length > 0 && name.trim().length > 0

  async function save() {
    setSaving(true)
    setError(null)
    const values: OfficerInput = {
      role,
      name,
      note: note || null,
      sort_order: Number(sortOrder) || 0,
      is_published: isPublished,
    }
    try {
      if (editing) {
        await updateOfficer({ id: officer!.id, values })
      } else {
        await createOfficer(values)
      }
      router.push('/admin/officers')
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
          役職（必須・例：会長／理事）
        </label>
        <input
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full rounded border px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-gray-600">氏名（必須）</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded border px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-gray-600">
          備考（任意・例：登録主任／レディース部長）
        </label>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full rounded border px-3 py-2"
        />
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">表示順</span>
        <input
          type="number"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="w-24 rounded border px-3 py-2"
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
          className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {saving ? '保存中…' : editing ? '更新する' : '作成する'}
        </button>
        <Link href="/admin/officers" className="rounded border px-4 py-2">
          一覧へ戻る
        </Link>
      </div>
    </div>
  )
}
