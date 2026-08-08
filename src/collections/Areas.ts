import type { CollectionConfig } from 'payload'
import { slugField } from '../fields/slug'
import { seoGroup } from '../fields/seo'
import { anyone, isAdmin, isStaff } from '../access'

/**
 * Two levels only: city (parent null) and neighbourhood (parent set).
 * Deeper nesting makes the filter UI unusable.
 */
export const Areas: CollectionConfig = {
  slug: 'areas',
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'parent', 'kind'], group: 'Directory' },
  access: { read: anyone, create: isStaff, update: isStaff, delete: isAdmin },
  fields: [
    { name: 'name', type: 'text', required: true },
    slugField('name'),
    {
      name: 'kind',
      type: 'select',
      required: true,
      defaultValue: 'neighbourhood',
      options: [
        { label: 'City', value: 'city' },
        { label: 'Neighbourhood', value: 'neighbourhood' },
      ],
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'areas',
      filterOptions: { kind: { equals: 'city' } },
      admin: { condition: (data) => data?.kind === 'neighbourhood' },
    },
    { name: 'center', type: 'point' },
    { name: 'description', type: 'richText', localized: true },
    seoGroup,
  ],
}
