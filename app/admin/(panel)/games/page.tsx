import Link from 'next/link'
import { requireAdmin } from '@/lib/admin'
import { listGamesAdmin } from '@/lib/queries'
import { GameRowActions } from './GameRowActions'

export const dynamic = 'force-dynamic'

export default async function AdminGamesPage() {
  await requireAdmin()
  const games = await listGamesAdmin()

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h1 className="text-xl font-bold">大会の管理</h1>
        <Link
          href="/admin/games/new"
          className="rounded bg-black px-4 py-2 text-white"
        >
          新規作成
        </Link>
      </div>

      <ul className="space-y-3">
        {games.map((t) => (
          <li key={t.id} className="rounded-lg border p-3">
            <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-gray-600">
              <span
                className={
                  t.is_published
                    ? 'rounded bg-green-100 px-2 py-0.5 text-green-800'
                    : 'rounded bg-gray-200 px-2 py-0.5 text-gray-700'
                }
              >
                {t.is_published ? '公開中' : '下書き'}
              </span>
              {isScheduled(t.is_published, t.publish_at) && (
                <span className="rounded bg-amber-100 px-2 py-0.5 text-amber-800">
                  予約中
                </span>
              )}
              {t.division?.name && (
                <span className="rounded bg-gray-100 px-2 py-0.5">
                  {t.division.name}
                </span>
              )}
              <span>{t.fiscal_year}年度</span>
              <span>{t.event_date ? formatDate(t.event_date) : '日程未定'}</span>
            </div>
            <div className="mb-2 text-lg leading-snug font-medium">
              {t.title}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/admin/games/${t.id}/edit`}
                className="rounded border px-3 py-1.5 text-sm"
              >
                編集
              </Link>
              <Link
                href={`/admin/games/${t.id}/documents`}
                className="rounded border px-3 py-1.5 text-sm"
              >
                資料(PDF)
              </Link>
              <GameRowActions id={t.id} isPublished={t.is_published} />
            </div>
          </li>
        ))}
        {games.length === 0 && (
          <li className="py-8 text-center text-gray-500">
            まだ大会がありません。「新規作成」から追加してください。
          </li>
        )}
      </ul>
    </main>
  )
}

function formatDate(d: string): string {
  const [y, m, day] = d.split('-')
  return `${y}年${Number(m)}月${Number(day)}日`
}

// 公開ONだが publish_at が未来＝予約中
function isScheduled(isPublished: boolean, publishAt: string | null): boolean {
  return isPublished && !!publishAt && new Date(publishAt).getTime() > Date.now()
}
