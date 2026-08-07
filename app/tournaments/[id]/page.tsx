import { notFound } from 'next/navigation'
import { getTournament } from '@/lib/queries'
import { resolveDocUrl, DOC_ORDER } from '@/lib/docs'

export const revalidate = 300

export default async function TournamentDetail({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { tournament, documents } = await getTournament(id)
  if (!tournament) notFound()

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-2 flex items-center gap-2 text-sm text-gray-600">
        {tournament.division?.name && (
          <span className="rounded bg-gray-100 px-2 py-0.5">
            {tournament.division.name}
          </span>
        )}
        <span>
          {tournament.event_date
            ? formatDate(tournament.event_date)
            : '日程調整中'}
        </span>
      </div>
      <h1 className="mb-3 text-2xl leading-snug font-bold">
        {tournament.title}
      </h1>
      {tournament.venue && (
        <p className="mb-1 text-gray-700">会場：{tournament.venue}</p>
      )}
      {tournament.summary && (
        <p className="mb-6 leading-relaxed whitespace-pre-wrap text-gray-800">
          {tournament.summary}
        </p>
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
