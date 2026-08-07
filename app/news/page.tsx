import Link from 'next/link'
import { listAnnouncements } from '@/lib/queries'

export const dynamic = 'force-dynamic'

export default async function NewsPage() {
  const announcements = await listAnnouncements()

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-4 border-l-4 border-primary pl-2 text-2xl font-bold">
        おしらせ
      </h1>
      <ul className="divide-y divide-gray-200">
        {announcements.map((a) => (
          <li key={a.id}>
            <Link
              href={`/news/${a.id}`}
              className="flex flex-col gap-1 py-4 active:bg-gray-50"
            >
              <span className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                {a.is_pinned && (
                  <span className="rounded bg-primary px-2 py-0.5 text-primary-foreground">
                    重要
                  </span>
                )}
                <span>{formatDate(a.published_at)}</span>
              </span>
              <span className="text-lg leading-snug font-medium">
                {a.title}
              </span>
            </Link>
          </li>
        ))}
        {announcements.length === 0 && (
          <li className="py-8 text-center text-gray-500">
            現在お知らせはありません。
          </li>
        )}
      </ul>
    </main>
  )
}

function formatDate(d: string): string {
  const [y, m, day] = d.slice(0, 10).split('-')
  return `${y}年${Number(m)}月${Number(day)}日`
}
