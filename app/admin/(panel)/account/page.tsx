import { requireAdmin } from '@/lib/admin'
import { PasswordChangeForm } from '@/components/admin/PasswordChangeForm'

export const dynamic = 'force-dynamic'

export default async function AdminAccountPage() {
  const user = await requireAdmin()

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="mb-4 text-xl font-bold">アカウント設定</h1>
      <p className="mb-4 text-sm text-gray-600">ログイン中：{user.email}</p>
      <h2 className="mb-2 font-bold">パスワード変更</h2>
      <PasswordChangeForm />
    </div>
  )
}
