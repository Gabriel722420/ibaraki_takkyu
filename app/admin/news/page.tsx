import Link from 'next/link'
import { requireAdmin } from '@/lib/admin'
import { listAnnouncementsAdmin } from '@/lib/queries'
import { NewsRowActions } from './NewsRowActions'

export const dynamic = 'force-dynamic'

export default async function AdminNewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  await requireAdmin()
  const sp = await searchParams
  const page = Math.max(1, Number(sp.page) || 1)
  const { items, total, perPage } = await listAnnouncementsAdmin({ page })
  const totalPages = Math.max(1, Math.ceil(total / perPage))

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h1 className="text-xl font-bold">おしらせの管理</h1>
        <div className="flex gap-2">
          <Link href="/admin/categories" className="rounded border px-4 py-2">
            カテゴリ
          </Link>
          <Link
            href="/admin/news/new"
            className="rounded bg-black px-4 py-2 text-white"
          >
            新規作成
          </Link>
        </div>
      </div>

      <p className="mb-2 text-sm text-gray-500">全{total}件</p>

      <ul className="space-y-3">
        {items.map((a) => (
          <li key={a.id} className="rounded-lg border p-3">
            <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-gray-600">
              <span
                className={
                  a.is_published
                    ? 'rounded bg-green-100 px-2 py-0.5 text-green-800'
                    : 'rounded bg-gray-200 px-2 py-0.5 text-gray-700'
                }
              >
                {a.is_published ? '公開中' : '下書き'}
              </span>
              {isScheduled(a.is_published, a.publish_at) && (
                <span className="rounded bg-amber-100 px-2 py-0.5 text-amber-800">
                  予約中
                </span>
              )}
              {a.is_pinned && (
                <span className="rounded bg-primary px-2 py-0.5 text-primary-foreground">
                  重要
                </span>
              )}
              {a.category?.name && (
                <span className="rounded bg-gray-100 px-2 py-0.5">
                  {a.category.name}
                </span>
              )}
              <span>{formatDate(a.published_at)}</span>
            </div>
            <div className="mb-2 text-lg leading-snug font-medium">
              {a.title}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/admin/news/${a.id}/edit`}
                className="rounded border px-3 py-1.5 text-sm"
              >
                編集
              </Link>
              <NewsRowActions id={a.id} isPublished={a.is_published} />
            </div>
          </li>
        ))}
        {items.length === 0 && (
          <li className="py-8 text-center text-gray-500">
            まだお知らせがありません。「新規作成」から追加してください。
          </li>
        )}
      </ul>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between gap-2">
          {page > 1 ? (
            <Link
              href={`/admin/news?page=${page - 1}`}
              className="rounded border px-4 py-2"
            >
              ← 前へ
            </Link>
          ) : (
            <span />
          )}
          <span className="text-sm text-gray-600">
            {page} / {totalPages} ページ
          </span>
          {page < totalPages ? (
            <Link
              href={`/admin/news?page=${page + 1}`}
              className="rounded border px-4 py-2"
            >
              次へ →
            </Link>
          ) : (
            <span />
          )}
        </div>
      )}
    </main>
  )
}

function formatDate(d: string): string {
  const [y, m, day] = d.slice(0, 10).split('-')
  return `${y}年${Number(m)}月${Number(day)}日`
}

// 公開ONだが publish_at が未来＝予約中
function isScheduled(isPublished: boolean, publishAt: string | null): boolean {
  return isPublished && !!publishAt && new Date(publishAt).getTime() > Date.now()
}
