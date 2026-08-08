import Link from 'next/link'
import { requireAdmin } from '@/lib/admin'
import { listResourcesAdmin } from '@/lib/queries'
import { togglePublish, deleteResource, moveResource } from './actions'
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

export default async function AdminResourcesPage() {
  await requireAdmin()
  const items = await listResourcesAdmin()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-lg font-bold">登録・資格情報の管理</h1>
        <Button asChild>
          <Link href="/admin/resources/new">新規作成</Link>
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>表示名</TableHead>
              <TableHead className="w-24">状態</TableHead>
              <TableHead className="w-48">カテゴリ / 種別 / 順</TableHead>
              <TableHead className="w-32 text-right">公開 / 操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.title}</TableCell>
                <TableCell>
                  <PublishBadge isPublished={r.is_published} />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  <Badge variant="outline" className="mr-1">
                    {r.category}
                  </Badge>
                  {r.file_path ? 'PDF' : r.external_url ? '外部リンク' : '—'}
                  <span className="ml-1">／順:{r.sort_order}</span>
                </TableCell>
                <TableCell>
                  <RowActions
                    id={r.id}
                    editHref={`/admin/resources/${r.id}/edit`}
                    isPublished={r.is_published}
                    onToggle={togglePublish}
                    onDelete={deleteResource}
                    onMove={moveResource}
                    deleteMessage="この資料を削除します。よろしいですか？"
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
                  まだ資料がありません。「新規作成」から追加してください。
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
