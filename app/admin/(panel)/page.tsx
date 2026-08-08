import Link from 'next/link'
import { requireAdmin } from '@/lib/admin'
import { ADMIN_NAV } from '@/lib/admin-nav'

export const dynamic = 'force-dynamic'

export default async function AdminHome() {
  await requireAdmin()

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-4 text-xl font-bold">ダッシュボード</h1>

      {/* よく使う操作 */}
      <section className="mb-6">
        <h2 className="mb-2 text-sm font-bold text-gray-500">よく使う操作</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/games/new"
            className="rounded-lg bg-primary px-4 py-3 font-medium text-primary-foreground"
          >
            ＋ 新しい大会
          </Link>
          <Link
            href="/admin/news/new"
            className="rounded-lg bg-primary px-4 py-3 font-medium text-primary-foreground"
          >
            ＋ 新しいおしらせ
          </Link>
          <Link
            href="/admin/resources/new"
            className="rounded-lg border border-primary px-4 py-3 font-medium text-primary"
          >
            ＋ 新しい資料
          </Link>
        </div>
      </section>

      {/* 各機能への入口（サイドバーと同じグルーピング） */}
      {ADMIN_NAV.map((g) => (
        <section key={g.title} className="mb-5">
          <h2 className="mb-2 text-sm font-bold text-gray-500">{g.title}</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {g.items.map((it) => (
              <Link
                key={it.href}
                href={it.href}
                className="rounded-lg border bg-white px-4 py-3 font-medium hover:bg-gray-50"
              >
                {it.label}
              </Link>
            ))}
          </div>
        </section>
      ))}

      <p className="mt-6 text-sm text-gray-500">
        公開サイトを見る：{' '}
        <Link href="/" className="text-primary hover:underline">
          トップページ →
        </Link>
      </p>
    </main>
  )
}
