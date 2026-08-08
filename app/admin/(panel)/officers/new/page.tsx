import { requireAdmin } from '@/lib/admin'
import { OfficerForm } from '../OfficerForm'

export const dynamic = 'force-dynamic'

export default async function NewOfficerPage() {
  await requireAdmin()
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="mb-4 text-xl font-bold">役員の新規作成</h1>
      <OfficerForm />
    </div>
  )
}
