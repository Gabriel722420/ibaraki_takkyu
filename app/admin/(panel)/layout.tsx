import Link from 'next/link'
import { requireAdmin } from '@/lib/admin'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminBreadcrumb } from '@/components/admin/AdminBreadcrumb'
import { LogoutButton } from '@/components/admin/LogoutButton'

export const dynamic = 'force-dynamic'

// 管理ダッシュボード専用レイアウト（サイドバー型）。
// login はこのグループ外なので影響しない。未ログインは requireAdmin が /admin/login へ。
export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireAdmin()

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* 上部バー（管理と分かる濃い青） */}
      <header className="bg-primary text-primary-foreground">
        <div className="flex items-center justify-between gap-3 px-4 py-2">
          <Link href="/admin" className="font-bold">
            茨城県卓球連盟 <span className="font-normal opacity-90">管理画面</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm opacity-90 sm:inline">
              {user.email}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="md:flex">
        <AdminSidebar />
        {/* 各ページが自前の <main> を持つため、ここは div（main 二重化を回避）。 */}
        <div className="min-w-0 flex-1">
          <div className="mx-auto max-w-2xl px-4 pt-4">
            <AdminBreadcrumb />
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
