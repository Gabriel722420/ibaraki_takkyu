'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { updatePolicySettings } from './actions'

export function PolicyForm({
  initial,
}: {
  initial: {
    copyright: string
    trademark: string
    disclaimer: string
    contact: string
  }
}) {
  const router = useRouter()
  const [copyright, setCopyright] = useState(initial.copyright)
  const [trademark, setTrademark] = useState(initial.trademark)
  const [disclaimer, setDisclaimer] = useState(initial.disclaimer)
  const [contact, setContact] = useState(initial.contact)
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function save() {
    setSaving(true)
    setError(null)
    setDone(false)
    try {
      await updatePolicySettings({ copyright, trademark, disclaimer, contact })
      setDone(true)
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : '保存に失敗しました。')
    } finally {
      setSaving(false)
    }
  }

  const fields: {
    label: string
    value: string
    set: (v: string) => void
  }[] = [
    { label: '著作権について', value: copyright, set: setCopyright },
    { label: '商標について', value: trademark, set: setTrademark },
    { label: '免責事項', value: disclaimer, set: setDisclaimer },
    { label: 'お問い合わせ先', value: contact, set: setContact },
  ]

  return (
    <div className="space-y-5">
      {fields.map((f) => (
        <div key={f.label}>
          <label className="mb-1 block text-sm text-gray-600">
            {f.label}（改行可）
          </label>
          <textarea
            value={f.value}
            onChange={(e) => f.set(e.target.value)}
            rows={6}
            className="w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>
      ))}

      {error && <p className="text-sm text-red-600">{error}</p>}
      {done && <p className="text-sm text-green-700">保存しました。</p>}

      <div className="flex flex-wrap gap-2">
        <button
          onClick={save}
          disabled={saving}
          className="inline-flex items-center rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/80 disabled:opacity-50"
        >
          {saving ? '保存中…' : '保存する'}
        </button>
        <Link href="/admin" className="inline-flex items-center rounded-lg border border-input px-3 py-2 text-sm hover:bg-muted">
          管理トップ
        </Link>
      </div>
    </div>
  )
}
