import * as migration_20260808_080358_initial from './20260808_080358_initial';
import * as migration_20260808_080600_listing_index from './20260808_080600_listing_index';

export const migrations = [
  {
    up: migration_20260808_080358_initial.up,
    down: migration_20260808_080358_initial.down,
    name: '20260808_080358_initial'
  },
  {
    up: migration_20260808_080600_listing_index.up,
    down: migration_20260808_080600_listing_index.down,
    name: '20260808_080600_listing_index'
  },
];
