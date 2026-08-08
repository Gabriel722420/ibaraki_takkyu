import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'

// 公開サイトの共通レイアウト（青帯ヘッダー・グロナビ・文字サイズ切替・フッター）。
// 従来のルートlayoutの「顔」をこのグループに移設（URLは不変）。
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter />
    </>
  )
}
