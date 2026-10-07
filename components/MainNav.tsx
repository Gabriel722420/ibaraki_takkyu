'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NAV } from '@/lib/nav'

export function MainNav() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="メインメニュー"
      className="border-b border-hairline bg-card"
    >
      <ul className="mx-auto flex max-w-6xl flex-wrap gap-x-1 px-2 md:px-4 lg:px-6">
        {NAV.map((n) => {
          // トップは完全一致、それ以外は配下も現在地扱い（例 /games/[id]）
          const active =
            n.href === '/' ? pathname === '/' : pathname.startsWith(n.href)
          return (
            <li key={n.href}>
              <Link
                href={n.href}
                aria-current={active ? 'page' : undefined}
                className={[
                  // タップ44px確保・下線ではなく下辺ライン＋背景tint＋色で現在地を明確化
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
    </nav>
  )
}
