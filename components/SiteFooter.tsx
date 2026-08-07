import Link from 'next/link'
import { NAV } from '@/lib/nav'

export function SiteFooter() {
  const year = new Date().getFullYear()
  return (
    <footer className="mt-12 bg-primary text-primary-foreground">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <p className="text-lg font-bold">一般社団法人茨城県卓球連盟</p>

        {/* TODO: 住所・連絡先はここに追記できます（例）
            <address className="mt-2 not-italic text-sm text-white/90">
              〒310-0000 茨城県水戸市○○ ○-○-○<br />
              TEL: 000-000-0000 ／ Email: info@example.jp
            </address>
        */}

        <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
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
        </ul>

        <p className="mt-6 text-sm text-white/80">
          © {year} 一般社団法人茨城県卓球連盟
        </p>
      </div>
    </footer>
  )
}
