'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { maybeCompressPdf } from '@/lib/pdf-compress'

const MAX_BYTES = 25 * 1024 * 1024 // 25MB（documents バケット上限）

export function PdfUploader({
  gameId,
  onUploaded,
}: {
  gameId: string
  onUploaded: (r: { filePath: string; originalName: string }) => void
}) {
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handle(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0]
    e.target.value = '' // 同一ファイルの再選択も拾えるように
    if (!picked) return
    setError(null)
    setStatus(null)
    if (picked.type !== 'application/pdf')
      return setError('PDFファイルを選んでください。')

    setBusy(true)
    try {
      // 5MB超のスキャンPDFはブラウザ内で自動圧縮（失敗時は原本にフォールバック）
      const file = await maybeCompressPdf(picked, setStatus)
      if (file.size > MAX_BYTES) {
        setBusy(false)
        return setError('ファイルが大きすぎます（25MBまで）。')
      }
      setStatus('アップロード中…')
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
      const originalName = picked.name.replace(/\.[^.]+$/, '') // 表示名の初期値（後で変更可）
      setStatus(null)
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
        {busy ? '処理中…' : 'PDFを選ぶ'}
        <input
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handle}
          disabled={busy}
        />
      </label>
      {status && <p className="mt-1 text-sm text-gray-600">{status}</p>}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}
