# Progress

- **Built:** Database schema (initial Payload migration), the `listing_index` view + indexes as a custom migration, and a working Albanian seed. `pnpm typecheck` is clean.
- **Broke:** Bootstrap had four blockers — a missing `@payloadcms/storage-vercel-blob` dep, a `status`/`_status` enum-name collision (fixed via `dbName: 'listing_status'`), per-collection enums that can't UNION (cast to `::text`), and a seed with no owning agent. `price_per_sqm` now returns NULL for rent listings so it stays a sale-only metric.
- **Next:** Build the first vertical slice — properties list + detail pages reading from `listing_index`, with SEO metadata and a smoke test (no public pages exist yet).
