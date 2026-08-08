import { requireAdmin } from '@/lib/admin'
import { listCategories } from '@/lib/queries'
import { NewsForm } from '../NewsForm'

export const dynamic = 'force-dynamic'

export default async function NewAnnouncementPage() {
  await requireAdmin()
  const today = new Date().toISOString().slice(0, 10)
  const categories = await listCategories()

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-4 text-xl font-bold">おしらせの新規作成</h1>
      <NewsForm today={today} categories={categories} />
    </main>
  )
}
