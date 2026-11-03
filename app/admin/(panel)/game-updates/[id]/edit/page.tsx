import { requireAdmin } from '@/lib/admin'
import {
  getGameUpdateAdmin,
  listDivisions,
  listGamesAdmin,
} from '@/lib/queries'
import { GameUpdateForm } from '../../GameUpdateForm'

export const dynamic = 'force-dynamic'

export default async function EditGameUpdatePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAdmin()
  const { id } = await params
  const [update, divisions, games] = await Promise.all([
    getGameUpdateAdmin(id),
    listDivisions(),
    listGamesAdmin(),
  ])
  if (!update) return <p className="p-4">更新履歴が見つかりません。</p>

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="mb-4 text-xl font-bold">大会情報更新履歴の編集</h1>
      <GameUpdateForm update={update} divisions={divisions} games={games} />
    </div>
  )
}
