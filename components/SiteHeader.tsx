import Link from 'next/link'
import { cookies } from 'next/headers'
import { TextSizeToggle } from './TextSizeToggle'

const NAV = [
  { href: '/', label: 'トップ' },
  { href: '/news', label: 'おしらせ' },
  { href: '/games', label: '大会情報' },
  { href: '/registration', label: '登録・資格情報' },
  { href: '/about', label: '連盟情報' },
]

export async function SiteHeader() {
  const size = ((await cookies()).get('textsize')?.value ?? 'normal') as
    'normal' | 'large' | 'xlarge'
  return (
    <header className="border-b border-gray-200">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-2 px-4 py-2">
        <Link href="/" className="font-bold">
          茨城県卓球連盟
        </Link>
        <TextSizeToggle initial={size} />
      </div>
      <nav aria-label="メインメニュー" className="border-t border-gray-100">
        <ul className="mx-auto flex max-w-2xl flex-wrap gap-x-4 gap-y-1 px-4 py-2">
          {NAV.map((n) => (
            <li key={n.href}>
              <Link
                href={n.href}
                className="inline-block py-1.5 underline-offset-4 hover:underline"
              >
                {n.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
