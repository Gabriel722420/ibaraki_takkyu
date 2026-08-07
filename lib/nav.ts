// グローバルナビ項目（ヘッダー/フッター共用）。
// 純粋な定数のみ（next/headers 等を含めない＝クライアントからも import 可）。
export const NAV: { href: string; label: string }[] = [
  { href: '/', label: 'トップ' },
  { href: '/news', label: 'おしらせ' },
  { href: '/games', label: '大会情報' },
  { href: '/registration', label: '登録・資格情報' },
  { href: '/about', label: '連盟情報' },
]
