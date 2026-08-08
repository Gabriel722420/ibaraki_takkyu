import Link from 'next/link'
import { requireAdmin } from '@/lib/admin'
import { ADMIN_NAV } from '@/lib/admin-nav'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'

export const dynamic = 'force-dynamic'

export default async function AdminHome() {
  await requireAdmin()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-lg font-bold">ダッシュボード</h1>
        <p className="text-sm text-muted-foreground">
          よく使う操作から始められます。
        </p>
      </div>

      {/* よく使う操作 */}
      <section>
        <h2 className="mb-2 text-xs font-bold tracking-wide text-muted-foreground">
          よく使う操作
        </h2>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/admin/games/new">＋ 新しい大会</Link>
          </Button>
          <Button asChild>
            <Link href="/admin/news/new">＋ 新しいおしらせ</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/resources/new">＋ 新しい資料</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/forms/new">＋ 新しい申込フォーム</Link>
          </Button>
        </div>
      </section>

      {/* 各機能への入口 */}
      {ADMIN_NAV.map((g) => (
        <section key={g.title}>
          <h2 className="mb-2 text-xs font-bold tracking-wide text-muted-foreground">
            {g.title}
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {g.items.map((it) => (
              <Link key={it.href} href={it.href} className="group block">
                <Card className="transition-colors group-hover:border-primary/40 group-hover:bg-accent/40">
                  <CardHeader>
                    <CardTitle className="text-base">{it.label}</CardTitle>
                    <CardDescription>{it.href}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      ))}

      <p className="text-sm text-muted-foreground">
        公開サイトを見る：{' '}
        <Link href="/" className="text-primary hover:underline">
          トップページ →
        </Link>
      </p>
    </div>
  )
}
