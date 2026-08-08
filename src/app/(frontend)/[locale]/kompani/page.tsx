import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getCompanyList } from '@/lib/companies'
import { isLocale, t, DEFAULT_LOCALE, type Locale } from '@/messages/sq'
import { buildAlternates, breadcrumbLd, localeUrl } from '@/lib/seo'
import { Badge } from '@/components/Badge'
import { JsonLd } from '@/components/JsonLd'

const PATH = '/kompani'

// Prebuild the index, then serve from cache and revalidate hourly (ISR).
export const revalidate = 3600

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const loc: Locale = isLocale(locale) ? locale : DEFAULT_LOCALE
  return {
    title: t.companies.metaTitle,
    description: t.companies.metaDescription,
    alternates: buildAlternates(loc, PATH),
  }
}

export default async function CompaniesPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  const companies = await getCompanyList()

  const breadcrumb = breadcrumbLd([
    { name: t.brand, url: localeUrl(locale, '') },
    { name: t.nav.companies, url: localeUrl(locale, PATH) },
  ])

  return (
    <main className="container">
      <JsonLd data={breadcrumb} />

      <div className="page-head">
        <p className="page-head__eyebrow">{t.nav.companies}</p>
        <h1 className="page-head__title">{t.companies.title}</h1>
        <p className="page-head__count">
          {companies.length}{' '}
          {companies.length === 1 ? t.companies.resultsOne : t.companies.resultsMany}
        </p>
      </div>

      {companies.length === 0 ? (
        <p className="empty">{t.companies.empty}</p>
      ) : (
        <div className="grid">
          {companies.map((c) => (
            <article className="company-card" key={c.slug}>
              <Link href={`/${locale}/kompani/${c.slug}`} className="card__link">
                <div className="company-card__logo" aria-hidden={c.logoUrl ? undefined : 'true'}>
                  {c.logoUrl ? (
                    <Image src={c.logoUrl} alt={c.name} width={96} height={96} />
                  ) : (
                    <span className="company-card__monogram">{c.name.charAt(0)}</span>
                  )}
                </div>
                <div className="company-card__body">
                  <div className="card__badges">
                    {c.verifiedPartner && <Badge>{t.company.verifiedPartner}</Badge>}
                  </div>
                  <h2 className="company-card__name">{c.name}</h2>
                  {c.areaNames.length > 0 && (
                    <p className="company-card__areas">{c.areaNames.join(', ')}</p>
                  )}
                </div>
              </Link>
            </article>
          ))}
        </div>
      )}
    </main>
  )
}
