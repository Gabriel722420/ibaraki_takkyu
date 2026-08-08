import Link from 'next/link'
import { requireAdmin } from '@/lib/admin'
import { listFormsAdmin } from '@/lib/queries'
import { togglePublish, deleteForm, duplicateForm } from './actions'
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

export const dynamic = 'force-dynamic'

export default async function AdminFormsPage() {
  await requireAdmin()
  const forms = await listFormsAdmin()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-lg font-bold">申込フォームの管理</h1>
        <Button asChild>
          <Link href="/admin/forms/new">新規作成</Link>
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>タイトル</TableHead>
              <TableHead className="w-40">紐付け大会</TableHead>
              <TableHead className="w-24">状態</TableHead>
              <TableHead className="w-56">発行URL</TableHead>
              <TableHead className="w-32 text-right">公開 / 操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {forms.map((f) => {
              const published = f.status === 'published'
              return (
                <TableRow key={f.id}>
                  <TableCell className="font-medium">{f.title}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {f.game?.title ?? '（単独）'}
                  </TableCell>
                  <TableCell>
                    {published ? (
                      <Badge className="bg-green-100 text-green-800">
                        公開中
                      </Badge>
                    ) : (
                      <Badge variant="secondary">下書き</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {published ? (
                      <code>/apply/{f.slug}</code>
                    ) : (
                      <span className="opacity-60">（公開後に発行）</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <RowActions
                      id={f.id}
                      editHref={`/admin/forms/${f.id}/edit`}
                      isPublished={published}
                      onToggle={togglePublish}
                      onDelete={deleteForm}
                      onDuplicate={duplicateForm}
                      deleteMessage="このフォームを削除します。項目も削除されます。よろしいですか？"
                    />
                  </TableCell>
                </TableRow>
              )
            })}
            {forms.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-8 text-center text-muted-foreground"
                >
                  まだフォームがありません。「新規作成」から追加してください。
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
