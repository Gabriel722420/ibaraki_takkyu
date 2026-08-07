'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createDivision, updateDivision, deleteDivision } from './actions'
import type { Division } from '@/lib/types'

export function DivisionsEditor({ divisions }: { divisions: Division[] }) {
  return (
    <div className="space-y-6">
      <AddForm />
      <section>
        <h2 className="mb-2 font-bold">登録済みの部門</h2>
        <ul className="space-y-3">
          {divisions.map((d) => (
            <DivisionRow key={d.id} division={d} />
          ))}
          {divisions.length === 0 && (
            <li className="text-gray-500">まだありません。</li>
          )}
        </ul>
      </section>
    </div>
  )
}

function AddForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [sortOrder, setSortOrder] = useState('0')
  const [busy, setBusy] = useState(false)

  async function add() {
    setBusy(true)
    try {
      await createDivision({
        name,
        slug: slug || undefined,
        sort_order: Number(sortOrder) || 0,
      })
      setName('')
      setSlug('')
      setSortOrder('0')
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="rounded-lg border p-4">
      <h2 className="mb-2 font-bold">部門を追加</h2>
      <div className="space-y-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="部門名（例：一般）"
          className="w-full rounded border px-3 py-2"
        />
        <input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="slug（英数字・空欄なら自動生成）"
          className="w-full rounded border px-3 py-2"
        />
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">表示順</span>
          <input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="w-24 rounded border px-3 py-2"
          />
        </div>
        <button
          onClick={add}
          disabled={busy || !name.trim()}
          className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {busy ? '追加中…' : '追加する'}
        </button>
      </div>
    </section>
  )
}

function DivisionRow({ division }: { division: Division }) {
  const router = useRouter()
  const [name, setName] = useState(division.name)
  const [slug, setSlug] = useState(division.slug)
  const [sortOrder, setSortOrder] = useState(String(division.sort_order))
  const [busy, setBusy] = useState(false)
  const dirty =
    name !== division.name ||
    slug !== division.slug ||
    Number(sortOrder) !== division.sort_order

  async function save() {
    setBusy(true)
    try {
      await updateDivision({
        id: division.id,
        name,
        slug,
        sort_order: Number(sortOrder) || 0,
      })
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  async function remove() {
    if (
      !confirm(
        'この部門を削除します。紐づく大会は残りますが「部門なし」になります。よろしいですか？',
      )
    )
      return
    setBusy(true)
    try {
      await deleteDivision({ id: division.id })
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  return (
    <li className="rounded-lg border p-3">
      <div className="mb-2 space-y-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded border px-3 py-2"
        />
        <div className="flex items-center gap-2">
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="flex-1 rounded border px-3 py-2"
          />
          <span className="text-sm text-gray-600">順</span>
          <input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="w-20 rounded border px-3 py-2"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={save}
          disabled={busy || !dirty || !name.trim()}
          className="rounded bg-black px-3 py-1.5 text-sm text-white disabled:opacity-50"
        >
          保存
        </button>
        <button
          onClick={remove}
          disabled={busy}
          className="rounded border px-3 py-1.5 text-sm text-red-600 disabled:opacity-50"
        >
          削除
        </button>
      </div>
    </li>
  )
}
