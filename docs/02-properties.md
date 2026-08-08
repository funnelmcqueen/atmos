# Properties

Standalone listings for sale or long-term rent, created by Atmos staff after
verifying an owner's submission.

## Fields beyond the shared set

See `docs/01-data-model.md` for the shared listing fields. Properties add:

- `reference` — internal code, e.g. `ATM-2026-0142`, shown on the detail page
- `agent` — relationship to a user with role `agent`
- `ownerName`, `ownerPhone` — **private**, never exposed by the public API
- `documentationNote` — short admin text about ownership papers, public
- `verified` — checkbox, drives the "Pronë e verifikuar" badge
- `featured` — checkbox, controls homepage placement
- `publishedAt` — date, set on first publish, used for "new" sorting
- `street`, `landmark` — free text, how listings are actually advertised

## Land listings

`propertyType: 'land'` hides rooms, floor, bedrooms, bathrooms and orientation
in the admin, and `rooms` stops being required. The detail page must not render
an empty layout block for them.

## Features list

Fixed options, not free text, because they are filter facets:

`parking`, `elevator`, `balcony`, `terrace`, `garden`, `pool`, `furnished`,
`seaView`, `cityView`, `lakeView`, `heating`, `airConditioning`, `security`,
`storage`, `streetFront`

Add options only by editing the collection — never let editors type their own.

## Detail page

Route: `/[locale]/prona/[slug]`

Above the fold: gallery, title, street and area, price, price per m2, status
badge, verified badge, mortgage badge when eligible, enquiry buttons (form,
WhatsApp, request a call).

When `priceOnRequest` is set, show "Çmimi me kërkesë" and no price per m2.

Below: description, feature grid, map with a single marker, agent card,
documentation note, publish and update dates, similar properties (same area,
same listing type, price within 25%, limit 4).

Owner contact fields must not appear in any public query. Set field-level
`access.read` to admin/agent only — do not rely on remembering to omit them.

## Structured data

Emit `RealEstateListing` JSON-LD with name, description, image, price,
priceCurrency, floorSize, numberOfRooms, and address using the area name and
`Tiranë, AL`. Canonical URL is the current locale's URL. See `docs/09-seo.md`.
