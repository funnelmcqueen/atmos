import type { Metadata } from 'next'
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { getPropertyDetail } from '@/lib/property-detail'
import { getSimilarProperties, getPropertySlugs, getCoverThumbnails } from '@/lib/listings'
import { isLocale, t, DEFAULT_LOCALE, BUILDING_PHASE_LABELS, type Locale } from '@/messages/sq'
import { formatPrice, formatArea, pricePerSqm, formatDate } from '@/lib/format'
import { buildAlternates, breadcrumbLd, realEstateListingLd, localeUrl } from '@/lib/seo'
import { PropertyGallery } from '@/components/PropertyGallery'
import { PropertySpecs } from '@/components/PropertySpecs'
import { FeatureGrid } from '@/components/FeatureGrid'
import { AgentCard } from '@/components/AgentCard'
import { ContactBar } from '@/components/ContactBar'
import { LocationPanel } from '@/components/LocationPanel'
import { PropertyCard } from '@/components/PropertyCard'
import { EnquiryFormSlot, EnquiryFormFallback } from '@/components/EnquiryFormSlot'
import { StatusBadge } from '@/components/StatusBadge'
import { Badge } from '@/components/Badge'
import { JsonLd } from '@/components/JsonLd'

// Prebuilt sq detail pages, served from cache. The one-hour revalidate window
// now lives on the `content` cache profile the read functions declare, because
// `cacheComponents` disallows a route-level `revalidate` (see next.config.ts).
// docs/09 also wants revalidateTag on publish — that hook lands with the
// approval-workflow slice; time-based revalidation covers this one.

export async function generateStaticParams() {
  const slugs = await getPropertySlugs()
  return slugs.map((slug) => ({ locale: DEFAULT_LOCALE, slug }))
}

const idOf = (rel: number | { id: number }): number =>
  typeof rel === 'number' ? rel : rel.id

