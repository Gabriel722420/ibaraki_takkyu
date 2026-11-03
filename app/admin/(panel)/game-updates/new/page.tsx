import { requireAdmin } from '@/lib/admin'
import { listDivisions, listGamesAdmin } from '@/lib/queries'
import { GameUpdateForm } from '../GameUpdateForm'

export const dynamic = 'force-dynamic'

export default async function NewGameUpdatePage() {
  await requireAdmin()
  const [divisions, games] = await Promise.all([
    listDivisions(),
    listGamesAdmin(),
  ])
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="mb-4 text-xl font-bold">大会情報更新履歴の新規作成</h1>
      <GameUpdateForm divisions={divisions} games={games} />
    </div>
  )
}
