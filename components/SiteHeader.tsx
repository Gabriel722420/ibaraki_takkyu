import Link from 'next/link'
import { cookies } from 'next/headers'
import { TextSizeToggle } from './TextSizeToggle'
import { MainNav } from './MainNav'

export async function SiteHeader() {
  const size = ((await cookies()).get('textsize')?.value ?? 'normal') as
    | 'normal'
    | 'large'
    | 'xlarge'
  return (
    <header>
      {/* 上部の帯（#0049a2）：連盟名＋文字サイズ切替 */}
      <div className="bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 md:px-6 lg:px-8">
          <Link href="/" className="text-lg font-bold leading-tight">
            一般社団法人茨城県卓球連盟
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
