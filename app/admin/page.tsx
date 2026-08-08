import Link from 'next/link'
import { requireAdmin } from '@/lib/admin'
import { LogoutButton } from '@/components/admin/LogoutButton'

export const dynamic = 'force-dynamic'

export default async function AdminHome() {
  await requireAdmin()

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h1 className="text-xl font-bold">管理トップ</h1>
        <LogoutButton />
      </div>
      <ul className="space-y-3">
        <li>
          <Link
            href="/admin/account"
            className="block rounded-lg border px-4 py-4 text-lg font-medium active:bg-gray-50"
          >
            アカウント設定（パスワード変更）
            <span className="mt-1 block text-sm font-normal text-gray-600">
              ログイン中の管理者パスワードを変更
            </span>
          </Link>
        </li>
        <li>
          <Link
            href="/admin/games"
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
            href="/admin/news"
            className="block rounded-lg border px-4 py-4 text-lg font-medium active:bg-gray-50"
          >
            おしらせの管理
            <span className="mt-1 block text-sm font-normal text-gray-600">
              お知らせの作成・編集・公開・削除（重要は上部固定）
            </span>
          </Link>
        </li>
        <li>
          <Link
            href="/admin/categories"
            className="block rounded-lg border px-4 py-4 text-lg font-medium active:bg-gray-50"
          >
            おしらせカテゴリの管理
            <span className="mt-1 block text-sm font-normal text-gray-600">
              分類（親子）の追加・改名・並べ替え・削除
            </span>
          </Link>
        </li>
        <li>
          <Link
            href="/admin/resources"
            className="block rounded-lg border px-4 py-4 text-lg font-medium active:bg-gray-50"
          >
            登録・資格情報の管理
            <span className="mt-1 block text-sm font-normal text-gray-600">
              資料(PDF/外部リンク)の追加・編集・並べ替え・公開・削除
            </span>
          </Link>
        </li>
        <li>
          <Link
            href="/admin/about"
            className="block rounded-lg border px-4 py-4 text-lg font-medium active:bg-gray-50"
          >
            連盟情報（about）の編集
            <span className="mt-1 block text-sm font-normal text-gray-600">
              会長挨拶の本文・署名・写真パスを編集
            </span>
          </Link>
        </li>
        <li>
          <Link
            href="/admin/officers"
            className="block rounded-lg border px-4 py-4 text-lg font-medium active:bg-gray-50"
          >
            役員の管理
            <span className="mt-1 block text-sm font-normal text-gray-600">
              役員の追加・編集・並べ替え・公開・削除
            </span>
          </Link>
        </li>
        <li>
          <Link
            href="/admin/policy"
            className="block rounded-lg border px-4 py-4 text-lg font-medium active:bg-gray-50"
          >
            サイトポリシー（policy）の編集
            <span className="mt-1 block text-sm font-normal text-gray-600">
              著作権・商標・免責事項・お問い合わせ先の編集
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
