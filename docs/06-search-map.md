# Search, filters and map

## The read model

All search reads `listing_index`, the view defined in `db/listing-index.sql`.
It unions properties and project units and exposes one shape:

```
id, source ('property' | 'unit'), source_id, slug, property_type, listing_type,
status, price, currency, price_on_request, price_eur, rent_period,
area_gross, area_net, terrace_sqm, price_per_sqm, rooms, bedrooms, bathrooms,
floor, building_phase, mortgage_eligible, area_id, area_name, street, location,
project_id, project_name, project_slug, unit_code, building, company_id,
featured, verified, published_at, updated_at
```

`price_per_sqm` is computed in the view from `price_eur / area_gross`, and is
NULL when `price_on_request` is true. Sort those rows last, never first.

`project_slug`, `unit_code` and `building` are unit-only — NULL on every
property row. They are in the view because the project page's unit table is a
listing surface and reads it like every other one: it needs the unit code to
label a row and the project slug to build the `/projekte/[slug]/[unit]` href.

A column belongs in the view when a listing surface needs it to render a row.
Localized text never does — see below.

**Sort and filter on `price_eur`, display `price` + `currency`.** The client
quotes some listings in Lek and some in Euro. A range filter on the raw `price`
column would put a 47,000 Lek rental above a €450,000 villa.

Localized text is not in the view. The view answers "which listings match", then
Payload's Local API fetches the matching rows in the current locale for
rendering. Keep it that way — putting three languages in the view triples it.

## Filters

Property type, city, area, listing type, price min/max (against `price_eur`),
gross m2 min/max, rooms, bedrooms, floor, status, features, mortgage eligible,
building phase.

Property type comes first in the UI. An apartment buyer and a land buyer want
different filters, and showing a floor filter on land listings looks broken.

Land hides rooms, floor, bedrooms and orientation from both the filter panel and
the result card.

Every filter lives in the URL as a search param, so a filtered result set is
shareable and server-renderable. No filter state in React state.

```
/sq/prona?qytet=tirane&zona=bllok&cmimMin=100000&cmimMax=300000&dhoma=2%2B1
```

Param names are Albanian on the `sq` locale and English on `en`. Map them in one
place, `src/lib/search-params.ts`, not inline in components.

## Pagination

Server-side, 12 per page, offset-based. `?faqe=2`. Add `rel="next"` and
`rel="prev"`. Do not use infinite scroll on indexable pages.

## Map

MapLibre GL with MapTiler vector tiles. Not Google Maps — the pricing punishes
exactly the usage pattern this site has.

- Markers coloured by listing type, matching the badge colours in `tokens.css`
- Cluster below zoom 13
- Click a marker, open a compact card with photo, price, rooms, area, and a link
- The map queries by bounding box: pass `bbox` and let PostGIS do the work with
  `ST_MakeEnvelope`. Never fetch all listings and filter client-side.
- "Use my location" is a button on the map only, never automatic on page load

Map state (centre, zoom) also belongs in the URL.

## Performance rule

The listing grid is a server component. The map is a client component loaded
with `next/dynamic` and `ssr: false`. If MapLibre ends up in the main bundle,
something is wired wrong.
