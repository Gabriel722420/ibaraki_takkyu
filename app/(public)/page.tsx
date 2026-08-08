import Link from 'next/link'
import {
  Trophy,
  ClipboardList,
  Building2,
  FolderOpen,
  ChevronRight,
  CalendarDays,
  MapPin,
} from 'lucide-react'
import {
  listAnnouncements,
  listUpcomingGames,
  listCategories,
} from '@/lib/queries'
import { gameStatus, GAME_STATUS_LABEL, type GameStatus } from '@/lib/docs'
import { BrandMark } from '@/components/BrandMark'
import type { Announcement, Category, Game } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const today = new Date().toISOString().slice(0, 10)
  // 実データの重心＝おしらせ(2049件)。大会は今後の新規のみ（当面少数）。
  // すべて既存クエリの流用（表示のみ・データ取得は不変）。
  const [news, games, categories] = await Promise.all([
    listAnnouncements({ perPage: 6 }),
    listUpcomingGames(6),
    listCategories(),
  ])
  const topCats = categories.filter((c) => !c.parent_id).slice(0, 8)

  return (
    <main>
      {/* 1. ヒーロー（#0049a2 基調・写真なし。微グラデ＋卓球ボールの円を極薄にあしらう） */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        {/* 微グラデーション（右上を明るく＝奥行き） */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(115%_125%_at_100%_0%,rgba(255,255,255,0.18),transparent_55%)]"
        />
        {/* 卓球ボールを模した極薄の円（あしらい・控えめ） */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-20 -right-16 size-72 rounded-full border border-white/10 bg-white/[0.06]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-20 right-28 hidden size-24 rounded-full border border-white/10 sm:block"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -left-16 size-72 rounded-full bg-white/[0.05]"
        />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-4 px-4 pt-12 pb-24 md:px-6 md:pt-16 md:pb-28 lg:px-8">
          {/* ロゴが入る想定の位置（支給待ち＝差し替え前提） */}
          <div className="flex items-center gap-3">
            <span className="grid size-14 shrink-0 place-items-center rounded-xl bg-white text-primary shadow-sm">
              <BrandMark className="size-10" />
            </span>
            <span className="text-sm font-medium text-white/85">
              一般社団法人 茨城県卓球連盟
            </span>
          </div>
          <h1 className="text-3xl leading-tight font-bold sm:text-4xl">
            公式サイト
          </h1>
          <p className="max-w-prose leading-relaxed text-white/90">
            大会情報・結果、選手登録、各種資料をご案内します。
          </p>
        </div>
      </section>

      {/* 2. 各種情報への入口（主役）。ヒーロー下端に重ねて浮かせる */}
      <section className="relative z-10 -mt-12">
        <div className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
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
              desc="選手登録・各種様式"
            />
            <EntryCard
              href="/about"
              icon={<Building2 className="size-7" aria-hidden />}
              label="連盟情報"
              desc="会長挨拶・役員・規程"
            />
            <EntryCard
              href="/registration"
              icon={<FolderOpen className="size-7" aria-hidden />}
              label="各種資料"
              desc="申込書・様式などの資料"
            />
          </div>
        </div>
      </section>

      {/* 3. 今後の大会（愛知型 upcoming：1行1大会の全幅リスト。少数でもスカスカにしない） */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 pt-10 pb-8 md:px-6 md:pt-12 md:pb-10 lg:px-8">
          <SectionHeading href="/games" label="今後の大会" more="大会情報一覧" />
          {games.length > 0 ? (
            <ul className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              {games.map((g) => (
                <li key={g.id} className="border-b border-gray-100 last:border-b-0">
                  <GameRow game={g} today={today} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyCard>現在、予定されている大会はありません。</EmptyCard>
          )}
        </div>
      </section>

      {/* 4. おしらせ（実データの主役）。最新順のカード＋カテゴリ絞り込み導線 */}
      <section className="bg-[#f6f7f9]">
        <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10 lg:px-8">
          <SectionHeading href="/news" label="おしらせ" more="おしらせ一覧" />

          {/* カテゴリ絞り込みへの入口（/news の絞り込みへ繋ぐ） */}
          {topCats.length > 0 && (
            <nav
              aria-label="おしらせのカテゴリ"
              className="mb-4 flex flex-wrap gap-2"
            >
              <CatChip href="/news" label="すべて" />
              {topCats.map((c) => (
                <CatChip
                  key={c.id}
                  href={`/news?category=${encodeURIComponent(c.slug)}`}
                  label={c.name}
                />
              ))}
            </nav>
          )}

          {news.items.length > 0 ? (
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {news.items.map((a) => (
                <li key={a.id}>
                  <NewsCard a={a} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyCard>現在、お知らせはありません。</EmptyCard>
          )}
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

// ── 今後の大会：1行1大会（全幅・日付(曜)／大会名／会場を横に展開） ──
function GameRow({ game: g, today }: { game: Game; today: string }) {
  const status = gameStatus({
    eventDate: g.event_date,
    hasResult: false, // 今後の大会＝未開催前提。状態は「予定」を基本表示。
    today,
  })
  return (
    <Link
      href={`/games/${g.id}`}
      className="group flex flex-col gap-1.5 px-4 py-4 transition-colors hover:bg-primary/5 sm:flex-row sm:items-center sm:gap-4"
    >
      {/* 日付（曜日付き）＋状態バッジ */}
      <span className="flex shrink-0 items-center gap-2 sm:w-52">
        <StatusBadge status={status} />
        <span className="inline-flex items-center gap-1 text-sm font-medium text-gray-700">
          <CalendarDays className="size-4 shrink-0 text-gray-400" aria-hidden />
          {formatGameDate(g.event_date)}
        </span>
      </span>
      {/* 大会名（部門バッジを前置） */}
      <span className="min-w-0 flex-1 leading-snug font-medium">
        {g.division?.name && (
          <span className="mr-2 rounded bg-gray-100 px-2 py-0.5 align-middle text-sm text-gray-600">
            {g.division.name}
          </span>
        )}
        {g.title}
      </span>
      {/* 会場 */}
      {g.venue && (
        <span className="inline-flex items-center gap-1 text-sm text-gray-600 sm:w-52 sm:justify-end">
          <MapPin className="size-4 shrink-0 text-gray-400" aria-hidden />
          {g.venue}
        </span>
      )}
      <ChevronRight
        className="hidden size-5 shrink-0 text-gray-400 transition group-hover:translate-x-0.5 group-hover:text-primary sm:block"
        aria-hidden
      />
    </Link>
  )
}

// ── おしらせカード（日付・カテゴリバッジ・タイトル） ──
function NewsCard({ a }: { a: Announcement }) {
  return (
    <Link
      href={`/news/${a.id}`}
      className="group flex h-full flex-col gap-1 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
    >
      <span className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
        {a.is_pinned && (
          <span className="rounded bg-primary px-2 py-0.5 font-medium text-primary-foreground">
            重要
          </span>
        )}
        <span>{formatNewsDate(a.published_at)}</span>
        {a.category?.name && (
          <span className="rounded bg-primary/10 px-2 py-0.5 font-medium text-primary">
            {a.category.name}
          </span>
        )}
      </span>
      <span className="mt-0.5 line-clamp-2 leading-snug font-medium">
        {a.title}
      </span>
    </Link>
  )
}

// ── カテゴリ絞り込みチップ ──
function CatChip({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-[36px] items-center rounded-full border border-gray-300 bg-white px-3 text-sm text-gray-700 transition-colors hover:border-primary hover:text-primary"
    >
      {label}
    </Link>
  )
}

// ── 各種情報：アイコン付き入口カード（主役・立体感） ──
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
      className="group flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md md:p-5"
    >
      <span className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
        {icon}
      </span>
      <span className="flex items-center gap-1 text-lg font-bold">
        {label}
        <ChevronRight
          className="size-4 text-gray-400 transition group-hover:translate-x-0.5 group-hover:text-primary"
          aria-hidden
        />
      </span>
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
    <span className={`shrink-0 rounded px-2 py-0.5 text-sm ${cls}`}>
      {GAME_STATUS_LABEL[status]}
    </span>
  )
}

const WEEKDAY = ['日', '月', '火', '水', '木', '金', '土']

// 大会日付：M月D日(曜)。データモデルに終了日カラムが無いため単一日表記。
function formatGameDate(d: string | null): string {
  if (!d) return '日程調整中'
  const [y, m, day] = d.slice(0, 10).split('-').map(Number)
  const wd = WEEKDAY[new Date(y, m - 1, day).getDay()]
  return `${m}月${day}日(${wd})`
}

// おしらせ日付：YYYY年M月D日（従来表記を踏襲）。
function formatNewsDate(d: string): string {
  const [y, m, day] = d.slice(0, 10).split('-')
  return `${y}年${Number(m)}月${Number(day)}日`
}
