import { requireAdmin } from '@/lib/admin'
import { AdminShell } from '@/components/admin/AdminShell'
import { Toaster } from '@/components/ui/sonner'

export const dynamic = 'force-dynamic'

// 管理ダッシュボード専用レイアウト（shadcn Sidebar 型）。
// login はこのグループ外なので影響しない。未ログインは requireAdmin が /admin/login へ。
export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireAdmin()

  return (
    <>
      <AdminShell email={user.email ?? ''}>{children}</AdminShell>
      <Toaster richColors position="top-center" />
    </>
  )
}
