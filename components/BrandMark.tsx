// 連盟のブランドマーク（既存ロゴが無いため、これが実質の顔。差し替え可能な構造は維持）。
// #0049a2 の角丸タイルに、白の塗りシルエットで「卓球ラケット＋ボール」。
// ラケットは横型シェークハンド（丸いブレード＋明確なグリップ）。40px でも視認できるよう簡潔に。
// 正式ロゴが決まれば、この中身を <img src="/logo.svg" alt="茨城県卓球連盟" /> に置換するだけでよい。
// tile / symbol の色は props で反転可（例：濃色地では白タイル＋#0049a2 シンボル）。
export function BrandMark({
  className,
  tile = '#0049a2',
  symbol = '#ffffff',
}: {
  className?: string
  tile?: string
  symbol?: string
}) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={className}
      role="img"
      aria-label="茨城県卓球連盟"
    >
      <rect width="40" height="40" rx="9" fill={tile} />
      <g fill={symbol}>
        {/* グリップ（シェークハンド：丸ブレードから斜めに伸びる柄・末広がりで持ち手を明示） */}
        <g transform="rotate(44 20 16)">
          <path d="M17.5 15 L16.8 28 Q16.7 31 19.4 31 L20.6 31 Q23.3 31 23.2 28 L22.5 15 Z" />
        </g>
        {/* ブレード（丸い打球面） */}
        <circle cx="21.6" cy="14.6" r="8.6" />
        {/* ボール */}
        <circle cx="32.2" cy="8" r="2.6" />
      </g>
    </svg>
  )
}
