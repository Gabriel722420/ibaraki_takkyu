import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAnnouncement } from '@/lib/queries'
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

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 md:px-6 md:py-10">
      <article className="rounded-xl border border-hairline bg-card p-5 md:p-8">
        <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-ink-muted">
          {a.is_pinned && (
            <span className="rounded-full bg-primary px-2.5 py-0.5 font-medium text-primary-foreground">
              重要
            </span>
          )}
          {a.category?.name && (
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 font-medium text-primary">
              {a.category.name}
            </span>
          )}
          <span>{formatDate(a.published_at)}</span>
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
