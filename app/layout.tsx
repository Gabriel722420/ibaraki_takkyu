import './globals.css'
import { cookies } from 'next/headers'
import { GoogleAnalytics } from '@next/third-parties/google'

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
    <html lang="ja" data-textsize={size}>
      <body>
        {children}
        <GoogleAnalytics gaId="G-6NZR9MQ159" />
      </body>
    </html>
  )
}
