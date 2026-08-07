import { requireAdmin } from '@/lib/admin'
import { ResourceForm } from '../ResourceForm'

export const dynamic = 'force-dynamic'

export default async function NewResourcePage() {
  await requireAdmin()
  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-4 text-xl font-bold">資料の新規作成</h1>
      <ResourceForm />
    </main>
  )
}
