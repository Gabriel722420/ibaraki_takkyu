import { FileText } from 'lucide-react'
import {
  getAboutSettings,
  listOfficers,
  getResourcesByCategory,
  getSettings,
} from '@/lib/queries'
import { resolveDocUrl, splitParagraphs } from '@/lib/docs'
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
  const paragraphs = about.greeting ? splitParagraphs(about.greeting) : []

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10 lg:px-8">
      <h1 className="mb-6 border-l-4 border-primary pl-3 text-[1.45rem] font-medium tracking-[-0.02em]">
        連盟情報
      </h1>

      {/* 1段目：会長挨拶（本文=2/3・写真回り込み）＋ サイドバー（規約DL／問い合わせ）で横幅を使い切る */}
      <div className="grid items-start gap-6 lg:grid-cols-3">
        <section className="rounded-xl border border-hairline bg-card p-5 md:p-8 lg:col-span-2">
          <h2 className="mb-4 text-[1.3rem] font-semibold tracking-[-0.01em]">
            会長挨拶
          </h2>
          {about.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={about.image}
              alt="会長"
              className="mb-3 w-40 max-w-full rounded-lg border border-hairline sm:float-right sm:mb-2 sm:ml-6"
            />
          )}
          {/* 各段落：全角1字下げ（indent-[1em]）＋段落間マージンで公式文書の体裁に。
              行間1.7・本文17px は維持。 */}
          {paragraphs.map((p, i) => (
            <p
              key={i}
              className="mt-2.5 indent-[1em] leading-[1.7] text-ink first:mt-0"
            >
              {p}
            </p>
          ))}
          {about.sign && (
            <p className="clear-both mt-6 text-right font-medium text-ink">
              {about.sign}
            </p>
          )}
        </section>

        {/* サイドバー：短い内容（DL・連絡先）を適切な幅のパネルに。
            タブレット(=全幅)では2枚を横並びにして間延びを防ぎ、lgではサイドバーに縦積み。 */}
        <aside className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
          <section className="rounded-xl border border-hairline bg-card p-5 md:p-6">
            <h2 className="mb-3 text-[1.1rem] font-semibold tracking-[-0.01em]">
              規約・ダウンロード
            </h2>
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
                      className="group flex items-center gap-3 rounded-lg border border-hairline bg-card px-4 py-3 font-medium text-ink transition-colors hover:border-primary/40 hover:bg-primary/[0.03] active:bg-primary/5"
                    >
                      <FileText
                        className="size-5 shrink-0 text-primary"
                        aria-hidden
                      />
                      <span className="group-hover:text-primary">
                        {d.title}
                      </span>
                    </a>
                  </li>
                )
              })}
              {docs.length === 0 && (
                <li className="text-ink-muted">準備中です。</li>
              )}
            </ul>
          </section>

          <section className="rounded-xl border border-hairline bg-card p-5 md:p-6">
            <h2 className="mb-3 text-[1.1rem] font-semibold tracking-[-0.01em]">
              お問い合わせ先
            </h2>
            {contact ? (
              <p className="leading-relaxed whitespace-pre-wrap text-ink">
                {contact}
              </p>
            ) : (
              <p className="text-ink-muted">準備中です。</p>
            )}
          </section>
        </aside>
      </div>

      {/* 2段目：組織・役員（全幅）。CSSマルチカラムで塊を密に敷き詰め、横の間延びを防ぐ */}
      <section className="mt-6 rounded-xl border border-hairline bg-card p-5 md:p-8">
        <h2 className="mb-4 text-[1.3rem] font-semibold tracking-[-0.01em]">
          組織・役員
        </h2>
        {officers.length === 0 ? (
          <p className="py-4 text-ink-muted">準備中です。</p>
        ) : (
          <div className="[column-gap:2.5rem] sm:columns-2 lg:columns-3">
            {groupOfficers(officers).map((g) => (
              <div key={g.label} className="mb-6 break-inside-avoid">
                <h3 className="mb-2 border-l-[3px] border-primary pl-2.5 font-semibold text-primary">
                  {g.label}
                </h3>
                <ul className="space-y-1.5">
                  {g.items.map((o) => (
                    <li key={o.id} className="leading-snug text-ink">
                      {g.mixed && (
                        <span className="mr-1 text-sm text-ink-muted">
                          {o.role}
                        </span>
                      )}
                      <span className="font-medium">{o.name}</span>
                      {o.note && (
                        <span className="ml-1 text-sm text-ink-muted">
                          （{o.note}）
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
