// 連盟ロゴのプレースホルダ（支給待ち・差し替え前提）。
// 意味不明な図形は置かず、連盟名の頭文字「茨」をタイポグラフィのモノグラムとして用いる。
// currentColor を継承するので、親で text-primary を当てると #0049a2 のマークになる。
// viewBox 基準なので className の size-* でそのまま拡縮できる。
// ロゴ支給後は、この中身を <img src="/logo.svg" alt="茨城県卓球連盟" /> に置換するだけでよい。
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={className}
      role="img"
      aria-label="茨城県卓球連盟"
    >
      <text
        x="20"
        y="21"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="30"
        fontWeight={700}
        fill="currentColor"
        fontFamily="var(--font-noto), sans-serif"
      >
        茨
      </text>
    </svg>
  )
}
