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
    <main className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10 lg:px-8">
      <h1 className="mb-6 border-l-4 border-primary pl-3 text-[1.45rem] font-medium tracking-[-0.02em]">
        大会情報
      </h1>

      {years.map((grp) => (
        <section key={grp.year} className="mb-10">
          <h2 className="mb-3 text-[1.3rem] font-semibold tracking-[-0.01em]">
            {grp.year}年度
          </h2>
          <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
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
                    className="group flex h-full items-center gap-3 rounded-xl border border-hairline bg-card p-4 transition-colors hover:border-primary/40 hover:bg-primary/[0.03] active:bg-primary/5"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 text-sm text-ink-muted">
                        <StatusBadge status={status} />
                        {g.division?.name && (
                          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 font-medium text-primary">
                            {g.division.name}
                          </span>
                        )}
                        <span>
                          {g.event_date
                            ? formatDate(g.event_date)
                            : '日程調整中'}
                        </span>
                      </div>
                      <span className="mt-1 block text-lg leading-snug font-medium text-ink group-hover:text-primary">
                        {g.title}
                      </span>
                    </div>
                    {status === 'published' && (
                      <span className="shrink-0 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground">
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
        <p className="rounded-xl border border-dashed border-surface-muted bg-card py-10 text-center text-ink-muted">
          大会情報はまだありません。
        </p>
      )}
    </main>
  )
}

// 状態は mono+accent の濃淡で表現（他の色相を足さない・DESIGN.md StatusBadge）
function StatusBadge({ status }: { status: GameStatus }) {
  const cls =
    status === 'published'
      ? 'bg-primary text-primary-foreground'
      : status === 'awaiting'
        ? 'bg-[#f0f0f0] text-ink-muted'
        : 'border border-primary/40 bg-primary/5 text-primary'
  return (
    <span className={`rounded-full px-2.5 py-0.5 font-medium ${cls}`}>
      {GAME_STATUS_LABEL[status]}
    </span>
  )
}

function formatDate(d: string): string {
  const [y, m, day] = d.split('-')
  return `${y}年${Number(m)}月${Number(day)}日`
}
