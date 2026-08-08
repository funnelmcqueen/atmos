import type { CollectionConfig } from 'payload'
import { slugField } from '../fields/slug'
import { seoGroup } from '../fields/seo'
import { isAdmin, isAdminField, isStaff, publishedOrStaff, updateUnlessPublishing } from '../access'

export const Companies: CollectionConfig = {
  slug: 'companies',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'verifiedPartner', '_status', 'updatedAt'],
    group: 'Directory',
  },
  versions: { drafts: { autosave: { interval: 800 } }, maxPerDoc: 25 },
  access: {
    read: publishedOrStaff,
    create: isStaff,
    update: updateUnlessPublishing,
    delete: isAdmin,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    slugField('name'),

    { name: 'about', type: 'richText', localized: true },

    { name: 'logo', type: 'upload', relationTo: 'media' },
    { name: 'coverImage', type: 'upload', relationTo: 'media' },

    {
      type: 'row',
      fields: [
        { name: 'foundedYear', type: 'number', admin: { width: '33%' } },
        { name: 'website', type: 'text', admin: { width: '33%' } },
        { name: 'phone', type: 'text', admin: { width: '33%' } },
      ],
    },
    { name: 'email', type: 'email' },

    {
      name: 'socials',
      type: 'array',
      fields: [
        {
          name: 'platform',
          type: 'select',
          options: ['facebook', 'instagram', 'linkedin', 'youtube', 'tiktok'],
        },
        { name: 'url', type: 'text', required: true },
      ],
    },

    {
      name: 'areasOfOperation',
      type: 'relationship',
      relationTo: 'areas',
      hasMany: true,
    },

    {
      name: 'certifications',
      type: 'array',
      fields: [
        { name: 'title', type: 'text', required: true, localized: true },
        { name: 'issuer', type: 'text' },
        { name: 'year', type: 'number' },
        { name: 'document', type: 'upload', relationTo: 'media' },
      ],
    },

    {
      name: 'verifiedPartner',
      type: 'checkbox',
      defaultValue: false,
      access: { update: isAdminField },
      admin: { position: 'sidebar', description: 'Admin only. Drives the partner badge.' },
    },

    {
      name: 'legalName',
      type: 'text',
      access: { read: isAdminField },
      admin: { position: 'sidebar' },
    },
    {
      name: 'nipt',
      type: 'text',
      access: { read: isAdminField },
      admin: { position: 'sidebar', description: 'Albanian tax ID. Internal.' },
    },

    seoGroup,
  ],
}
