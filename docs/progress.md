# Progress

- **Built:** Database schema (initial Payload migration), the `listing_index` view + indexes as a custom migration, and a working Albanian seed. `pnpm typecheck` is clean.
- **Broke:** Bootstrap had four blockers — a missing `@payloadcms/storage-vercel-blob` dep, a `status`/`_status` enum-name collision (fixed via `dbName: 'listing_status'`), per-collection enums that can't UNION (cast to `::text`), and a seed with no owning agent. `price_per_sqm` now returns NULL for rent listings so it stays a sale-only metric.
- **Next:** Build the first vertical slice — properties list + detail pages reading from `listing_index`, with SEO metadata and a smoke test (no public pages exist yet).

---

## Properties slice — 8 Aug 2026

- **Built:** The properties vertical slice end to end (Albanian only). `/[locale]/prona` — server-rendered list off `listing_index` (`source='property'`), 12 per page, `?faqe=` offset pagination. `/[locale]/prona/[slug]` — detail per `docs/02` with `generateStaticParams` + ISR. Reusable `PropertyCard` (composed titles, since the view has no localized `title`), plus `StatusBadge`, `Badge`, `Pagination`, `PropertyGallery`, `PropertySpecs`, `FeatureGrid`, `AgentCard`, `LocationPanel`, `JsonLd`. Supporting modules: `messages/sq.ts` (UI copy + enum→label maps), `lib/format.ts` (European price/area/date), `lib/listings.ts` (parameterized `listing_index` reads: page, slugs, similar), `lib/property-detail.ts` (single-property fetch), `lib/seo.ts` (canonical/hreflang + RealEstateListing/BreadcrumbList JSON-LD). Styling entirely from `tokens.css` via `styles/frontend.css`. State handling verified: land omits the layout block, price-on-request → "Çmimi me kërkesë" (no €/m²), rent → "/muaj", sold/reserved keep a badge and stay visible. Owner fields stripped and drafts 404 via `overrideAccess:false`. Three Playwright smoke tests (list, detail, draft-404); seed gains one draft fixture. `typecheck`, `lint`, `test:e2e` (7/7) all green.
- **Broke:** Three pre-existing toolchain issues surfaced running the DoD gates, none caused by this slice. (1) `pnpm lint` — the FlatCompat `eslint.config.mjs` crashes under ESLint 9.39 with eslint-config-next 16; rewrote to spread the v16 flat configs directly, removing the `@eslint/eslintrc` bridge. (2) `pnpm test:e2e` — Playwright's `chromium` channel launches the branded Chrome-for-Testing binary, which fails on this machine (`spawn UNKNOWN` → side-by-side/VC++ runtime missing); switched to Playwright's bundled Chromium. (3) admin e2e login never hydrated — the admin `importMap.js` was stale (missing the vercel-blob upload handler); regenerated with `payload generate:importmap`. One-time: installed the Playwright Chromium browser locally.
- **Next:** Projects + units slice — units get their own detail route, then drop the `source='property'` filter on `/prona` so the shared grid shows both sources. Then the search/filters/map slice (MapLibre — the detail `LocationPanel` is a placeholder for it), `next-intl` wiring for the `en` locale, and the enquiry flow (the `AgentCard` "Dërgo kërkesë" is a mailto stub until the Enquiries collection lands).

---

## Search + filters slice — 8 Aug 2026

