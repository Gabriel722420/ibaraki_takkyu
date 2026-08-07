'use client'
import { useState } from 'react'

type Size = 'normal' | 'large' | 'xlarge'
const OPTIONS: { value: Size; label: string; px: number }[] = [
  { value: 'normal', label: '標準', px: 16 },
  { value: 'large', label: '大きく', px: 19 },
  { value: 'xlarge', label: 'もっと大きく', px: 22 },
]

export function TextSizeToggle({ initial }: { initial: Size }) {
  const [size, setSize] = useState<Size>(initial)
  function apply(next: Size) {
    setSize(next)
    document.documentElement.dataset.textsize = next
    document.cookie = `textsize=${next}; path=/; max-age=31536000; samesite=lax`
  }
  return (
    <div
      role="group"
      aria-label="文字の大きさ"
      className="flex items-center gap-1"
    >
      <span aria-hidden className="mr-1 text-sm text-gray-600">
        文字サイズ
      </span>
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => apply(o.value)}
          aria-pressed={size === o.value}
          className={[
            'flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md border leading-none',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-1',
            size === o.value
              ? 'border-black bg-black text-white'
              : 'border-gray-300 bg-white text-gray-800',
          ].join(' ')}
          style={{ fontSize: `${o.px}px`, padding: '0 12px' }}
        >
          <span aria-hidden>あ</span>
          <span className="sr-only">{o.label}</span>
        </button>
      ))}
    </div>
  )
}
