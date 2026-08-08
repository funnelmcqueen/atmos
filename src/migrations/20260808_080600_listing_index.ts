import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Creates the `listing_index` read model (see db/listing-index.sql) and its
 * supporting indexes. Runs after the initial schema migration so the base
 * tables exist. The SQL lives in db/listing-index.sql so it stays the single
 * source of truth; this migration only executes it, keeping the view versioned
 * with the schema.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  const ddl = fs.readFileSync(path.resolve(dirname, '../../db/listing-index.sql'), 'utf-8')
  await db.execute(sql.raw(ddl))
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(
    sql.raw(`
      DROP VIEW IF EXISTS listing_index;
      DROP INDEX IF EXISTS properties_search_idx;
      DROP INDEX IF EXISTS properties_mortgage_idx;
      DROP INDEX IF EXISTS properties_location_idx;
      DROP INDEX IF EXISTS project_units_search_idx;
      DROP INDEX IF EXISTS projects_location_idx;
    `),
  )
}
