import { requireAdmin } from '@/lib/admin'
import { listDivisions, getGameAdmin } from '@/lib/queries'
import { GameForm } from '../../GameForm'

export const dynamic = 'force-dynamic'

export default async function EditGamePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAdmin()
  const { id } = await params
  const [divisions, { game }] = await Promise.all([
    listDivisions(),
    getGameAdmin(id),
  ])
  if (!game) return <p className="p-4">大会が見つかりません。</p>

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="mb-4 text-xl font-bold">大会の編集</h1>
      <GameForm
        divisions={divisions}
        game={game}
        defaultFiscalYear={game.fiscal_year}
      />
    </div>
  )
}
