import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { searchListings, getListingFacets, getCoverThumbnails } from '@/lib/listings'
import { isLocale, t, DEFAULT_LOCALE, type Locale } from '@/messages/sq'
import {
  parseSearchParams,
  toSearchParams,
  hasActiveFilters,
  type FilterValues,
} from '@/lib/search-params'
import { buildAlternates, breadcrumbLd, localeUrl } from '@/lib/seo'
import { PropertyCard } from '@/components/PropertyCard'
import { FilterPanel } from '@/components/FilterPanel'
import { Pagination } from '@/components/Pagination'
import { JsonLd } from '@/components/JsonLd'

const PER_PAGE = 12
const PATH = '/prona'

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}): Promise<Metadata> {
  const { locale } = await params
  const loc: Locale = isLocale(locale) ? locale : DEFAULT_LOCALE
  const filters = parseSearchParams(loc, await searchParams)

  return {
    title: t.list.metaTitle,
    description: t.list.metaDescription,
    alternates: buildAlternates(loc, PATH),
    // A filtered or re-sorted result set is a thin, near-duplicate view — keep
    // it out of the index but let crawlers follow through to the listings. The
    // clean /prona stays indexable (docs/06-search-map.md).
    ...(hasActiveFilters(filters) ? { robots: { index: false, follow: true } } : {}),
  }
}

export default async function PropertiesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  const filters: FilterValues = parseSearchParams(locale, await searchParams)
  const facets = await getListingFacets()

  // `zona` is a slug in the URL; resolve it to an area id against the facets.
  // A slug that matches nothing resolves to -1 so the query returns no rows —
  // the right answer for a hand-typed or stale area.
  const areaId = filters.area
    ? (facets.areas.find((a) => a.slug === filters.area)?.id ?? -1)
    : null

  const { cards, total } = await searchListings(filters, areaId, PER_PAGE)
  const thumbs = await getCoverThumbnails(cards)
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))

  // Filter params (localized, no page) that every pagination link re-appends.
  const filterQuery = toSearchParams(locale, filters).toString()

  const breadcrumb = breadcrumbLd([
    { name: t.brand, url: localeUrl(locale, '') },
    { name: t.nav.properties, url: localeUrl(locale, PATH) },
  ])

  return (
    <main className="container">
      <JsonLd data={breadcrumb} />

      <div className="page-head">
        <p className="page-head__eyebrow">{t.nav.properties}</p>
        <h1 className="page-head__title">{t.list.title}</h1>
        <p className="page-head__count">
          {total} {total === 1 ? t.list.resultsOne : t.list.resultsMany}
        </p>
      </div>

      <FilterPanel locale={locale} values={filters} facets={facets} />

      {cards.length === 0 ? (
        <p className="empty">{t.list.empty}</p>
      ) : (
        <div className="grid">
          {cards.map((card) => (
            <PropertyCard
              key={card.slug}
              card={card}
              locale={locale}
              thumbnail={thumbs.get(card.slug) ?? null}
            />
          ))}
        </div>
      )}

      <Pagination
        locale={locale}
        basePath={PATH}
        page={filters.page}
        totalPages={totalPages}
        query={filterQuery}
      />
    </main>
  )
}
