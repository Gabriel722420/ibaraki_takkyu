import { getPolicySettings, getResourcesByCategory } from '@/lib/queries'
import { resolveDocUrl } from '@/lib/docs'

export const dynamic = 'force-dynamic'

export default async function PolicyPage() {
  const [policy, privacyDocs] = await Promise.all([
    getPolicySettings(),
    getResourcesByCategory('個人情報保護'),
  ])

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-6 border-l-4 border-primary pl-2 text-2xl font-bold">
        このサイトについて・プライバシーポリシー
      </h1>

      <TextSection title="著作権について" body={policy.copyright} />
      <TextSection title="商標について" body={policy.trademark} />
      <TextSection title="免責事項" body={policy.disclaimer} />

      {/* 個人情報保護 */}
      <section className="mb-10">
        <h2 className="mb-3 text-xl font-bold">個人情報保護について</h2>
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
                  className="block rounded-lg border border-gray-300 px-4 py-3 text-base font-medium active:bg-gray-50"
                >
                  {d.title}
                </a>
              </li>
            )
          })}
          {privacyDocs.length === 0 && (
            <li className="py-4 text-gray-500">準備中です。</li>
          )}
        </ul>
      </section>

      <TextSection title="お問い合わせ先" body={policy.contact} />
    </main>
  )
}

function TextSection({ title, body }: { title: string; body: string }) {
  return (
    <section className="mb-10">
      <h2 className="mb-3 text-xl font-bold">{title}</h2>
      {body ? (
        <p className="leading-relaxed whitespace-pre-wrap text-gray-800">
          {body}
        </p>
      ) : (
        <p className="text-gray-500">準備中です。</p>
      )}
    </section>
  )
}
