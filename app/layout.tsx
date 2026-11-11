import './globals.css'
import { cookies } from 'next/headers'
import { GoogleAnalytics } from '@next/third-parties/google'
import localFont from 'next/font/local'

// 欧文・数字は Inter、和文は Noto Sans JP。両方 woff2 を app/fonts/ に同梱し next/font/local で
// セルフホスト（ビルド時に Google Fonts へ一切アクセスしない＝取得失敗でデプロイが落ちる事故を根治）。
// font-family 先頭に Inter → 和文グリフは Noto へフォールバック（DESIGN.md Typography）。
// 使用weightは 400/500/600/700（body/ui/subheading/heading）。display:swap は従来どおり。
const inter = localFont({
  src: [
    { path: './fonts/inter-400.woff2', weight: '400', style: 'normal' },
    { path: './fonts/inter-500.woff2', weight: '500', style: 'normal' },
    { path: './fonts/inter-600.woff2', weight: '600', style: 'normal' },
    { path: './fonts/inter-700.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-inter',
  display: 'swap',
})
// Noto Sans JP は fontsource の「japanese」サブセット単一ファイル（JIS全域の完全カバレッジ）を
// weight 別に同梱。欠字を避けるため subset は切らず full を採用（サイズは下記 report 参照）。
const notoSansJP = localFont({
  src: [
    { path: './fonts/noto-sans-jp-400.woff2', weight: '400', style: 'normal' },
    { path: './fonts/noto-sans-jp-500.woff2', weight: '500', style: 'normal' },
    { path: './fonts/noto-sans-jp-600.woff2', weight: '600', style: 'normal' },
    { path: './fonts/noto-sans-jp-700.woff2', weight: '700', style: 'normal' },
  ],
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
