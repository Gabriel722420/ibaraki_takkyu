'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { updateAboutSettings } from './actions'

export function AboutSettingsForm({
  initial,
}: {
  initial: { greeting: string; sign: string; image: string }
}) {
  const router = useRouter()
  const [greeting, setGreeting] = useState(initial.greeting)
  const [sign, setSign] = useState(initial.sign)
  const [image, setImage] = useState(initial.image)
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function save() {
    setSaving(true)
    setError(null)
    setDone(false)
    try {
      await updateAboutSettings({ greeting, sign, image })
      setDone(true)
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : '保存に失敗しました。')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="mb-1 block text-sm text-gray-600">
          会長挨拶 本文（改行可）
        </label>
        <textarea
          value={greeting}
          onChange={(e) => setGreeting(e.target.value)}
          rows={14}
          className="w-full rounded border px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-gray-600">署名</label>
        <input
          value={sign}
          onChange={(e) => setSign(e.target.value)}
          className="w-full rounded border px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-gray-600">
          写真パス（例：/about/kobayashi.png ／ 差し替えは public/about/ に画像を置いてパス指定）
        </label>
        <input
          value={image}
          onChange={(e) => setImage(e.target.value)}
          className="w-full rounded border px-3 py-2"
        />
        {image && (
          <div className="mt-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt="会長（プレビュー）"
              className="w-32 rounded border"
            />
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {done && <p className="text-sm text-green-700">保存しました。</p>}

      <div className="flex flex-wrap gap-2">
        <button
          onClick={save}
          disabled={saving}
          className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {saving ? '保存中…' : '保存する'}
        </button>
        <Link href="/admin" className="rounded border px-4 py-2">
          管理トップ
        </Link>
      </div>
    </div>
  )
}
