# Atmos Real Estate — build rules

Read this before every task. If a request conflicts with this file, stop and ask.

## What this is

A real estate platform for the Albanian market: property marketplace, new-build
projects with unit inventory, verified developer profiles, and an editorial section.
Public pages must rank in Google. Private panels are role-based.

The full product vision lives in `docs/`. Read only the domain file you need for
the current task — do not load all of `docs/` into context at once.

## Stack — fixed, do not substitute

- Next.js (App Router) — public site and panels, one codebase
- Payload 3 — admin panel, auth, roles, drafts, versions, localization
- Postgres on Neon, via `@payloadcms/db-postgres`
- Hosting: Vercel
- Media: Vercel Blob in v1
- Maps: MapLibre GL + MapTiler vector tiles
- Email: Resend + React Email
- Package manager: pnpm

Do not add a dependency without asking. No ORMs beyond what Payload ships with.
No Redux, no state library — server components and URL search params carry state.

## Hard rules

1. **Payload owns the schema.** Every content model is a Payload collection in
   `src/collections/`. Never write a hand-rolled migration that changes a table
   Payload manages. Schema changes go through the collection file, then
   `pnpm payload migrate:create`.

2. **Localized content uses Payload localization** — `localized: true` on the
   field. Never store `{sq, en, it}` in a JSON column. The admin must be able to
   approve one language and regenerate another independently.

3. **Never localize factual data.** Price, area, floor, coordinates, dates,
   room counts, addresses and proper names are the same in all three languages.
   Only titles, descriptions, and editorial prose are localized.

4. **Properties and project units both feed `listing_index`.** Search, filters,
   the map, and any future matching read from that view — never from
   `properties` or `project_units` directly. See `docs/06-search-map.md`.

5. **Price is optional, currency is mixed, area is gross.** Listings can be
   "price on request". Prices are entered in EUR or Lek and sorted on the
   derived `priceEur`. Price per m2 always divides by `areaGross`. See
   `docs/01-data-model.md`.

6. **Agents own their listings.** An agent may view every property but edit
   only the ones assigned to them, and may never publish. Enforced in
   `access.update` as a query constraint. See `docs/11-roles.md`.

7. **Nothing is public until approved.** Every publishable collection uses
   Payload drafts. `_status: 'published'` is the only thing the public site
   queries. See `docs/08-approval-workflow.md`.

8. **All colors, spacing and type come from `src/styles/tokens.css`.** No
   arbitrary hex values, no inline styles for anything themeable. The client has
   approved this palette — do not redesign it.

9. **Every public route is `/[locale]/...`** with `sq` as default. A locale
   switch must keep the user on the same entity. See `docs/07-i18n.md`.

10. **All visual work follows `docs/12-design.md`.** Read it before
    building any component or page.

## Definition of done

A task is not finished until all of these pass:

```bash
pnpm typecheck    # tsc --noEmit, zero errors
pnpm lint
pnpm test:e2e     # Playwright smoke tests
```

Then commit. One commit per feature slice, present-tense message
("add property detail page"). Never bundle unrelated changes.

If `pnpm typecheck` fails, fix it before reporting back. Do not describe work as
complete while the build is red.

## How to build

Work in vertical slices, not layers. A slice is: collection → seed data → list
page → detail page → SEO metadata → smoke test → commit. Finish one entity
completely before starting the next.

Slice order: properties → projects and units → companies → articles.

Before writing a page, run `pnpm seed` and confirm there is real data to render
against. Never build a page that only works with placeholder content.

## What not to build yet

Out of scope for v1. If a task asks for these, flag it and stop:

daily rentals and booking, Atmos Match, saved searches, notification emails,
property comparison, mortgage calculators, virtual tours, market data reports,
the Italian locale.

`docs/10-roadmap.md` has the reasoning.

## Voice

Interface copy is Albanian first, in sentence case, plain verbs. A button says
what happens: "Dërgo pronën", not "Submit". Keep the same word for the same
action everywhere in the flow.
