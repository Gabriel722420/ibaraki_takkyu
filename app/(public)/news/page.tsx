import Link from 'next/link'
import { listAnnouncements, listCategories } from '@/lib/queries'
import { collectCategoryIds } from '@/lib/docs'

export const dynamic = 'force-dynamic'

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>
}) {
  const sp = await searchParams
  const categories = await listCategories()
  const selected = sp.category
    ? (categories.find((c) => c.slug === sp.category) ?? null)
    : null
  const categoryIds = selected
    ? collectCategoryIds(categories, selected.id)
    : undefined
  const page = Math.max(1, Number(sp.page) || 1)

  const { items, total, perPage } = await listAnnouncements({
    categoryIds,
    page,
  })
  const totalPages = Math.max(1, Math.ceil(total / perPage))

  const topCats = categories.filter((c) => !c.parent_id)
  // アクティブなトップ分類（子が選択されていれば親）と、その子一覧
  const activeTop = selected
    ? selected.parent_id
      ? (categories.find((c) => c.id === selected.parent_id) ?? selected)
      : selected
    : null
  const subCats = activeTop
    ? categories.filter((c) => c.parent_id === activeTop.id)
    : []

  const hrefFor = (slug: string | null) =>
    slug ? `/news?category=${encodeURIComponent(slug)}` : '/news'

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10 lg:px-8">
      <h1 className="mb-5 border-l-4 border-primary pl-3 text-[1.45rem] font-medium tracking-[-0.02em]">
        おしらせ
      </h1>

      {/* カテゴリ絞り込み（トップ分類） */}
      <nav aria-label="カテゴリ" className="mb-2 flex flex-wrap gap-2">
        <FilterChip label="すべて" href={hrefFor(null)} active={!selected} />
        {topCats.map((c) => (
          <FilterChip
            key={c.id}
            label={c.name}
            href={hrefFor(c.slug)}
            active={activeTop?.id === c.id}
          />
        ))}
      </nav>

      {/* サブ分類（選択トップ分類の子） */}
      {subCats.length > 0 && (
        <nav
          aria-label="サブカテゴリ"
          className="mb-4 flex flex-wrap gap-2 border-l-2 border-hairline pl-3"
        >
          <FilterChip
            label={`${activeTop!.name}（すべて）`}
            href={hrefFor(activeTop!.slug)}
            active={selected?.id === activeTop!.id}
            small
          />
          {subCats.map((c) => (
            <FilterChip
              key={c.id}
              label={c.name}
              href={hrefFor(c.slug)}
              active={selected?.id === c.id}
              small
            />
          ))}
        </nav>
      )}

      <p className="mb-3 text-sm text-ink-muted">
        {selected ? `「${selected.name}」` : '全'}
        {total}件
      </p>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((a) => (
          <li key={a.id}>
            <Link
              href={`/news/${a.wp_post_id ?? a.id}`}
              className="group flex h-full flex-col gap-1.5 rounded-xl border border-hairline bg-card p-4 transition-colors hover:border-primary/40 hover:bg-primary/[0.03] active:bg-primary/5"
            >
              <span className="flex flex-wrap items-center gap-2 text-sm text-ink-muted">
                {a.is_pinned && (
                  <span className="rounded-full bg-primary px-2.5 py-0.5 font-medium text-primary-foreground">
                    重要
                  </span>
                )}
                {a.category?.name && (
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 font-medium text-primary">
                    {a.category.name}
                  </span>
                )}
                <span>{formatDate(a.published_at)}</span>
              </span>
              <span className="text-lg leading-snug font-medium text-ink group-hover:text-primary">
                {a.title}
              </span>
            </Link>
          </li>
        ))}
        {items.length === 0 && (
          <li className="col-span-full rounded-xl border border-dashed border-surface-muted bg-card py-10 text-center text-ink-muted">
            該当するお知らせはありません。
          </li>
        )}
      </ul>

      {totalPages > 1 && (
        <Pager
          slug={selected?.slug ?? null}
          page={page}
          totalPages={totalPages}
        />
      )}
    </main>
  )
}

function FilterChip({
  label,
  href,
  active,
  small,
}: {
  label: string
  href: string
  active: boolean
  small?: boolean
}) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={[
        'inline-flex min-h-[36px] items-center rounded-full border px-3.5 transition-colors',
        small ? 'text-sm' : '',
        active
          ? 'border-primary bg-primary font-medium text-primary-foreground'
          : 'border-surface-muted bg-card text-ink hover:border-primary hover:text-primary',
      ].join(' ')}
    >
      {label}
    </Link>
  )
}

function Pager({
  slug,
  page,
  totalPages,
}: {
  slug: string | null
  page: number
  totalPages: number
}) {
  const base = (p: number) => {
    const params = new URLSearchParams()
    if (slug) params.set('category', slug)
    if (p > 1) params.set('page', String(p))
    const qs = params.toString()
    return qs ? `/news?${qs}` : '/news'
  }
  return (
    <div className="mt-8 flex items-center justify-between gap-2">
      {page > 1 ? (
        <Link
          href={base(page - 1)}
          className="rounded-lg border border-surface-muted bg-card px-4 py-2 font-medium text-ink transition-colors hover:border-primary hover:text-primary"
        >
          ← 前へ
        </Link>
      ) : (
        <span />
      )}
      <span className="text-sm text-ink-muted">
        {page} / {totalPages} ページ
      </span>
      {page < totalPages ? (
        <Link
          href={base(page + 1)}
          className="rounded-lg border border-surface-muted bg-card px-4 py-2 font-medium text-ink transition-colors hover:border-primary hover:text-primary"
        >
          次へ →
        </Link>
      ) : (
        <span />
      )}
    </div>
  )
}

function formatDate(d: string): string {
  const [y, m, day] = d.slice(0, 10).split('-')
  return `${y}年${Number(m)}月${Number(day)}日`
}
