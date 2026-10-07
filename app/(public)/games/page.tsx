import Link from 'next/link'
import { CalendarDays, ChevronRight } from 'lucide-react'
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
          {/* 1行1大会の全幅リスト（件数が少なくてもスカスカにならず、多くても整然） */}
          <ul className="overflow-hidden rounded-xl border border-hairline bg-card">
            {grp.items.map((g) => {
              const status = gameStatus({
                eventDate: g.event_date,
                hasResult: g.hasResult,
                today,
              })
              return (
                <li
                  key={g.id}
                  className="border-b border-hairline last:border-b-0"
                >
                  <Link
                    href={`/games/${g.id}`}
                    className="group flex flex-col gap-1.5 px-4 py-4 transition-colors hover:bg-primary/5 sm:flex-row sm:items-center sm:gap-4 md:px-5"
                  >
                    <span className="flex shrink-0 flex-wrap items-center gap-2 sm:w-60">
                      <StatusBadge status={status} />
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-ink-muted">
                        <CalendarDays
                          className="size-4 shrink-0 text-ink-faint"
                          aria-hidden
                        />
                        {g.event_date ? formatDate(g.event_date) : '日程調整中'}
                      </span>
                    </span>
                    <span className="min-w-0 flex-1 leading-snug font-medium text-ink group-hover:text-primary">
                      {g.division?.name && (
                        <span className="mr-2 rounded-full bg-primary/10 px-2.5 py-0.5 align-middle text-sm font-medium text-primary">
                          {g.division.name}
                        </span>
                      )}
                      {g.title}
                    </span>
                    {status === 'published' ? (
                      <span className="shrink-0 rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground">
                        結果
                      </span>
                    ) : (
                      <ChevronRight
                        className="hidden size-5 shrink-0 text-ink-faint transition-transform group-hover:translate-x-0.5 group-hover:text-primary sm:block"
                        aria-hidden
                      />
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
