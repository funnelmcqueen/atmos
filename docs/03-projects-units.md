# Projects and units

A project is a new-build development. Units are the sellable apartments in it.

## Project fields

- `name` — not localized, it's a proper name ("Orbital 3 Residence")
- `tagline`, `description` — localized
- `slug`, `developer` (relationship to companies), `area`, `location` (point)
- `constructionPhase` — `planning`, `underConstruction`, `completed`
- `completionDate` — date, quarter precision is fine
- `gallery`, `sitePlan` (media), `brochure` (media, optional)
- `unitTypesSummary` — array of `{ rooms, areaFrom, areaTo, priceFrom }`,
  denormalized so the project card doesn't aggregate units on every render
- `featured`, `publishedAt`

## Unit fields

The shared listing fields from `docs/01-data-model.md`, plus:

- `project` — relationship to projects, required
- `unitCode` — e.g. `B-12-4`
- `building` — text, optional, for multi-building projects
- `floorPlan` — media

A unit **inherits** `area`, `location` and `developer` from its project. Do not
duplicate those fields on the unit. The `listing_index` view resolves them with
a join.

`listingType` on a unit is always `sale` in v1.

## Project page

Route: `/[locale]/projekte/[slug]`

Gallery, developer card linking to the company page, construction phase and
completion date, description, site plan, map, and the unit table.

The unit table is the important part: floor, unit code, rooms, area, price,
price per m2, status. Sortable by floor and price, filterable by status and
rooms. Sold units stay visible with a `sold` badge — that visible scarcity is
what makes the page persuasive, and the client asked for it (§12).

## Status changes

When a unit's status changes to `reserved` or `sold`, that is a normal edit and
goes through the same draft/publish flow as anything else. Do not add a
side-channel API for status updates in v1.
