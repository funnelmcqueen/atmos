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
import type { ProjectDetail, UnitDetail } from '@/lib/projects'
import type { ListingCard } from '@/lib/listings'

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

/* -------------------------------------------------------------------------- */
/* Projects and units                                                         */
/* -------------------------------------------------------------------------- */

const absolute = (url: string): string => (url.startsWith('http') ? url : `${SITE_URL}${url}`)

/** schema.org availability for a market status. */
const availabilityOf = (status: string): string => {
  if (status === 'sold') return 'https://schema.org/SoldOut'
  if (status === 'reserved') return 'https://schema.org/PreOrder'
  return 'https://schema.org/InStock'
}

const postalAddress = (areaName: string | null): JsonLd => ({
  '@type': 'PostalAddress',
  addressLocality: areaName ?? 'Tiranë',
  addressRegion: 'Tiranë',
  addressCountry: 'AL',
})

/**
 * Residence for a project, plus an Offer per available unit (docs/09).
 *
 * Only available units become Offers. Google reads an Offer as "you can buy
 * this"; emitting sold units as offers with `SoldOut` would be technically
 * legal and practically a stream of dead offers in the rich result. Sold units
 * still appear in the visible table — the page and the markup answer different
 * questions, and this is the one case where they legitimately differ.
 *
 * `numberOfAvailableAccommodationUnits` carries the scarcity the table shows,
 * in the vocabulary a crawler understands.
 */
export const residenceLd = (
  detail: ProjectDetail,
  units: ListingCard[],
  url: string,
  unitUrl: (unitSlug: string) => string,
): JsonLd => {
  const { project, areaName, images } = detail

  const ld: JsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Residence',
    name: project.name,
    url,
    address: postalAddress(areaName),
  }

  const description = project.seo?.metaDescription || project.tagline
  if (description) ld.description = description

  const cover = images[0]
  if (cover) ld.image = absolute(cover.url)

  if (Array.isArray(project.location) && project.location.length === 2) {
    ld.geo = {
      '@type': 'GeoCoordinates',
      longitude: project.location[0],
      latitude: project.location[1],
    }
  }

  const available = units.filter((u) => u.status === 'available')
  ld.numberOfAccommodationUnits = units.length
  ld.numberOfAvailableAccommodationUnits = available.length

  const offers = available
    .filter((u) => !u.priceOnRequest && typeof u.price === 'number' && u.currency)
    .map((u) => ({
      '@type': 'Offer',
      name: u.unitCode ?? u.slug,
      url: unitUrl(u.slug),
      price: u.price,
      priceCurrency: u.currency,
      availability: availabilityOf(u.status),
      itemOffered: {
        '@type': 'Apartment',
        name: u.unitCode ?? u.slug,
        numberOfRooms: u.bedrooms ?? undefined,
        floorSize: { '@type': 'QuantitativeValue', value: u.areaGross, unitCode: 'MTK' },
      },
    }))

  if (offers.length > 0) ld.makesOffer = offers

  return ld
}

/**
 * RealEstateListing for a single unit (docs/09). Same type as a standalone
 * property — to a searcher they are the same thing (docs/01) — with the parent
 * development named through `containedInPlace` so the two pages are linked in
 * the graph rather than competing.
 */
export const unitListingLd = (detail: UnitDetail, url: string, projectUrl: string): JsonLd => {
  const { unit, project, areaName, images, floorPlan } = detail

  const ld: JsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: unit.title,
    url,
    floorSize: { '@type': 'QuantitativeValue', value: unit.areaGross, unitCode: 'MTK' },
    address: postalAddress(areaName),
    containedInPlace: {
      '@type': 'Residence',
      name: project.name,
      url: projectUrl,
    },
  }

  if (unit.seo?.metaDescription) ld.description = unit.seo.metaDescription

  const cover = images[0] ?? floorPlan
  if (cover) ld.image = absolute(cover.url)

  const rooms = unit.bedrooms ?? Number(String(unit.rooms ?? '').split('+')[0])
  if (Number.isFinite(rooms) && rooms > 0) ld.numberOfRooms = rooms
  if (typeof unit.floor === 'number') ld.floorLevel = String(unit.floor)

  if (!unit.priceOnRequest && typeof unit.price === 'number' && unit.currency) {
    ld.offers = {
      '@type': 'Offer',
      price: unit.price,
      priceCurrency: unit.currency,
      availability: availabilityOf(unit.status),
    }
  }

  return ld
}
