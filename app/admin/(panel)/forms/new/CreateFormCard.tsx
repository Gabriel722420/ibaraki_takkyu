'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createForm } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function CreateFormCard() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [busy, setBusy] = useState(false)

  async function create() {
    setBusy(true)
    try {
      const { id } = await createForm({ title })
      toast.success('作成しました')
      router.push(`/admin/forms/${id}/edit`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '作成に失敗しました。')
      setBusy(false)
    }
  }

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle className="text-base">フォームの新規作成</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-2">
          <Label htmlFor="title">タイトル</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例：第70回大会 参加申込"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && title.trim()) create()
            }}
          />
        </div>
        <Button onClick={create} disabled={busy || !title.trim()}>
          {busy ? '作成中…' : '作成してビルダーへ'}
        </Button>
      </CardContent>
    </Card>
  )
}
