import Link from 'next/link'
import { requireAdmin } from '@/lib/admin'
import { listResourcesAdmin } from '@/lib/queries'
import { ResourceRowActions } from './ResourceRowActions'

export const dynamic = 'force-dynamic'

export default async function AdminResourcesPage() {
  await requireAdmin()
  const items = await listResourcesAdmin()

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h1 className="text-xl font-bold">登録・資格情報の管理</h1>
        <Link
          href="/admin/resources/new"
          className="rounded bg-black px-4 py-2 text-white"
        >
          新規作成
        </Link>
      </div>

      <ul className="space-y-3">
        {items.map((r) => (
          <li key={r.id} className="rounded-lg border p-3">
            <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-gray-600">
              <span
                className={
                  r.is_published
                    ? 'rounded bg-green-100 px-2 py-0.5 text-green-800'
                    : 'rounded bg-gray-200 px-2 py-0.5 text-gray-700'
                }
              >
                {r.is_published ? '公開中' : '非公開'}
              </span>
              <span className="rounded bg-gray-100 px-2 py-0.5">
                {r.category}
              </span>
              <span>順:{r.sort_order}</span>
              <span>{r.file_path ? 'PDF' : r.external_url ? '外部リンク' : '—'}</span>
            </div>
            <div className="mb-2 text-lg leading-snug font-medium">
              {r.title}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/admin/resources/${r.id}/edit`}
                className="rounded border px-3 py-1.5 text-sm"
              >
                編集
              </Link>
              <ResourceRowActions id={r.id} isPublished={r.is_published} />
            </div>
          </li>
        ))}
        {items.length === 0 && (
          <li className="py-8 text-center text-gray-500">
            まだ資料がありません。「新規作成」から追加してください。
          </li>
        )}
      </ul>
    </main>
  )
}
