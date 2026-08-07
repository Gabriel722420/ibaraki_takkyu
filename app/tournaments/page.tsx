import Link from 'next/link'
import { listTournaments } from '@/lib/queries'

export const revalidate = 300

export default async function TournamentsPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; division?: string }>
}) {
  const sp = await searchParams
  const fiscalYear = sp.year ? Number(sp.year) : undefined
  const tournaments = await listTournaments({
    fiscalYear,
    divisionId: sp.division,
  })

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-4 text-2xl font-bold">大会情報</h1>
      <ul className="divide-y divide-gray-200">
        {tournaments.map((t) => (
          <li key={t.id}>
            <Link
              href={`/tournaments/${t.id}`}
              className="flex flex-col gap-1 py-4 active:bg-gray-50"
            >
              <div className="flex items-center gap-2 text-sm text-gray-600">
                {t.division?.name && (
                  <span className="rounded bg-gray-100 px-2 py-0.5">
                    {t.division.name}
                  </span>
                )}
                <span>
                  {t.event_date ? formatDate(t.event_date) : '日程調整中'}
                </span>
              </div>
              <span className="text-lg leading-snug font-medium">
                {t.title}
              </span>
            </Link>
          </li>
        ))}
        {tournaments.length === 0 && (
          <li className="py-8 text-center text-gray-500">
            大会情報はまだありません。
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
