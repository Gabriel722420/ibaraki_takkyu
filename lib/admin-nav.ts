// 管理画面サイドバーのナビ定義（純粋定数・クライアント/サーバー両用）。
export type AdminNavItem = { href: string; label: string }
export type AdminNavGroup = { title: string; items: AdminNavItem[] }

export const ADMIN_NAV: AdminNavGroup[] = [
  {
    title: 'コンテンツ',
    items: [
      { href: '/admin/games', label: '大会' },
      { href: '/admin/news', label: 'おしらせ' },
      { href: '/admin/resources', label: '資料（登録・資格）' },
    ],
  },
  {
    title: '分類・組織',
    items: [
      { href: '/admin/categories', label: 'おしらせカテゴリ' },
      { href: '/admin/divisions', label: '部門' },
      { href: '/admin/officers', label: '役員' },
    ],
  },
  {
    title: 'サイト情報',
    items: [
      { href: '/admin/about', label: '連盟情報' },
      { href: '/admin/policy', label: 'サイトポリシー' },
    ],
  },
  {
    title: '設定',
    items: [{ href: '/admin/account', label: 'アカウント設定' }],
  },
]

// パスから現在地ラベルを解決（パンくず用）。最長一致の項目を返す。
export function adminLabelForPath(pathname: string): string | null {
  if (pathname === '/admin') return null // ダッシュボード直下はパンくず不要
  let best: AdminNavItem | null = null
  for (const g of ADMIN_NAV) {
    for (const it of g.items) {
      if (pathname === it.href || pathname.startsWith(it.href + '/')) {
        if (!best || it.href.length > best.href.length) best = it
      }
    }
  }
  return best?.label ?? null
}
