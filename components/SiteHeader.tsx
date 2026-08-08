import Link from 'next/link'
import { cookies } from 'next/headers'
import { TextSizeToggle } from './TextSizeToggle'
import { MainNav } from './MainNav'
import { BrandMark } from './BrandMark'

export async function SiteHeader() {
  const size = ((await cookies()).get('textsize')?.value ?? 'normal') as
    | 'normal'
    | 'large'
    | 'xlarge'
  return (
    // shadow で青帯＋ナビを一つの塊として見せる（一体感）
    <header className="shadow-sm">
      {/* 上部の帯（#0049a2）：ロゴ枠＋連盟名＋文字サイズ切替 */}
      <div className="bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 md:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            {/* ロゴ用スペース（支給待ち＝差し替え前提）。白地に #0049a2 のマーク。 */}
            <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-white text-primary shadow-sm">
              <BrandMark className="size-8" />
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-xs text-white/80">一般社団法人</span>
              <span className="text-lg font-bold">茨城県卓球連盟</span>
            </span>
          </Link>
          {/* 切替ボタン群を白地カードに載せて青帯上でも視認性を確保 */}
          <div className="rounded-lg bg-white px-2 py-1">
            <TextSizeToggle initial={size} />
          </div>
        </div>
      </div>
      <MainNav />
    </header>
  )
}
