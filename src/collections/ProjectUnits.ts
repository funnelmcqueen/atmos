import type { CollectionConfig } from 'payload'
import { listingFields } from '../fields/listing'
import { isAdmin, isStaff, publishedOrStaff, updateUnlessPublishing } from '../access'

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
  ],
}
