/**
 * Read access to `listing_index` — the single read model behind cards, search,
 * the map and similar-properties (docs/06-search-map.md). Nothing user-facing
 * queries the `properties` or `project_units` tables directly.
 *
 * Search on /prona serves standalone properties only (`source = 'property'`).
 * That is a product decision, not a leftover: dropping 200 units of one project
 * into the general result set dilutes it. Units surface on their project page,
 * on their developer's company page, and at their own detail route. Revisit
 * once there is real project inventory to judge it against.
 *
 * The view has no `title` column — title is localized and lives in
 * `properties_locales`. Cards compose a heading from structured columns
 * instead; the detail page reads the real localized title from Payload.
 */
import { getPayload } from 'payload'
import config from '@/payload.config'
import { cacheLife } from 'next/cache'
import type {
  FilterValues,
  SortKey,
  UnitFilterValues,
  UnitSortKey,
} from '@/lib/search-params'

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
  // Unit-only. Null on every standalone property (docs/01 — what goes in the
  // view). `projectSlug` + `slug` are what build a unit's detail href.
  projectSlug: string | null
  projectName: string | null
  unitCode: string | null
  building: string | null
}

type Row = Record<string, unknown>

const num = (v: unknown): number | null => (v === null || v === undefined ? null : Number(v))
const numReq = (v: unknown): number => Number(v)
const str = (v: unknown): string | null => (v === null || v === undefined ? null : String(v))

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
  rentPeriod: str(r.rent_period),
  areaGross: numReq(r.area_gross),
  rooms: str(r.rooms),
  bedrooms: num(r.bedrooms),
  floor: num(r.floor),
  areaName: str(r.area_name),
  street: str(r.street),
  mortgageEligible: Boolean(r.mortgage_eligible),
  verified: Boolean(r.verified),
  projectSlug: str(r.project_slug),
  projectName: str(r.project_name),
  unitCode: str(r.unit_code),
  building: str(r.building),
})

/**
 * Where a listing card links. Units live under their project
 * (/projekte/[project]/[unit]); slugs are unique per collection, not globally,
 * so a unit and a property can share one — the nesting is what keeps them
 * apart. A unit row missing its project slug (impossible via the view's inner
 * join, but the type allows it) falls back to unlinked rather than to a 404.
 */
export const listingHref = (card: ListingCard, locale: string): string | null => {
  if (card.source === 'property') return `/${locale}/prona/${card.slug}`
  return card.projectSlug ? `/${locale}/projekte/${card.projectSlug}/${card.slug}` : null
}

