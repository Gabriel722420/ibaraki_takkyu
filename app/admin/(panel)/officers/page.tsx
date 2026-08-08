import Link from 'next/link'
import { requireAdmin } from '@/lib/admin'
import { listOfficersAdmin } from '@/lib/queries'
import { togglePublish, deleteOfficer, moveOfficer } from './actions'
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

export default async function AdminOfficersPage() {
  await requireAdmin()
  const officers = await listOfficersAdmin()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-lg font-bold">役員の管理</h1>
        <Button asChild>
          <Link href="/admin/officers/new">新規作成</Link>
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>氏名</TableHead>
              <TableHead className="w-40">役職</TableHead>
              <TableHead className="w-24">状態 / 順</TableHead>
              <TableHead className="w-32 text-right">公開 / 操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {officers.map((o) => (
              <TableRow key={o.id}>
                <TableCell className="font-medium">
                  {o.name}
                  {o.note && (
                    <span className="block text-xs text-muted-foreground">
                      {o.note}
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  <Badge variant="outline">{o.role}</Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  <PublishBadge isPublished={o.is_published} />
                  <span className="ml-1">順:{o.sort_order}</span>
                </TableCell>
                <TableCell>
                  <RowActions
                    id={o.id}
                    editHref={`/admin/officers/${o.id}/edit`}
                    isPublished={o.is_published}
                    onToggle={togglePublish}
                    onDelete={deleteOfficer}
                    onMove={moveOfficer}
                    deleteMessage="この役員を削除します。よろしいですか？"
                  />
                </TableCell>
              </TableRow>
            ))}
            {officers.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="py-8 text-center text-muted-foreground"
                >
                  まだ役員がありません。「新規作成」から追加してください。
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
