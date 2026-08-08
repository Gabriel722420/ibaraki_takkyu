import { notFound } from 'next/navigation'
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
    <main className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-2 flex items-center gap-2 text-sm text-gray-600">
        {game.division?.name && (
          <span className="rounded bg-gray-100 px-2 py-0.5">
            {game.division.name}
          </span>
        )}
        <span>
          {game.event_date
            ? formatDate(game.event_date)
            : '日程調整中'}
        </span>
      </div>
      <h1 className="mb-3 text-2xl leading-snug font-bold">
        {game.title}
      </h1>
      {game.venue && (
        <p className="mb-1 text-gray-700">会場：{game.venue}</p>
      )}
      {game.summary && (
        <div
          className="richtext mb-6 text-gray-800"
          dangerouslySetInnerHTML={{
            __html: sanitizeHtml(toContentHtml(game.summary)),
          }}
        />
      )}

      {DOC_ORDER.map((type) => {
        const group = documents.filter((d) => d.doc_type === type)
        if (group.length === 0) return null
        return (
          <section key={type} className="mb-5">
            <h2 className="mb-2 text-base font-bold">{type}</h2>
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
                      className="block rounded-lg border border-gray-300 px-4 py-3 text-base font-medium active:bg-gray-50"
                    >
                      {doc.title}
                    </a>
                  </li>
                )
              })}
            </ul>
          </section>
        )
      })}
    </main>
  )
}

function formatDate(d: string): string {
  const [y, m, day] = d.split('-')
  return `${y}年${Number(m)}月${Number(day)}日`
}
