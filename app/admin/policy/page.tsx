import { requireAdmin } from '@/lib/admin'
import { getPolicySettings } from '@/lib/queries'
import { PolicyForm } from './PolicyForm'

export const dynamic = 'force-dynamic'

export default async function AdminPolicyPage() {
  await requireAdmin()
  const policy = await getPolicySettings()

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-4 text-xl font-bold">サイトポリシーの編集</h1>
      <p className="mb-4 text-sm text-gray-600">
        個人情報保護のPDFは「登録・資格情報の管理」で
        カテゴリー「個人情報保護」として編集できます。
      </p>
      <PolicyForm initial={policy} />
    </main>
  )
}
