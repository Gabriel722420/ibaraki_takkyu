import { FileText } from 'lucide-react'
import { getPolicySettings, getResourcesByCategory } from '@/lib/queries'
import { resolveDocUrl } from '@/lib/docs'

export const dynamic = 'force-dynamic'

export default async function PolicyPage() {
  const [policy, privacyDocs] = await Promise.all([
    getPolicySettings(),
    getResourcesByCategory('個人情報保護'),
  ])

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 md:px-6 md:py-10">
      <h1 className="mb-6 border-l-4 border-primary pl-3 text-[1.45rem] font-medium tracking-[-0.02em]">
        このサイトについて・プライバシーポリシー
      </h1>

      <div className="space-y-4">
        <TextSection title="著作権について" body={policy.copyright} />
        <TextSection title="商標について" body={policy.trademark} />
        <TextSection title="免責事項" body={policy.disclaimer} />

        {/* 個人情報保護 */}
        <section className="rounded-xl border border-hairline bg-card p-5 md:p-7">
          <h2 className="mb-3 text-[1.3rem] font-semibold tracking-[-0.01em]">
            個人情報保護について
          </h2>
          <ul className="space-y-2">
            {privacyDocs.map((d) => {
              const url = resolveDocUrl(d)
              if (!url) return null
              return (
                <li key={d.id}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 rounded-lg border border-hairline bg-card px-4 py-3 font-medium text-ink transition-colors hover:border-primary/40 hover:bg-primary/[0.03] active:bg-primary/5"
                  >
                    <FileText
                      className="size-5 shrink-0 text-primary"
                      aria-hidden
                    />
                    <span className="group-hover:text-primary">{d.title}</span>
                  </a>
                </li>
              )
            })}
            {privacyDocs.length === 0 && (
              <li className="py-4 text-ink-muted">準備中です。</li>
            )}
          </ul>
        </section>

        <TextSection title="お問い合わせ先" body={policy.contact} />
      </div>
    </main>
  )
}

function TextSection({ title, body }: { title: string; body: string }) {
  return (
    <section className="rounded-xl border border-hairline bg-card p-5 md:p-7">
      <h2 className="mb-3 text-[1.3rem] font-semibold tracking-[-0.01em]">
        {title}
      </h2>
      {body ? (
        <p className="leading-relaxed whitespace-pre-wrap text-ink">{body}</p>
      ) : (
        <p className="text-ink-muted">準備中です。</p>
      )}
    </section>
  )
}
