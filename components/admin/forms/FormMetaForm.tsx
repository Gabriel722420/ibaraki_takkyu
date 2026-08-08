'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { toLocalInput, fromLocalInput } from '@/components/admin/FormKit'
import { updateForm } from '@/app/admin/(panel)/forms/actions'
import type { Form as FormType } from '@/lib/types'

const NONE = '__none__'

const schema = z.object({
  title: z.string().min(1, 'タイトルは必須です'),
  slug: z
    .string()
    .min(1, 'slug は必須です')
    .regex(/^[a-z0-9-]+$/, '英小文字・数字・ハイフンのみ使用できます'),
  description: z.string().optional(),
  gameId: z.string(),
  published: z.boolean(),
  openAt: z.string().optional(),
  closeAt: z.string().optional(),
})
type Values = z.infer<typeof schema>

export function FormMetaForm({
  form,
  games,
}: {
  form: FormType
  games: { id: string; title: string }[]
}) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  const rhf = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: form.title,
      slug: form.slug,
      description: form.description ?? '',
      gameId: form.game_id ?? NONE,
      published: form.status === 'published',
      openAt: toLocalInput(form.open_at),
      closeAt: toLocalInput(form.close_at),
    },
  })

  async function onSubmit(v: Values) {
    setSaving(true)
    try {
      await updateForm({
        id: form.id,
        values: {
          title: v.title,
          description: v.description || null,
          game_id: v.gameId === NONE ? null : v.gameId,
          slug: v.slug,
          status: v.published ? 'published' : 'draft',
          open_at: fromLocalInput(v.openAt || ''),
          close_at: fromLocalInput(v.closeAt || ''),
        },
      })
      toast.success('保存しました')
      router.refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '保存に失敗しました。')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Form {...rhf}>
      <form onSubmit={rhf.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={rhf.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>タイトル</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={rhf.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>説明（任意）</FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={rhf.control}
          name="gameId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>紐付け大会（任意）</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={NONE}>（単独フォーム）</SelectItem>
                  {games.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={rhf.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>slug（発行URL）</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                公開URLは /apply/{rhf.watch('slug') || 'slug'} になります。
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={rhf.control}
            name="openAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>受付開始（任意）</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={rhf.control}
            name="closeAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>受付終了（任意）</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={rhf.control}
          name="published"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center gap-2">
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="!mt-0">公開する（下書き↔公開）</FormLabel>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={saving}>
          {saving ? '保存中…' : '基本情報を保存'}
        </Button>
      </form>
    </Form>
  )
}
