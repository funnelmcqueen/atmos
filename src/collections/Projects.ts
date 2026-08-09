import type { CollectionConfig } from 'payload'
import { slugField } from '../fields/slug'
import { seoGroup } from '../fields/seo'
import { adminOnlyInPanel, isAdmin, isStaff, publishedOrStaff, updateUnlessPublishing } from '../access'

export const Projects: CollectionConfig = {
  slug: 'projects',
  labels: { singular: 'Projekt', plural: 'Projekte' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'developer', 'area', 'constructionPhase', '_status', 'updatedAt'],
    group: 'Listime',
    description: 'Rezidenca dhe komplekse të reja. Njësitë shtohen te “Njësitë”.',
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
    { name: 'name', type: 'text', label: 'Emri i projektit', required: true },
    slugField('name'),

    { name: 'tagline', type: 'text', label: 'Slogani', localized: true },
    { name: 'description', type: 'richText', label: 'Përshkrimi', localized: true },

    {
      name: 'developer',
      type: 'relationship',
      label: 'Investitori',
      relationTo: 'companies',
      required: true,
      index: true,
    },
    {
      name: 'area',
      type: 'relationship',
      label: 'Zona',
      relationTo: 'areas',
      required: true,
      index: true,
    },
    {
      name: 'location',
      type: 'point',
      label: 'Vendndodhja në hartë',
      required: true,
      admin: { description: 'Njësitë e këtij projekti e trashëgojnë këtë vendndodhje.' },
    },

    /**
     * The agent who owns this development's leads.
     *
     * A project is one developer relationship and in practice one person
     * handles it, so enquiries on the project page and on every unit beneath it
     * route here (docs/05). Units deliberately have no agent of their own —
     * they inherit this one, the same way they inherit area, location and
     * developer (docs/03). Unset falls back to the shared inbox, which is a
     * triage queue, not a destination: leads sitting in a shared inbox get lost.
     */
    {
      name: 'agent',
      type: 'relationship',
      label: 'Agjenti',
      relationTo: 'users',
      filterOptions: { role: { in: ['agent', 'admin'] } },
      admin: {
        position: 'sidebar',
        description: 'Merr kërkesat për këtë projekt dhe për të gjitha njësitë e tij.',
      },
    },

    {
      type: 'row',
      fields: [
        {
          name: 'constructionPhase',
          type: 'select',
          label: 'Faza e ndërtimit',
          required: true,
          defaultValue: 'underConstruction',
          options: [
            { label: 'Në planifikim', value: 'planning' },
            { label: 'Në ndërtim', value: 'underConstruction' },
            { label: 'Përfunduar', value: 'completed' },
          ],
          admin: {
            width: '50%',
            description: 'Faza e gjithë projektit. Ndryshe nga faza e një njësie të veçantë.',
          },
        },
        {
          name: 'completionDate',
          type: 'date',
          label: 'Data e përfundimit',
          admin: { width: '50%', date: { pickerAppearance: 'monthOnly' } },
        },
      ],
    },

    {
      name: 'gallery',
      type: 'array',
      label: 'Galeria',
      minRows: 1,
      labels: { singular: 'Foto', plural: 'Foto' },
      admin: { description: 'Fotoja e parë shfaqet në listën e projekteve.' },
      fields: [
        { name: 'image', type: 'upload', label: 'Fotoja', relationTo: 'media', required: true },
        { name: 'caption', type: 'text', label: 'Përshkrimi i fotos', localized: true },
      ],
    },
    { name: 'sitePlan', type: 'upload', label: 'Plani i sitit', relationTo: 'media' },
    { name: 'brochure', type: 'upload', label: 'Broshura', relationTo: 'media' },

    // Denormalized so the project card doesn't aggregate units on render.
    // Recomputed from published units by the afterChange/afterDelete hooks in
    // collections/hooks/recalcUnitTypes.ts — see docs/03.
    {
      name: 'unitTypesSummary',
      type: 'array',
      label: 'Përmbledhje e njësive',
      // Derived and read-only: nothing an agent can act on, so it stays out of
      // their form. Recomputed by the hooks above whenever a unit moves.
      admin: {
        readOnly: true,
        condition: adminOnlyInPanel,
        description: 'E llogaritur nga njësitë e publikuara. Nuk plotësohet me dorë.',
      },
      fields: [
        { name: 'rooms', type: 'text', label: 'Dhomat' },
        { name: 'areaFrom', type: 'number', label: 'Sipërfaqja nga' },
        { name: 'areaTo', type: 'number', label: 'Sipërfaqja deri' },
        { name: 'priceFrom', type: 'number', label: 'Çmimi nga' },
        { name: 'availableCount', type: 'number', label: 'Njësi të lira' },
      ],
    },

    {
      name: 'featured',
      type: 'checkbox',
      label: 'I promovuar',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    { name: 'publishedAt', type: 'date', label: 'Publikuar më', admin: { position: 'sidebar' } },

    seoGroup,
  ],
}
