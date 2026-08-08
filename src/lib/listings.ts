/**
 * Read access to `listing_index` — the single read model behind cards, search,
 * the map and similar-properties (docs/06-search-map.md). Nothing user-facing
 * queries the `properties` or `project_units` tables directly.
 *
 * This slice serves standalone properties only (`source = 'property'`): unit
 * detail pages don't exist until the projects slice, so every card here links
 * to /prona/[slug]. Drop the source filter once units have a detail route.
 *
 * The view has no `title` column — title is localized and lives in
 * `properties_locales`. Cards compose a heading from structured columns
 * instead; the detail page reads the real localized title from Payload.
 */
import { getPayload } from 'payload'
import config from '@/payload.config'

/** One card's worth of a listing, camelCased from the view's snake_case. */
export interface ListingCard {
  source: 'property' | 'unit'
  sourceId: number
  slug: string
  propertyType: string
  listingType: string
  status: string
  price: number | null
  currency: 'EUR' | 'ALL' | null
  priceOnRequest: boolean
  priceEur: number | null
  pricePerSqm: number | null
  rentPeriod: string | null
  areaGross: number
  rooms: string | null
  bedrooms: number | null
  floor: number | null
  areaName: string | null
  street: string | null
  mortgageEligible: boolean
  verified: boolean
}

type Row = Record<string, unknown>

const num = (v: unknown): number | null => (v === null || v === undefined ? null : Number(v))
const numReq = (v: unknown): number => Number(v)

const toCard = (r: Row): ListingCard => ({
  source: r.source as ListingCard['source'],
  sourceId: numReq(r.source_id),
  slug: String(r.slug),
  propertyType: String(r.property_type),
  listingType: String(r.listing_type),
  status: String(r.status),
  price: num(r.price),
  currency: (r.currency as ListingCard['currency']) ?? null,
  priceOnRequest: Boolean(r.price_on_request),
  priceEur: num(r.price_eur),
  pricePerSqm: num(r.price_per_sqm),
  rentPeriod: r.rent_period === null || r.rent_period === undefined ? null : String(r.rent_period),
  areaGross: numReq(r.area_gross),
  rooms: r.rooms === null || r.rooms === undefined ? null : String(r.rooms),
  bedrooms: num(r.bedrooms),
  floor: num(r.floor),
  areaName: r.area_name === null || r.area_name === undefined ? null : String(r.area_name),
  street: r.street === null || r.street === undefined ? null : String(r.street),
  mortgageEligible: Boolean(r.mortgage_eligible),
  verified: Boolean(r.verified),
})

// Columns every card needs. Deliberately omits `location` (PostGIS point —
// comes back as WKB and no card uses it).
const CARD_COLUMNS = `
  source, source_id, slug, property_type, listing_type, status,
  price, currency, price_on_request, price_eur, price_per_sqm, rent_period,
  area_gross, rooms, bedrooms, floor, area_name, street, mortgage_eligible, verified
`

type Pool = { query: (text: string, params?: unknown[]) => Promise<{ rows: Row[] }> }

const getPool = async (): Promise<Pool> => {
  const payload = await getPayload({ config })
  return payload.db.pool as Pool
}

export interface PropertyPage {
  cards: ListingCard[]
  total: number
}

/** One page of standalone properties: featured first, then newest. */
export const getPropertyPage = async (page: number, perPage: number): Promise<PropertyPage> => {
  const pool = await getPool()
  const offset = (page - 1) * perPage

  const [rows, count] = await Promise.all([
    pool.query(
      `SELECT ${CARD_COLUMNS}
         FROM listing_index
        WHERE source = 'property'
        ORDER BY featured DESC, published_at DESC NULLS LAST, source_id DESC
        LIMIT $1 OFFSET $2`,
      [perPage, offset],
    ),
    pool.query(`SELECT COUNT(*)::int AS total FROM listing_index WHERE source = 'property'`),
  ])

  return { cards: rows.rows.map(toCard), total: Number(count.rows[0]?.total ?? 0) }
}

/** Distinct published property slugs — feeds generateStaticParams. */
export const getPropertySlugs = async (): Promise<string[]> => {
  const pool = await getPool()
  const { rows } = await pool.query(
    `SELECT slug FROM listing_index WHERE source = 'property' ORDER BY slug`,
  )
  return rows.map((r) => String(r.slug))
}

/**
 * Similar properties: same area, same listing type, price within ±25%,
 * limit 4 (docs/02-properties.md). Price-on-request listings have no priceEur
 * to band on, so they fall back to same area + listing type.
 */
export const getSimilarProperties = async (args: {
  areaId: number
  listingType: string
  priceEur: number | null
  excludeSlug: string
}): Promise<ListingCard[]> => {
  const pool = await getPool()
  const { areaId, listingType, priceEur, excludeSlug } = args

  if (typeof priceEur === 'number') {
    const { rows } = await pool.query(
      `SELECT ${CARD_COLUMNS}
         FROM listing_index
        WHERE source = 'property'
          AND area_id = $1
          AND listing_type = $2
          AND slug <> $3
          AND price_eur BETWEEN $4 * 0.75 AND $4 * 1.25
        ORDER BY ABS(price_eur - $4) ASC
        LIMIT 4`,
      [areaId, listingType, excludeSlug, priceEur],
    )
    return rows.map(toCard)
  }

  const { rows } = await pool.query(
    `SELECT ${CARD_COLUMNS}
       FROM listing_index
      WHERE source = 'property'
        AND area_id = $1
        AND listing_type = $2
        AND slug <> $3
      ORDER BY published_at DESC NULLS LAST
      LIMIT 4`,
    [areaId, listingType, excludeSlug],
  )
  return rows.map(toCard)
}
