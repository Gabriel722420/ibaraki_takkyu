import Link from 'next/link'
import { requireAdmin } from '@/lib/admin'
import { getFormAdmin, listGamesAdmin } from '@/lib/queries'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { FormMetaForm } from '@/components/admin/forms/FormMetaForm'
import { FieldsBuilder } from '@/components/admin/forms/FieldsBuilder'
import { FormPreview } from '@/components/admin/forms/FormPreview'
import { PublishUrl } from '@/components/admin/forms/PublishUrl'

export const dynamic = 'force-dynamic'

export default async function EditFormPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAdmin()
  const { id } = await params
  const [{ form, fields }, games] = await Promise.all([
    getFormAdmin(id),
    listGamesAdmin(),
  ])
  if (!form) return <p className="p-4">フォームが見つかりません。</p>

  const gameOptions = games.map((g) => ({ id: g.id, title: g.title }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-lg font-bold">フォームビルダー</h1>
        <Button variant="outline" asChild>
          <Link href="/admin/forms">一覧へ戻る</Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">基本情報</CardTitle>
            </CardHeader>
            <CardContent>
              <FormMetaForm form={form} games={gameOptions} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">発行URL</CardTitle>
            </CardHeader>
            <CardContent>
              <PublishUrl
                slug={form.slug}
                published={form.status === 'published'}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">項目（ドラッグで並べ替え）</CardTitle>
            </CardHeader>
            <CardContent>
              <FieldsBuilder formId={form.id} fields={fields} />
            </CardContent>
          </Card>
        </div>

        <div className="lg:sticky lg:top-16 lg:self-start">
          <p className="mb-2 text-xs font-bold tracking-wide text-muted-foreground">
            プレビュー
          </p>
          <FormPreview
            title={form.title}
            description={form.description}
            fields={fields}
          />
        </div>
      </div>
    </div>
  )
}
