import Link from 'next/link'
import { requireAdmin } from '@/lib/admin'
import { listDivisions } from '@/lib/queries'
import { DivisionsEditor } from './DivisionsEditor'

export const dynamic = 'force-dynamic'

export default async function AdminDivisionsPage() {
  await requireAdmin()
  const divisions = await listDivisions()

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h1 className="text-xl font-bold">部門の管理</h1>
        <Link href="/admin" className="rounded border px-4 py-2">
          管理トップ
        </Link>
      </div>
      <DivisionsEditor divisions={divisions} />
    </div>
  )
}
