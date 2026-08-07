'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const MAX_BYTES = 25 * 1024 * 1024 // 25MB

export function PdfUploader({
  gameId,
  onUploaded,
}: {
  gameId: string
  onUploaded: (r: { filePath: string; originalName: string }) => void
}) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handle(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = '' // 同一ファイルの再選択も拾えるように
    if (!file) return
    setError(null)
    if (file.type !== 'application/pdf')
      return setError('PDFファイルを選んでください。')
    if (file.size > MAX_BYTES)
      return setError('ファイルが大きすぎます（25MBまで）。')

    setBusy(true)
    try {
      const supabase = createClient()
      const ext = (file.name.split('.').pop() || 'pdf').toLowerCase()
      const filePath = `${gameId}/${crypto.randomUUID()}.${ext}` // 物理パスは固定・不変
      const { error: upErr } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          contentType: 'application/pdf',
          upsert: false,
        })
      if (upErr) throw upErr
      const originalName = file.name.replace(/\.[^.]+$/, '') // 表示名の初期値（後で変更可）
      onUploaded({ filePath, originalName })
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'アップロードに失敗しました。',
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <label className="inline-block cursor-pointer rounded-lg border px-4 py-2 active:bg-gray-50">
        {busy ? 'アップロード中…' : 'PDFを選ぶ'}
        <input
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handle}
          disabled={busy}
        />
      </label>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}
