import type { Metadata } from 'next'
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { connection } from 'next/server'
import { isLocale, t, DEFAULT_LOCALE, LOCALES, type Locale } from '@/messages/sq'
import { buildAlternates, breadcrumbLd, localeUrl } from '@/lib/seo'
import { signFormToken } from '@/lib/terms'
import { ListingRequestForm } from '@/components/ListingRequestForm'
import { JsonLd } from '@/components/JsonLd'

const PATH = '/dergo-pronen'

// The locale list is fixed; without this the route cannot prerender at all
// (CLAUDE.md rule 11, docs/13-caching.md).
export async function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const loc: Locale = isLocale(locale) ? locale : DEFAULT_LOCALE

  return {
    title: t.listingRequest.metaTitle,
    description: t.listingRequest.metaDescription,
    alternates: buildAlternates(loc, PATH),
  }
}

export default async function ListingRequestPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  const breadcrumb = breadcrumbLd([
    { name: t.brand, url: localeUrl(locale, '') },
    { name: t.listingRequest.title, url: localeUrl(locale, PATH) },
  ])

  return (
    <main className="container container--narrow">
      <JsonLd data={breadcrumb} />

      <div className="page-head">
        <p className="page-head__eyebrow">{t.brand}</p>
        <h1 className="page-head__title">{t.listingRequest.title}</h1>
        <p className="page-head__intro">{t.listingRequest.intro}</p>
      </div>

      {/* The form's signed token has to be minted per request, or a prerender
          would bake one timestamp into the HTML for every visitor and the
          timing check would eventually reject everything. `connection()` inside
          the boundary keeps that dynamic while the heading above stays static —
          see EnquiryFormSlot for the same pattern on the detail pages. */}
      <Suspense fallback={<div className="form-loading" aria-hidden="true" />}>
        <TokenisedForm locale={locale} />
      </Suspense>
    </main>
  )
}

async function TokenisedForm({ locale }: { locale: Locale }) {
  await connection()
  return <ListingRequestForm locale={locale} formToken={signFormToken()} />
}
