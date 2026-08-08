'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ADMIN_NAV } from '@/lib/admin-nav'

function isActive(pathname: string, href: string) {
  if (href === '/admin') return pathname === '/admin'
  return pathname === href || pathname.startsWith(href + '/')
}

function NavList({ pathname }: { pathname: string }) {
  return (
    <nav className="space-y-4 p-3">
      <Link
        href="/admin"
        className={[
          'block rounded px-3 py-2 font-medium',
          pathname === '/admin'
            ? 'bg-primary text-primary-foreground'
            : 'text-gray-800 hover:bg-gray-100',
        ].join(' ')}
      >
        ダッシュボード
      </Link>
      {ADMIN_NAV.map((g) => (
        <div key={g.title}>
          <p className="px-3 pb-1 text-xs font-bold tracking-wide text-gray-500">
            {g.title}
          </p>
          <ul>
            {g.items.map((it) => {
              const active = isActive(pathname, it.href)
              return (
                <li key={it.href}>
                  <Link
                    href={it.href}
                    aria-current={active ? 'page' : undefined}
                    className={[
                      'block rounded px-3 py-2',
                      active
                        ? 'bg-primary/10 font-medium text-primary'
                        : 'text-gray-800 hover:bg-gray-100',
                    ].join(' ')}
                  >
                    {it.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}

export function AdminSidebar() {
  const pathname = usePathname()
  return (
    <>
      {/* モバイル：折りたたみドロワー（native details・JS不要） */}
      <details className="border-b bg-white md:hidden">
        <summary className="cursor-pointer list-none px-4 py-3 font-medium text-primary">
          ☰ メニュー
        </summary>
        <NavList pathname={pathname} />
      </details>

      {/* PC：固定サイドバー */}
      <aside className="hidden w-64 shrink-0 border-r bg-white md:block">
        <NavList pathname={pathname} />
      </aside>
    </>
  )
}
