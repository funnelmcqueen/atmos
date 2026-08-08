/**
 * Ad-hoc read-only proof that listing_index works end to end.
 * Not part of the app — run with: pnpm tsx scripts/query-listing-index.ts
 */
import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config'

const show = (title: string, rows: unknown[]) => {
  console.log(`\n=== ${title} (${rows.length}) ===`)
  console.table(rows)
}

const run = async () => {
  const payload = await getPayload({ config })
  const pool = payload.db.pool as {
    query: (text: string) => Promise<{ rows: unknown[] }>
    end: () => Promise<void>
  }
  // 1. Properties and units in one result set
  const all = await pool.query(
    `SELECT source, slug, property_type, listing_type, status, price, currency,
            price_eur, area_gross, price_per_sqm, rooms, floor, project_name
       FROM listing_index
      ORDER BY source, price_eur NULLS LAST`,
  )
  show('All listings (properties + units) with price_per_sqm from area_gross', all.rows)

  // 2. Land listing: null rooms and null floor
  const land = await pool.query(
    `SELECT source, slug, property_type, rooms, floor, area_gross, price_eur, price_per_sqm
       FROM listing_index
      WHERE property_type = 'land'`,
  )
  show('Land listing — rooms and floor are NULL', land.rows)

  // 3. Price-on-request: null price and null price_per_sqm
  const por = await pool.query(
    `SELECT source, slug, price_on_request, price, price_eur, area_gross, price_per_sqm
       FROM listing_index
      WHERE price_on_request = TRUE`,
  )
  show('Price on request — price and price_per_sqm are NULL', por.rows)

  // 4. Lek-priced listing with priceEur derived (ALL/100)
  const lek = await pool.query(
    `SELECT source, slug, currency, price AS price_lek, price_eur,
            area_gross, price_per_sqm
       FROM listing_index
      WHERE currency = 'ALL'`,
  )
  show('Lek-priced listing — price_eur = price / 100', lek.rows)

  // Sanity: verify price_per_sqm = round(price_eur / area_gross) on a known row
  const spot = await pool.query(
    `SELECT slug, price_eur, area_gross, price_per_sqm,
            ROUND(price_eur / NULLIF(area_gross, 0)) AS recomputed
       FROM listing_index
      WHERE source = 'unit' AND slug = 'orbital-3-b-6-1'`,
  )
  show('Spot check — price_per_sqm math on unit B-6-1', spot.rows)

  await pool.end()
  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