// Columns every card needs. Deliberately omits `location` (PostGIS point —
// comes back as WKB and no card uses it). The map query below re-adds it as
// two scalar lng/lat columns via ST_X/ST_Y.
const CARD_COLUMNS = `
  source, source_id, slug, property_type, listing_type, status,
  price, currency, price_on_request, price_eur, price_per_sqm, rent_period,
  area_gross, rooms, bedrooms, floor, area_name, street, mortgage_eligible, verified,
  project_slug, project_name, unit_code, building
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

/** A card's cover photo. */
export interface CardThumb {
  url: string
  alt: string
}

/**
 * Cover thumbnails for a page of property cards, keyed by slug.
 *
 * The card DATA still comes from `listing_index` (rule 4). The cover image is a
 * presentational enrichment the view doesn't carry, so it's resolved here in
 * one batched read of the `properties` collection, keyed off the source ids the
 * view already returned. Uses the pre-generated `card` image size (800×600).
 * Units aren't covered — only standalone properties have galleries in v1.
 */
export const getCoverThumbnails = async (
  cards: ListingCard[],
): Promise<Map<string, CardThumb>> => {
  'use cache'
  cacheLife('content')
  const map = new Map<string, CardThumb>()
  const ids = cards.filter((c) => c.source === 'property').map((c) => c.sourceId)
  if (ids.length === 0) return map

  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'properties',
    where: { id: { in: ids } },
    depth: 1, // populate gallery[].image so the cover URL is available
    limit: ids.length,
    overrideAccess: false,
  })

  for (const p of docs) {
    const cover = p.gallery?.[0]?.image
    if (cover && typeof cover === 'object' && cover.url) {
      map.set(p.slug, {
        url: cover.sizes?.card?.url ?? cover.url,
        alt: cover.alt ?? p.title,
      })
    }
  }
  return map
}

/** A filterable facet: an area to narrow by, with the slug the URL carries. */
export interface AreaFacet {
  id: number
  slug: string
  name: string
}

export interface ListingFacets {
  areas: AreaFacet[]
  rooms: string[]
}

/**
 * The option lists the filter panel offers, derived from what is actually
 * published so the panel never shows a filter that returns nothing. Areas come
 * from the ids present in `listing_index`; their slugs (which the `zona` param
 * uses) are not in the view, so they are resolved from the `areas` collection.
 * Rooms are the distinct raw strings ("1+1", "2+1") standalone listings carry.
 */
export const getListingFacets = async (): Promise<ListingFacets> => {
  'use cache'
  cacheLife('content')
  const pool = await getPool()

  const [areaRows, roomRows] = await Promise.all([
    pool.query(
      `SELECT DISTINCT area_id, area_name
         FROM listing_index
        WHERE source = 'property' AND area_id IS NOT NULL
        ORDER BY area_name`,
    ),
    pool.query(
      `SELECT DISTINCT rooms
         FROM listing_index
        WHERE source = 'property' AND rooms IS NOT NULL
        ORDER BY rooms`,
    ),
  ])

  const areaIds = areaRows.rows.map((r) => numReq(r.area_id))
  const slugById = new Map<number, string>()
  if (areaIds.length > 0) {
    const payload = await getPayload({ config })
    const { docs } = await payload.find({
      collection: 'areas',
      where: { id: { in: areaIds } },
      limit: areaIds.length,
      depth: 0,
    })
    for (const a of docs) slugById.set(a.id, a.slug)
  }

  const areas: AreaFacet[] = areaRows.rows
    .map((r) => {
      const id = numReq(r.area_id)
      const slug = slugById.get(id)
      return slug ? { id, slug, name: String(r.area_name) } : null
    })
    .filter((a): a is AreaFacet => a !== null)

  return { areas, rooms: roomRows.rows.map((r) => String(r.rooms)) }
}

/** ORDER BY clause per sort key. Null price_per_sqm and price_eur sort last,
 *  never first (docs/06); every sort tiebreaks on source_id for a stable page. */
const ORDER_BY: Record<SortKey, string> = {
  newest: 'featured DESC, published_at DESC NULLS LAST, source_id DESC',
  'price-asc': 'price_eur ASC NULLS LAST, source_id DESC',
  'price-desc': 'price_eur DESC NULLS LAST, source_id DESC',
  'per-sqm': 'price_per_sqm ASC NULLS LAST, source_id DESC',
}

/**
 * Build the shared WHERE for a `listing_index` query from validated
 * `FilterValues`. Every clause is parameterized — no user string reaches the
 * SQL. `area` is a slug in the URL; the caller resolves it to `areaId` against
 * the facets (an unresolved slug yields no rows, the right answer for a bad
 * area). Price filters run on `price_eur`, size on `area_gross` — the same
 * columns the view sorts on, so mixed-currency ranges behave (docs/06).
 *
 * The list and the map share this builder so the map obeys exactly the same
 * active filters as the grid (docs/06). Each returns `clauses` and `params`;
 * the caller appends its own tail (LIMIT/OFFSET, or the bbox envelope) starting
 * at `params.length + 1`.
 */
const filterClauses = (
  filters: FilterValues,
  areaId: number | null,
): { clauses: string[]; params: unknown[] } => {
  const clauses: string[] = [`source = 'property'`]
  const params: unknown[] = []
  const add = (sql: string, value: unknown) => {
    params.push(value)
    clauses.push(sql.replace('$?', `$${params.length}`))
  }

  if (filters.propertyType) add('property_type = $?', filters.propertyType)
  if (areaId !== null) add('area_id = $?', areaId)
  if (filters.listingType) add('listing_type = $?', filters.listingType)
  if (filters.priceMin !== null) add('price_eur >= $?', filters.priceMin)
  if (filters.priceMax !== null) add('price_eur <= $?', filters.priceMax)
  if (filters.areaMin !== null) add('area_gross >= $?', filters.areaMin)
  if (filters.areaMax !== null) add('area_gross <= $?', filters.areaMax)
  if (filters.rooms) add('rooms = $?', filters.rooms)
  if (filters.mortgage) clauses.push('mortgage_eligible = TRUE')
  if (filters.status) add('status = $?', filters.status)

  return { clauses, params }
}

/**
 * One page of standalone properties matching `filters`, sorted per `filters.sort`.
 */
export const searchListings = async (
  filters: FilterValues,
  areaId: number | null,
  perPage: number,
): Promise<PropertyPage> => {
  const pool = await getPool()

  const { clauses, params } = filterClauses(filters, areaId)
  const where = clauses.join(' AND ')
  const offset = (filters.page - 1) * perPage

  const [rows, count] = await Promise.all([
    pool.query(
      `SELECT ${CARD_COLUMNS}
         FROM listing_index
        WHERE ${where}
        ORDER BY ${ORDER_BY[filters.sort]}
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, perPage, offset],
    ),
    pool.query(`SELECT COUNT(*)::int AS total FROM listing_index WHERE ${where}`, params),
  ])

  return { cards: rows.rows.map(toCard), total: Number(count.rows[0]?.total ?? 0) }
}

