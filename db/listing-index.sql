-- listing_index
--
-- The single read model behind search, filters, the map and result cards.
-- Unions standalone properties with project units. Units inherit area,
-- location and developer from their parent project.
--
-- Rule: nothing user-facing queries `properties` or `project_units` directly.
-- See docs/01-data-model.md and docs/06-search-map.md.
--
-- price_per_sqm is a SALE metric only. Rent listings return NULL for it: a
-- monthly rent of 11 EUR/m2 and a sale of 1971 EUR/m2 in the same column would
-- corrupt every price-per-m2 sort and range filter.
--
-- Apply through a Payload custom migration so it is versioned with the schema.
-- Table and column names below are the ones Payload generates; verify them
-- against the first `payload migrate:create` output before running this.
--
-- Enum columns are cast to text on both sides of the UNION. Payload gives each
-- collection its own enum type (enum_properties_property_type vs
-- enum_project_units_property_type, etc.), and Postgres will not UNION two
-- distinct enum types. Casting to text yields one plain-string read model.
--
-- Three columns are unit-only and NULL on the property side: unit_code,
-- building and project_slug. They are here rather than resolved per-render
-- because the project page's unit table is a listing surface like any other —
-- it reads this view (rule 4), and a unit table with no unit code, and no way
-- to build /projekte/[project]/[unit] hrefs, is not a unit table. Properties
-- have no analogue for any of the three, so they union as typed NULLs.

DROP VIEW IF EXISTS listing_index;

CREATE VIEW listing_index AS

-- Standalone properties
SELECT
  ('property:' || p.id)                             AS id,
  'property'::text                                  AS source,
  p.id                                              AS source_id,
  p.slug                                            AS slug,
  p.property_type::text                             AS property_type,
  p.listing_type::text                              AS listing_type,
  p.status::text                                    AS status,
  p.price                                           AS price,
  p.currency::text                                  AS currency,
  p.price_on_request                                AS price_on_request,
  p.price_eur                                       AS price_eur,
  p.rent_period::text                               AS rent_period,
  p.area_gross                                      AS area_gross,
  p.area_net                                        AS area_net,
  p.terrace_sqm                                     AS terrace_sqm,
  CASE WHEN p.listing_type = 'sale'
       THEN ROUND(p.price_eur / NULLIF(p.area_gross, 0))
       ELSE NULL END                                AS price_per_sqm,
  p.rooms                                           AS rooms,
  p.bedrooms                                        AS bedrooms,
  p.bathrooms                                       AS bathrooms,
  p.floor                                           AS floor,
  p.building_phase::text                            AS building_phase,
  p.mortgage_eligible                               AS mortgage_eligible,
  p.area_id                                         AS area_id,
  a.name                                            AS area_name,
  p.street                                          AS street,
  p.location                                        AS location,
  NULL::int                                         AS project_id,
  NULL::text                                        AS project_name,
  NULL::text                                        AS project_slug,
  NULL::text                                        AS unit_code,
  NULL::text                                        AS building,
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
  u.property_type::text                             AS property_type,
  u.listing_type::text                              AS listing_type,
  u.status::text                                    AS status,
  u.price                                           AS price,
  u.currency::text                                  AS currency,
  u.price_on_request                                AS price_on_request,
  u.price_eur                                       AS price_eur,
  u.rent_period::text                               AS rent_period,
  u.area_gross                                      AS area_gross,
  u.area_net                                        AS area_net,
  u.terrace_sqm                                     AS terrace_sqm,
  CASE WHEN u.listing_type = 'sale'
       THEN ROUND(u.price_eur / NULLIF(u.area_gross, 0))
       ELSE NULL END                                AS price_per_sqm,
  u.rooms                                           AS rooms,
  u.bedrooms                                        AS bedrooms,
  u.bathrooms                                       AS bathrooms,
  u.floor                                           AS floor,
  u.building_phase::text                            AS building_phase,
  u.mortgage_eligible                               AS mortgage_eligible,
  pr.area_id                                        AS area_id,
  a.name                                            AS area_name,
  NULL::text                                        AS street,
  pr.location                                       AS location,
  pr.id                                             AS project_id,
  pr.name                                           AS project_name,
  pr.slug                                           AS project_slug,
  u.unit_code                                       AS unit_code,
  u.building                                        AS building,
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
-- The project page reads every published unit of one project and sorts by
-- floor or price — a project-scoped lookup the search index above does not lead
-- with.
CREATE INDEX IF NOT EXISTS project_units_project_idx
  ON project_units (project_id, _status, floor, price_eur);
CREATE INDEX IF NOT EXISTS projects_location_idx
  ON projects USING GIST (location);