const priceLine = (
  price: number | null | undefined,
  currency: 'EUR' | 'ALL' | null | undefined,
  priceOnRequest: boolean | null | undefined,
  listingType: string,
  rentPeriod: string | null | undefined,
): string => {
  if (priceOnRequest || typeof price !== 'number' || !currency) return t.card.priceOnRequest
  const suffix = listingType === 'rent' ? (rentPeriod === 'nightly' ? '/natë' : t.card.perMonth) : ''
  return `${formatPrice(price, currency)}${suffix}`
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const loc: Locale = isLocale(locale) ? locale : DEFAULT_LOCALE
  const detail = await getPropertyDetail(slug, loc)
  if (!detail) return {}

  const { property, areaName } = detail
  const title = property.seo?.metaTitle || [property.title, areaName].filter(Boolean).join(' — ')
  const description =
    property.seo?.metaDescription ||
    `${property.title}${areaName ? `, ${areaName}` : ''}. ${priceLine(
      property.price,
      property.currency,
      property.priceOnRequest,
      property.listingType,
      property.rentPeriod,
    )}.`

  return {
    title,
    description,
    alternates: buildAlternates(loc, `/prona/${slug}`),
    robots: property.seo?.noindex ? { index: false, follow: true } : undefined,
  }
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  if (!isLocale(locale)) notFound()

  const detail = await getPropertyDetail(slug, locale)
  if (!detail) notFound() // draft or unknown slug → 404 for anonymous

  const { property, areaName, agent, images } = detail
  const isLand = property.propertyType === 'land'

  const price = priceLine(
    property.price,
    property.currency,
    property.priceOnRequest,
    property.listingType,
    property.rentPeriod,
  )
  const psqm = pricePerSqm(
    property.priceEur,
    property.areaGross,
    property.listingType,
    property.priceOnRequest,
  )

  const areaId = idOf(property.area)
  const similar = await getSimilarProperties({
    areaId,
    listingType: property.listingType,
    priceEur: property.priceEur ?? null,
    excludeSlug: slug,
  })
  const similarThumbs = await getCoverThumbnails(similar)

  const place = [property.street, areaName].filter(Boolean).join(', ')
  const url = localeUrl(locale, `/prona/${slug}`)

  const breadcrumb = breadcrumbLd([
    { name: t.brand, url: localeUrl(locale, '') },
    { name: t.nav.properties, url: localeUrl(locale, '/prona') },
    { name: property.title, url },
  ])

  return (
    <main className="container">
      <JsonLd data={breadcrumb} />
      <JsonLd data={realEstateListingLd(detail, url)} />

      <div className="detail">
        <div className="detail__main">
          <PropertyGallery images={images} title={property.title} />

          <header className="detail-head">
            <div className="detail-head__badges">
              <StatusBadge status={property.status} />
              {property.verified && <Badge>{t.badge.verified}</Badge>}
              {property.mortgageEligible && <Badge tone="accent">{t.badge.mortgage}</Badge>}
            </div>
            <h1 className="detail-head__title">{property.title}</h1>
            {place && <p className="detail-head__place">{place}</p>}
            <div className="detail-head__price-row">
              <span className="detail-head__price">{price}</span>
              {psqm && <span className="detail-head__psqm">{psqm}</span>}
            </div>
            {property.reference && (
              <p className="detail-head__reference">
                {t.detail.reference}: {property.reference}
              </p>
            )}
          </header>

          {property.description && (
            <section className="detail__block prose">
              <h2 className="section__heading">{t.detail.description}</h2>
              <RichText data={property.description} />
            </section>
          )}

          <div className="detail__block">
            {/* Layout block — omitted entirely for land (docs/02). */}
            {!isLand && (
              <PropertySpecs
                items={[
                  { label: t.detail.specs.rooms, value: property.rooms },
                  { label: t.detail.specs.bedrooms, value: property.bedrooms },
                  { label: t.detail.specs.bathrooms, value: property.bathrooms },
                  { label: t.detail.specs.floor, value: property.floor },
                  {
                    label: t.detail.specs.orientation,
                    value: property.orientation?.length ? property.orientation.join(', ') : null,
                  },
                ]}
              />
            )}
            <PropertySpecs
              items={[
                { label: t.detail.specs.areaGross, value: formatArea(property.areaGross) },
                {
                  label: t.detail.specs.areaNet,
                  value: property.areaNet ? formatArea(property.areaNet) : null,
                },
                {
                  label: t.detail.specs.terrace,
                  value: property.terraceSqm ? formatArea(property.terraceSqm) : null,
                },
                {
                  label: t.detail.specs.buildingPhase,
                  value: property.buildingPhase
                    ? BUILDING_PHASE_LABELS[property.buildingPhase] ?? property.buildingPhase
                    : null,
                },
              ]}
            />
          </div>

          <div className="detail__block">
            <FeatureGrid features={property.features ?? []} />
          </div>

          {/* The enquiry form, per docs/05. Behind Suspense because its signed
              token must be minted per request — see EnquiryFormSlot. */}
          <div className="detail__block">
            <Suspense fallback={<EnquiryFormFallback />}>
              <EnquiryFormSlot sourceType="property" sourceId={property.id} locale={locale} />
            </Suspense>
          </div>

          <div className="detail__block">
            {/* Marker colour follows the listing type, matching the search map
                (docs/06) — the panel now carries a real single-marker map. */}
            <LocationPanel
              areaName={areaName}
              street={property.street ?? null}
              location={property.location}
              tone={property.listingType === 'rent' ? 'rent' : 'sale'}
            />
          </div>
        </div>

        <aside className="detail__aside">
          <AgentCard agent={agent} reference={property.reference ?? null} title={property.title} />

          {property.documentationNote && (
            <div className="doc-note">
              <h2 className="section__heading">{t.detail.documentation}</h2>
              <p>{property.documentationNote}</p>
            </div>
          )}

          <p className="dates">
            {property.publishedAt && (
              <>
                {t.detail.published}: {formatDate(property.publishedAt, locale)}
                <br />
              </>
            )}
            {t.detail.updated}: {formatDate(property.updatedAt, locale)}
          </p>
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="detail__block">
          <h2 className="section__heading">{t.detail.similar}</h2>
          <div className="grid">
            {similar.map((card) => (
              <PropertyCard
                key={card.slug}
                card={card}
                locale={locale}
                thumbnail={similarThumbs.get(card.slug) ?? null}
              />
            ))}
          </div>
        </section>
      )}

      {/* Mobile-only sticky Call/WhatsApp bar; the desktop aside keeps AgentCard. */}
      <ContactBar phone={agent?.phone ?? null} />
    </main>
  )
}
