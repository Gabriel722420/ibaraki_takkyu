import Link from 'next/link'
import { requireAdmin } from '@/lib/admin'
import { listAnnouncementsAdmin } from '@/lib/queries'
import { togglePublish, deleteAnnouncement } from './actions'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { RowActions } from '@/components/admin/RowActions'
import { PublishBadge, ScheduledBadge } from '@/components/admin/StatusBadges'

export const dynamic = 'force-dynamic'

export default async function AdminNewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  await requireAdmin()
  const sp = await searchParams
  const page = Math.max(1, Number(sp.page) || 1)
  const { items, total, perPage } = await listAnnouncementsAdmin({ page })
  const totalPages = Math.max(1, Math.ceil(total / perPage))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-lg font-bold">おしらせの管理</h1>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/categories">カテゴリ</Link>
          </Button>
          <Button asChild>
            <Link href="/admin/news/new">新規作成</Link>
          </Button>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">全{total}件</p>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>タイトル</TableHead>
              <TableHead className="w-32">状態</TableHead>
              <TableHead className="w-40">カテゴリ / 掲載日</TableHead>
              <TableHead className="w-32 text-right">公開 / 操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="font-medium">{a.title}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    <PublishBadge isPublished={a.is_published} />
                    <ScheduledBadge
                      isPublished={a.is_published}
                      publishAt={a.publish_at}
                    />
                    {a.is_pinned && (
                      <Badge className="bg-primary text-primary-foreground">
                        重要
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {a.category?.name && (
                    <Badge variant="outline" className="mr-1">
                      {a.category.name}
                    </Badge>
                  )}
                  {formatDate(a.published_at)}
                </TableCell>
                <TableCell>
                  <RowActions
                    id={a.id}
                    editHref={`/admin/news/${a.id}/edit`}
                    isPublished={a.is_published}
                    onToggle={togglePublish}
                    onDelete={deleteAnnouncement}
                    deleteMessage="このお知らせを削除します。よろしいですか？"
                  />
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="py-8 text-center text-muted-foreground"
                >
                  まだお知らせがありません。「新規作成」から追加してください。
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-2">
          {page > 1 ? (
            <Button variant="outline" asChild>
              <Link href={`/admin/news?page=${page - 1}`}>← 前へ</Link>
            </Button>
          ) : (
            <span />
          )}
          <span className="text-sm text-muted-foreground">
            {page} / {totalPages} ページ
          </span>
          {page < totalPages ? (
            <Button variant="outline" asChild>
              <Link href={`/admin/news?page=${page + 1}`}>次へ →</Link>
            </Button>
          ) : (
            <span />
          )}
        </div>
      )}
    </div>
  )
}

function formatDate(d: string): string {
  const [y, m, day] = d.slice(0, 10).split('-')
  return `${y}年${Number(m)}月${Number(day)}日`
}
