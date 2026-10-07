import { FileText } from 'lucide-react'
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
    <main className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10 lg:px-8">
      <h1 className="mb-3 border-l-4 border-primary pl-3 text-[1.45rem] font-medium tracking-[-0.02em]">
        登録・資格情報
      </h1>
      <p className="mb-8 max-w-prose leading-relaxed text-ink-muted">
        選手登録や各種大会の申込に必要な様式・資料をご案内します。
      </p>

      {groups.map((g) => (
        <section key={g.category} className="mb-10">
          <h2 className="mb-3 text-[1.3rem] font-semibold tracking-[-0.01em]">
            {g.category}
          </h2>
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
                      className="group flex h-full items-center gap-3 rounded-lg border border-hairline bg-card px-4 py-3 font-medium text-ink transition-colors hover:border-primary/40 hover:bg-primary/[0.03] active:bg-primary/5"
                    >
                      <FileText
                        className="size-5 shrink-0 text-primary"
                        aria-hidden
                      />
                      <span className="group-hover:text-primary">
                        {r.title}
                        {r.external_url && (
                          <span className="ml-1 text-sm font-normal text-ink-muted">
                            （外部サイト）
                          </span>
                        )}
                      </span>
                    </a>
                  ) : (
                    <span className="flex h-full items-center rounded-lg border border-hairline px-4 py-3 text-ink-faint">
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
        <p className="rounded-xl border border-dashed border-surface-muted bg-card py-10 text-center text-ink-muted">
          現在、掲載中の資料はありません。
        </p>
      )}
    </main>
  )
}
