import { getGameAdmin } from '@/lib/queries'
import { requireAdmin } from '@/lib/admin'
import { DocumentsEditor } from './DocumentsEditor'

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAdmin()
  const { id } = await params
  const { game, documents } = await getGameAdmin(id)
  if (!game) return <p className="p-4">大会が見つかりません。</p>
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="mb-4 text-xl font-bold">{game.title}／資料の管理</h1>
      <DocumentsEditor gameId={id} initialDocs={documents} />
    </div>
  )
}
