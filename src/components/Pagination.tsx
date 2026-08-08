import Link from 'next/link'
import type { Locale } from '@/messages/sq'
import { t } from '@/messages/sq'

/**
 * Offset pagination via ?faqe= on /prona. Server-rendered links only — no
 * client JS, and each page has a real crawlable URL.
 */
export function Pagination({
  locale,
  basePath,
  page,
  totalPages,
}: {
  locale: Locale
  basePath: string
  page: number
  totalPages: number
}) {
  if (totalPages <= 1) return null

  const href = (p: number) => (p <= 1 ? `/${locale}${basePath}` : `/${locale}${basePath}?faqe=${p}`)
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
