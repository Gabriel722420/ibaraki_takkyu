import { listResources } from '@/lib/queries'
import { resolveDocUrl } from '@/lib/docs'
import type { Resource } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function RegistrationPage() {
  const resources = await listResources()

  // category ごとにグルーピング（sort_order 順に並んだ配列の初出順でグループ化）
  const groups: { category: string; items: Resource[] }[] = []
  for (const r of resources) {
    let g = groups.find((x) => x.category === r.category)
    if (!g) {
      g = { category: r.category, items: [] }
      groups.push(g)
    }
    g.items.push(r)
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-4 border-l-4 border-primary pl-2 text-2xl font-bold">
        登録・資格情報
      </h1>

      {groups.map((g) => (
        <section key={g.category} className="mb-8">
          <h2 className="mb-2 text-xl font-bold">{g.category}</h2>
          <ul className="space-y-2">
            {g.items.map((r) => {
              const url = resolveDocUrl(r)
              return (
                <li key={r.id}>
                  {url ? (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-lg border border-gray-300 px-4 py-3 text-base font-medium active:bg-gray-50"
                    >
                      {r.title}
                      {r.external_url && (
                        <span className="ml-1 text-sm text-gray-500">
                          （外部サイト）
                        </span>
                      )}
                    </a>
                  ) : (
                    <span className="block rounded-lg border border-gray-200 px-4 py-3 text-base text-gray-500">
                      {r.title}
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
        </section>
      ))}

      {resources.length === 0 && (
        <p className="py-8 text-center text-gray-500">
          現在、掲載中の資料はありません。
        </p>
      )}
    </main>
  )
}
