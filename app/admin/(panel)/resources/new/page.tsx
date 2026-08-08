import { requireAdmin } from '@/lib/admin'
import { ResourceForm } from '../ResourceForm'

export const dynamic = 'force-dynamic'

export default async function NewResourcePage() {
  await requireAdmin()
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="mb-4 text-xl font-bold">資料の新規作成</h1>
      <ResourceForm />
    </div>
  )
}
