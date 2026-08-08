import type { CollectionConfig } from 'payload'
import { listingFields } from '../fields/listing'
import { seoGroup } from '../fields/seo'
import { isAdmin, isAdminField, isStaff, isStaffField, publishedOrStaff, updateOwnListing } from '../access'

export const Properties: CollectionConfig = {
  slug: 'properties',
  labels: { singular: 'Property', plural: 'Properties' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'listingType', 'price', 'status', '_status', 'updatedAt'],
    group: 'Listings',
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
  fields: [
    ...listingFields,

    {
      name: 'reference',
      type: 'text',
      unique: true,
      index: true,
      admin: { position: 'sidebar', description: 'e.g. ATM-2026-0142' },
    },

    { name: 'area', type: 'relationship', relationTo: 'areas', required: true, index: true },
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
          admin: { width: '50%', description: 'e.g. Pranë Rotondës' },
        },
      ],
    },
    {
      name: 'location',
      type: 'point',
      required: true,
      admin: { description: 'Drag the pin. Drives the map and radius search.' },
    },

    {
      // Admin-only to change. If agents could reassign this, the ownership
      // rule in updateOwnListing would be trivially bypassable.
      name: 'agent',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
      filterOptions: { role: { in: ['agent', 'admin'] } },
      access: { update: isAdminField },
      admin: {
        position: 'sidebar',
        description: 'Owns this listing. Only an admin can reassign it.',
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

    {
      type: 'row',
      fields: [
        { name: 'verified', type: 'checkbox', defaultValue: false, admin: { width: '50%' } },
        { name: 'featured', type: 'checkbox', defaultValue: false, admin: { width: '50%' } },
      ],
    },

    {
      name: 'documentationNote',
      type: 'textarea',
      localized: true,
      admin: { description: 'Public. What documentation Atmos has verified.' },
    },

    // Private. Field-level access, not just admin.hidden — hidden fields still
    // come back over the REST API.
    {
      name: 'ownerName',
      type: 'text',
      access: { read: isStaffField, update: isStaffField },
      admin: { description: 'Private. Never rendered publicly.' },
    },
    {
      name: 'ownerPhone',
      type: 'text',
      access: { read: isStaffField, update: isStaffField },
    },
    {
      name: 'internalNotes',
      type: 'textarea',
      access: { read: isStaffField, update: isStaffField, create: isAdminField },
    },

    {
      name: 'sourceRequest',
      type: 'relationship',
      relationTo: 'listing-requests',
      access: { read: isStaffField },
      admin: { position: 'sidebar', description: 'The owner submission this came from.' },
    },

    seoGroup,
  ],
}
