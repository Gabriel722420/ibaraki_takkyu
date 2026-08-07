import Link from 'next/link'
import { requireAdmin } from '@/lib/admin'

export const dynamic = 'force-dynamic'

export default async function AdminHome() {
  await requireAdmin()

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-4 text-xl font-bold">管理トップ</h1>
      <ul className="space-y-3">
        <li>
          <Link
            href="/admin/tournaments"
            className="block rounded-lg border px-4 py-4 text-lg font-medium active:bg-gray-50"
          >
            大会の管理
            <span className="mt-1 block text-sm font-normal text-gray-600">
              大会の作成・編集・公開・削除、資料(PDF)の管理
            </span>
          </Link>
        </li>
        <li>
          <Link
            href="/admin/divisions"
            className="block rounded-lg border px-4 py-4 text-lg font-medium active:bg-gray-50"
          >
            部門の管理
            <span className="mt-1 block text-sm font-normal text-gray-600">
              部門の追加・改名・表示順の変更・削除
            </span>
          </Link>
        </li>
      </ul>
    </main>
  )
}
