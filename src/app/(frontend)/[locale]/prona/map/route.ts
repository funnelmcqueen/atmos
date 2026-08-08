import { isLocale } from '@/messages/sq'
import { parseSearchParams } from '@/lib/search-params'
import {
  searchListingsInBounds,
  getListingFacets,
  getCoverThumbnails,
  type Bbox,
} from '@/lib/listings'

/**
 * Bounding-box feed for the property map on /[locale]/prona.
 *
 * `GET /{locale}/prona/map?bbox=minLng,minLat,maxLng,maxLat&<filters>` returns a
 * GeoJSON FeatureCollection of the standalone properties inside the viewport
 * that also match the active filters. The map refetches this on pan/zoom
 * (debounced) — PostGIS does the spatial filtering with ST_MakeEnvelope, so the
 * client never receives listings outside the box (docs/06-search-map.md).
 *
 * The filter params are the same localized names the list reads, parsed by the
 * same `parseSearchParams`, so the map and the grid always agree on what is
 * being shown. Kept off `/api` on purpose: that prefix is Payload's catch-all.
 */

/** Parse `bbox=minLng,minLat,maxLng,maxLat` into a validated, sane rectangle. */
const parseBbox = (raw: string | null): Bbox | null => {
  if (!raw) return null
  const parts = raw.split(',').map(Number)
  if (parts.length !== 4 || parts.some((n) => !Number.isFinite(n))) return null
  const [minLng, minLat, maxLng, maxLat] = parts
  if (minLng > maxLng || minLat > maxLat) return null
  if (minLng < -180 || maxLng > 180 || minLat < -90 || maxLat > 90) return null
  return [minLng, minLat, maxLng, maxLat]
}

export const GET = async (
  request: Request,
  { params }: { params: Promise<{ locale: string }> },
): Promise<Response> => {
  const { locale } = await params
  if (!isLocale(locale)) return new Response(null, { status: 404 })

  const url = new URL(request.url)
  const bbox = parseBbox(url.searchParams.get('bbox'))
  if (!bbox) {
    return Response.json({ error: 'invalid or missing bbox' }, { status: 400 })
  }

  // Same localized filter params the list reads, so map and grid never diverge.
  const filters = parseSearchParams(locale, Object.fromEntries(url.searchParams))

  // `zona` is a slug in the URL; resolve it to an area id exactly as the page
  // does. A slug that matches nothing resolves to -1 → no rows, the right
  // answer for a stale or hand-typed area.
  const facets = await getListingFacets()
  const areaId = filters.area
    ? (facets.areas.find((a) => a.slug === filters.area)?.id ?? -1)
    : null

  const listings = await searchListingsInBounds(filters, areaId, bbox)
  const thumbs = await getCoverThumbnails(listings.map((l) => l.card))

  const features = listings.map((l) => ({
    type: 'Feature' as const,
    geometry: { type: 'Point' as const, coordinates: [l.lng, l.lat] },
    properties: {
      // Promoted for the marker colour expression (['get','listingType']); the
      // full card + thumbnail ride along for the popup, which reuses PropertyCard.
      listingType: l.card.listingType,
      card: l.card,
      thumbnail: thumbs.get(l.card.slug) ?? null,
    },
  }))

  return Response.json(
    { type: 'FeatureCollection', features },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
