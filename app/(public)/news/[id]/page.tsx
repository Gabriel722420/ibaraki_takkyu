import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CalendarDays, ChevronRight } from 'lucide-react'
import { getAnnouncement, listRelatedAnnouncements } from '@/lib/queries'
import { toContentHtml } from '@/lib/docs'
import { sanitizeHtml } from '@/lib/sanitize'

export const dynamic = 'force-dynamic'

export default async function NewsDetail({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const a = await getAnnouncement(id)
  if (!a) notFound()
  const related = await listRelatedAnnouncements(a, 5)

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 md:px-6 md:py-10">
      {/* 本文が薄い（PDF添付主体）記事でも、資料ボタンを主役に据えて成立するカード。 */}
      <article className="rounded-xl border border-hairline bg-card p-5 md:p-8">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {a.is_pinned && (
            <span className="rounded-full bg-primary px-2.5 py-0.5 text-sm font-medium text-primary-foreground">
              重要
            </span>
          )}
          {a.category?.name && (
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-sm font-medium text-primary">
              {a.category.name}
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-sm text-ink-muted">
            <CalendarDays className="size-4 text-ink-faint" aria-hidden />
            {formatDate(a.published_at)}
          </span>
        </div>
        <h1 className="mb-5 text-[1.45rem] leading-snug font-semibold tracking-[-0.02em] md:text-[1.6rem]">
          {a.title}
        </h1>
        {a.body && (
          <div
            className="richtext text-ink"
            dangerouslySetInnerHTML={{
              __html: sanitizeHtml(toContentHtml(a.body)),
            }}
          />
        )}
      </article>

      {/* 回遊：同カテゴリの関連おしらせ（2049記事の回遊導線） */}
      {related.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 border-l-4 border-primary pl-3 text-[1.15rem] font-semibold tracking-[-0.01em]">
            関連するおしらせ
          </h2>
          <ul className="overflow-hidden rounded-xl border border-hairline bg-card">
            {related.map((r) => (
              <li key={r.id} className="border-b border-hairline last:border-b-0">
                <Link
                  href={`/news/${r.id}`}
                  className="group flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-primary/5"
                >
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2 text-sm text-ink-muted">
                      {r.category?.name && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary">
                          {r.category.name}
                        </span>
                      )}
                      <span>{formatDate(r.published_at)}</span>
                    </span>
                    <span className="mt-0.5 line-clamp-2 font-medium text-ink group-hover:text-primary">
                      {r.title}
                    </span>
                  </span>
                  <ChevronRight
                    className="size-5 shrink-0 text-ink-faint transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                    aria-hidden
                  />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-6">
        <Link
          href="/news"
          className="inline-flex items-center font-medium text-primary underline-offset-4 hover:underline"
        >
          ← おしらせ一覧へ
        </Link>
      </div>
    </main>
  )
}

function formatDate(d: string): string {
  const [y, m, day] = d.slice(0, 10).split('-')
  return `${y}年${Number(m)}月${Number(day)}日`
}
