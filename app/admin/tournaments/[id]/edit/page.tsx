import { requireAdmin } from '@/lib/admin'
import { listDivisions, getTournamentAdmin } from '@/lib/queries'
import { TournamentForm } from '../../TournamentForm'

export const dynamic = 'force-dynamic'

export default async function EditTournamentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAdmin()
  const { id } = await params
  const [divisions, { tournament }] = await Promise.all([
    listDivisions(),
    getTournamentAdmin(id),
  ])
  if (!tournament) return <p className="p-4">大会が見つかりません。</p>

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-4 text-xl font-bold">大会の編集</h1>
      <TournamentForm
        divisions={divisions}
        tournament={tournament}
        defaultFiscalYear={tournament.fiscal_year}
      />
    </main>
  )
}
