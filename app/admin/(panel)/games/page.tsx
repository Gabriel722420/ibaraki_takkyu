import Link from 'next/link'
import { requireAdmin } from '@/lib/admin'
import { listGamesAdmin } from '@/lib/queries'
import { togglePublish, deleteGame } from './actions'
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

export default async function AdminGamesPage() {
  await requireAdmin()
  const games = await listGamesAdmin()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-lg font-bold">大会の管理</h1>
        <Button asChild>
          <Link href="/admin/games/new">新規作成</Link>
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>大会名</TableHead>
              <TableHead className="w-28">状態</TableHead>
              <TableHead className="w-40">部門 / 開催日</TableHead>
              <TableHead className="w-32 text-right">公開 / 操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {games.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-medium">
                  {t.title}
                  <span className="block text-xs text-muted-foreground">
                    {t.fiscal_year}年度
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    <PublishBadge isPublished={t.is_published} />
                    <ScheduledBadge
                      isPublished={t.is_published}
                      publishAt={t.publish_at}
                    />
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {t.division?.name && (
                    <Badge variant="outline" className="mr-1">
                      {t.division.name}
                    </Badge>
                  )}
                  {t.event_date ? formatDate(t.event_date) : '日程未定'}
                </TableCell>
                <TableCell>
                  <RowActions
                    id={t.id}
                    editHref={`/admin/games/${t.id}/edit`}
                    docsHref={`/admin/games/${t.id}/documents`}
                    isPublished={t.is_published}
                    onToggle={togglePublish}
                    onDelete={deleteGame}
                    deleteMessage="この大会を削除します。添付PDFもすべて削除されます。よろしいですか？"
                  />
                </TableCell>
              </TableRow>
            ))}
            {games.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="py-8 text-center text-muted-foreground"
                >
                  まだ大会がありません。「新規作成」から追加してください。
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function formatDate(d: string): string {
  const [y, m, day] = d.split('-')
  return `${y}年${Number(m)}月${Number(day)}日`
}
