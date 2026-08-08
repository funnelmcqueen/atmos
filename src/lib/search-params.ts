/**
 * The one place URL search params are mapped to and from filter state.
 *
 * Filters on /[locale]/prona live entirely in the URL (docs/06-search-map.md):
 * a filtered result set is shareable and server-renderable, and there is no
 * React state anywhere in the flow. Components never read raw params — they
 * call `parseSearchParams` to get a validated `FilterValues`, and build links
 * with `toSearchParams`.
 *
 * Param NAMES are localized (Albanian on `sq`, English on `en`); param VALUES
 * are the canonical enum tokens the database already stores (`tipi=apartment`,
 * not a translated word), because those facts are not localized (CLAUDE.md
 * rule 3). Area and rooms are the two value exceptions: area carries an area
 * slug, rooms the raw Albanian room string (`2+1`).
 */
import { type Locale } from '@/messages/sq'
import { PROPERTY_TYPES } from '@/fields/listing'

/** Sort options offered on the list. Values are stable, non-localized tokens. */
export const SORT_KEYS = ['newest', 'price-asc', 'price-desc', 'per-sqm'] as const
export type SortKey = (typeof SORT_KEYS)[number]
export const DEFAULT_SORT: SortKey = 'newest'

const LISTING_TYPES = ['sale', 'rent'] as const
const STATUSES = ['available', 'reserved', 'sold'] as const

/** The property type whose card and filter panel drop rooms, floor, etc. */
export const LAND_TYPE = 'land'

/** Parsed, validated filter state. Nulls mean "not filtered on". */
export interface FilterValues {
  propertyType: string | null
  area: string | null // area slug
  listingType: string | null
  priceMin: number | null // EUR, against price_eur
  priceMax: number | null
  areaMin: number | null // m², against area_gross
  areaMax: number | null
  rooms: string | null // raw string, e.g. "2+1"
  mortgage: boolean
  status: string | null
  sort: SortKey
  page: number
}

/** Canonical field keys, mapped to a localized param name per locale. */
type FieldKey =
  | 'propertyType'
  | 'area'
  | 'listingType'
  | 'priceMin'
  | 'priceMax'
  | 'areaMin'
  | 'areaMax'
  | 'rooms'
  | 'mortgage'
  | 'status'
  | 'sort'
  | 'page'

const PARAM_NAMES: Record<Locale, Record<FieldKey, string>> = {
  sq: {
    propertyType: 'tipi',
    area: 'zona',
    listingType: 'transaksioni',
    priceMin: 'cmimMin',
    priceMax: 'cmimMax',
    areaMin: 'sipMin',
    areaMax: 'sipMax',
    rooms: 'dhoma',
    mortgage: 'hipoteke',
    status: 'statusi',
    sort: 'rendit',
    page: 'faqe',
  },
  en: {
    propertyType: 'type',
    area: 'area',
    listingType: 'for',
    priceMin: 'priceMin',
    priceMax: 'priceMax',
    areaMin: 'sizeMin',
    areaMax: 'sizeMax',
    rooms: 'rooms',
    mortgage: 'mortgage',
    status: 'status',
    sort: 'sort',
    page: 'page',
  },
}

/** The localized query-param name for a field — used as the form field name. */
export const paramName = (locale: Locale, field: FieldKey): string => PARAM_NAMES[locale][field]

type RawParams = Record<string, string | string[] | undefined>

const first = (v: string | string[] | undefined): string | undefined =>
  (Array.isArray(v) ? v[0] : v)?.trim() || undefined

/** A non-negative integer, or null. Rejects floats, negatives and junk. */
const toPositiveInt = (raw: string | undefined): number | null => {
  if (raw === undefined) return null
  const n = Number(raw)
  return Number.isInteger(n) && n >= 0 ? n : null
}

const oneOf = <T extends string>(raw: string | undefined, allowed: readonly T[]): T | null =>
  raw !== undefined && (allowed as readonly string[]).includes(raw) ? (raw as T) : null

/**
 * Read the URL params for one locale into validated `FilterValues`. Unknown or
 * malformed values fall back to null (or the default for sort/page), so a
 * hand-edited or stale URL degrades gracefully instead of throwing.
 */
