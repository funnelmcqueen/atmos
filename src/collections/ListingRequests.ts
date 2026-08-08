import type { CollectionConfig } from 'payload'
import { anyone, isAdmin, isStaff } from '../access'

/**
 * Owner submissions. Never public, no public route, no drafts.
 * An agent reads this and creates the Property by hand — the manual step is
 * the product. See docs/05-listing-requests.md.
 */
export const ListingRequests: CollectionConfig = {
  slug: 'listing-requests',
  labels: { singular: 'Listing request', plural: 'Listing requests' },
  admin: {
    useAsTitle: 'ownerName',
    defaultColumns: ['ownerName', 'city', 'listingType', 'askingPrice', 'requestStatus', 'createdAt'],
    group: 'Inbox',
  },
  access: {
    create: anyone,
    read: isStaff,
    update: isStaff,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'requestStatus',
      type: 'select',
      required: true,
      defaultValue: 'new',
      options: [
        { label: 'New', value: 'new' },
        { label: 'Contacted', value: 'contacted' },
        { label: 'Verified', value: 'verified' },
        { label: 'Published', value: 'published' },
        { label: 'Rejected', value: 'rejected' },
      ],
      admin: { position: 'sidebar' },
    },

    {
      type: 'row',
      fields: [
        { name: 'ownerName', type: 'text', required: true, admin: { width: '33%' } },
        { name: 'ownerPhone', type: 'text', required: true, admin: { width: '33%' } },
        { name: 'ownerEmail', type: 'email', admin: { width: '33%' } },
      ],
    },

    {
      type: 'row',
      fields: [
        { name: 'city', type: 'text', required: true, admin: { width: '50%' } },
        { name: 'areaName', type: 'text', admin: { width: '50%' } },
      ],
    },
    { name: 'address', type: 'text' },

    {
      type: 'row',
      fields: [
        {
          name: 'listingType',
          type: 'select',
          required: true,
          options: [
            { label: 'Në shitje', value: 'sale' },
            { label: 'Me qira', value: 'rent' },
          ],
          admin: { width: '50%' },
        },
        { name: 'propertyType', type: 'text', admin: { width: '50%' } },
      ],
    },

    {
      type: 'row',
      fields: [
        { name: 'rooms', type: 'text', admin: { width: '33%' } },
        { name: 'areaSqm', type: 'number', admin: { width: '33%' } },
        { name: 'floor', type: 'number', admin: { width: '33%' } },
      ],
    },
    { name: 'askingPrice', type: 'number' },
    { name: 'description', type: 'textarea' },

    {
      name: 'photos',
      type: 'array',
      maxRows: 15,
      fields: [{ name: 'image', type: 'upload', relationTo: 'media', required: true }],
    },

    { name: 'hasDocumentation', type: 'checkbox', label: 'Owner confirms documentation is in order' },

    // Consent record — §20 of the vision doc.
    { name: 'termsVersion', type: 'text', required: true, admin: { readOnly: true } },
    { name: 'termsAcceptedAt', type: 'date', required: true, admin: { readOnly: true } },
    { name: 'submittedLocale', type: 'text', admin: { readOnly: true } },

    {
      name: 'assignedAgent',
      type: 'relationship',
      relationTo: 'users',
      filterOptions: { role: { in: ['agent', 'admin'] } },
      admin: { position: 'sidebar' },
    },
    { name: 'internalNotes', type: 'textarea' },
    { name: 'rejectionReason', type: 'textarea' },
    {
      name: 'linkedProperty',
      type: 'relationship',
      relationTo: 'properties',
      admin: { position: 'sidebar', description: 'Set once the listing goes live.' },
    },
  ],
}
