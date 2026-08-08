import { requireAdmin } from '@/lib/admin'
import { getResourceAdmin } from '@/lib/queries'
import { ResourceForm } from '../../ResourceForm'

export const dynamic = 'force-dynamic'

export default async function EditResourcePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAdmin()
  const { id } = await params
  const resource = await getResourceAdmin(id)
  if (!resource) return <p className="p-4">資料が見つかりません。</p>

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="mb-4 text-xl font-bold">資料の編集</h1>
      <ResourceForm resource={resource} />
    </div>
  )
}
