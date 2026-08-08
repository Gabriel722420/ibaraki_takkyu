import Link from 'next/link'
import { requireAdmin } from '@/lib/admin'
import { listOfficersAdmin } from '@/lib/queries'
import { OfficerRowActions } from './OfficerRowActions'

export const dynamic = 'force-dynamic'

export default async function AdminOfficersPage() {
  await requireAdmin()
  const officers = await listOfficersAdmin()

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h1 className="text-xl font-bold">役員の管理</h1>
        <Link
          href="/admin/officers/new"
          className="rounded bg-black px-4 py-2 text-white"
        >
          新規作成
        </Link>
      </div>

      <ul className="space-y-3">
        {officers.map((o) => (
          <li key={o.id} className="rounded-lg border p-3">
            <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-gray-600">
              <span
                className={
                  o.is_published
                    ? 'rounded bg-green-100 px-2 py-0.5 text-green-800'
                    : 'rounded bg-gray-200 px-2 py-0.5 text-gray-700'
                }
              >
                {o.is_published ? '公開中' : '非公開'}
              </span>
              <span>順:{o.sort_order}</span>
              <span className="rounded bg-gray-100 px-2 py-0.5">{o.role}</span>
            </div>
            <div className="mb-2 text-lg leading-snug font-medium">
              {o.name}
              {o.note && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  {o.note}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/admin/officers/${o.id}/edit`}
                className="rounded border px-3 py-1.5 text-sm"
              >
                編集
              </Link>
              <OfficerRowActions id={o.id} isPublished={o.is_published} />
            </div>
          </li>
        ))}
        {officers.length === 0 && (
          <li className="py-8 text-center text-gray-500">
            まだ役員がありません。「新規作成」から追加してください。
          </li>
        )}
      </ul>
    </main>
  )
}
