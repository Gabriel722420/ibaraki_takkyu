import Link from 'next/link'
import { NAV } from '@/lib/nav'
import { getPolicySettings } from '@/lib/queries'

// 公開フッター（#0049a2 基調・写真なし）。組織情報・グロナビ導線・問い合わせ・ポリシーを整然と。
export async function SiteFooter() {
  const year = new Date().getFullYear()
  // 問い合わせ先は既存 settings（policy_contact）を流用（空なら該当ブロックを出さない）。
  const { contact } = await getPolicySettings()

  return (
    <footer className="mt-12 bg-primary text-primary-foreground">
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2">
          {/* 組織情報・問い合わせ */}
          <div>
            <p className="text-lg font-bold">一般社団法人茨城県卓球連盟</p>
            {contact && (
              <div className="mt-4">
                <p className="text-sm font-bold text-white/90">お問い合わせ</p>
                <address className="mt-1 text-sm leading-relaxed whitespace-pre-line text-white/90 not-italic">
                  {contact}
                </address>
              </div>
            )}
          </div>

          {/* サイト内導線 */}
          <nav aria-label="フッターメニュー">
            <p className="text-sm font-bold text-white/90">サイト内メニュー</p>
            <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-3">
              {NAV.map((n) => (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    className="inline-block py-1 underline-offset-4 hover:underline"
                  >
                    {n.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/policy"
                  className="inline-block py-1 underline-offset-4 hover:underline"
                >
                  このサイトについて
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-8 border-t border-white/20 pt-4 text-sm text-white/80">
          © {year} 一般社団法人茨城県卓球連盟
        </div>
      </div>
    </footer>
  )
}
