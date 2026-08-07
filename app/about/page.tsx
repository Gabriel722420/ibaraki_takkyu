import {
  getAboutSettings,
  listOfficers,
  getResourcesByCategory,
} from '@/lib/queries'
import { resolveDocUrl } from '@/lib/docs'

export const dynamic = 'force-dynamic'

export default async function AboutPage() {
  const [about, officers, docs] = await Promise.all([
    getAboutSettings(),
    listOfficers(),
    getResourcesByCategory('規程'),
  ])

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-6 border-l-4 border-primary pl-2 text-2xl font-bold">
        連盟情報
      </h1>

      {/* 会長挨拶 */}
      <section className="mb-10">
        <h2 className="mb-3 text-xl font-bold">会長挨拶</h2>
        {about.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={about.image}
            alt="会長"
            className="mb-4 w-40 max-w-full rounded-lg border sm:float-right sm:ml-4"
          />
        )}
        {about.greeting && (
          <p className="leading-relaxed whitespace-pre-wrap text-gray-800">
            {about.greeting}
          </p>
        )}
        {about.sign && (
          <p className="mt-4 text-right font-medium text-gray-800">
            {about.sign}
          </p>
        )}
        <div className="clear-both" />
      </section>

      {/* 役員情報 */}
      <section className="mb-10">
        <h2 className="mb-3 text-xl font-bold">組織・役員</h2>
        <ul className="divide-y divide-gray-200">
          {officers.map((o) => (
            <li key={o.id} className="flex flex-col gap-0.5 py-2">
              <span className="text-sm text-gray-600">{o.role}</span>
              <span className="text-lg leading-snug font-medium">{o.name}</span>
              {o.note && <span className="text-sm text-gray-500">{o.note}</span>}
            </li>
          ))}
          {officers.length === 0 && (
            <li className="py-4 text-gray-500">準備中です。</li>
          )}
        </ul>
      </section>

      {/* 関連書類（規程） */}
      <section className="mb-10">
        <h2 className="mb-3 text-xl font-bold">規約・ダウンロード</h2>
        <ul className="space-y-2">
          {docs.map((d) => {
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
          {docs.length === 0 && (
            <li className="py-4 text-gray-500">準備中です。</li>
          )}
        </ul>
      </section>

      {/* 連絡先 */}
      <section>
        <h2 className="mb-2 text-xl font-bold">連絡先</h2>
        {/* TODO: 連絡先はフッター/管理から追記予定 */}
        <p className="leading-relaxed text-gray-600">
          お問い合わせは各担当までご連絡ください。
        </p>
      </section>
    </main>
  )
}