export const parseSearchParams = (locale: Locale, raw: RawParams): FilterValues => {
  const get = (field: FieldKey) => first(raw[paramName(locale, field)])

  return {
    propertyType: oneOf(get('propertyType'), PROPERTY_TYPES),
    area: get('area') ?? null,
    listingType: oneOf(get('listingType'), LISTING_TYPES),
    priceMin: toPositiveInt(get('priceMin')),
    priceMax: toPositiveInt(get('priceMax')),
    areaMin: toPositiveInt(get('areaMin')),
    areaMax: toPositiveInt(get('areaMax')),
    rooms: get('rooms') ?? null,
    mortgage: get('mortgage') === '1',
    status: oneOf(get('status'), STATUSES),
    sort: oneOf(get('sort'), SORT_KEYS) ?? DEFAULT_SORT,
    page: Math.max(1, toPositiveInt(get('page')) ?? 1),
  }
}

/**
 * True when the URL narrows or reorders the result set. Filtered pages get
 * `noindex, follow`; plain pagination (only `faqe`) on an otherwise-clean URL
 * stays indexable (docs/06). A non-default sort counts as filtered so the same
 * listings under a different order are not indexed as duplicate pages.
 */
export const hasActiveFilters = (v: FilterValues): boolean =>
  v.propertyType !== null ||
  v.area !== null ||
  v.listingType !== null ||
  v.priceMin !== null ||
  v.priceMax !== null ||
  v.areaMin !== null ||
  v.areaMax !== null ||
  v.rooms !== null ||
  v.mortgage ||
  v.status !== null ||
  v.sort !== DEFAULT_SORT

/**
 * Serialize filter state back to localized params. Only active values are
 * emitted, so URLs stay clean. `includePage` is false for the filter form and
 * pagination base (page is added per-link); the mortgage flag only appears when
 * on, and sort only when non-default.
 */
export const toSearchParams = (
  locale: Locale,
  v: FilterValues,
  opts: { includePage?: boolean } = {},
): URLSearchParams => {
  const sp = new URLSearchParams()
  const set = (field: FieldKey, value: string) => sp.set(paramName(locale, field), value)

  if (v.propertyType) set('propertyType', v.propertyType)
  if (v.area) set('area', v.area)
  if (v.listingType) set('listingType', v.listingType)
  if (v.priceMin !== null) set('priceMin', String(v.priceMin))
  if (v.priceMax !== null) set('priceMax', String(v.priceMax))
  if (v.areaMin !== null) set('areaMin', String(v.areaMin))
  if (v.areaMax !== null) set('areaMax', String(v.areaMax))
  if (v.rooms) set('rooms', v.rooms)
  if (v.mortgage) set('mortgage', '1')
  if (v.status) set('status', v.status)
  if (v.sort !== DEFAULT_SORT) set('sort', v.sort)
  if (opts.includePage && v.page > 1) set('page', String(v.page))

  return sp
}

/* --- Unit table (project page) -------------------------------------------- */

/**
 * The unit table on /[locale]/projekte/[slug] sorts and filters through the URL
 * on the same terms as the property search: a `<form method="get">` and plain
 * links, no client JS, so a sorted or filtered table is shareable and
 * server-rendered.
 *
 * It is deliberately a separate shape from `FilterValues` rather than a reuse
 * of it. The table sorts by FLOOR, which property search does not offer, and it
 * filters on only two things (status, rooms) because everything else — area,
 * type, developer — is fixed by the project the visitor is already looking at.
 * Folding it into the search filters would mean a dozen fields that can never
 * apply here, and a sort union where half the options are wrong on each page.
 */
export const UNIT_SORT_KEYS = ['floor-asc', 'floor-desc', 'price-asc', 'price-desc'] as const
export type UnitSortKey = (typeof UNIT_SORT_KEYS)[number]

/** Floor ascending — a building read from the ground up (docs/03). */
export const DEFAULT_UNIT_SORT: UnitSortKey = 'floor-asc'

export interface UnitFilterValues {
  status: string | null
  rooms: string | null // raw string, e.g. "2+1"
  sort: UnitSortKey
}

type UnitFieldKey = 'status' | 'rooms' | 'sort'

const UNIT_PARAM_NAMES: Record<Locale, Record<UnitFieldKey, string>> = {
  sq: { status: 'statusi', rooms: 'dhoma', sort: 'rendit' },
  en: { status: 'status', rooms: 'rooms', sort: 'sort' },
}

