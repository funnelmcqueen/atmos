-- listing_index
--
-- The single read model behind search, filters, the map and result cards.
-- Unions standalone properties with project units. Units inherit area,
-- location and developer from their parent project.
--
-- Rule: nothing user-facing queries `properties` or `project_units` directly.
-- See docs/01-data-model.md and docs/06-search-map.md.
--
-- Apply through a Payload custom migration so it is versioned with the schema.
-- Table and column names below are the ones Payload generates; verify them
-- against the first `payload migrate:create` output before running this.

DROP VIEW IF EXISTS listing_index;

CREATE VIEW listing_index AS

-- Standalone properties
SELECT
  ('property:' || p.id)                             AS id,
  'property'::text                                  AS source,
  p.id                                              AS source_id,
  p.slug                                            AS slug,
  p.property_type                                   AS property_type,
  p.listing_type                                    AS listing_type,
  p.status                                          AS status,
  p.price                                           AS price,
  p.currency                                        AS currency,
  p.price_on_request                                AS price_on_request,
  p.price_eur                                       AS price_eur,
  p.rent_period                                     AS rent_period,
  p.area_gross                                      AS area_gross,
  p.area_net                                        AS area_net,
  p.terrace_sqm                                     AS terrace_sqm,
  ROUND(p.price_eur / NULLIF(p.area_gross, 0))      AS price_per_sqm,
  p.rooms                                           AS rooms,
  p.bedrooms                                        AS bedrooms,
  p.bathrooms                                       AS bathrooms,
  p.floor                                           AS floor,
  p.building_phase                                  AS building_phase,
  p.mortgage_eligible                               AS mortgage_eligible,
  p.area_id                                         AS area_id,
  a.name                                            AS area_name,
  p.street                                          AS street,
  p.location                                        AS location,
  NULL::int                                         AS project_id,
  NULL::text                                        AS project_name,
  NULL::int                                         AS company_id,
  p.featured                                        AS featured,
  p.verified                                        AS verified,
  p.published_at                                    AS published_at,
  p.updated_at                                      AS updated_at
FROM properties p
LEFT JOIN areas a ON a.id = p.area_id
WHERE p._status = 'published'

UNION ALL

-- Units inside projects
SELECT
  ('unit:' || u.id)                                 AS id,
  'unit'::text                                      AS source,
  u.id                                              AS source_id,
  u.slug                                            AS slug,
  u.property_type                                   AS property_type,
  u.listing_type                                    AS listing_type,
  u.status                                          AS status,
  u.price                                           AS price,
  u.currency                                        AS currency,
  u.price_on_request                                AS price_on_request,
  u.price_eur                                       AS price_eur,
  u.rent_period                                     AS rent_period,
  u.area_gross                                      AS area_gross,
  u.area_net                                        AS area_net,
  u.terrace_sqm                                     AS terrace_sqm,
  ROUND(u.price_eur / NULLIF(u.area_gross, 0))      AS price_per_sqm,
  u.rooms                                           AS rooms,
  u.bedrooms                                        AS bedrooms,
  u.bathrooms                                       AS bathrooms,
  u.floor                                           AS floor,
  u.building_phase                                  AS building_phase,
  u.mortgage_eligible                               AS mortgage_eligible,
  pr.area_id                                        AS area_id,
  a.name                                            AS area_name,
  NULL::text                                        AS street,
  pr.location                                       AS location,
  pr.id                                             AS project_id,
  pr.name                                           AS project_name,
  pr.developer_id                                   AS company_id,
  FALSE                                             AS featured,
  TRUE                                              AS verified,
  u.published_at                                    AS published_at,
  u.updated_at                                      AS updated_at
FROM project_units u
JOIN projects pr ON pr.id = u.project_id AND pr._status = 'published'
LEFT JOIN areas a ON a.id = pr.area_id
WHERE u._status = 'published';

-- Notes
--
-- price_per_sqm divides by GROSS area. That is what the market quotes
-- ("1550 Euro/m2" on an 88 m² gross / 75 m² net listing). Dividing by net
-- would produce a number no client recognises.
--
-- price_per_sqm is NULL when price_on_request is true. Sort those rows last.

-- Indexes go on the base tables, not the view.
CREATE INDEX IF NOT EXISTS properties_search_idx
  ON properties (_status, listing_type, property_type, status, price_eur, area_gross);
CREATE INDEX IF NOT EXISTS properties_mortgage_idx
  ON properties (mortgage_eligible) WHERE mortgage_eligible = TRUE;
CREATE INDEX IF NOT EXISTS properties_location_idx
  ON properties USING GIST (location);
CREATE INDEX IF NOT EXISTS project_units_search_idx
  ON project_units (_status, status, price_eur, area_gross);
CREATE INDEX IF NOT EXISTS projects_location_idx
  ON projects USING GIST (location);
