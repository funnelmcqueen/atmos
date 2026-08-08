import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPropertyPage } from '@/lib/listings'
import { isLocale, t, DEFAULT_LOCALE, type Locale } from '@/messages/sq'
import { buildAlternates, breadcrumbLd, localeUrl } from '@/lib/seo'
import { PropertyCard } from '@/components/PropertyCard'
import { Pagination } from '@/components/Pagination'
import { JsonLd } from '@/components/JsonLd'

const PER_PAGE = 12
const PATH = '/prona'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const loc: Locale = isLocale(locale) ? locale : DEFAULT_LOCALE
  return {
    title: t.list.metaTitle,
    description: t.list.metaDescription,
    alternates: buildAlternates(loc, PATH),
  }
}

const parsePage = (raw: string | string[] | undefined): number => {
  const n = Number(Array.isArray(raw) ? raw[0] : raw)
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1
}

export default async function PropertiesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ faqe?: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  const { faqe } = await searchParams
  const page = parsePage(faqe)

  const { cards, total } = await getPropertyPage(page, PER_PAGE)
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))

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

      {cards.length === 0 ? (
        <p className="empty">{t.list.empty}</p>
      ) : (
        <div className="grid">
          {cards.map((card) => (
            <PropertyCard key={card.slug} card={card} locale={locale} />
          ))}
        </div>
      )}

      <Pagination locale={locale} basePath={PATH} page={page} totalPages={totalPages} />
    </main>
  )
}
