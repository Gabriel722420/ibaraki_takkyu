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
    <main className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-gray-600">
        {a.is_pinned && (
          <span className="rounded bg-primary px-2 py-0.5 text-primary-foreground">
            重要
          </span>
        )}
        <span>{formatDate(a.published_at)}</span>
      </div>
      <h1 className="mb-4 text-2xl leading-snug font-bold">{a.title}</h1>
      {a.body && (
        <div
          className="richtext text-gray-800"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(toContentHtml(a.body)) }}
        />
      )}
      <div className="mt-8">
        <Link
          href="/news"
          className="text-primary underline-offset-4 hover:underline"
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
