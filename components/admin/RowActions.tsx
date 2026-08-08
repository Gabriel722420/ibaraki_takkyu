'use client'
import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  FileText,
  Copy,
} from 'lucide-react'
import { toast } from 'sonner'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

type ToggleFn = (input: { id: string; isPublished: boolean }) => Promise<void>
type DeleteFn = (input: { id: string }) => Promise<void>
type MoveFn = (input: { id: string; dir: 'up' | 'down' }) => Promise<void>
type SimpleFn = (input: { id: string }) => Promise<void>

export function RowActions({
  id,
  editHref,
  docsHref,
  isPublished,
  onToggle,
  onDelete,
  onMove,
  onDuplicate,
  deleteMessage = 'この項目を削除します。よろしいですか？',
}: {
  id: string
  editHref?: string
  docsHref?: string
  isPublished?: boolean
  onToggle?: ToggleFn
  onDelete: DeleteFn
  onMove?: MoveFn
  onDuplicate?: SimpleFn
  deleteMessage?: string
}) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [confirmOpen, setConfirmOpen] = useState(false)

  function run(fn: () => Promise<void>, okMsg?: string) {
    start(async () => {
      try {
        await fn()
        router.refresh()
        if (okMsg) toast.success(okMsg)
      } catch (e) {
        toast.error(e instanceof Error ? e.message : '操作に失敗しました。')
      }
    })
  }

  return (
    <div className="flex items-center justify-end gap-2">
      {onToggle && typeof isPublished === 'boolean' && (
        <Switch
          checked={isPublished}
          disabled={pending}
          onCheckedChange={(v) =>
            run(
              () => onToggle({ id, isPublished: v }),
              v ? '公開しました' : '非公開にしました',
            )
          }
          aria-label="公開切替"
        />
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label="操作">
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {editHref && (
            <DropdownMenuItem asChild>
              <Link href={editHref}>
                <Pencil /> 編集
              </Link>
            </DropdownMenuItem>
          )}
          {docsHref && (
            <DropdownMenuItem asChild>
              <Link href={docsHref}>
                <FileText /> 資料(PDF)
              </Link>
            </DropdownMenuItem>
          )}
          {onDuplicate && (
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault()
                run(() => onDuplicate({ id }), '複製しました')
              }}
            >
              <Copy /> 複製
            </DropdownMenuItem>
          )}
          {onMove && (
            <>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault()
                  run(() => onMove({ id, dir: 'up' }))
                }}
              >
                <ArrowUp /> 上へ移動
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault()
                  run(() => onMove({ id, dir: 'down' }))
                }}
              >
                <ArrowDown /> 下へ移動
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onSelect={(e) => {
              e.preventDefault()
              setConfirmOpen(true)
            }}
          >
            <Trash2 /> 削除
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>削除の確認</AlertDialogTitle>
            <AlertDialogDescription>{deleteMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>やめる</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => run(() => onDelete({ id }), '削除しました')}
            >
              削除する
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