- **Built:** URL-driven search and filters on `/[locale]/prona` (no map this session — that stays for the MapLibre slice). All filter state lives in the search params, so a result set is shareable and there is no React state anywhere: names are Albanian on `sq` (`tipi`, `zona`, `transaksioni`, `cmimMin/Max`, `sipMin/Max`, `dhoma`, `hipoteke`, `statusi`, `rendit`, `faqe`) and English on `en`, while values stay the canonical enum tokens (area = slug, rooms = raw string). One mapping file, `lib/search-params.ts` (`parseSearchParams` / `toSearchParams` / `hasActiveFilters`), validates against the real enums so a stale URL degrades gracefully. Filters: property type (first — it decides which others apply), area, listing type, price min/max (on `price_eur`), gross m² min/max, rooms, mortgage, status; land drops rooms from the panel. Sort: newest, price ↑/↓, price per m² — all `NULLS LAST`, so price-on-request rows sort last, never first. `FilterPanel` is a pure `<form method="get">` server component (no client JS). `lib/listings.ts` gains `searchListings` (parameterized WHERE + matching COUNT, still `source='property'`) and `getListingFacets` (published areas + distinct rooms); `getPropertyPage` removed as subsumed. `Pagination` now re-appends the active filters to every page link. Filtered or re-sorted pages emit `noindex, follow`; the clean `/prona` stays indexable. Styling entirely from `tokens.css`. The seed gains 8 real apartments imported from `scripts/harvest/inventory.json` (real price/size/rooms/floor/street, bucketed under existing seeded areas so no coordinates are invented) → 16 published properties / 13 apartments, enough for `?tipi=apartment` to paginate. Four Playwright specs (filtered subset, empty state, pagination-preserves-filters, noindex). `typecheck`, `lint`, `test:e2e` (14/14) all green.
- **Broke:** Nothing new — the DoD gates passed first time, no toolchain surprises this slice.
- **Next:** Projects + units slice (units get a detail route; then drop the `source='property'` filter so the grid shows both sources), then the MapLibre map layer for `/prona` (bbox queries via `ST_MakeEnvelope`, marker cards — the `LocationPanel` placeholder), `next-intl` for the `en` locale, and the enquiry flow.

---

## Projects + units slice — 8 Aug 2026

