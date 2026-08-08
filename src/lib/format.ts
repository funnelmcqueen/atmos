/**
 * Factual formatting — price, area, price per m², dates.
 *
 * The client's market reads European number format regardless of interface
 * language (docs/07-i18n.md), so grouping is the same in every locale. Prices
 * display in the currency as entered; only price per m² is normalised to EUR,
 * mirroring the ROUND(price_eur / area_gross) formula in db/listing-index.sql.
 */
import type { Locale } from '@/messages/sq'

const THIN_SPACE = ' '

const grouped = (n: number): string =>
  Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, THIN_SPACE)

/** `€250 000` / `250 000 Lek`, currency as entered. */
export const formatPrice = (price: number, currency: 'EUR' | 'ALL'): string =>
  currency === 'EUR' ? `€${grouped(price)}` : `${grouped(price)}${THIN_SPACE}Lek`

/** `€1 550 /m²` from an already-computed EUR-per-m² value (the view's column). */
export const formatPerSqm = (valueEur: number): string =>
  `€${grouped(valueEur)}${THIN_SPACE}/m²`

/**
 * Price per m² in EUR, computed off gross area — same math as the view.
 * Returns null for rent, price-on-request, or missing inputs (no €/m² shown).
 */
export const pricePerSqm = (
  priceEur: number | null | undefined,
  areaGross: number | null | undefined,
  listingType: string,
  priceOnRequest?: boolean | null,
): string | null => {
  if (listingType !== 'sale' || priceOnRequest) return null
  if (typeof priceEur !== 'number' || typeof areaGross !== 'number' || areaGross <= 0) return null
  return formatPerSqm(priceEur / areaGross)
}

/** `150.5 m²` — one decimal only when it carries information. */
export const formatArea = (sqm: number): string => {
  const rounded = Math.round(sqm * 10) / 10
  const text = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1)
  return `${text}${THIN_SPACE}m²`
}

export const formatDate = (iso: string, locale: Locale): string =>
  new Intl.DateTimeFormat(locale === 'sq' ? 'sq-AL' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(iso))
