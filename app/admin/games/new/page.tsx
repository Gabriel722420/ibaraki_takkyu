import { requireAdmin } from '@/lib/admin'
import { listDivisions } from '@/lib/queries'
import { GameForm } from '../GameForm'

export const dynamic = 'force-dynamic'

// 年度の初期値（4月始まりの年度）
function currentFiscalYear(): number {
  const now = new Date()
  return now.getMonth() + 1 >= 4 ? now.getFullYear() : now.getFullYear() - 1
}

export default async function NewGamePage() {
  await requireAdmin()
  const divisions = await listDivisions()

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-4 text-xl font-bold">大会の新規作成</h1>
      <GameForm
        divisions={divisions}
        defaultFiscalYear={currentFiscalYear()}
      />
    </main>
  )
}
