import type { CollectionConfig } from 'payload'
import { slugField } from '../fields/slug'
import { seoGroup } from '../fields/seo'
import { isAdmin, isStaff, publishedOrStaff, updateUnlessPublishing } from '../access'

export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'developer', 'constructionPhase', '_status', 'updatedAt'],
    group: 'Listings',
  },
  versions: { drafts: { autosave: { interval: 800 } }, maxPerDoc: 25 },
  access: {
    read: publishedOrStaff,
    create: isStaff,
    update: updateUnlessPublishing,
    delete: isAdmin,
  },
  fields: [
    // Proper name — same in every language. Not localized.
    { name: 'name', type: 'text', required: true },
    slugField('name'),

    { name: 'tagline', type: 'text', localized: true },
    { name: 'description', type: 'richText', localized: true },

    {
      name: 'developer',
      type: 'relationship',
      relationTo: 'companies',
      required: true,
      index: true,
    },
    { name: 'area', type: 'relationship', relationTo: 'areas', required: true, index: true },
    { name: 'location', type: 'point', required: true },

    {
      type: 'row',
      fields: [
        {
          name: 'constructionPhase',
          type: 'select',
          required: true,
          defaultValue: 'underConstruction',
          options: [
            { label: 'Në planifikim', value: 'planning' },
            { label: 'Në ndërtim', value: 'underConstruction' },
            { label: 'Përfunduar', value: 'completed' },
          ],
          admin: { width: '50%' },
        },
        {
          name: 'completionDate',
          type: 'date',
          admin: { width: '50%', date: { pickerAppearance: 'monthOnly' } },
        },
      ],
    },

    {
      name: 'gallery',
      type: 'array',
      minRows: 1,
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        { name: 'caption', type: 'text', localized: true },
      ],
    },
    { name: 'sitePlan', type: 'upload', relationTo: 'media' },
    { name: 'brochure', type: 'upload', relationTo: 'media' },

    // Denormalized so the project card doesn't aggregate units on render.
    // Recomputed by a hook on project-units afterChange — see docs/03.
    {
      name: 'unitTypesSummary',
      type: 'array',
      admin: { readOnly: true, description: 'Derived from published units.' },
      fields: [
        { name: 'rooms', type: 'text' },
        { name: 'areaFrom', type: 'number' },
        { name: 'areaTo', type: 'number' },
        { name: 'priceFrom', type: 'number' },
        { name: 'availableCount', type: 'number' },
      ],
    },

    { name: 'featured', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar' } },
    { name: 'publishedAt', type: 'date', admin: { position: 'sidebar' } },

    seoGroup,
  ],
}
