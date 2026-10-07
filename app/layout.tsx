import './globals.css'
import { cookies } from 'next/headers'
import { GoogleAnalytics } from '@next/third-parties/google'
import { Inter, Noto_Sans_JP } from 'next/font/google'

// 欧文・数字は Inter、和文は Noto Sans JP（両方オープン・next/font でセルフホスト）。
// font-family 先頭に Inter → 和文グリフは Noto へフォールバック（DESIGN.md Typography）。
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
})
const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto',
  display: 'swap',
})

export const metadata = { title: '一般社団法人茨城県卓球連盟' }

// ルートは <html>/<body> のシェルのみ。ヘッダー/フッター等の「顔」は
// 各グループ layout（(public) / admin(panel)）が担当する。
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 文字サイズ切替（公開側UD）。html に付与し rem スケールを全体連動させる。
  const size = (await cookies()).get('textsize')?.value ?? 'normal'
  return (
    <html
      lang="ja"
      data-textsize={size}
      className={`${inter.variable} ${notoSansJP.variable}`}
    >
      <body>
        {children}
        <GoogleAnalytics gaId="G-6NZR9MQ159" />
      </body>
    </html>
  )
}