- **Built:** The projects and units slice end to end. `/[locale]/projekte` — prerendered index of `ProjectCard`s (SSG + 1h ISR; a `generateStaticParams` over `LOCALES` is what gets a paramless `[locale]` route prerendered at all). `/[locale]/projekte/[slug]` — project page per docs/03: gallery, developer card linking to the profile, phase + completion, description, site plan, brochure, map, and the unit table. `/[locale]/projekte/[slug]/[unit]` — nested unit detail (SSG + ISR), nested because slugs are unique per collection, not globally, so a flat route could collide a unit with a property; the read verifies the unit really belongs to the project in the URL, so a cross-project address 404s instead of rendering under the wrong development. **The unit table** is the centre of it: floor, unit code, rooms, area, price, €/m², status; sortable by floor and price via header links, filterable by status and rooms via a `<form method="get">`, all state in the URL, zero client JS. **Sold and reserved units are never filtered out by default** — they stay listed, muted, unlinked, with their badge (docs/03, docs/12). New: `lib/projects.ts` (project/unit single-entity reads), `getProjectUnits`/`getProjectUnitStats`/`getProjectRooms`/`getUnitRoutes`/`listingHref` in `lib/listings.ts`, `parseUnitParams`/`toUnitParams` in `search-params.ts`, `UnitTable`, `ProjectCard`, `PointMap`/`PointMapView`. SEO: `Residence` + an `Offer` per *available, priced* unit, `RealEstateListing` + `containedInPlace` on the unit page, BreadcrumbList everywhere, canonical + hreflang. Company page: the inline unlinked project block is gone, replaced by the shared `ProjectCard`; unit cards now carry a real href (`getCompanyProjects` deleted from `lib/companies.ts` as superseded by `getCompanyProjectCards`). `LocationPanel` gained a real single-marker MapLibre map, so the property page's map placeholder is closed in the same pass. Seed adds a second (completed, multi-building) project, a price-on-request unit, a ground-floor unit and a draft unit. Twelve Playwright specs; `typecheck`, `lint`, `build` and `test:e2e` (33/33) all green.
- **Broke:** Three things worth remembering. (1) **`listing_index` had no `unit_code`, `building` or `project_slug`** — a unit table cannot label a row or link to a unit without them, and rule 4 forbids reading `project_units` directly for a listing surface. Added to `db/listing-index.sql` and re-applied via a migration that just re-executes the file (the file's leading `DROP VIEW` is what makes that work — `CREATE OR REPLACE VIEW` cannot add columns). docs/01 and docs/06 updated in the same commit. (2) **The `unitTypesSummary` hook `Projects.ts` documented did not exist**, so every project card had nothing to show. Written — and the first version deadlocked the seed: it read the pool and called the Local API *without* `req`, so it sat on a separate connection waiting for locks the enclosing delete transaction held, and the whole thing died several minutes later as `25P03 idle-in-transaction timeout`. An afterChange/afterDelete hook must pass `req` on every read and write; the aggregate is now a transaction-aware Local API `find` rather than SQL over the view, which also means it sees the publish it was triggered by. (3) **Units had no `seo` group** — every other public entity has one (docs/09), so it was added with a generated Payload migration.
- **Decided:** `/[locale]/projekte/[slug]` is **server-rendered on demand, not ISR**, and the file says so. Reading `searchParams` opts a route out of static generation wholesale in Next, so `generateStaticParams` + `revalidate` there would prerender nothing and document an intention the build ignores — `next build` confirms `ƒ`. That matches the line already drawn: pure entity pages (`/prona/[slug]`, `/kompani/[slug]`, each unit) are static + ISR, pages carrying URL query state (`/prona`, this one) are dynamic. The crawlable long tail is the unit pages, and those prerender. Making it static needs either the table's state out of the query string or `cacheComponents` turned on — both bigger than this slice. Separately, `/prona` still filters to `source='property'` on purpose: mixing a few hundred units of one project into general search dilutes it, and that call gets revisited when there is real project inventory.
- **Superseded:** the "project page is dynamic" decision below was reversed the same day — see the cacheComponents entry.
- **Next:** `next-intl` for the `en` locale (three routes now hardcode Albanian copy from `messages/sq.ts`), the enquiry flow (`AgentCard` and the unit page's developer block are both mailto stubs), sitemaps — `/sitemap-projects.xml` and friends are specified in docs/09 and none exist yet — and `revalidateTag` on publish with the approval-workflow slice.

---

## cacheComponents — 9 Aug 2026

- **Built:** Turned on `cacheComponents` (Next 16.2, stable) so the project page could be a static shell with the unit table as its one dynamic hole — the thing the previous entry said needed a bigger decision. Every route is now `◐` in the build output: prerendered HTML with server-streamed dynamic content. `/[locale]/projekte/[slug]` prerenders the gallery, heading, availability count, description, site plan, map, developer aside and **both JSON-LD blocks**; only `<FilteredUnitTable>` — which awaits `searchParams` — streams. The 6.6 KB shell on disk contains the Residence + Offer markup and zero table rows; a real request returns 39 KB with the full table, so crawlers still get every sold unit. `/prona` got the same treatment, its whole result set (count, filter panel, map, grid, pagination) behind one boundary, which turned it from fully dynamic into a static shell too.
- **Broke / had to change:** More than one page. (1) **`export const revalidate` is disallowed under cacheComponents** — it had to come off all five ISR pages, so the one-hour window moved onto a named `content` cache profile in `next.config.ts` (`stale 5m / revalidate 1h / expire 1y`) declared by each read function via `'use cache'` + `cacheLife('content')`. Nineteen read functions across `lib/{listings,projects,companies,property-detail}.ts` are now cached; `searchListings` and `searchListingsInBounds` deliberately are not. The whole model is written up in `docs/13-caching.md`, and CLAUDE.md rule 11 points at it. (2) **Awaiting `params` is itself an uncached read**, so the paramless `[locale]` index routes (`/prona`, `/kompani`, `/projekte`) each needed a `generateStaticParams` over `LOCALES` before they would prerender at all. (3) The **Payload starter homepage** called `payload.auth(headers)` at the top level and blocked its own prerender; the greeting moved behind Suspense. It is still the starter page — docs/12 keeps the real homepage last. (4) A codemod mangled `lib/listings.ts` because that file is CRLF and the others are LF — reverted and redone; worth knowing this repo has mixed line endings.
- **Watch out for:** Two testing effects, both written up under **Known quirks** at the end of this file — soft navigation now leaves the previous page's `<h1>` in the DOM until the next route commits, which broke a Playwright assertion; and the admin spec's cold-start timeout, which is pre-existing and not a Payload/cacheComponents conflict. Payload admin builds and runs fine under it (`◐`).
- **Verified:** `typecheck`, `lint` (0 errors), `build`, `test:e2e` 33/33, plus production-server checks that sort, filter, sold-unit visibility, the Residence markup and the single-marker map all still behave.

---

## Route-mode gate — 9 Aug 2026

- **Built:** `pnpm check:routes` — a fourth DoD gate beside `typecheck`, `lint` and `test:e2e`. It runs the production build, parses the route table, and fails if any route renders differently from `scripts/route-modes.ts`, which is the single place expectations live (adding a page = adding one line there). Fails in both directions, so the list cannot rot: an undeclared route and a declared-but-missing route are both red. Pass a build log path to skip the rebuild in CI. All four failure branches were tested against doctored logs — wrong mode, unlisted route, vanished route, unparseable output — and each exits 1 with a message naming the fix.
- **Learned:** The gate is worth less than expected as a defence against pages silently going dynamic, because `cacheComponents` already blocks that at compile time. Tried `export const dynamic = 'force-dynamic'` on the project page expecting a `ƒ` in the table; the build rejected the export outright, same as `revalidate`. So the compiler — not this script — is what stops the model being broken from inside a page. What the script actually covers is what the compiler cannot know: a **new route nobody reviewed**, a route that **disappeared**, and **upgrade drift** where a Next release changes how an existing route renders without erroring. The header comment in `scripts/route-modes.ts` says this plainly rather than overselling it, and also records what it does *not* catch — a page kept at `ppr` by wrapping nearly everything in `<Suspense>` still reports `ppr` while prerendering a hollow shell.
- **Verified:** `typecheck`, `lint` (0 errors), `check:routes` (15 routes), `test:e2e` 33/33.

---

## Forms and email slice — 9 Aug 2026

- **Built:** The two public write operations (docs/05), end to end. `EnquiryForm` on the property, unit and project detail pages, storing `sourceType`, `sourceId`, `locale`, the resolved agent, and the consent record; `/[locale]/dergo-pronen` with every docs/05 field, photo upload up to 15, and the documentation + terms checkboxes. Both confirm **in place** via `useActionState` — no redirect, because sending someone to a thank-you page loses the listing they were reading and the way back is a re-submitting back button. Anti-spam: honeypot, a **signed** render-time token behind the 3-second timing check, and a rate limit by hashed IP (5 enquiries/hour, 3 requests/day) counted off existing rows — no Redis, no new service, works across serverless instances where an in-memory Map would not. Resend + React Email templates (`EnquiryNotification`, `ListingRequestNotification`) go to the routed agent with admin in bcc. `ContactBar` gains the form as a **third** option beside call and WhatsApp, and the project page gets a contact bar it never had.
- **Decided:** `create` is now **closed** on `enquiries` and `listing-requests` — both were `anyone`, so `/api/enquiries` was publicly writable and every anti-spam control could be skipped by posting JSON straight past the form. The server actions are the only way in and create with `overrideAccess`. `media.create` stays staff-only for the same reason; anonymous photo uploads happen inside the action or not at all. Projects gained an `agent` field: enquiries on a project and on **every unit beneath it** route to that person, units inheriting the agent as they already inherit area, location and developer (docs/03). Unassigned falls through to a shared inbox, flagged in the email and left null in the admin so it reads as triage rather than a destination. Email failure never fails a submission — the row is committed first and a failed send is logged, because telling someone "try again" after we already stored their lead just duplicates it.
- **Broke:** Three worth remembering. (1) **Payload ended up in the client bundle.** The form components imported `HONEYPOT_FIELD` from `lib/anti-spam.ts`, which imports Payload for its rate-limit query — the build failed deep inside `payload/dist/...` compiled for the browser, naming nothing near the actual import. Constants moved to `lib/form-constants.ts`, which imports nothing. The same file also fixed a second latent bug: a `'use server'` module may only export async functions, and the action was exporting `MAX_PHOTOS`. (2) **A signed token minted in a prerendered page is baked in at build time** — every visitor would have shared one timestamp, and once it aged past the token ceiling the timing check would have rejected every submission on the site, looking like "the form is broken" and pointing nowhere near the cache. `EnquiryFormSlot` calls `connection()` inside a Suspense boundary so the token is per-request while the page stays prerendered. (3) **The seed found-or-created its agent**, so adding a phone to the create branch did nothing on any database that had already been seeded — the contact bar silently had nothing to call. The seed now upserts the fields fixtures depend on.
- **Known limit:** Photos post through the Server Action, with `serverActions.bodySizeLimit` raised to 25mb. Fifteen photos off a modern phone **will** exceed that sometimes. A request over the limit is rejected by the framework *before* the action runs, so the server cannot return a useful error — which is why the form measures the total on selection and blocks with a real message naming the problem, and why the action re-checks the same ceiling. The proper fix is uploading direct to Vercel Blob and posting only the media ids; that removes the limit entirely and should happen before launch if the client's photo sets are large.
- **Verified:** `typecheck`, `lint` (0 errors), `check:routes` (16 routes), `test:e2e` **45/45** — twelve new specs covering submit-creates-the-record, honeypot rejected with nothing stored, missing terms blocked, sub-3s rejected, unit routing to the project agent, unassigned falling back to the inbox, and the terms box never pre-ticked on either form.
- **Next:** Blog (step 8, skipped to get here), `next-intl` for the `en` locale, sitemaps, and `revalidateTag` on publish.

---

## Email delivery proven — 9 Aug 2026

- **Built:** Sender is now `RESEND_FROM`, defaulting to Resend's shared test sender `onboarding@resend.dev` so the delivery path works with no domain verification; switching to `noreply@atmos.al` is one variable. Added `RESEND_OVERRIDE_TO`, which redirects every notification to one address and puts the intended recipient in the subject as `[→ agent@…]`. That is not only for this test: the shared test sender can *only* deliver to the Resend account owner, and a staging deploy pointed at production-shaped data would otherwise email the client's real agents the first time someone tried a form. Successful sends now log the Resend message id, so "was this lead sent?" has an answer that is not silence.
- **Proven:** A real enquiry submitted through the running production build reached Resend — `[enquiry] 26 notified seed-agent@atmos.al (resend 0c7a9b34-…)`, redirected to the account owner. Both routing paths were exercised: a property (assigned agent) and Laprakë Garden (unassigned → shared inbox). The failure path proved itself first: the initial attempt was rejected with Resend's "you can only send testing emails to your own email address", the enquiry was still stored, and the submission still succeeded — exactly the "email failure never fails a lead" design.
- **Broke:** A pre-existing bug the emails exposed. `lib/seo.ts` read `NEXT_PUBLIC_SERVER_URL`; `.env.example` and the README both document `NEXT_PUBLIC_SITE_URL`. Nothing set the former, so `SITE_URL` silently fell back to `http://localhost:3000` — meaning every canonical, hreflang alternate and JSON-LD `url` on a deployed site pointed at localhost. Invisible locally, because there the fallback is right. A notification email carrying a localhost link is what made it obvious. Now reads `NEXT_PUBLIC_SITE_URL`, with the old name honoured as a fallback so nothing regresses on deploy.
- **Fixed the flaky admin spec.** Its `beforeAll` had a 30s default while the first request to `/admin/login` takes ~23s to compile on a cold `next dev` — measured, not guessed — and the hook also seeds a user and opens a browser before navigating. So the block passed or failed depending on what ran before it, and the margin shrinks as the app grows. Now `testInfo.setTimeout(180_000)` inside the hook: a describe-level `test.setTimeout` would not have worked, because it applies to tests and not to `beforeAll`. Verified against a cold server with `.next/cache` cleared.
- **Not done:** the send was through a local production build, **not the deployed site** — there is no `.vercel` link, no Vercel CLI, and no deployment URL in the repo, so there was nothing to submit against. The code path is identical; what is unproven is the Vercel environment wiring.
- **Verified:** `typecheck`, `lint` (0 errors), `check:routes` (16 routes), `test:e2e` 45/45 from a cold start.

---

# Known quirks

Things that look like bugs, are not, and cost someone an hour already. Add to
this rather than rediscovering.

## Two `<h1>`s during a client-side navigation

**Symptom.** A Playwright assertion on `page.locator('h1')` straight after
`page.waitForURL(...)` fails with a strict-mode violation resolving to two
elements — the destination's heading *and* the previous page's.

**Why.** Since `cacheComponents` landed, `waitForURL` and "the new page is
rendered" are further apart than they used to be. The URL changes when a soft
navigation *starts*; React keeps the previous tree mounted until the next route
is ready to commit. In `next dev` "ready" includes compiling the target route on
demand, so the overlap can last many seconds — long past a 5s expect timeout.
Nothing is stuck and nothing is duplicated in the final DOM; a real user just
sees the old page until the new one is ready, which is the intended behaviour of
a React transition.

**What to do.** Do not assert on the destination mid-transition. Either scope the
assertion to something that only exists on the new page, or — better, and what
`tests/e2e/projects.e2e.spec.ts` does — assert that the click changed the URL,
then `page.goto()` the href and assert the content on a clean load. Chasing it
with longer timeouts or `waitForLoadState` is testing the dev server's compile
speed, not the app.

**Do not** "fix" this by removing the Suspense boundaries or turning
`cacheComponents` off — see `docs/13-caching.md`.

## Playwright's first admin request is slow to compile — fixed, but know why

**Resolved 9 Aug 2026.** The admin spec's `beforeAll` used to time out on a cold
dev server and pass on a warm one, so the whole describe block's result depended
on what ran before it.

The cause is not a bug: the first request to `/admin/login` takes ~23 seconds to
compile the Payload admin bundle under `next dev`, against a 30s default hook
timeout that also has to seed a user and open a browser context. The hook now
sets its own 180s budget. It must be `testInfo.setTimeout()` *inside* the hook —
a describe-level `test.setTimeout()` applies to the tests, not to `beforeAll`.

If it ever returns, measure the compile before touching anything else:

    curl -o /dev/null -w '%{time_total}
' http://localhost:3000/admin/login

against a freshly started dev server.

## `pnpm seed` wipes attached photos

`scripts/attach-photos.ts` has to run after every `pnpm seed`, or the properties
photo e2e test fails on a seed with no galleries. The seed clears the collections
it owns, and media attachments go with them.

## Mixed line endings

`src/lib/listings.ts` is CRLF; most files written since are LF. Any regex-based
codemod over the repo needs `\r?\n`, or it silently matches nothing in some files
and corrupts others.

## `'use cache'` data survives a re-seed

Re-seeding changes the database but not the cache. Pages read through
`'use cache'` keep serving the previous rows for the profile's revalidate window
(an hour), and the entries live in `.next/cache`, so restarting the dev server
does not clear them either. A test that fails right after `pnpm seed` while the
page looks correct in the database is usually this.

    rm -rf .next/cache

Worth trying before debugging the test. Note it is not always the answer — the
same symptom came from a seed bug once in the same session (see the forms slice
entry), so confirm what is actually in the database first.
