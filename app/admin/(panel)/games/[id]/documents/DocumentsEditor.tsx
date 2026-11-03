'use client'
import { useState } from 'react'
import { PdfUploader } from '@/components/PdfUploader'
import {
  addDocument,
  renameDocument,
  updateDocType,
  deleteDocument,
  addGameUpdate,
} from './actions'
import { DOC_ORDER, DOC_LABEL } from '@/lib/docs'
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
  // ④ 半自動起票：アップと同時に「大会情報更新履歴（TOP）」へ載せる
  const [postUpdate, setPostUpdate] = useState(false)
  const [updateBody, setUpdateBody] = useState('')

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
      if (postUpdate && updateBody.trim()) {
        await addGameUpdate({ gameId, body: updateBody.trim() })
      }
      setPending(null)
      setPostUpdate(false)
      setUpdateBody('')
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
                {DOC_LABEL[t]}
              </option>
            ))}
          </select>
          <span className="text-xs text-gray-500">
            2027大会〜は「上位結果（永続）／詳細結果（365日で非表示）」を使用
          </span>
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

            {/* ④ 半自動起票：TOPの大会情報更新履歴に載せる（任意） */}
            <label className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                checked={postUpdate}
                onChange={(e) => {
                  setPostUpdate(e.target.checked)
                  if (e.target.checked && !updateBody.trim()) {
                    setUpdateBody(
                      `「${pending.title}」（${DOC_LABEL[docType]}）をアップしました。`,
                    )
                  }
                }}
                className="h-5 w-5"
              />
              <span className="text-sm">
                大会情報更新履歴（TOP）に載せる
              </span>
            </label>
            {postUpdate && (
              <textarea
                value={updateBody}
                onChange={(e) => setUpdateBody(e.target.value)}
                rows={2}
                placeholder="例）〜の要項と申込書をアップしました。"
                className="w-full rounded border px-3 py-2 text-sm"
              />
            )}

            <div className="flex gap-2">
              <button
                onClick={confirmAdd}
                disabled={
                  saving ||
                  !pending.title.trim() ||
                  (postUpdate && !updateBody.trim())
                }
                className="rounded bg-primary px-4 py-2 text-white transition-colors hover:bg-[#0f3277] disabled:opacity-50"
              >
                {saving ? '保存中…' : 'この内容で追加'}
              </button>
              <button
                onClick={() => {
                  setPending(null)
                  setPostUpdate(false)
                  setUpdateBody('')
                }}
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
              {DOC_LABEL[t]}
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
          className="rounded bg-primary px-3 py-1.5 text-sm text-white transition-colors hover:bg-[#0f3277] disabled:opacity-50"
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
