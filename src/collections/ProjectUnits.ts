import type { CollectionConfig } from 'payload'
import { listingFields } from '../fields/listing'
import { seoGroup } from '../fields/seo'
import { isAdmin, isStaff, publishedOrStaff, updateUnlessPublishing } from '../access'
import {
  recalcUnitTypesAfterChange,
  recalcUnitTypesAfterDelete,
} from './hooks/recalcUnitTypes'

/**
 * A unit inherits area, location and developer from its project.
 * Do not add those fields here — listing_index resolves them with a join.
 */
export const ProjectUnits: CollectionConfig = {
  slug: 'project-units',
  labels: { singular: 'Unit', plural: 'Units' },
  admin: {
    useAsTitle: 'unitCode',
    defaultColumns: ['unitCode', 'project', 'floor', 'rooms', 'price', 'status', '_status'],
    group: 'Listings',
  },
  versions: {
    drafts: { autosave: { interval: 800 } },
    maxPerDoc: 25,
  },
  access: {
    read: publishedOrStaff,
    create: isStaff,
    update: updateUnlessPublishing,
    delete: isAdmin,
  },
  // Publishing, editing or deleting a unit moves its project's denormalized
  // unitTypesSummary — the number a project card leads with (docs/03).
  hooks: {
    afterChange: [recalcUnitTypesAfterChange],
    afterDelete: [recalcUnitTypesAfterDelete],
  },
  fields: [
    {
      name: 'project',
      type: 'relationship',
      relationTo: 'projects',
      required: true,
      index: true,
    },
    {
      type: 'row',
      fields: [
        { name: 'unitCode', type: 'text', required: true, admin: { width: '50%' } },
        { name: 'building', type: 'text', admin: { width: '50%' } },
      ],
    },
    { name: 'floorPlan', type: 'upload', relationTo: 'media' },

    ...listingFields,

    // A unit is a public, indexable entity with its own route, so it gets the
    // same per-locale title/description overrides as a property or a project
    // (docs/09). Without it a unit page could only ever carry a generated
    // title, and units are the pages a new-build search lands on.
    seoGroup,
  ],
}