/** A listing placed on the map: the card data plus its point coordinates. */
export interface MapListing {
  card: ListingCard
  lng: number
  lat: number
}

/** [minLng, minLat, maxLng, maxLat] — the map viewport, west/south/east/north. */
export type Bbox = [number, number, number, number]

/**
 * Standalone properties whose point falls inside `bbox`, under the same active
 * `filters` as the list (docs/06 — filters drive the map, not just the grid).
 *
 * PostGIS does the spatial work: `location && ST_MakeEnvelope(...)` intersects
 * the point against the viewport rectangle using the GIST index — never fetch
 * every listing and filter client-side. The envelope carries no SRID argument
 * because Payload stores the `point` field as `geometry(Point)` with SRID 0
 * (see the initial migration); a 4326 envelope would raise a mixed-SRID error.
 *
 * Unclustered rendering stays cheap by capping the result; a viewport with more
 * points than `cap` still clusters correctly because clustering is by count in
 * a cell, and the cap only trims the long tail a user cannot distinguish at that
 * zoom. `location IS NOT NULL` guards the (currently required) point defensively.
 */
export const searchListingsInBounds = async (
  filters: FilterValues,
  areaId: number | null,
  bbox: Bbox,
  cap = 500,
): Promise<MapListing[]> => {
  const pool = await getPool()

  const { clauses, params } = filterClauses(filters, areaId)
  clauses.push('location IS NOT NULL')

  const i = params.length // params so far; envelope takes the next four
  params.push(bbox[0], bbox[1], bbox[2], bbox[3])
  clauses.push(`location && ST_MakeEnvelope($${i + 1}, $${i + 2}, $${i + 3}, $${i + 4})`)

  const where = clauses.join(' AND ')

  const { rows } = await pool.query(
    `SELECT ${CARD_COLUMNS}, ST_X(location) AS lng, ST_Y(location) AS lat
       FROM listing_index
      WHERE ${where}
      ORDER BY featured DESC, published_at DESC NULLS LAST, source_id DESC
      LIMIT $${params.length + 1}`,
    [...params, cap],
  )

  return rows.map((r) => ({ card: toCard(r), lng: Number(r.lng), lat: Number(r.lat) }))
}

/**
 * Available units for a company, across all of its published projects. Reads
 * the same `listing_index` read model as every other card surface (rule 4):
 * unit rows carry `company_id` from their project's developer. Only
 * `status = 'available'` — the company page advertises what a buyer can still
 * take (docs/04). Cheapest first, then newest.
 */
export const getCompanyUnits = async (companyId: number): Promise<ListingCard[]> => {
  'use cache'
  cacheLife('content')
  const pool = await getPool()
  const { rows } = await pool.query(
    `SELECT ${CARD_COLUMNS}
       FROM listing_index
      WHERE source = 'unit'
        AND company_id = $1
        AND status = 'available'
      ORDER BY price_eur ASC NULLS LAST, published_at DESC NULLS LAST, source_id DESC`,
    [companyId],
  )
  return rows.map(toCard)
}

/* -------------------------------------------------------------------------- */
/* Project units                                                              */
/* -------------------------------------------------------------------------- */

