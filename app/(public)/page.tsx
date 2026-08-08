import Link from 'next/link'
import {
  Trophy,
  ClipboardList,
  Building2,
  Newspaper,
  ChevronRight,
} from 'lucide-react'
import { listAnnouncements, listUpcomingGames } from '@/lib/queries'
import { gameStatus, GAME_STATUS_LABEL, type GameStatus } from '@/lib/docs'
import type { Announcement, Game } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const today = new Date().toISOString().slice(0, 10)
  const [news, games] = await Promise.all([
    // カテゴリ情報つきで取得（2カラム振り分け用）。既存クエリを流用（データ取得は不変）。
    listAnnouncements({ perPage: 12 }),
    listUpcomingGames(5),
  ])

  // おしらせをカテゴリ名で「大会関連」と「その他」に振り分け（例に沿った2カラム）。
  // どちらかが空でも各カラムがフォールバック行を出すため成立する。
  const isGameRelated = (a: Announcement) =>
    /大会|試合|結果|組合せ|組合わせ|要項|申込/.test(a.category?.name ?? '')
  const newsGame = news.items.filter(isGameRelated).slice(0, 6)
  const newsOther = news.items.filter((a) => !isGameRelated(a)).slice(0, 6)

  return (
    <main>
      {/* 1. 導入部（#0049a2 を効かせた落ち着いたヘッダーブロック・写真なし） */}
      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14 lg:px-8">
          <h1 className="text-2xl leading-tight font-bold sm:text-3xl">
            茨城県卓球連盟 公式サイト
          </h1>
          <p className="mt-3 max-w-prose leading-relaxed text-white/90">
            一般社団法人茨城県卓球連盟の公式サイトです。
            <br className="hidden sm:block" />
            大会情報・結果・登録・各種資料をご案内します。
          </p>
        </div>
      </section>

      {/* 2. 近日の大会（1行カード・状態バッジ） */}
      <section className="bg-[#f6f7f9]">
        <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10 lg:px-8">
          <SectionHeading href="/games" label="近日の大会" more="大会情報一覧" />
          {games.length > 0 ? (
            <ul className="grid gap-3 lg:grid-cols-2">
              {games.map((g) => (
                <li key={g.id}>
                  <GameRow game={g} today={today} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyCard>近日開催予定の大会はありません。</EmptyCard>
          )}
        </div>
      </section>

      {/* 3. おしらせ（カテゴリで2カラム整理） */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10 lg:px-8">
          <SectionHeading href="/news" label="おしらせ" more="おしらせ一覧" />
          <div className="grid gap-x-8 gap-y-6 md:grid-cols-2">
            <NewsColumn title="大会関連のおしらせ" items={newsGame} />
            <NewsColumn title="その他のおしらせ" items={newsOther} />
          </div>
        </div>
      </section>

      {/* 4. 各種情報への入口（アイコン付きカードのグリッド） */}
      <section className="bg-[#f6f7f9]">
        <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10 lg:px-8">
          <h2 className="mb-4 border-l-4 border-primary pl-2 text-xl font-bold">
            各種情報
          </h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <EntryCard
              href="/games"
              icon={<Trophy className="size-7" aria-hidden />}
              label="大会情報"
              desc="日程・要項・組合せ・結果"
            />
            <EntryCard
              href="/registration"
              icon={<ClipboardList className="size-7" aria-hidden />}
              label="登録・資格情報"
              desc="登録手続き・各種様式・資料"
            />
            <EntryCard
              href="/about"
              icon={<Building2 className="size-7" aria-hidden />}
              label="連盟情報"
              desc="連盟概要・役員・規程"
            />
            <EntryCard
              href="/news"
              icon={<Newspaper className="size-7" aria-hidden />}
              label="おしらせ"
              desc="新着情報の一覧"
            />
          </div>
        </div>
      </section>
    </main>
  )
}

// ── セクション見出し（ラベル＋一覧への導線） ──
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
    <div className="mb-4 flex items-baseline justify-between gap-2">
      <h2 className="border-l-4 border-primary pl-2 text-xl font-bold">
        {label}
      </h2>
      <Link
        href={href}
        className="inline-flex shrink-0 items-center text-sm font-medium text-primary underline-offset-4 hover:underline"
      >
        {more}
        <ChevronRight className="size-4" aria-hidden />
      </Link>
    </div>
  )
}

// ── 近日の大会：1行カード（日付／部門バッジ／大会名／会場・状態バッジ） ──
function GameRow({ game: g, today }: { game: Game; today: string }) {
  const status = gameStatus({
    eventDate: g.event_date,
    hasResult: false, // 近日=未開催前提。状態は「予定」を基本表示。
    today,
  })
  return (
    <Link
      href={`/games/${g.id}`}
      className="flex h-full items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 transition hover:border-primary/40 hover:shadow-sm active:bg-gray-50"
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
          <StatusBadge status={status} />
          {g.division?.name && (
            <span className="rounded bg-gray-100 px-2 py-0.5">
              {g.division.name}
            </span>
          )}
          <span>{g.event_date ? formatDate(g.event_date) : '日程調整中'}</span>
        </div>
        <span className="mt-1 block text-lg leading-snug font-medium">
          {g.title}
        </span>
        {g.venue && (
          <span className="mt-0.5 block text-sm text-gray-600">
            会場：{g.venue}
          </span>
        )}
      </div>
      <ChevronRight className="size-5 shrink-0 text-gray-400" aria-hidden />
    </Link>
  )
}

// ── おしらせ 1カラム（日付ミュート＋カテゴリバッジ＋タイトル） ──
function NewsColumn({
  title,
  items,
}: {
  title: string
  items: Announcement[]
}) {
  return (
    <div>
      <h3 className="mb-2 text-base font-bold text-gray-800">{title}</h3>
      {items.length > 0 ? (
        <ul className="space-y-2">
          {items.map((a) => (
            <li key={a.id}>
              <Link
                href="/news"
                className="block rounded-lg border border-gray-200 bg-white p-3 transition hover:border-primary/40 hover:shadow-sm active:bg-gray-50"
              >
                <span className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                  <span>{formatDate(a.published_at)}</span>
                  {a.category?.name && (
                    <span className="rounded bg-primary/10 px-2 py-0.5 font-medium text-primary">
                      {a.category.name}
                    </span>
                  )}
                </span>
                <span className="mt-1 block leading-snug font-medium">
                  {a.title}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyCard>現在、該当のおしらせはありません。</EmptyCard>
      )}
    </div>
  )
}

// ── 各種情報：アイコン付き入口カード ──
function EntryCard({
  href,
  icon,
  label,
  desc,
}: {
  href: string
  icon: React.ReactNode
  label: string
  desc: string
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white p-4 text-center transition hover:border-primary/40 hover:shadow-sm active:bg-gray-50"
    >
      <span className="text-primary">{icon}</span>
      <span className="font-bold">{label}</span>
      <span className="text-sm leading-snug text-gray-600">{desc}</span>
    </Link>
  )
}

function EmptyCard({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg border border-dashed border-gray-300 bg-white px-4 py-6 text-gray-500">
      {children}
    </p>
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
  const [y, m, day] = d.slice(0, 10).split('-')
  return `${y}年${Number(m)}月${Number(day)}日`
}
