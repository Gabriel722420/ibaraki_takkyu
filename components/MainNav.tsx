'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { NAV } from '@/lib/nav'

export function MainNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  // トップは完全一致、それ以外は配下も現在地扱い（例 /games/[id]）
  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <nav aria-label="メインメニュー" className="border-b border-hairline bg-card">
      <div className="mx-auto max-w-6xl px-2 md:px-4 lg:px-6">
        {/* モバイル（md未満）：横並び5項目は2段折返し＋高占有でファーストビューを
            潰すため「メニュー」ボタン1つに集約。タップで下に縦並びパネルを展開。 */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          className="flex min-h-[44px] w-full items-center gap-2 px-2 text-[1.0625rem] font-medium text-ink transition-colors hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 md:hidden"
        >
          {open ? (
            <X className="size-6 text-primary" aria-hidden />
          ) : (
            <Menu className="size-6 text-primary" aria-hidden />
          )}
          メニュー
        </button>

        {/* デスクトップ/タブレット（md以上）：従来の横並びナビを維持 */}
        <ul className="hidden gap-x-1 md:flex">
          {NAV.map((n) => {
            const active = isActive(n.href)
            return (
              <li key={n.href}>
                <Link
                  href={n.href}
                  aria-current={active ? 'page' : undefined}
                  className={[
                    // タップ44px確保・下辺ライン＋背景tint＋色で現在地を明確化
                    'flex min-h-[44px] items-center rounded-t-lg border-b-[3px] px-3.5 text-[1.0625rem] transition-colors md:px-4',
                    active
                      ? 'border-primary bg-primary/10 font-semibold text-primary'
                      : 'border-transparent font-medium text-ink hover:bg-primary/5 hover:text-primary',
                  ].join(' ')}
                >
                  {n.label}
                </Link>
              </li>
            )
          })}
        </ul>

        {/* モバイル展開パネル：縦並び5項目。現在地は左辺ライン＋tint＋色で維持。
            aria-controls の参照先を常設するため hidden で開閉（条件描画しない）。 */}
        <ul
          id="mobile-nav"
          className={`pb-2 md:hidden ${open ? 'block' : 'hidden'}`}
        >
          {NAV.map((n) => {
            const active = isActive(n.href)
            return (
              <li key={n.href}>
                <Link
                  href={n.href}
                  aria-current={active ? 'page' : undefined}
                  onClick={() => setOpen(false)}
                  className={[
                    'flex min-h-[44px] items-center rounded-lg border-l-[3px] px-3 text-[1.0625rem] transition-colors',
                    active
                      ? 'border-primary bg-primary/10 font-semibold text-primary'
                      : 'border-transparent font-medium text-ink hover:bg-primary/5 hover:text-primary',
                  ].join(' ')}
                >
                  {n.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