/** ORDER BY per unit-table sort key. Floor is the default reading order of a
 *  building; NULL floors and NULL prices sort last either way, and every sort
 *  tiebreaks on unit_code so equal floors keep a stable, human order. */
const UNIT_ORDER_BY: Record<UnitSortKey, string> = {
  'floor-asc': 'floor ASC NULLS LAST, unit_code ASC',
  'floor-desc': 'floor DESC NULLS LAST, unit_code ASC',
  'price-asc': 'price_eur ASC NULLS LAST, unit_code ASC',
  'price-desc': 'price_eur DESC NULLS LAST, unit_code ASC',
}

/**
 * Every published unit of one project, for the unit table (docs/03).
 *
 * Sold and reserved units are in the result set unless the visitor explicitly
 * filters them out. That is the point of the table: visible scarcity is what
 * makes the page persuasive, and the client asked for it (docs/03, docs/12). Do
 * not add a default `status = 'available'` clause here.
 */
export const getProjectUnits = async (
  projectId: number,
  filters: UnitFilterValues,
): Promise<ListingCard[]> => {
  'use cache'
  cacheLife('content')
  const pool = await getPool()

  const clauses = [`source = 'unit'`, 'project_id = $1']
  const params: unknown[] = [projectId]
  const add = (sql: string, value: unknown) => {
    params.push(value)
    clauses.push(sql.replace('$?', `$${params.length}`))
  }

  if (filters.status) add('status = $?', filters.status)
  if (filters.rooms) add('rooms = $?', filters.rooms)

  const { rows } = await pool.query(
    `SELECT ${CARD_COLUMNS}
       FROM listing_index
      WHERE ${clauses.join(' AND ')}
      ORDER BY ${UNIT_ORDER_BY[filters.sort]}`,
    params,
  )
  return rows.map(toCard)
}

/**
 * How many of a project's published units are still available, and the cheapest
 * asking price among them — the two numbers a project card leads with. Computed
 * from the view rather than from `unitTypesSummary` so the card never contradicts
 * the table below it.
 */
export interface ProjectUnitStats {
  total: number
  available: number
  priceFromEur: number | null
}

export const getProjectUnitStats = async (
  projectIds: number[],
): Promise<Map<number, ProjectUnitStats>> => {
  'use cache'
  cacheLife('content')
  const stats = new Map<number, ProjectUnitStats>()
  if (projectIds.length === 0) return stats

  const pool = await getPool()
  const { rows } = await pool.query(
    `SELECT project_id,
            COUNT(*)::int                                        AS total,
            COUNT(*) FILTER (WHERE status = 'available')::int    AS available,
            MIN(price_eur) FILTER (WHERE status = 'available')   AS price_from
       FROM listing_index
      WHERE source = 'unit' AND project_id = ANY($1)
      GROUP BY project_id`,
    [projectIds],
  )

  for (const r of rows) {
    stats.set(numReq(r.project_id), {
      total: numReq(r.total),
      available: numReq(r.available),
      priceFromEur: num(r.price_from),
    })
  }
  return stats
}

/** Distinct room strings among a project's published units — the only values
 *  the unit table's rooms filter offers, so it never lists an empty option. */
export const getProjectRooms = async (projectId: number): Promise<string[]> => {
  'use cache'
  cacheLife('content')
  const pool = await getPool()
  const { rows } = await pool.query(
    `SELECT DISTINCT rooms
       FROM listing_index
      WHERE source = 'unit' AND project_id = $1 AND rooms IS NOT NULL
      ORDER BY rooms`,
    [projectId],
  )
  return rows.map((r) => String(r.rooms))
}

/** Published unit slugs paired with their project slug — feeds the unit route's
 *  generateStaticParams. */
export const getUnitRoutes = async (): Promise<{ project: string; unit: string }[]> => {
  'use cache'
  cacheLife('content')
  const pool = await getPool()
  const { rows } = await pool.query(
    `SELECT project_slug, slug
       FROM listing_index
      WHERE source = 'unit' AND project_slug IS NOT NULL
      ORDER BY project_slug, slug`,
  )
  return rows.map((r) => ({ project: String(r.project_slug), unit: String(r.slug) }))
}

/** Distinct published property slugs — feeds generateStaticParams. */
export const getPropertySlugs = async (): Promise<string[]> => {
  'use cache'
  cacheLife('content')
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
  'use cache'
  cacheLife('content')
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
