import {
  getAboutSettings,
  listOfficers,
  getResourcesByCategory,
  getSettings,
} from '@/lib/queries'
import { resolveDocUrl } from '@/lib/docs'
import type { Officer } from '@/lib/types'

export const dynamic = 'force-dynamic'

// role を大分類へマッピング（定義順に表示）
const OFFICER_GROUPS: { label: string; roles: string[] }[] = [
  { label: '名誉職', roles: ['名誉会長', '名誉副会長'] },
  { label: '顧問', roles: ['最高顧問', '顧問'] },
  { label: '会長・副会長', roles: ['会長', '副会長'] },
  { label: '理事長・事務局・副理事長', roles: ['理事長', '事務局長', '副理事長'] },
  { label: '常任理事', roles: ['常任理事'] },
  { label: '理事', roles: ['理事'] },
  { label: '監事', roles: ['監事'] },
]

function groupLabelFor(role: string): string {
  return OFFICER_GROUPS.find((g) => g.roles.includes(role))?.label ?? 'その他'
}

// sort_order を保ったまま大分類でバケット化
function groupOfficers(
  officers: Officer[],
): { label: string; items: Officer[]; mixed: boolean }[] {
  const buckets = new Map<string, Officer[]>()
  for (const o of officers) {
    const label = groupLabelFor(o.role)
    if (!buckets.has(label)) buckets.set(label, [])
    buckets.get(label)!.push(o)
  }
  const order = [...OFFICER_GROUPS.map((g) => g.label), 'その他']
  return order
    .filter((label) => buckets.has(label))
    .map((label) => {
      const items = buckets.get(label)!
      const mixed = new Set(items.map((i) => i.role)).size > 1
      return { label, items, mixed }
    })
}

export default async function AboutPage() {
  const [about, officers, docs, settings] = await Promise.all([
    getAboutSettings(),
    listOfficers(),
    getResourcesByCategory('規程'),
    // 連絡先は policy と共通（policy_contact）。編集は /admin/policy に集約し二重管理を避ける。
    getSettings(['policy_contact']),
  ])
  const contact = settings.policy_contact ?? ''

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 md:px-6 lg:px-8">
      <h1 className="mb-6 border-l-4 border-primary pl-2 text-2xl font-bold">
        連盟情報
      </h1>

      {/* 会長挨拶（長文＝読みやすい行長 max-w-prose に保つ） */}
      <section className="mb-10">
        <h2 className="mb-3 text-xl font-bold">会長挨拶</h2>
        <div className="max-w-prose">
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
        </div>
      </section>

      {/* 役員情報（大分類でグルーピング／1人1行・密度重視） */}
      <section className="mb-10">
        <h2 className="mb-3 text-xl font-bold">組織・役員</h2>
        {officers.length === 0 ? (
          <p className="py-4 text-gray-500">準備中です。</p>
        ) : (
          groupOfficers(officers).map((g) => (
            <div key={g.label} className="mb-5">
              <h3 className="mb-2 border-l-2 border-primary pl-2 font-bold text-primary">
                {g.label}
              </h3>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-1 md:grid-cols-3 lg:grid-cols-4">
                {g.items.map((o) => (
                  <li
                    key={o.id}
                    className={`leading-snug ${o.note ? 'col-span-2' : ''}`}
                  >
                    {g.mixed && (
                      <span className="mr-1 text-sm text-gray-500">
                        {o.role}
                      </span>
                    )}
                    <span className="font-medium">{o.name}</span>
                    {o.note && (
                      <span className="ml-1 text-sm text-gray-500">
                        （{o.note}）
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </section>

      {/* 関連書類（規程） */}
      <section className="mb-10">
        <h2 className="mb-3 text-xl font-bold">規約・ダウンロード</h2>
        <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {docs.map((d) => {
            const url = resolveDocUrl(d)
            if (!url) return null
            return (
              <li key={d.id}>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block h-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base font-medium transition hover:border-primary/40 hover:shadow-sm active:bg-gray-50"
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

      {/* 連絡先（settings.policy_contact を policy と共通参照。編集は /admin/policy） */}
      <section>
        <h2 className="mb-2 text-xl font-bold">お問い合わせ先</h2>
        {contact ? (
          <p className="max-w-prose leading-relaxed whitespace-pre-wrap text-gray-800">
            {contact}
          </p>
        ) : (
          <p className="text-gray-500">準備中です。</p>
        )}
      </section>
    </main>
  )
}
