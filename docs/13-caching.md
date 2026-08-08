# Caching and rendering

Read this before adding a page, a read function, or anything that touches how a
route renders.

## The one thing to know

**`cacheComponents` is on, app-wide** (`next.config.ts`). Every route is a
prerendered static shell with the request-dependent parts streamed in behind
`<Suspense>`. `next build` reports this as `◐ (Partial Prerender)`.

The trade: **every uncached data read must be explicit.** It either sits behind
`'use cache'` or inside a Suspense boundary, or the build fails with
`Uncached data was accessed outside of <Suspense>`. That error is the feature
working, not a problem to route around. It makes "is this page static?" something
the compiler answers instead of something you infer from the route table.

## Do not add `export const revalidate`

It is **disallowed** under `cacheComponents` and fails the build:

```
Route segment config "revalidate" is not compatible with `nextConfig.cacheComponents`.
```

The one-hour ISR window docs/09 asks for did not go away — it moved onto a named
cache profile that the read functions declare. If you are reaching for
`revalidate` on a page, what you want is `cacheLife` on the read.

The same applies to reintroducing it "just for one page". There is no per-page
opt-out; the flag is global.

## The cache profiles

Defined in `next.config.ts` under `cacheLife`.

| Profile | stale | revalidate | expire | For |
| --- | --- | --- | --- | --- |
| `content` | 5 min | 1 hour | 1 year | Every public read of published content |

`expire` is deliberately long. If Neon is unreachable, the site keeps serving the
last good render rather than failing — property listings do not go stale in a way
that hurts anyone. `revalidate` is the number that matters and it matches
docs/09.

One profile is enough today. Add a second only when some read genuinely needs a
different window, and say here what it is for.

## How a read opts in

```ts
export const getProjectDetail = async (slug: string, locale: Locale) => {
  'use cache'
  cacheLife('content')
  // …
}
```

`cacheLife` comes from `next/cache`. Arguments and return values must be
serializable — these functions take strings and numbers and return plain
objects, arrays and `Map`s, all of which are fine.

## What is cached, and what is not

19 read functions across `lib/` carry `'use cache'` + `cacheLife('content')`:

- `lib/listings.ts` — `getCoverThumbnails`, `getListingFacets`,
  `getCompanyUnits`, `getProjectUnits`, `getProjectUnitStats`,
  `getProjectRooms`, `getUnitRoutes`, `getPropertySlugs`, `getSimilarProperties`
- `lib/projects.ts` — `getProjectList`, `getProjectSlugs`,
  `getCompanyProjectCards`, `getProjectDetail`, `getUnitDetail`
- `lib/companies.ts` — `getCompanyList`, `getCompanySlugs`, `getCompanyProfile`,
  `getCompanyArticles`
- `lib/property-detail.ts` — `getPropertyDetail`

**Two reads are deliberately uncached**, both in `lib/listings.ts`:

- **`searchListings`** — the /prona result set. Its cache key would be the full
  filter combination: property type × area × listing type × four numeric ranges ×
  rooms × mortgage × status × sort × page. That is a combinatorial space no cache
  can usefully hold, and every entry would be written once and read never. It
  already runs inside a Suspense boundary, which is the right tool for it.
- **`searchListingsInBounds`** — the map's bbox query, called from the
  `/prona/map` route handler. Same reasoning, worse: the key is a floating-point
  viewport rectangle that changes on every pan.

If you add a read whose arguments come from the URL rather than from an entity's
identity, it probably belongs in this list too.

## Awaiting `params` is a read

A route with a dynamic segment and no `generateStaticParams` cannot prerender at
all, because `await params` is itself request data. This bit the paramless
`[locale]` index routes, which had nothing else dynamic about them.

**Every page under `[locale]` needs `generateStaticParams`.** For index pages it
is just the locale list:

```ts
export async function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }))
}
```

For entity pages it is the locale plus the published slugs, as it always was.

## Where the dynamic holes are

Only three places in the app read the request, and each is behind Suspense:

| Route | The hole | Why |
| --- | --- | --- |
| `/[locale]/projekte/[slug]` | `FilteredUnitTable` | Unit table sort + filter live in the query string |
| `/[locale]/prona` | `Results` | The entire result set is derived from filters |
| `/` | `Greeting` | `payload.auth()` reads the request's cookies |

On the project page this split is load-bearing for SEO: the shell carries the
`Residence` + `Offer` structured data built from the **unfiltered** unit set, so
a crawler sees the whole development regardless of how the table is sorted. Keep
request-independent content in the shell, and never build structured data from
the filtered view.

## The gate

`pnpm check:routes` builds the app, parses the route table, and fails if any
route renders differently from what `scripts/route-modes.ts` declares. It runs
alongside `typecheck` and `lint` in the definition of done.

**Adding a page means adding a line to `scripts/route-modes.ts`.** That is the
only place the expectations live. The check fails in both directions — an
undeclared route and a declared route that no longer exists both go red — so the
list cannot drift out of date.

If a page you expected to be `ppr` reports `dynamic`, fix the page. Changing the
expectation to match is the one thing that defeats the point.

Its limits are worth knowing: the compiler already rejects `revalidate` exports,
`dynamic` exports and uncached reads outside Suspense, so this gate mostly guards
against unreviewed new routes and against a Next upgrade quietly changing how an
existing route renders. It checks the *mode*, not the quality of the shell — a
page wrapped almost entirely in `<Suspense>` still reports `ppr` while
prerendering almost nothing. When you change a page's boundaries, look at what
actually landed in `.next/server/app/**.html`.

## Rules of thumb

- A page's shell should render without knowing anything about the request.
- If content depends on `searchParams`, `cookies()` or `headers()`, put it in its
  own async component and wrap it in `<Suspense>` — pass the *promise* down
  rather than awaiting it in the parent, or the parent stops being static.
- Give every boundary a fallback that reserves roughly the right height, so the
  shell does not reflow when the hole resolves.
- Reads keyed by entity identity get `'use cache'`. Reads keyed by user input do
  not.