/** The localized query-param name for a unit-table field. */
export const unitParamName = (locale: Locale, field: UnitFieldKey): string =>
  UNIT_PARAM_NAMES[locale][field]

export const parseUnitParams = (locale: Locale, raw: RawParams): UnitFilterValues => {
  const get = (field: UnitFieldKey) => first(raw[unitParamName(locale, field)])

  return {
    status: oneOf(get('status'), STATUSES),
    rooms: get('rooms') ?? null,
    sort: oneOf(get('sort'), UNIT_SORT_KEYS) ?? DEFAULT_UNIT_SORT,
  }
}

/**
 * Serialize unit-table state back to localized params, emitting only what is
 * active so the default view of a project page is a bare, canonical URL.
 * `override` swaps one field — the sortable column headers are links built with
 * it, which is why this returns the full param string rather than mutating.
 */
export const toUnitParams = (
  locale: Locale,
  v: UnitFilterValues,
  override: Partial<UnitFilterValues> = {},
): URLSearchParams => {
  const merged = { ...v, ...override }
  const sp = new URLSearchParams()

  if (merged.status) sp.set(unitParamName(locale, 'status'), merged.status)
  if (merged.rooms) sp.set(unitParamName(locale, 'rooms'), merged.rooms)
  if (merged.sort !== DEFAULT_UNIT_SORT) sp.set(unitParamName(locale, 'sort'), merged.sort)

  return sp
}

/**
 * True when the table is narrowed or re-sorted. The project page itself stays
 * indexable either way — unlike a search result set, a sorted unit table is the
 * same page with the same content, not a thin near-duplicate permutation of a
 * catalogue. This drives the "clear" affordance, not robots.
 */
export const hasActiveUnitFilters = (v: UnitFilterValues): boolean =>
  v.status !== null || v.rooms !== null || v.sort !== DEFAULT_UNIT_SORT

/* --- Map view state ------------------------------------------------------- */

/**
 * The map's centre and zoom also live in the URL (docs/06), so a panned map is
 * shareable and restores on reload. These are view state, not filters: they are
 * deliberately NOT part of `FilterValues` and NOT counted by `hasActiveFilters`,
 * so panning the map never flips the page to `noindex`. The map writes them
 * client-side with `history.replaceState`, so a pan never re-runs the server
 * list or resets pagination — only filters do that.
 */
export interface MapState {
  center: [number, number] | null // [lng, lat]
  zoom: number | null
}

const MAP_PARAM_NAMES: Record<Locale, { center: string; zoom: string }> = {
  sq: { center: 'qendra', zoom: 'zoom' },
  en: { center: 'center', zoom: 'zoom' },
}

/** The localized query-param name for a map view-state field. */
export const mapParamName = (locale: Locale, field: 'center' | 'zoom'): string =>
  MAP_PARAM_NAMES[locale][field]

const toFiniteNumber = (raw: string | undefined): number | null => {
  if (raw === undefined) return null
  const n = Number(raw)
  return Number.isFinite(n) ? n : null
}

/** Read the map's centre (`lng,lat`) and zoom from the URL, or nulls if absent
 *  or malformed — the map then falls back to its default view. */
export const parseMapState = (locale: Locale, raw: RawParams): MapState => {
  const centerRaw = first(raw[mapParamName(locale, 'center')])
  const [lngRaw, latRaw] = (centerRaw ?? '').split(',')
  const lng = toFiniteNumber(lngRaw)
  const lat = toFiniteNumber(latRaw)
  const zoom = toFiniteNumber(first(raw[mapParamName(locale, 'zoom')]))

  return {
    center: lng !== null && lat !== null ? [lng, lat] : null,
    zoom,
  }
}

/**
 * Write map view state into an existing `URLSearchParams`, mutating it in place
 * and leaving every other param (the active filters) untouched. The map calls
 * this before `replaceState` so the two map params are the only thing a pan
 * changes in the URL.
 */
export const setMapState = (locale: Locale, params: URLSearchParams, state: MapState): void => {
  if (state.center) {
    const [lng, lat] = state.center
    params.set(mapParamName(locale, 'center'), `${lng.toFixed(5)},${lat.toFixed(5)}`)
  }
  if (state.zoom !== null) params.set(mapParamName(locale, 'zoom'), state.zoom.toFixed(2))
}
