/**
 * How every route is expected to render.
 *
 * **This is the one file to edit when you add a page.** `pnpm check:routes`
 * builds the app, reads the route table Next prints, and fails if reality and
 * this list disagree — in either direction. A new route that is not listed here
 * fails, and a listed route that no longer exists fails too, so the list cannot
 * quietly rot.
 *
 * ## What this gate is actually for
 *
 * `cacheComponents` already blocks most ways of breaking the model: a route-level
 * `revalidate` or `dynamic` export fails the build, and so does an uncached read
 * outside a Suspense boundary. Verified, not assumed — adding
 * `export const dynamic = 'force-dynamic'` to a page was tried and the build
 * rejected it. So this list is not the last line of defence against a page
 * silently going dynamic; the compiler mostly is.
 *
 * What it catches is what the compiler cannot know:
 *
 * - **A new route nobody reviewed.** Adding a page or a route handler fails
 *   here until someone states how it should render. That is the everyday value.
 * - **A route that vanished**, so the list cannot rot into fiction.
 * - **Upgrade drift.** A Next release changing how an existing route renders is
 *   otherwise invisible — it does not error, the site just quietly gets slower.
 *
 * What it does **not** catch: a page kept at `ppr` by wrapping nearly all of it
 * in `<Suspense>`. The mode still reads `ppr` while the prerendered shell is
 * hollow. Nothing automated will tell you that — check what is actually in the
 * shell (`.next/server/app/**.html`) when a page's boundaries change.
 *
 * The modes, as Next prints them:
 *
 * - `static`  (○) Fully prerendered. Nothing in it reads the request.
 * - `ppr`     (◐) Prerendered shell with dynamic content streamed into a
 *                 Suspense boundary. The normal shape for a page in this app.
 * - `dynamic` (ƒ) Server-rendered on demand, no prerendered shell at all.
 *
 * A public page should be `ppr` or `static`. If one of them turns up as
 * `dynamic`, something reads the request outside a Suspense boundary — fix the
 * page rather than this file. Changing an entry to `dynamic` to make the gate
 * pass is exactly the silent regression the gate exists to catch.
 */

export type RouteMode = 'static' | 'ppr' | 'dynamic'

/** Symbol in Next's route table → the name used here. */
export const MODE_BY_SYMBOL: Record<string, RouteMode> = {
  '○': 'static',
  '◐': 'ppr',
  'ƒ': 'dynamic',
}

export const EXPECTED_ROUTE_MODES: Record<string, RouteMode> = {
  // --- Public pages --------------------------------------------------------
  // Every one of these must keep a prerendered shell. See docs/13-caching.md
  // for where each one's dynamic hole is.

  // Payload's starter homepage. Still `ppr` rather than `static` because the
  // greeting authenticates; the real homepage is built last (docs/12).
  '/': 'ppr',

  '/[locale]/prona': 'ppr', // hole: the whole result set (filters, map, grid)
  '/[locale]/prona/[slug]': 'ppr',
  '/[locale]/projekte': 'ppr',
  '/[locale]/projekte/[slug]': 'ppr', // hole: the unit table's sort + filter
  '/[locale]/projekte/[slug]/[unit]': 'ppr',
  '/[locale]/kompani': 'ppr',
  '/[locale]/kompani/[slug]': 'ppr',

  // --- Route handlers and framework routes ---------------------------------
  // Dynamic on purpose. Each one either answers a per-request query or is owned
  // by Payload.

  // The map's bbox query. Its key is a floating-point viewport, so it is
  // deliberately uncached (docs/13-caching.md).
  '/[locale]/prona/map': 'dynamic',

  '/admin/[[...segments]]': 'ppr', // Payload admin, works fine under cacheComponents
  '/api/[...slug]': 'dynamic',
  '/api/graphql': 'dynamic',
  '/api/graphql-playground': 'dynamic',

  // --- Scaffolding ---------------------------------------------------------
  '/_not-found': 'static',
  '/my-route': 'static', // Payload starter leftover
}
