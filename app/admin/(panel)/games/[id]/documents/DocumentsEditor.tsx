'use client'
import { useState } from 'react'
import { PdfUploader } from '@/components/PdfUploader'
import {
  addDocument,
  renameDocument,
  updateDocType,
  deleteDocument,
} from './actions'
import { DOC_ORDER } from '@/lib/docs'
import type { GameDocument, DocType } from '@/lib/types'

export function DocumentsEditor({
  gameId,
  initialDocs,
}: {
  gameId: string
  initialDocs: GameDocument[]
}) {
  const [docType, setDocType] = useState<DocType>('要項')
  const [pending, setPending] = useState<{
    filePath: string
    title: string
  } | null>(null)
  const [saving, setSaving] = useState(false)

  async function confirmAdd() {
    if (!pending) return
    setSaving(true)
    try {
      await addDocument({
        gameId,
        docType,
        title: pending.title,
        filePath: pending.filePath,
      })
      setPending(null)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border p-4">
        <h2 className="mb-2 font-bold">PDFを追加</h2>
        <div className="mb-3 flex items-center gap-2">
          <span className="text-sm text-gray-600">区分</span>
          <select
            value={docType}
            onChange={(e) => setDocType(e.target.value as DocType)}
            className="rounded border px-2 py-1"
          >
            {DOC_ORDER.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {!pending ? (
          <PdfUploader
            gameId={gameId}
            onUploaded={({ filePath, originalName }) =>
              setPending({ filePath, title: originalName })
            }
          />
        ) : (
          <div className="space-y-2">
            <label className="block text-sm text-gray-600">
              表示名（後からいつでも変更できます）
            </label>
            <input
              value={pending.title}
              onChange={(e) =>
                setPending({ ...pending, title: e.target.value })
              }
              className="w-full rounded border px-3 py-2"
            />
            <div className="flex gap-2">
              <button
                onClick={confirmAdd}
                disabled={saving || !pending.title.trim()}
                className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
              >
                {saving ? '保存中…' : 'この内容で追加'}
              </button>
              <button
                onClick={() => setPending(null)}
                className="rounded border px-4 py-2"
              >
                やめる
              </button>
            </div>
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-2 font-bold">登録済みの資料</h2>
        <ul className="space-y-3">
          {initialDocs.map((doc) => (
            <DocRow key={doc.id} doc={doc} gameId={gameId} />
          ))}
          {initialDocs.length === 0 && (
            <li className="text-gray-500">まだありません。</li>
          )}
        </ul>
      </section>
    </div>
  )
}

function DocRow({
  doc,
  gameId,
}: {
  doc: GameDocument
  gameId: string
}) {
  const [title, setTitle] = useState(doc.title)
  const [type, setType] = useState<DocType>(doc.doc_type)
  const [busy, setBusy] = useState(false)
  const dirty = title !== doc.title || type !== doc.doc_type

  async function save() {
    setBusy(true)
    try {
      if (title !== doc.title)
        await renameDocument({ id: doc.id, gameId, title })
      if (type !== doc.doc_type)
        await updateDocType({ id: doc.id, gameId, docType: type })
    } finally {
      setBusy(false)
    }
  }
  async function remove() {
    if (!confirm('この資料を削除します。よろしいですか？')) return
    setBusy(true)
    try {
      await deleteDocument({
        id: doc.id,
        gameId,
        filePath: doc.file_path,
      })
    } finally {
      setBusy(false)
    }
  }

  return (
    <li className="rounded-lg border p-3">
      <div className="mb-2 flex items-center gap-2">
        <select
          value={type}
          onChange={(e) => setType(e.target.value as DocType)}
          className="rounded border px-2 py-1"
        >
          {DOC_ORDER.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 rounded border px-3 py-2"
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={save}
          disabled={busy || !dirty || !title.trim()}
          className="rounded bg-black px-3 py-1.5 text-sm text-white disabled:opacity-50"
        >
          保存
        </button>
        <button
          onClick={remove}
          disabled={busy}
          className="rounded border px-3 py-1.5 text-sm text-red-600"
        >
          削除
        </button>
      </div>
    </li>
  )
}
