import { requireAdmin } from '@/lib/admin'
import { getAnnouncementAdmin } from '@/lib/queries'
import { NewsForm } from '../../NewsForm'

export const dynamic = 'force-dynamic'

export default async function EditAnnouncementPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAdmin()
  const { id } = await params
  const announcement = await getAnnouncementAdmin(id)
  if (!announcement) return <p className="p-4">お知らせが見つかりません。</p>
  const today = new Date().toISOString().slice(0, 10)

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-4 text-xl font-bold">おしらせの編集</h1>
      <NewsForm announcement={announcement} today={today} />
    </main>
  )
}
