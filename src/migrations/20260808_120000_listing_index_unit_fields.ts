import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Re-applies `listing_index` after the projects slice added three unit-only
 * columns to it — `project_slug`, `unit_code`, `building` — plus the
 * project-scoped index the unit table sorts on.
 *
 * The DDL still lives in db/listing-index.sql (single source of truth); this
 * migration just executes the current file, exactly as the original one did.
 * That file opens with `DROP VIEW IF EXISTS`, which is what makes re-running it
 * work at all: `CREATE OR REPLACE VIEW` cannot add columns to an existing view,
 * so the view has to be dropped and rebuilt. Nothing depends on it in the
 * database (no materialized views, no dependent views), so the drop is safe.
 *
 * `down` drops the view and the new index. It deliberately does not rebuild the
 * pre-slice view from an inlined copy of the old SQL: that copy would be a
 * second source of truth for the read model, and duplicating it is exactly what
 * db/listing-index.sql exists to prevent. Rolling back one further step re-runs
 * the original migration's `down`, and rolling forward rebuilds the view from
 * the file.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  const ddl = fs.readFileSync(path.resolve(dirname, '../../db/listing-index.sql'), 'utf-8')
  await db.execute(sql.raw(ddl))
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(
    sql.raw(`
      DROP INDEX IF EXISTS project_units_project_idx;
      DROP VIEW IF EXISTS listing_index;
    `),
  )
}
