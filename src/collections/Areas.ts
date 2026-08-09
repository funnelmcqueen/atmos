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
  labels: { singular: 'Zonë', plural: 'Zonat' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'parent', 'kind', 'updatedAt'],
    group: 'Direktori',
    description: 'Qytete dhe lagje. Çdo pronë lidhet me një zonë.',
  },
  access: { read: anyone, create: isStaff, update: isStaff, delete: isAdmin },
  fields: [
    // Proper name — same in every language. Not localized.
    { name: 'name', type: 'text', label: 'Emri', required: true },
    slugField('name'),
    {
      name: 'kind',
      type: 'select',
      label: 'Lloji',
      required: true,
      defaultValue: 'neighbourhood',
      options: [
        { label: 'Qytet', value: 'city' },
        { label: 'Lagje', value: 'neighbourhood' },
      ],
      admin: { description: 'Vetëm dy nivele: qytet, ose lagje brenda një qyteti.' },
    },
    {
      name: 'parent',
      type: 'relationship',
      label: 'Qyteti',
      relationTo: 'areas',
      filterOptions: { kind: { equals: 'city' } },
      admin: { condition: (data) => data?.kind === 'neighbourhood' },
    },
    { name: 'center', type: 'point', label: 'Qendra në hartë' },
    { name: 'description', type: 'richText', label: 'Përshkrimi', localized: true },
    seoGroup,
  ],
}
