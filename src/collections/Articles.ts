import type { CollectionConfig } from 'payload'
import { slugField } from '../fields/slug'
import { seoGroup } from '../fields/seo'
import { isAdmin, isStaff, publishedOrStaff, updateUnlessPublishing } from '../access'

export const Articles: CollectionConfig = {
  slug: 'articles',
  labels: { singular: 'Artikull', plural: 'Artikuj' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'author', 'publishedAt', '_status'],
    group: 'Editoriale',
  },
  versions: { drafts: { autosave: { interval: 800 } }, maxPerDoc: 25 },
  access: {
    read: publishedOrStaff,
    create: isStaff,
    update: updateUnlessPublishing,
    delete: isAdmin,
  },
  fields: [
    { name: 'title', type: 'text', label: 'Titulli', required: true, localized: true },
    slugField('title'),
    {
      name: 'excerpt',
      type: 'textarea',
      label: 'Hyrja',
      localized: true,
      maxLength: 220,
      admin: { description: 'Dy fjali që shfaqen në listë dhe në Google.' },
    },
    { name: 'body', type: 'richText', label: 'Teksti', localized: true },
    { name: 'coverImage', type: 'upload', label: 'Fotoja e ballinës', relationTo: 'media' },

    {
      name: 'category',
      type: 'select',
      label: 'Kategoria',
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
    {
      name: 'relatedAreas',
      type: 'relationship',
      label: 'Zonat e lidhura',
      relationTo: 'areas',
      hasMany: true,
    },
    {
      name: 'relatedCompanies',
      type: 'relationship',
      label: 'Kompanitë e lidhura',
      relationTo: 'companies',
      hasMany: true,
    },
    {
      name: 'relatedProjects',
      type: 'relationship',
      label: 'Projektet e lidhura',
      relationTo: 'projects',
      hasMany: true,
    },

    {
      name: 'author',
      type: 'relationship',
      label: 'Autori',
      relationTo: 'users',
      admin: { position: 'sidebar' },
    },
    { name: 'publishedAt', type: 'date', label: 'Publikuar më', admin: { position: 'sidebar' } },
    {
      name: 'contentType',
      type: 'select',
      label: 'Lloji i përmbajtjes',
      required: true,
      defaultValue: 'editorial',
      options: [
        { label: 'Editorial', value: 'editorial' },
        { label: 'Analizë', value: 'analysis' },
        { label: 'I sponsorizuar', value: 'sponsored' },
      ],
      admin: {
        position: 'sidebar',
        description:
          'Përmbajtja e sponsorizuar shënohet si e tillë në faqe. Nuk është me zgjedhje.',
      },
    },

    seoGroup,
  ],
}
