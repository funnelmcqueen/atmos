import type { CollectionConfig } from 'payload'
import { slugField } from '../fields/slug'
import { seoGroup } from '../fields/seo'
import { isAdmin, isAdminField, isStaff, publishedOrStaff, updateUnlessPublishing } from '../access'

export const Companies: CollectionConfig = {
  slug: 'companies',
  labels: { singular: 'Kompani', plural: 'Kompanitë' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'phone', 'verifiedPartner', '_status', 'updatedAt'],
    group: 'Direktori',
    description: 'Investitorë dhe kompani ndërtimi.',
  },
  versions: { drafts: { autosave: { interval: 800 } }, maxPerDoc: 25 },
  access: {
    read: publishedOrStaff,
    create: isStaff,
    update: updateUnlessPublishing,
    delete: isAdmin,
  },
  fields: [
    { name: 'name', type: 'text', label: 'Emri tregtar', required: true },
    slugField('name'),

    { name: 'about', type: 'richText', label: 'Rreth kompanisë', localized: true },

    { name: 'logo', type: 'upload', label: 'Logoja', relationTo: 'media' },
    { name: 'coverImage', type: 'upload', label: 'Fotoja e ballinës', relationTo: 'media' },

    {
      type: 'row',
      fields: [
        { name: 'foundedYear', type: 'number', label: 'Viti i themelimit', admin: { width: '33%' } },
        { name: 'website', type: 'text', label: 'Uebsajti', admin: { width: '33%' } },
        { name: 'phone', type: 'text', label: 'Telefoni', admin: { width: '33%' } },
      ],
    },
    { name: 'email', type: 'email', label: 'Email' },

    {
      name: 'socials',
      type: 'array',
      label: 'Rrjetet sociale',
      labels: { singular: 'Rrjet social', plural: 'Rrjete sociale' },
      fields: [
        {
          name: 'platform',
          type: 'select',
          label: 'Platforma',
          options: [
            { label: 'Facebook', value: 'facebook' },
            { label: 'Instagram', value: 'instagram' },
            { label: 'LinkedIn', value: 'linkedin' },
            { label: 'YouTube', value: 'youtube' },
            { label: 'TikTok', value: 'tiktok' },
          ],
        },
        { name: 'url', type: 'text', label: 'Lidhja', required: true },
      ],
    },

    {
      name: 'areasOfOperation',
      type: 'relationship',
      label: 'Zonat e operimit',
      relationTo: 'areas',
      hasMany: true,
    },

    {
      name: 'certifications',
      type: 'array',
      label: 'Certifikata',
      labels: { singular: 'Certifikatë', plural: 'Certifikata' },
      fields: [
        { name: 'title', type: 'text', label: 'Titulli', required: true, localized: true },
        { name: 'issuer', type: 'text', label: 'Lëshuar nga' },
        { name: 'year', type: 'number', label: 'Viti' },
        { name: 'document', type: 'upload', label: 'Dokumenti', relationTo: 'media' },
      ],
    },

    {
      name: 'verifiedPartner',
      type: 'checkbox',
      label: 'Partner i verifikuar',
      defaultValue: false,
      access: { update: isAdminField },
      admin: {
        position: 'sidebar',
        description: 'Vetëm administratori. Kjo ndez distinktivin e partnerit në sajt.',
      },
    },

    {
      name: 'legalName',
      type: 'text',
      label: 'Emri ligjor',
      access: { read: isAdminField },
      admin: { position: 'sidebar' },
    },
    {
      name: 'nipt',
      type: 'text',
      label: 'NIPT',
      access: { read: isAdminField },
      admin: { position: 'sidebar', description: 'Numri i identifikimit tatimor. I brendshëm.' },
    },

    seoGroup,
  ],
}
