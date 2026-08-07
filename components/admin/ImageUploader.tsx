'use client'
import { useState } from 'react'
import imageCompression from 'browser-image-compression'
import { createClient } from '@/lib/supabase/client'
import { resolveImageUrl } from '@/lib/docs'

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp']

// 本文用の写真アップロード（プレビュー付き）。
// アップロード前にブラウザ内で自動圧縮：長辺1600px・品質0.8・上限2MB目安。
export function ImageUploader({
  prefix,
  value,
  onChange,
}: {
  prefix: string
  value: string | null
  onChange: (path: string | null) => void
}) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const previewUrl = resolveImageUrl(value)

  async function handle(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setError(null)
    if (!ALLOWED.includes(file.type))
      return setError('JPEG / PNG / WebP の画像を選んでください。')

    setBusy(true)
    try {
      const compressed = await imageCompression(file, {
        maxWidthOrHeight: 1600,
        initialQuality: 0.8,
        maxSizeMB: 2,
        useWebWorker: true,
      })
      const supabase = createClient()
      const ext = (compressed.type.split('/')[1] || 'jpg').replace(
        'jpeg',
        'jpg',
      )
      const path = `${prefix}/${crypto.randomUUID()}.${ext}`
      const { error: upErr } = await supabase.storage
        .from('images')
        .upload(path, compressed, {
          contentType: compressed.type,
          upsert: false,
        })
      if (upErr) throw upErr
      onChange(path)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'アップロードに失敗しました。',
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-2">
      {previewUrl && (
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="添付画像プレビュー"
            className="max-h-48 w-auto max-w-full rounded-lg border"
          />
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <label className="inline-block cursor-pointer rounded-lg border px-4 py-2 active:bg-gray-50">
          {busy
            ? '処理中…'
            : previewUrl
              ? '別の写真に差し替え'
              : '写真を選ぶ'}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handle}
            disabled={busy}
          />
        </label>
        {previewUrl && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="rounded border px-3 py-1.5 text-sm text-red-600"
          >
            写真を外す
          </button>
        )}
      </div>
      <p className="text-xs text-gray-500">
        アップロード時に自動で圧縮されます（長辺1600px・目安2MBまで）。
      </p>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
