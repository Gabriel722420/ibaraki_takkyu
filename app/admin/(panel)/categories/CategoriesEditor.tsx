'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createCategory, updateCategory, deleteCategory } from './actions'
import { inputClass } from '@/components/admin/FormKit'
import type { Category } from '@/lib/types'

export function CategoriesEditor({ categories }: { categories: Category[] }) {
  const tops = categories.filter((c) => !c.parent_id)
  const parentOptions = tops // 2階層想定：親候補はトップのみ

  return (
    <div className="space-y-6">
      <AddForm parents={parentOptions} />
      <section>
        <h2 className="mb-2 font-bold">登録済みカテゴリ</h2>
        <ul className="space-y-3">
          {categories.map((c) => (
            <Row key={c.id} category={c} categories={categories} />
          ))}
          {categories.length === 0 && (
            <li className="text-gray-500">まだありません。</li>
          )}
        </ul>
      </section>
    </div>
  )
}

function AddForm({ parents }: { parents: Category[] }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [parentId, setParentId] = useState('')
  const [sortOrder, setSortOrder] = useState('0')
  const [busy, setBusy] = useState(false)

  async function add() {
    setBusy(true)
    try {
      await createCategory({
        name,
        slug: slug || undefined,
        parent_id: parentId || null,
        sort_order: Number(sortOrder) || 0,
      })
      setName('')
      setSlug('')
      setParentId('')
      setSortOrder('0')
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="rounded-lg border p-4">
      <h2 className="mb-2 font-bold">カテゴリを追加</h2>
      <div className="space-y-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="名称（例：ジュニア 県西）"
          className={inputClass}
        />
        <input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="slug（英数字・空欄なら自動）"
          className={inputClass}
        />
        <select
          value={parentId}
          onChange={(e) => setParentId(e.target.value)}
          className={inputClass}
        >
          <option value="">（親なし＝トップ分類）</option>
          {parents.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">表示順</span>
          <input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="w-24 rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>
        <button
          onClick={add}
          disabled={busy || !name.trim()}
          className="inline-flex items-center rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/80 disabled:opacity-50"
        >
          {busy ? '追加中…' : '追加する'}
        </button>
      </div>
    </section>
  )
}

function Row({
  category,
  categories,
}: {
  category: Category
  categories: Category[]
}) {
  const router = useRouter()
  const [name, setName] = useState(category.name)
  const [slug, setSlug] = useState(category.slug)
  const [parentId, setParentId] = useState(category.parent_id ?? '')
  const [sortOrder, setSortOrder] = useState(String(category.sort_order))
  const [busy, setBusy] = useState(false)
  // 親候補：自分以外のトップ、または自分以外
  const parents = categories.filter(
    (c) => c.id !== category.id && !c.parent_id,
  )

  async function save() {
    setBusy(true)
    try {
      await updateCategory({
        id: category.id,
        name,
        slug,
        parent_id: parentId || null,
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
        'このカテゴリを削除します。子カテゴリは親なしに、記事は未分類になります。よろしいですか？',
      )
    )
      return
    setBusy(true)
    try {
      await deleteCategory({ id: category.id })
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
          className={inputClass}
        />
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="flex-1 rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          <select
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
            className="rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="">親なし</option>
            {parents.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="w-20 rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={save}
          disabled={busy || !name.trim()}
          className="inline-flex items-center rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/80 disabled:opacity-50"
        >
          保存
        </button>
        <button
          onClick={remove}
          disabled={busy}
          className="inline-flex items-center rounded-lg border border-input px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10 disabled:opacity-50"
        >
          削除
        </button>
      </div>
    </li>
  )
}
