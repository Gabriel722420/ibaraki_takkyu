import Link from 'next/link'
import { requireAdmin } from '@/lib/admin'
import { listCategories } from '@/lib/queries'
import { CategoriesEditor } from './CategoriesEditor'

export const dynamic = 'force-dynamic'

export default async function AdminCategoriesPage() {
  await requireAdmin()
  const categories = await listCategories()

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h1 className="text-xl font-bold">おしらせカテゴリの管理</h1>
        <Link href="/admin/news" className="rounded border px-4 py-2">
          おしらせ一覧へ
        </Link>
      </div>
      <CategoriesEditor categories={categories} />
    </main>
  )
}
