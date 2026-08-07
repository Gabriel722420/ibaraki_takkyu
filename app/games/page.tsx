import Link from 'next/link'
import { listGamesForYearList } from '@/lib/queries'
import { gameStatus, GAME_STATUS_LABEL, type GameStatus } from '@/lib/docs'
import type { Game } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function GamesPage() {
  const games = await listGamesForYearList()
  const today = new Date().toISOString().slice(0, 10)

  // 年度（fiscal_year）で括る。games は fiscal_year 降順→event_date 昇順で取得済み。
  const years: { year: number; items: (Game & { hasResult: boolean })[] }[] = []
  for (const g of games) {
    let grp = years.find((y) => y.year === g.fiscal_year)
    if (!grp) {
      grp = { year: g.fiscal_year, items: [] }
      years.push(grp)
    }
    grp.items.push(g)
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-4 border-l-4 border-primary pl-2 text-2xl font-bold">
        大会情報
      </h1>

      {years.map((grp) => (
        <section key={grp.year} className="mb-8">
          <h2 className="mb-2 text-xl font-bold">{grp.year}年度</h2>
          <ul className="divide-y divide-gray-200">
            {grp.items.map((g) => {
              const status = gameStatus({
                eventDate: g.event_date,
                hasResult: g.hasResult,
                today,
              })
              return (
                <li key={g.id}>
                  <Link
                    href={`/games/${g.id}`}
                    className="flex items-center gap-3 py-4 active:bg-gray-50"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                        <StatusBadge status={status} />
                        {g.division?.name && (
                          <span className="rounded bg-gray-100 px-2 py-0.5">
                            {g.division.name}
                          </span>
                        )}
                        <span>
                          {g.event_date
                            ? formatDate(g.event_date)
                            : '日程調整中'}
                        </span>
                      </div>
                      <span className="mt-0.5 block text-lg leading-snug font-medium">
                        {g.title}
                      </span>
                    </div>
                    {status === 'published' && (
                      <span className="shrink-0 rounded-lg bg-primary px-3 py-2 text-sm font-bold text-primary-foreground">
                        結果
                      </span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>
      ))}

      {games.length === 0 && (
        <p className="py-8 text-center text-gray-500">
          大会情報はまだありません。
        </p>
      )}
    </main>
  )
}

function StatusBadge({ status }: { status: GameStatus }) {
  const cls =
    status === 'published'
      ? 'bg-green-100 text-green-800'
      : status === 'awaiting'
        ? 'bg-amber-100 text-amber-800'
        : 'bg-blue-100 text-blue-800'
  return (
    <span className={`rounded px-2 py-0.5 ${cls}`}>
      {GAME_STATUS_LABEL[status]}
    </span>
  )
}

function formatDate(d: string): string {
  const [y, m, day] = d.split('-')
  return `${y}年${Number(m)}月${Number(day)}日`
}
