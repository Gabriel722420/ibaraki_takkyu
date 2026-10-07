import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CalendarDays, Download, FileText } from 'lucide-react'
import { getGame } from '@/lib/queries'
import { resolveDocUrl, toContentHtml, DOC_ORDER } from '@/lib/docs'
import { sanitizeHtml } from '@/lib/sanitize'

export const revalidate = 300

export default async function GameDetail({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { game, documents } = await getGame(id)
  if (!game) notFound()

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 md:px-6 md:py-10">
      <article className="rounded-xl border border-hairline bg-card p-5 md:p-8">
        <div className="mb-3 flex items-center gap-2 text-sm text-ink-muted">
          {game.division?.name && (
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 font-medium text-primary">
              {game.division.name}
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="size-4 text-ink-faint" aria-hidden />
            {game.event_date ? formatDate(game.event_date) : '日程調整中'}
          </span>
        </div>
        <h1 className="mb-3 text-[1.45rem] leading-snug font-semibold tracking-[-0.02em] md:text-[1.6rem]">
          {game.title}
        </h1>
        {game.venue && (
          <p className="mb-4 text-ink-muted">会場：{game.venue}</p>
        )}
        {game.summary && (
          <div
            className="richtext text-ink"
            dangerouslySetInnerHTML={{
              __html: sanitizeHtml(toContentHtml(game.summary)),
            }}
          />
        )}

        {DOC_ORDER.map((type) => {
          const group = documents.filter((d) => d.doc_type === type)
          if (group.length === 0) return null
          return (
            <section key={type} className="mt-6 border-t border-hairline pt-6">
              <h2 className="mb-3 text-lg font-semibold">{type}</h2>
              {/* 資料は大きなDLボタン（タップ44px+・#0049a2・ファイル名＋DL矢印）。
                  PDF到達が核心のため押しやすさを最優先。 */}
              <ul className="space-y-2">
                {group.map((doc) => {
                  const url = resolveDocUrl(doc)
                  if (!url) return null
                  return (
                    <li key={doc.id}>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex min-h-[3.25rem] items-center gap-3 rounded-xl border border-hairline bg-card px-4 py-3 font-semibold text-ink transition-colors hover:border-primary/40 hover:bg-[#f2f6fd] active:bg-primary/5"
                      >
                        <FileText
                          className="size-6 shrink-0 text-primary"
                          aria-hidden
                        />
                        <span className="min-w-0 flex-1 group-hover:text-primary">
                          {doc.title}
                        </span>
                        <Download
                          className="size-[1.15rem] shrink-0 text-ink-faint transition-colors group-hover:text-primary"
                          aria-hidden
                        />
                      </a>
                    </li>
                  )
                })}
              </ul>
            </section>
          )
        })}
      </article>
      <div className="mt-6">
        <Link
          href="/games"
          className="inline-flex items-center font-medium text-primary underline-offset-4 hover:underline"
        >
          ← 大会情報一覧へ
        </Link>
      </div>
    </main>
  )
}

function formatDate(d: string): string {
  const [y, m, day] = d.split('-')
  return `${y}年${Number(m)}月${Number(day)}日`
}
