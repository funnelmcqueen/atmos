import type { CollectionConfig } from 'payload'
import { slugField } from '../fields/slug'
import { seoGroup } from '../fields/seo'
import { isAdmin, isStaff, publishedOrStaff, updateUnlessPublishing } from '../access'

export const Articles: CollectionConfig = {
  slug: 'articles',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'publishedAt', '_status'],
    group: 'Editorial',
  },
  versions: { drafts: { autosave: { interval: 800 } }, maxPerDoc: 25 },
  access: {
    read: publishedOrStaff,
    create: isStaff,
    update: updateUnlessPublishing,
    delete: isAdmin,
  },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    slugField('title'),
    { name: 'excerpt', type: 'textarea', localized: true, maxLength: 220 },
    { name: 'body', type: 'richText', localized: true },
    { name: 'coverImage', type: 'upload', relationTo: 'media' },

    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Blerje', value: 'buying' },
        { label: 'Shitje', value: 'selling' },
        { label: 'Investime', value: 'investment' },
        { label: 'Dokumentacion', value: 'documentation' },
        { label: 'Tregu', value: 'market' },
        { label: 'Projekte', value: 'projects' },
      ],
    },

    // Tags that let the article surface on the related entity pages.
    { name: 'relatedAreas', type: 'relationship', relationTo: 'areas', hasMany: true },
    { name: 'relatedCompanies', type: 'relationship', relationTo: 'companies', hasMany: true },
    { name: 'relatedProjects', type: 'relationship', relationTo: 'projects', hasMany: true },

    { name: 'author', type: 'relationship', relationTo: 'users', admin: { position: 'sidebar' } },
    { name: 'publishedAt', type: 'date', admin: { position: 'sidebar' } },
    {
      name: 'contentType',
      type: 'select',
      required: true,
      defaultValue: 'editorial',
      options: [
        { label: 'Editorial', value: 'editorial' },
        { label: 'Analysis', value: 'analysis' },
        { label: 'Sponsored', value: 'sponsored' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Sponsored content must be labelled on the page. Not optional.',
      },
    },

    seoGroup,
  ],
}
