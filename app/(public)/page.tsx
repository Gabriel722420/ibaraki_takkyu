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
import type { Announcement, Game } from '@/lib/types'

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

  const hasGames = games.length > 0

  return (
    <main>
      {/* 1. ヒーロー：実写の卓球台・ネット（人物なし / AI生成しない）を #0049a2 の
          ブランドウォッシュで敷く。左は濃く＝白文字を保護、右は薄め＝写真を見せる。
          出典: Pexels(Julia Dibrova) / Pexels License・public/hero-table.jpg にセルフホスト。
          ロゴ/写真差し替えは <img> 1箇所。画像が落ちても下の bg-primary で青地を担保。 */}
      <section className="relative isolate overflow-hidden text-white">
        <div aria-hidden className="absolute inset-0 -z-30 bg-primary" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/hero-table.jpg"
          alt=""
          aria-hidden
          className="absolute inset-0 -z-20 size-full object-cover object-[center_32%]"
        />
        {/* ブランドウォッシュ（青一色で統一・左→右で濃淡） */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/95 via-primary/85 to-primary/45"
        />
        {/* 下端を締める縦グラデ（入口カードの重なりを馴染ませる） */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 -z-10 h-28 bg-gradient-to-t from-primary/70 to-transparent"
        />
        <div className="relative mx-auto max-w-6xl px-4 pt-12 pb-28 md:px-6 md:pt-16 md:pb-36 lg:px-8">
          {/* 連盟名はヘッダーが担う。ヒーローは写真＋ウォッシュを主役に、
              重複を避けて「用途を示す簡潔な見出し＋リード」のみ置く（連盟名は反復しない）。 */}
          <span className="inline-flex items-center rounded-full border border-white/35 px-3 py-0.5 text-xs font-medium tracking-wide text-white/90">
            公式サイト
          </span>
          <h1 className="mt-4 max-w-[20ch] text-[1.75rem] leading-[1.15] font-bold tracking-[-0.02em] sm:text-[2.3rem] md:text-[2.6rem]">
            大会・登録・各種資料のご案内
          </h1>
          <p className="mt-4 max-w-prose leading-relaxed text-white/90">
            大会情報・結果、選手登録、各種資料をご案内します。
          </p>
        </div>
      </section>

      {/* 2. 各種情報への入口（主役）。ヒーロー下端に重ねて浮かせる */}
      <section className="relative z-10 -mt-14">
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

      {/* 3. 今後の大会：データがある時だけ表示（0件なら畳んで空箱を主役化させない） */}
      {hasGames && (
        <section>
          <div className="mx-auto max-w-6xl px-4 pt-16 pb-2 md:px-6 md:pt-20 lg:px-8">
            <SectionHeading
              href="/games"
              label="今後の大会"
              more="大会情報一覧"
            />
            <ul className="overflow-hidden rounded-xl border border-hairline bg-card">
              {games.map((g) => (
                <li
                  key={g.id}
                  className="border-b border-hairline last:border-b-0"
                >
                  <GameRow game={g} today={today} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* 4. おしらせ（実データの主役）。最新順のカード＋カテゴリ絞り込み導線 */}
      <section>
        <div
          className={`mx-auto max-w-6xl px-4 pb-16 md:px-6 md:pb-24 lg:px-8 ${
            hasGames ? 'pt-12 md:pt-16' : 'pt-16 md:pt-20'
          }`}
        >
          <SectionHeading href="/news" label="おしらせ" more="おしらせ一覧" />

          {/* カテゴリ導線：Airbnb型の横スクロール1行ストリップ（平板な折返しを避ける） */}
          {topCats.length > 0 && (
            <nav
              aria-label="おしらせのカテゴリ"
              className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              <CatChip href="/news" label="すべて" accent />
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
      <h2 className="border-l-4 border-primary pl-3 text-[1.3rem] font-semibold tracking-[-0.01em]">
        {label}
      </h2>
      <Link
        href={href}
        className="group inline-flex shrink-0 items-center gap-0.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
      >
        {more}
        <ChevronRight
          className="size-4 transition-transform group-hover:translate-x-0.5"
          aria-hidden
        />
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
        <span className="inline-flex items-center gap-1 text-sm font-medium text-ink-muted">
          <CalendarDays
            className="size-4 shrink-0 text-ink-faint"
            aria-hidden
          />
          {formatGameDate(g.event_date)}
        </span>
      </span>
      {/* 大会名（部門バッジを前置） */}
      <span className="min-w-0 flex-1 leading-snug font-medium">
        {g.division?.name && (
          <span className="mr-2 rounded-full bg-primary/10 px-2.5 py-0.5 align-middle text-sm font-medium text-primary">
            {g.division.name}
          </span>
        )}
        {g.title}
      </span>
      {/* 会場 */}
      {g.venue && (
        <span className="inline-flex items-center gap-1 text-sm text-ink-muted sm:w-52 sm:justify-end">
          <MapPin className="size-4 shrink-0 text-ink-faint" aria-hidden />
          {g.venue}
        </span>
      )}
      <ChevronRight
        className="hidden size-5 shrink-0 text-ink-faint transition-transform group-hover:translate-x-0.5 group-hover:text-primary sm:block"
        aria-hidden
      />
    </Link>
  )
}

// ── おしらせカード（日付・カテゴリバッジ・タイトル）。影でなく hairline＋値差で分離 ──
function NewsCard({ a }: { a: Announcement }) {
  return (
    <Link
      href={`/news/${a.id}`}
      className="group flex h-full flex-col gap-1.5 rounded-xl border border-hairline bg-card p-4 transition-colors hover:border-primary/40 hover:bg-primary/[0.03]"
    >
      <span className="flex flex-wrap items-center gap-2 text-sm text-ink-muted">
        {a.is_pinned && (
          <span className="rounded-full bg-primary px-2.5 py-0.5 font-medium text-primary-foreground">
            重要
          </span>
        )}
        <span>{formatNewsDate(a.published_at)}</span>
        {a.category?.name && (
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 font-medium text-primary">
            {a.category.name}
          </span>
        )}
      </span>
      <span className="line-clamp-3 leading-relaxed font-medium text-ink group-hover:text-primary">
        {a.title}
      </span>
    </Link>
  )
}

// ── カテゴリ絞り込みチップ（pill・mono+accent）。accent=入口の「すべて」を強調 ──
function CatChip({
  href,
  label,
  accent,
}: {
  href: string
  label: string
  accent?: boolean
}) {
  return (
    <Link
      href={href}
      className={[
        'inline-flex min-h-[38px] shrink-0 items-center rounded-full border px-4 text-sm font-medium transition-colors',
        accent
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-surface-muted bg-card text-ink hover:border-primary hover:text-primary',
      ].join(' ')}
    >
      {label}
    </Link>
  )
}

// ── 各種情報：アイコン付き入口カード（主役）。影でなく hairline＋値差＋ホバーtint ──
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
      className="group flex flex-col gap-3 rounded-xl border border-hairline bg-card p-4 transition-colors hover:border-primary/40 hover:bg-primary/[0.03] md:p-5"
    >
      <span className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
        {icon}
      </span>
      <span className="flex items-center gap-1 text-lg font-semibold">
        {label}
        <ChevronRight
          className="size-4 text-ink-faint transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
          aria-hidden
        />
      </span>
      <span className="text-sm leading-snug text-ink-muted">{desc}</span>
    </Link>
  )
}

function EmptyCard({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-surface-muted bg-card px-4 py-8 text-center text-ink-muted">
      {children}
    </p>
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
    <span
      className={`shrink-0 rounded-full px-2.5 py-0.5 text-sm font-medium ${cls}`}
    >
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
