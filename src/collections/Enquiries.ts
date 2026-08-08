import type { CollectionConfig } from 'payload'
import { anyone, isAdmin, isStaff } from '../access'

export const Enquiries: CollectionConfig = {
  slug: 'enquiries',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'phone', 'sourceType', 'handled', 'createdAt'],
    group: 'Inbox',
  },
  access: { create: anyone, read: isStaff, update: isStaff, delete: isAdmin },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'phone', type: 'text', required: true },
    { name: 'email', type: 'email' },
    { name: 'message', type: 'textarea' },
    {
      name: 'sourceType',
      type: 'select',
      required: true,
      options: ['property', 'unit', 'project'],
    },
    { name: 'sourceId', type: 'text', required: true, index: true },
    { name: 'sourceTitle', type: 'text', admin: { readOnly: true } },
    { name: 'locale', type: 'text', admin: { readOnly: true } },
    { name: 'handled', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar' } },
    {
      name: 'assignedAgent',
      type: 'relationship',
      relationTo: 'users',
      admin: { position: 'sidebar' },
    },
    { name: 'termsVersion', type: 'text', admin: { readOnly: true } },
  ],
  hooks: {
    afterChange: [
      async ({ operation, doc, req }) => {
        if (operation !== 'create') return
        // Notify the assigned agent via Resend. Implement in src/lib/email.ts.
        req.payload.logger.info(`New enquiry ${doc.id} on ${doc.sourceType} ${doc.sourceId}`)
      },
    ],
  },
}
