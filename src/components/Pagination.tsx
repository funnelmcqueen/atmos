import Link from 'next/link'
import type { Locale } from '@/messages/sq'
import { t } from '@/messages/sq'
import { paramName } from '@/lib/search-params'

/**
 * Offset pagination via ?faqe= on /prona. Server-rendered links only — no
 * client JS, and each page has a real crawlable URL.
 *
 * `query` carries the active filter params (localized, without the page param);
 * every page link re-appends them so paging never drops the current filters
 * (docs/06-search-map.md). Omit it and pagination behaves as a bare ?faqe=.
 */
export function Pagination({
  locale,
  basePath,
  page,
  totalPages,
  query = '',
}: {
  locale: Locale
  basePath: string
  page: number
  totalPages: number
  query?: string
}) {
  if (totalPages <= 1) return null

  const base = `/${locale}${basePath}`
  const pageParam = paramName(locale, 'page')
  const href = (p: number) => {
    const parts = [query, p > 1 ? `${pageParam}=${p}` : ''].filter(Boolean)
    return parts.length ? `${base}?${parts.join('&')}` : base
  }
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <nav className="pagination" aria-label={t.pagination.page}>
      {page > 1 ? (
        <Link className="pagination__step" href={href(page - 1)} rel="prev">
          {t.pagination.previous}
        </Link>
      ) : (
        <span className="pagination__step pagination__step--disabled">{t.pagination.previous}</span>
      )}

      <ul className="pagination__pages">
        {pages.map((p) => (
          <li key={p}>
            {p === page ? (
              <span className="pagination__page pagination__page--current" aria-current="page">
                {p}
              </span>
            ) : (
              <Link className="pagination__page" href={href(p)}>
                {p}
              </Link>
            )}
          </li>
        ))}
      </ul>

      {page < totalPages ? (
        <Link className="pagination__step" href={href(page + 1)} rel="next">
          {t.pagination.next}
        </Link>
      ) : (
        <span className="pagination__step pagination__step--disabled">{t.pagination.next}</span>
      )}
    </nav>
  )
}
