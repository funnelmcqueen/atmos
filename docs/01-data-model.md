# Data model

Read this before touching any collection.

## Entities

```
Company --< Project --< ProjectUnit
                |
Area -----------+--< Property

ListingRequest   (private inbound, becomes a Property once approved)
Enquiry          (private inbound, attached to any listing)
Article          (editorial, optionally tagged to Area / Company / Project)
Media            (images, uploads)
User             (client | agent | admin)
```

## The one decision that matters

A standalone apartment for sale and unit 4B inside a new project are the **same
thing to a searcher**. Same filters, same map, same result grid, same card.

They are **different things to an owner**. A property has one owner and one
price. A unit belongs to a project, inherits its location and developer, and its
status changes as the building sells.

So: two source collections, one shared read model.

- `properties` — standalone listings
- `project_units` — units inside a project
- `listing_index` — a Postgres view unioning both, defined in `db/listing-index.sql`

Every search query, filter, map bounds query and result card reads
`listing_index`. Nothing user-facing queries the two source tables directly.

If you skip the view and query both tables separately, every filter gets written
twice and they will drift.

## Shared listing fields

These exist on both `properties` and `project_units` with identical names and
types, because the view depends on it:

| Field | Type | Localized | Notes |
| --- | --- | --- | --- |
| `title` | text | yes | |
| `description` | richText | yes | |
| `slug` | text | no | unique, generated from Albanian title |
| `propertyType` | select | no | apartment, villa, house, shop, office, warehouse, land |
| `price` | number | no | optional — see price on request below |
| `currency` | select | no | `EUR` or `ALL` |
| `priceOnRequest` | checkbox | no | "Çmimi me kërkesë" |
| `priceEur` | number | no | derived, sorting only, never displayed |
| `rentPeriod` | select | no | monthly, nightly — rent only |
| `areaGross` | number | no | required, drives price per m² |
| `areaNet` | number | no | |
| `terraceSqm` | number | no | veranda or terrace |
| `commonAreaSqm` | number | no | |
| `rooms` | text | no | `2+1`, `1+1+2`. Not required for land |
| `bedrooms`, `bathrooms` | number | no | for filtering |
| `floor` | number | no | hidden for land |
| `orientation` | select, hasMany | no | listings quote two or three |
| `buildingPhase` | select | no | brick, facade, finished, existing |
| `mortgageEligible` | checkbox | no | "Me hipotekë" — a primary filter here |
| `status` | select | no | `available`, `reserved`, `sold` |
| `listingType` | select | no | `sale`, `rent` |
| `area` | relationship to areas | no | properties only; units inherit from project |
| `location` | point | no | PostGIS, lng/lat |
| `gallery` | array of media | no | |
| `features` | select, hasMany | no | see `docs/02-properties.md` |

Properties additionally carry `street` and `landmark` as free text, because
listings here are advertised by street ("Rruga Bardhyl") and by reference point
("Pranë Rotondës"), not by neighbourhood alone.

## Three rules about price and area

**Price is optional.** Real listings say "Çmimi me kërkesë". If `price` is
required, those cannot be entered at all. Use `priceOnRequest` and let `price`
be null.

**Prices come in two currencies.** The same agency quotes €135,000 on one
listing and 47,000 Lek/month on the next. Store what was entered, and derive
`priceEur` on save so range filters and sorting work across both. Display always
uses the original.

**Price per m² divides by gross area.** The market quotes "1550 Euro/m2" against
the gross figure. Computing it from net produces a number the client will say is
wrong. Never store it — compute in the view.

## Naming

Collection slugs are plural: `properties`, `project-units`, `projects`,
`companies`, `areas`, `listing-requests`, `enquiries`, `articles`.
Field names are camelCase. Database tables are whatever Payload generates —
don't fight it.
