/**
 * Canonical + hreflang alternates and JSON-LD builders (docs/09-seo.md).
 *
 * Slugs are not localized (docs/07), so a path is the same under every locale
 * prefix — hreflang alternates are just the same path under each locale, with
 * x-default pointing at the default locale.
 */
import type { Metadata } from 'next'
import { LOCALES, DEFAULT_LOCALE, type Locale } from '@/messages/sq'
import type { PropertyDetail } from '@/lib/property-detail'

export const SITE_URL = (process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000').replace(
  /\/$/,
  '',
)

/** Absolute URL for a locale-prefixed path, e.g. ('sq', '/prona') → …/sq/prona. */
export const localeUrl = (locale: string, path: string): string =>
  `${SITE_URL}/${locale}${path}`

/** Next `alternates` block: canonical to the current locale, hreflang for all. */
export const buildAlternates = (locale: Locale, path: string): Metadata['alternates'] => {
  const languages: Record<string, string> = {}
  for (const l of LOCALES) languages[l] = localeUrl(l, path)
  languages['x-default'] = localeUrl(DEFAULT_LOCALE, path)
  return { canonical: localeUrl(locale, path), languages }
}

type JsonLd = Record<string, unknown>

export const breadcrumbLd = (items: { name: string; url: string }[]): JsonLd => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: item.name,
    item: item.url,
  })),
})

/**
 * Organization for a company profile (docs/04): name, logo, url, sameAs
 * (socials), address. `url` is the canonical company-page URL. `logoUrl` and
 * `sameAs` are omitted when absent — the seed company has no logo or socials,
 * and an empty logo/sameAs is worse than none for rich results.
 */
export const organizationLd = (args: {
  name: string
  url: string
  logoUrl: string | null
  sameAs: string[]
}): JsonLd => {
  const { name, url, logoUrl, sameAs } = args

  const ld: JsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Tiranë',
      addressRegion: 'Tiranë',
      addressCountry: 'AL',
    },
  }

  if (logoUrl) ld.logo = logoUrl.startsWith('http') ? logoUrl : `${SITE_URL}${logoUrl}`
  if (sameAs.length > 0) ld.sameAs = sameAs

  return ld
}

/**
 * RealEstateListing for a property (docs/02). Address uses the area name and
 * Tiranë, AL as the client specified. Price and priceCurrency are omitted for
 * price-on-request; floorSize is gross area in square metres.
 */
export const realEstateListingLd = (detail: PropertyDetail, url: string): JsonLd => {
  const { property, areaName, images } = detail

  const ld: JsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.title,
    url,
    floorSize: {
      '@type': 'QuantitativeValue',
      value: property.areaGross,
      unitCode: 'MTK',
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: areaName ?? 'Tiranë',
      addressRegion: 'Tiranë',
      addressCountry: 'AL',
    },
  }

  if (property.description) {
    // Flatten the rich text root to a plain string for the meta-level field.
    ld.description = property.seo?.metaDescription ?? property.title
  }

  const cover = images[0]
  if (cover) ld.image = cover.url.startsWith('http') ? cover.url : `${SITE_URL}${cover.url}`

  const rooms = property.bedrooms ?? Number(String(property.rooms ?? '').split('+')[0])
  if (Number.isFinite(rooms) && rooms > 0) ld.numberOfRooms = rooms

  if (!property.priceOnRequest && typeof property.price === 'number' && property.currency) {
    ld.offers = {
      '@type': 'Offer',
      price: property.price,
      priceCurrency: property.currency,
      availability:
        property.status === 'sold'
          ? 'https://schema.org/SoldOut'
          : 'https://schema.org/InStock',
    }
  }

  return ld
}
