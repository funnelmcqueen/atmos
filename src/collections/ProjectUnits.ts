import type { CollectionConfig } from 'payload'
import {
  areaSection,
  featuresSection,
  gallerySection,
  layoutSection,
  listingSlugField,
  priceEurField,
  priceSection,
  publishedAtField,
  titleSection,
  typeAndMarketSection,
} from '../fields/listing'
import { seoGroup } from '../fields/seo'
import { isAdmin, isStaff, publishedOrStaff, updateUnlessPublishing } from '../access'
import {
  recalcUnitTypesAfterChange,
  recalcUnitTypesAfterDelete,
} from './hooks/recalcUnitTypes'

/**
 * A unit inherits area, location and developer from its project.
 * Do not add those fields here — listing_index resolves them with a join.
 *
 * Same section order as Properties, minus the location section (inherited) and
 * the owner block (a unit's owner is the developer). Which unit it is comes
 * first: an agent adding inventory is working down a floor plan, not describing
 * a one-off listing.
 */
export const ProjectUnits: CollectionConfig = {
  slug: 'project-units',
  labels: { singular: 'Njësi', plural: 'Njësitë' },
  admin: {
    useAsTitle: 'unitCode',
    defaultColumns: ['unitCode', 'project', 'floor', 'rooms', 'price', 'status', '_status'],
    group: 'Listime',
    description: 'Njësitë brenda një projekti. Zonën dhe vendndodhjen i marrin nga projekti.',
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
      type: 'collapsible',
      label: 'Njësia',
      fields: [
        {
          name: 'project',
          type: 'relationship',
          label: 'Projekti',
          relationTo: 'projects',
          required: true,
          index: true,
          admin: { description: 'Zona, vendndodhja dhe investitori merren nga ky projekt.' },
        },
        {
          type: 'row',
          fields: [
            {
              name: 'unitCode',
              type: 'text',
              label: 'Kodi i njësisë',
              required: true,
              admin: { width: '50%', description: 'P.sh. A-4-2 ose Ap. 12.' },
            },
            { name: 'building', type: 'text', label: 'Godina', admin: { width: '50%' } },
          ],
        },
        { name: 'floorPlan', type: 'upload', label: 'Planimetria', relationTo: 'media' },
      ],
    },

    typeAndMarketSection,
    priceSection,
    areaSection,
    layoutSection,
    featuresSection,
    gallerySection,
    titleSection(),

    // --- Sidebar ------------------------------------------------------------
    listingSlugField,
    priceEurField,
    publishedAtField,

    // A unit is a public, indexable entity with its own route, so it gets the
    // same per-locale title/description overrides as a property or a project
    // (docs/09). Without it a unit page could only ever carry a generated
    // title, and units are the pages a new-build search lands on.
    seoGroup,
  ],
}
