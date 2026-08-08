# Atmos bootstrap

Day-one scaffolding for the Atmos Real Estate build. Drop these into a fresh
Payload + Next.js repo before writing any pages.

## What's here

```
CLAUDE.md              build rules — Claude Code reads this every session
docs/                  the vision doc, split by domain
src/payload.config.ts  locales, db, storage, collections
src/collections/       the data model
src/fields/            shared field groups (listing, slug, seo)
src/access/            role, ownership and draft access control
db/listing-index.sql   the search view that unions properties and units
scripts/seed.ts        realistic Albanian seed data
src/styles/tokens.css  the approved palette and type scale
```

## Order of operations

```bash
pnpm create payload-app@latest atmos --template blank --db postgres
cd atmos
```

1. Copy this bootstrap over the generated app.
2. Fill `.env` (see below).
3. `pnpm payload migrate:create initial` — check the generated table names
   against `db/listing-index.sql` before step 4.
4. Add a custom migration that runs `db/listing-index.sql`, then
   `pnpm payload migrate`.
5. `pnpm seed`
6. `pnpm dev`, open `/admin`, create the first admin user.
7. Confirm the seed data is visible in the admin before building any page.

Do not skip step 7. Every page after this gets built against real rows.

## Env

```
DATABASE_URL=              # Neon pooled connection string
PAYLOAD_SECRET=            # openssl rand -hex 32
BLOB_READ_WRITE_TOKEN=     # Vercel Blob
NEXT_PUBLIC_MAPTILER_KEY=
RESEND_API_KEY=
NEXT_PUBLIC_SITE_URL=https://atmos.al
```

## Scripts to add to package.json

```json
{
  "seed": "tsx scripts/seed.ts",
  "typecheck": "tsc --noEmit",
  "test:e2e": "playwright test"
}
```

## First smoke tests

Write these before the first page, and keep them passing:

- `/sq` renders and returns 200
- `/sq/prona` lists at least one property
- `/sq/prona/[slug]` renders for a seeded slug
- `/sq/projekte/[slug]` renders the unit table
- `/en/prona/[slug]` renders the same entity in English
- a draft property returns 404 to an anonymous request
- an agent cannot update a property assigned to another agent

That last one is the important one. It is the difference between a platform the
client trusts and an incident.
