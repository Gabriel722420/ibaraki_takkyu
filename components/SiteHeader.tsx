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
    // 影でなく色の値差＋ hairline で区切る（DESIGN.md: 分離は影でなく値差）
    <header>
      {/* 上部の帯（#0049a2）：ロゴ枠＋連盟名＋文字サイズ切替 */}
      <div className="bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 md:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            {/* ブランドマーク（卓球ラケット＋ボール）。#0049a2 の青帯上では白タイルが
                最も視認性が高いため反転配置（canonical は #0049a2タイル＋白＝白背景/favicon 用）。 */}
            <BrandMark tile="#ffffff" symbol="#0049a2" className="size-11 shrink-0 rounded-[10px]" />
            <span className="flex flex-col leading-tight">
              <span className="text-xs text-white/80">一般社団法人</span>
              <span className="text-lg font-semibold tracking-[-0.01em]">
                茨城県卓球連盟
              </span>
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
