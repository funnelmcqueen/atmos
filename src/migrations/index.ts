import * as migration_20260808_080358_initial from './20260808_080358_initial';
import * as migration_20260808_080600_listing_index from './20260808_080600_listing_index';
import * as migration_20260808_120000_listing_index_unit_fields from './20260808_120000_listing_index_unit_fields';
import * as migration_20260808_204920_project_unit_seo from './20260808_204920_project_unit_seo';

export const migrations = [
  {
    up: migration_20260808_080358_initial.up,
    down: migration_20260808_080358_initial.down,
    name: '20260808_080358_initial',
  },
  {
    up: migration_20260808_080600_listing_index.up,
    down: migration_20260808_080600_listing_index.down,
    name: '20260808_080600_listing_index',
  },
  {
    up: migration_20260808_120000_listing_index_unit_fields.up,
    down: migration_20260808_120000_listing_index_unit_fields.down,
    name: '20260808_120000_listing_index_unit_fields',
  },
  {
    up: migration_20260808_204920_project_unit_seo.up,
    down: migration_20260808_204920_project_unit_seo.down,
    name: '20260808_204920_project_unit_seo'
  },
];
