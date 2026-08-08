import type { CollectionConfig } from 'payload'
import { isAdmin, isStaff } from '../access'

/**
 * Enquiries from a listing or project detail page (docs/05).
 *
 * `create` is **closed**, deliberately. This is a public form, but the public
 * does not post here directly — `src/app/actions/enquiry.ts` validates the
 * honeypot, the signed timing token, the rate limit and the terms acceptance,
 * then creates the row with `overrideAccess`. Leaving `create: anyone` would
 * publish a writable `/api/enquiries` endpoint that skips every one of those
 * checks, which makes the anti-spam work decorative. If you need another way in,
 * add another server action — do not reopen this.
 */
export const Enquiries: CollectionConfig = {
  slug: 'enquiries',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'phone', 'sourceType', 'handled', 'createdAt'],
    group: 'Inbox',
  },
  access: { create: () => false, read: isStaff, update: isStaff, delete: isAdmin },
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
      filterOptions: { role: { in: ['agent', 'admin'] } },
      admin: {
        position: 'sidebar',
        description: 'Resolved on submit from the listing or project. Empty means it went to the shared inbox.',
      },
    },

    // Consent record — §20 of the vision doc, docs/05. Version *and* timestamp,
    // both set server-side from the submission, never from the client.
    { name: 'termsVersion', type: 'text', admin: { readOnly: true } },
    { name: 'termsAcceptedAt', type: 'date', admin: { readOnly: true } },

    // Salted hash of the submitter's IP. Never the raw address: this exists to
    // rate-limit and to spot an abusive source, and a one-way hash does both
    // without the site keeping a log of who looked at what.
    {
      name: 'ipHash',
      type: 'text',
      index: true,
      admin: { readOnly: true, position: 'sidebar', description: 'Salted hash, for rate limiting.' },
    },
  ],
  hooks: {
    afterChange: [
      async ({ operation, doc, req }) => {
        if (operation !== 'create') return
        // The notification email is sent by the server action, after the create
        // commits — not here. An afterChange hook runs inside the transaction,
        // so a slow or failing Resend call would hold a lead open or roll back
        // one already accepted. This is a log line, nothing more.
        req.payload.logger.info(`New enquiry ${doc.id} on ${doc.sourceType} ${doc.sourceId}`)
      },
    ],
  },
}
