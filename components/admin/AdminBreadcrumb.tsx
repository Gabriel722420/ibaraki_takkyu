'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { adminLabelForPath } from '@/lib/admin-nav'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

export function AdminBreadcrumb() {
  const pathname = usePathname()
  const label = adminLabelForPath(pathname)
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/admin">管理トップ</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {label && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{label}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
