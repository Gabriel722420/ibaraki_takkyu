import { getTournamentAdmin } from '@/lib/queries'
import { requireAdmin } from '@/lib/admin'
import { DocumentsEditor } from './DocumentsEditor'

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAdmin()
  const { id } = await params
  const { tournament, documents } = await getTournamentAdmin(id)
  if (!tournament) return <p className="p-4">大会が見つかりません。</p>
  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-4 text-xl font-bold">{tournament.title}／資料の管理</h1>
      <DocumentsEditor tournamentId={id} initialDocs={documents} />
    </main>
  )
}
