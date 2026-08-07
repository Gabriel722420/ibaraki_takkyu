'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PdfUploader } from '@/components/PdfUploader'
import { createResource, updateResource, type ResourceInput } from './actions'
import type { Resource } from '@/lib/types'

export function ResourceForm({ resource }: { resource?: Resource }) {
  const router = useRouter()
  const editing = !!resource

  const [category, setCategory] = useState(resource?.category ?? '')
  const [title, setTitle] = useState(resource?.title ?? '')
  const [filePath, setFilePath] = useState<string | null>(
    resource?.file_path ?? null,
  )
  const [externalUrl, setExternalUrl] = useState(resource?.external_url ?? '')
  const [sortOrder, setSortOrder] = useState(String(resource?.sort_order ?? 0))
  const [isPublished, setIsPublished] = useState(
    resource?.is_published ?? true,
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSave = title.trim().length > 0 && category.trim().length > 0

  async function save() {
    setSaving(true)
    setError(null)
    const values: ResourceInput = {
      category,
      title,
      file_path: filePath,
      external_url: externalUrl || null,
      sort_order: Number(sortOrder) || 0,
      is_published: isPublished,
    }
    try {
      if (editing) {
        await updateResource({ id: resource!.id, values })
      } else {
        await createResource(values)
      }
      router.push('/admin/resources')
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
          カテゴリー（必須・例：登録関係／資格・審判）
        </label>
        <input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded border px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-gray-600">
          表示名（必須・後から変更できます）
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded border px-3 py-2"
        />
      </div>

      <div className="rounded-lg border p-4">
        <p className="mb-2 font-bold">PDF（Storageにアップロード）</p>
        {filePath ? (
          <div className="space-y-2">
            <p className="text-sm text-gray-600 break-all">
              添付済み：{filePath}
            </p>
            <button
              type="button"
              onClick={() => setFilePath(null)}
              className="rounded border px-3 py-1.5 text-sm text-red-600"
            >
              PDFを外す
            </button>
          </div>
        ) : (
          <PdfUploader
            gameId="resources"
            onUploaded={({ filePath, originalName }) => {
              setFilePath(filePath)
              if (!title.trim()) setTitle(originalName)
            }}
          />
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm text-gray-600">
          外部リンク（任意・PDFの代わりに外部URLを使う場合）
        </label>
        <input
          value={externalUrl}
          onChange={(e) => setExternalUrl(e.target.value)}
          placeholder="https://…"
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
        <Link href="/admin/resources" className="rounded border px-4 py-2">
          一覧へ戻る
        </Link>
      </div>
    </div>
  )
}
