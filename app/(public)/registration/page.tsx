import { listResources } from '@/lib/queries'
import { resolveDocUrl } from '@/lib/docs'
import type { Resource } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function RegistrationPage() {
  const all = await listResources()
  // 規程(/about)・個人情報保護(/policy) は専用ページで扱うため一覧から除外
  const RESERVED = new Set(['規程', '個人情報保護'])
  const resources = all.filter((r) => !RESERVED.has(r.category))

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
    <main className="mx-auto max-w-6xl px-4 py-6 md:px-6 lg:px-8">
      <h1 className="mb-4 border-l-4 border-primary pl-2 text-2xl font-bold">
        登録・資格情報
      </h1>

      {groups.map((g) => (
        <section key={g.category} className="mb-8">
          <h2 className="mb-2 text-xl font-bold">{g.category}</h2>
          <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {g.items.map((r) => {
              const url = resolveDocUrl(r)
              return (
                <li key={r.id}>
                  {url ? (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block h-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base font-medium transition hover:border-primary/40 hover:shadow-sm active:bg-gray-50"
                    >
                      {r.title}
                      {r.external_url && (
                        <span className="ml-1 text-sm text-gray-500">
                          （外部サイト）
                        </span>
                      )}
                    </a>
                  ) : (
                    <span className="block h-full rounded-lg border border-gray-200 px-4 py-3 text-base text-gray-500">
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
