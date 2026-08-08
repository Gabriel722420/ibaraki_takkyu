// 連盟ロゴのプレースホルダ（支給待ち・差し替え前提）。
// 卓球ボールを模した円のみ・写真なし。currentColor を継承するので、
// 親で text-primary を当てると #0049a2 のマークになる。
// ロゴ支給後は、この中身を <img src="/logo.svg" alt="茨城県卓球連盟" /> に置換するだけでよい。
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={className}
      role="img"
      aria-label="茨城県卓球連盟のロゴ"
    >
      <circle cx="20" cy="20" r="13" fill="currentColor" />
      <circle cx="15.5" cy="15" r="3.6" fill="#ffffff" opacity="0.4" />
    </svg>
  )
}
