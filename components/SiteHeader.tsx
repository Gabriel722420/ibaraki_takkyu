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
        {/* ロゴ左／文字サイズ切替右の両端配置（justify-between）。両者とも shrink-0 で、
            ロゴ(連盟名)も切替も絶対に欠けさせない＝重なり・truncateを起こさない。
            連盟名は固定pxでサイズ切替に連動させない（ヘッダーは chrome・切替ボタンも固定px）。
            この構成で 360〜414 の全幅 × xlarge でも1行に余裕を持って収まる。 */}
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-x-3 px-4 py-3 md:gap-x-4 md:px-6 lg:px-8">
          <Link href="/" className="flex shrink-0 items-center gap-2 md:gap-3">
            {/* ブランドマーク（卓球ラケット＋ボール）。#0049a2 の青帯上では白タイルが
                最も視認性が高いため反転配置（canonical は #0049a2タイル＋白＝白背景/favicon 用）。 */}
            <BrandMark tile="#ffffff" symbol="#0049a2" className="size-9 shrink-0 rounded-[10px] md:size-11" />
            <span className="flex flex-col leading-tight">
              <span className="text-[11px] text-white/80 md:text-xs">一般社団法人</span>
              <span className="text-[16px] font-semibold tracking-[-0.01em] md:text-lg">
                茨城県卓球連盟
              </span>
            </span>
          </Link>
          {/* 切替ボタン群を白地カードに載せて青帯上でも視認性を確保。shrink-0 で縮めない。
              横幅を固定px(px-[7px])にして xlarge でも toggle が肥大しない。 */}
          <div className="shrink-0 rounded-lg bg-white px-[7px] py-1">
            <TextSizeToggle initial={size} />
          </div>
        </div>
      </div>
      <MainNav />
    </header>
  )
}
