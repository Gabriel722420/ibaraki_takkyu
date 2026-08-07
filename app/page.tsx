import Link from 'next/link'
import { listLatestAnnouncements, listUpcomingGames } from '@/lib/queries'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const [announcements, games] = await Promise.all([
    listLatestAnnouncements(5),
    listUpcomingGames(5),
  ])

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <p className="mb-8 leading-relaxed text-gray-800">
        茨城県卓球連盟の公式サイトです。大会情報・結果・各種資料をご案内します。
      </p>

      {/* おしらせ */}
      <section className="mb-10">
        <SectionHeading href="/news" label="おしらせ" more="おしらせ一覧へ" />
        <ul className="divide-y divide-gray-200">
          {announcements.map((a) => (
            <li key={a.id}>
              <Link
                href="/news"
                className="flex flex-col gap-1 py-4 active:bg-gray-50"
              >
                <span className="text-sm text-gray-600">
                  {formatDate(a.published_at)}
                </span>
                <span className="text-lg leading-snug font-medium">
                  {a.title}
                </span>
              </Link>
            </li>
          ))}
          {announcements.length === 0 && (
            <li className="py-6 text-gray-500">現在お知らせはありません。</li>
          )}
        </ul>
      </section>

      {/* 近日の大会 */}
      <section>
        <SectionHeading href="/games" label="近日の大会" more="大会情報一覧へ" />
        <ul className="divide-y divide-gray-200">
          {games.map((g) => (
            <li key={g.id}>
              <Link
                href={`/games/${g.id}`}
                className="flex flex-col gap-1 py-4 active:bg-gray-50"
              >
                <span className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                  {g.division?.name && (
                    <span className="rounded bg-gray-100 px-2 py-0.5">
                      {g.division.name}
                    </span>
                  )}
                  <span>
                    {g.event_date ? formatDate(g.event_date) : '日程調整中'}
                  </span>
                </span>
                <span className="text-lg leading-snug font-medium">
                  {g.title}
                </span>
              </Link>
            </li>
          ))}
          {games.length === 0 && (
            <li className="py-6 text-gray-500">
              近日開催予定の大会はありません。
            </li>
          )}
        </ul>
      </section>
    </main>
  )
}

function SectionHeading({
  href,
  label,
  more,
}: {
  href: string
  label: string
  more: string
}) {
  return (
    <div className="mb-2 flex items-baseline justify-between gap-2">
      <h2 className="border-l-4 border-primary pl-2 text-xl font-bold">
        {label}
      </h2>
      <Link
        href={href}
        className="text-sm font-medium text-primary underline-offset-4 hover:underline"
      >
        {more} →
      </Link>
    </div>
  )
}

function formatDate(d: string): string {
  const [y, m, day] = d.slice(0, 10).split('-')
  return `${y}年${Number(m)}月${Number(day)}日`
}
