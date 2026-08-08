import { requireAdmin } from '@/lib/admin'
import { CreateFormCard } from './CreateFormCard'

export const dynamic = 'force-dynamic'

export default async function NewFormPage() {
  await requireAdmin()
  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold">申込フォームの新規作成</h1>
      <CreateFormCard />
    </div>
  )
}
