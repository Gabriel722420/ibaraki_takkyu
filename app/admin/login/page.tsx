import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LoginForm } from '@/components/admin/LoginForm'

export const dynamic = 'force-dynamic'

// 公開ページ（requireAdmin 対象外）。既ログインなら管理トップへ。
export default async function AdminLoginPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) redirect('/admin')

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-4 text-xl font-bold">管理ログイン</h1>
      <p className="mb-4 text-sm text-gray-600">
        管理者アカウントでログインしてください。
      </p>
      <LoginForm />
    </main>
  )
}
