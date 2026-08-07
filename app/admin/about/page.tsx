import Link from 'next/link'
import { requireAdmin } from '@/lib/admin'
import { getAboutSettings } from '@/lib/queries'
import { AboutSettingsForm } from './AboutSettingsForm'

export const dynamic = 'force-dynamic'

export default async function AdminAboutPage() {
  await requireAdmin()
  const about = await getAboutSettings()

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h1 className="text-xl font-bold">連盟情報（会長挨拶）の編集</h1>
        <Link href="/admin/officers" className="rounded border px-4 py-2">
          役員の管理へ
        </Link>
      </div>
      <AboutSettingsForm initial={about} />
    </main>
  )
}
