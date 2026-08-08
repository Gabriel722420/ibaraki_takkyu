'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { adminLabelForPath } from '@/lib/admin-nav'

export function AdminBreadcrumb() {
  const pathname = usePathname()
  const label = adminLabelForPath(pathname)
  return (
    <nav className="mb-4 text-sm text-gray-500" aria-label="パンくず">
      <Link href="/admin" className="hover:underline">
        管理トップ
      </Link>
      {label && (
        <>
          <span className="mx-1">›</span>
          <span className="text-gray-700">{label}</span>
        </>
      )}
    </nav>
  )
}
