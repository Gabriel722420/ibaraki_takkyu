import './globals.css'
import { cookies } from 'next/headers'
import { SiteHeader } from '@/components/SiteHeader'

export const metadata = { title: '一般社団法人茨城県卓球連盟' }

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const size = (await cookies()).get('textsize')?.value ?? 'normal'
  return (
    <html lang="ja" data-textsize={size}>
      <body>
        <SiteHeader />
        {children}
      </body>
    </html>
  )
}
