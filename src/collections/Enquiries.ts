import type { CollectionConfig } from 'payload'
import { adminOnlyInPanel, isAdmin, isStaff } from '../access'

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
  labels: { singular: 'Kërkesë kontakti', plural: 'Kërkesa kontakti' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'phone', 'sourceTitle', 'sourceType', 'handled', 'createdAt'],
    group: 'Kutia hyrëse',
    description: 'Kontakte nga faqet e pronave dhe projekteve. Kthe përgjigje brenda ditës.',
  },
  access: { create: () => false, read: isStaff, update: isStaff, delete: isAdmin },
  fields: [
    { name: 'name', type: 'text', label: 'Emri', required: true },
    { name: 'phone', type: 'text', label: 'Telefoni', required: true },
    { name: 'email', type: 'email', label: 'Email' },
    { name: 'message', type: 'textarea', label: 'Mesazhi' },
    {
      name: 'sourceType',
      type: 'select',
      label: 'Erdhi nga',
      required: true,
      options: [
        { label: 'Pronë', value: 'property' },
        { label: 'Njësi projekti', value: 'unit' },
        { label: 'Projekt', value: 'project' },
      ],
    },
    {
      // Required, so no `adminOnlyInPanel` here — a condition on a required
      // field relaxes it to optional in the generated types. See the note in
      // ListingRequests.ts.
      name: 'sourceId',
      type: 'text',
      label: 'ID e burimit',
      required: true,
      index: true,
      admin: { readOnly: true },
    },
    { name: 'sourceTitle', type: 'text', label: 'Titulli i pronës', admin: { readOnly: true } },
    {
      name: 'locale',
      type: 'text',
      label: 'Gjuha',
      admin: { readOnly: true, condition: adminOnlyInPanel },
    },
    {
      name: 'handled',
      type: 'checkbox',
      label: 'U trajtua',
      defaultValue: false,
      admin: { position: 'sidebar', description: 'Shënoje pasi ta kesh kontaktuar personin.' },
    },
    {
      name: 'assignedAgent',
      type: 'relationship',
      label: 'Agjenti përgjegjës',
      relationTo: 'users',
      filterOptions: { role: { in: ['agent', 'admin'] } },
      admin: {
        position: 'sidebar',
        description:
          'Merret nga prona ose projekti kur dërgohet. Bosh do të thotë se shkoi te kutia e përbashkët.',
      },
    },

    // Consent record — §20 of the vision doc, docs/05. Version *and* timestamp,
    // both set server-side from the submission, never from the client.
    {
      name: 'termsVersion',
      type: 'text',
      label: 'Versioni i kushteve',
      admin: { readOnly: true, condition: adminOnlyInPanel },
    },
    {
      name: 'termsAcceptedAt',
      type: 'date',
      label: 'Kushtet pranuar më',
      admin: { readOnly: true, condition: adminOnlyInPanel },
    },

    // Salted hash of the submitter's IP. Never the raw address: this exists to
    // rate-limit and to spot an abusive source, and a one-way hash does both
    // without the site keeping a log of who looked at what.
    {
      name: 'ipHash',
      type: 'text',
      label: 'Gjurma e IP-së',
      index: true,
      admin: {
        readOnly: true,
        position: 'sidebar',
        condition: adminOnlyInPanel,
        description: 'Hash i kriptuar, vetëm për kufizimin e abuzimeve.',
      },
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
