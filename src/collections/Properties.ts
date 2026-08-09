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
import {
  adminOnlyInPanel,
  isAdmin,
  isAdminField,
  isStaff,
  isStaffField,
  publishedOrStaff,
  updateOwnListing,
} from '../access'

export const Properties: CollectionConfig = {
  slug: 'properties',
  labels: { singular: 'Pronë', plural: 'Prona' },
  admin: {
    useAsTitle: 'title',
    // What an agent scans a list for: where it is, then what it costs. The
    // neighbourhood earns its column — nobody hunts a listing by square metres.
    defaultColumns: ['title', 'area', 'price', 'areaGross', 'status', '_status'],
    group: 'Listime',
    description: 'Prona individuale. Njësitë e projekteve janë koleksion më vete.',
  },
  versions: {
    drafts: { autosave: { interval: 800 } },
    maxPerDoc: 25,
  },
  access: {
    read: publishedOrStaff,
    create: isStaff,
    update: updateOwnListing,
    delete: isAdmin,
  },
  /**
   * Ordered the way an agent works a listing: what it is, where it is, what it
   * costs, how big, how it is laid out, what it has, photos — then the title and
   * description, which are written once the facts are on the page, and last the
   * owner's private details.
   *
   * The sections come from `src/fields/listing.ts` so a unit gets the same form.
   * They are `collapsible`, which stores nothing — see the note in that file
   * before turning one into a `group`.
   */
  fields: [
    typeAndMarketSection,

    // 2. Where it is. Property-only: a unit inherits its project's location.
    {
      type: 'collapsible',
      label: 'Vendndodhja',
      fields: [
        {
          name: 'area',
          type: 'relationship',
          label: 'Zona',
          relationTo: 'areas',
          required: true,
          index: true,
          admin: { description: 'Lagjja ose qyteti. Kjo është ajo mbi të cilën filtrohet kërkimi.' },
        },
        {
          type: 'row',
          fields: [
            {
              // Listings are advertised by street, not neighbourhood:
              // "Rruga Tom Plezha", "Rruga Bardhyl". Free text on purpose — a
              // street table would need constant maintenance for no filter value.
              name: 'street',
              type: 'text',
              label: 'Rruga',
              admin: { width: '50%' },
            },
            {
              name: 'landmark',
              type: 'text',
              label: 'Pikë referimi',
              admin: { width: '50%', description: 'P.sh. “Pranë Rotondës”.' },
            },
          ],
        },
        {
          name: 'location',
          type: 'point',
          label: 'Vendndodhja në hartë',
          required: true,
          admin: {
            description: 'Lëvize shënjuesin mbi ndërtesë. Ushqen hartën dhe kërkimin me rreze.',
          },
        },
      ],
    },

    priceSection,
    areaSection,
    layoutSection,
    featuresSection,
    gallerySection,

    titleSection([
      {
        name: 'documentationNote',
        type: 'textarea',
        label: 'Shënim për dokumentacionin',
        localized: true,
        admin: {
          description: 'Publike. Çfarë dokumentacioni ka verifikuar Atmos për këtë pronë.',
        },
      },
    ]),

    // 9. Private. Field-level access, not just admin.hidden — hidden fields
    // still come back over the REST API.
    //
    // Do not put these two in a `row`. A `row` nested in a `collapsible` drops
    // any child that carries field-level `access` — the fields vanish from the
    // form with no error, while the same row renders fine when its children
    // have no `access` (every other section here proves that). Cost of the
    // workaround is two full-width inputs instead of a 50/50 pair, which on a
    // phone is what they render as anyway. See docs/progress.md.
    {
      type: 'collapsible',
      label: 'Të dhënat e pronarit',
      admin: { description: 'Private. Nuk shfaqen kurrë në sajt.' },
      fields: [
        {
          name: 'ownerName',
          type: 'text',
          label: 'Emri i pronarit',
          access: { read: isStaffField, update: isStaffField },
        },
        {
          name: 'ownerPhone',
          type: 'text',
          label: 'Telefoni i pronarit',
          access: { read: isStaffField, update: isStaffField },
        },
        {
          name: 'internalNotes',
          type: 'textarea',
          label: 'Shënime të brendshme',
          access: { read: isStaffField, update: isStaffField, create: isAdminField },
          admin: { description: 'Vetëm për ekipin. Nuk dalin as në API publike.' },
        },
      ],
    },

    // --- Sidebar ------------------------------------------------------------
    listingSlugField,
    {
      name: 'reference',
      type: 'text',
      label: 'Referenca',
      unique: true,
      index: true,
      admin: { position: 'sidebar', description: 'P.sh. ATM-2026-0142.' },
    },
    {
      // Admin-only to change. If agents could reassign this, the ownership
      // rule in updateOwnListing would be trivially bypassable.
      name: 'agent',
      type: 'relationship',
      label: 'Agjenti',
      relationTo: 'users',
      required: true,
      index: true,
      filterOptions: { role: { in: ['agent', 'admin'] } },
      access: { update: isAdminField },
      admin: {
        position: 'sidebar',
        description: 'Kjo pronë i përket këtij agjenti. Vetëm administratori mund ta ndryshojë.',
      },
      hooks: {
        beforeChange: [
          ({ value, req, operation }) => {
            if (operation === 'create' && !value && req.user) return req.user.id
            return value
          },
        ],
      },
    },
    priceEurField,
    publishedAtField,
    {
      name: 'verified',
      type: 'checkbox',
      label: 'E verifikuar nga Atmos',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    {
      name: 'featured',
      type: 'checkbox',
      label: 'E promovuar',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    {
      name: 'sourceRequest',
      type: 'relationship',
      label: 'Nga kërkesa',
      relationTo: 'listing-requests',
      access: { read: isStaffField },
      admin: {
        position: 'sidebar',
        condition: adminOnlyInPanel,
        description: 'Kërkesa e pronarit nga e cila lindi kjo pronë.',
      },
    },

    seoGroup,
  ],
}
