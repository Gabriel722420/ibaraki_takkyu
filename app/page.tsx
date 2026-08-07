import Link from 'next/link'

export default function Home() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-3 text-2xl font-bold">一般社団法人茨城県卓球連盟</h1>
      <p className="mb-6 leading-relaxed text-gray-800">
        大会情報・結果・各種資料をご案内します。
      </p>
      <ul className="space-y-3">
        <li>
          <Link
            href="/games"
            className="block rounded-lg border px-4 py-3 text-lg font-medium active:bg-gray-50"
          >
            大会情報を見る
          </Link>
        </li>
        <li>
          <Link
            href="/news"
            className="block rounded-lg border px-4 py-3 text-lg font-medium active:bg-gray-50"
          >
            おしらせを見る
          </Link>
        </li>
      </ul>
    </main>
  )
}
