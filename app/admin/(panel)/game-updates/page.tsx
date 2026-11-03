import Link from 'next/link'
import { requireAdmin } from '@/lib/admin'
import { listGameUpdatesAdmin } from '@/lib/queries'
import { togglePublish, deleteGameUpdate } from './actions'
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
import { PublishBadge } from '@/components/admin/StatusBadges'

export const dynamic = 'force-dynamic'

function fmt(d: string): string {
  const [y, m, day] = d.slice(0, 10).split('-')
  return `${y}/${Number(m)}/${Number(day)}`
}

export default async function AdminGameUpdatesPage() {
  await requireAdmin()
  const updates = await listGameUpdatesAdmin()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-lg font-bold">大会情報更新履歴の管理</h1>
        <Button asChild>
          <Link href="/admin/game-updates/new">新規作成</Link>
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        TOPに時系列で表示され、掲載日から30日を過ぎると自動的に非表示になります（データは残ります）。
        大会のPDFアップ画面からも「更新履歴に載せる」で作成できます。
      </p>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24">掲載日</TableHead>
              <TableHead>更新メッセージ</TableHead>
              <TableHead className="w-28">部門 / 大会</TableHead>
              <TableHead className="w-24">状態</TableHead>
              <TableHead className="w-32 text-right">公開 / 操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {updates.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="text-sm text-muted-foreground">
                  {fmt(u.posted_at)}
                </TableCell>
                <TableCell className="font-medium">{u.body}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {u.division?.name && (
                    <Badge variant="outline">{u.division.name}</Badge>
                  )}
                  {u.game?.title && (
                    <span className="mt-0.5 block text-xs">{u.game.title}</span>
                  )}
                </TableCell>
                <TableCell>
                  <PublishBadge isPublished={u.is_published} />
                </TableCell>
                <TableCell>
                  <RowActions
                    id={u.id}
                    editHref={`/admin/game-updates/${u.id}/edit`}
                    isPublished={u.is_published}
                    onToggle={togglePublish}
                    onDelete={deleteGameUpdate}
                    deleteMessage="この更新履歴を削除します。よろしいですか？"
                  />
                </TableCell>
              </TableRow>
            ))}
            {updates.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-8 text-center text-muted-foreground"
                >
                  まだ更新履歴がありません。「新規作成」から追加してください。
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
