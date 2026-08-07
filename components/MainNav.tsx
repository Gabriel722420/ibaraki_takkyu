'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NAV } from '@/lib/nav'

export function MainNav() {
  const pathname = usePathname()

  return (
    <nav aria-label="メインメニュー" className="border-b border-gray-200 bg-white">
      <ul className="mx-auto flex max-w-2xl flex-wrap px-2">
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
                  'flex min-h-[44px] items-center px-3 text-base font-medium',
                  'border-b-[3px] transition-colors',
                  active
                    ? 'border-primary text-primary'
                    : 'border-transparent text-foreground hover:text-primary',
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
