import { requireAdmin } from '@/lib/admin'
import { getOfficerAdmin } from '@/lib/queries'
import { OfficerForm } from '../../OfficerForm'

export const dynamic = 'force-dynamic'

export default async function EditOfficerPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAdmin()
  const { id } = await params
  const officer = await getOfficerAdmin(id)
  if (!officer) return <p className="p-4">役員が見つかりません。</p>

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="mb-4 text-xl font-bold">役員の編集</h1>
      <OfficerForm officer={officer} />
    </div>
  )
}
