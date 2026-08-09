import type { CollectionConfig } from 'payload'
import { adminOnlyInPanel, isAdmin, isStaff } from '../access'

/**
 * Owner submissions. Never public, no public route, no drafts.
 * An agent reads this and creates the Property by hand — the manual step is
 * the product. See docs/05-listing-requests.md.
 *
 * `create` is **closed**, like Enquiries. The public form at
 * /[locale]/dergo-pronen posts to `src/app/actions/listing-request.ts`, which
 * runs the honeypot, signed timing, rate-limit and terms checks before creating
 * the row with `overrideAccess`. A writable `/api/listing-requests` would let a
 * bot skip all of it — and this collection accepts photo uploads, so an open
 * endpoint is worth even less here than elsewhere.
 */
export const ListingRequests: CollectionConfig = {
  slug: 'listing-requests',
  labels: { singular: 'Kërkesë prone', plural: 'Kërkesa pronash' },
  admin: {
    useAsTitle: 'ownerName',
    defaultColumns: ['ownerName', 'ownerPhone', 'city', 'listingType', 'askingPrice', 'requestStatus', 'createdAt'],
    group: 'Kutia hyrëse',
    description: 'Prona që dërgojnë vetë pronarët. Verifikoji, pastaj krijo pronën me dorë.',
  },
  access: {
    create: () => false, // server action only — see the note above
    read: isStaff,
    update: isStaff,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'requestStatus',
      type: 'select',
      label: 'Statusi i kërkesës',
      required: true,
      defaultValue: 'new',
      options: [
        { label: 'E re', value: 'new' },
        { label: 'Kontaktuar', value: 'contacted' },
        { label: 'E verifikuar', value: 'verified' },
        { label: 'Publikuar', value: 'published' },
        { label: 'Refuzuar', value: 'rejected' },
      ],
      admin: { position: 'sidebar' },
    },

    {
      type: 'row',
      fields: [
        { name: 'ownerName', type: 'text', label: 'Emri i pronarit', required: true, admin: { width: '33%' } },
        { name: 'ownerPhone', type: 'text', label: 'Telefoni', required: true, admin: { width: '33%' } },
        { name: 'ownerEmail', type: 'email', label: 'Email', admin: { width: '33%' } },
      ],
    },

    {
      type: 'row',
      fields: [
        { name: 'city', type: 'text', label: 'Qyteti', required: true, admin: { width: '50%' } },
        { name: 'areaName', type: 'text', label: 'Zona', admin: { width: '50%' } },
      ],
    },
    { name: 'address', type: 'text', label: 'Adresa' },

    {
      type: 'row',
      fields: [
        {
          name: 'listingType',
          type: 'select',
          label: 'Transaksioni',
          required: true,
          options: [
            { label: 'Në shitje', value: 'sale' },
            { label: 'Me qira', value: 'rent' },
          ],
          admin: { width: '50%' },
        },
        {
          name: 'propertyType',
          type: 'text',
          label: 'Lloji i pronës',
          admin: { width: '50%', description: 'Siç e ka shkruar pronari, tekst i lirë.' },
        },
      ],
    },

    {
      type: 'row',
      fields: [
        { name: 'rooms', type: 'text', label: 'Dhomat', admin: { width: '33%' } },
        { name: 'areaSqm', type: 'number', label: 'Sipërfaqja (m²)', admin: { width: '33%' } },
        { name: 'floor', type: 'number', label: 'Kati', admin: { width: '33%' } },
      ],
    },
    { name: 'askingPrice', type: 'number', label: 'Çmimi i kërkuar (EUR)' },
    { name: 'description', type: 'textarea', label: 'Përshkrimi' },

    {
      name: 'photos',
      type: 'array',
      label: 'Fotot e dërguara',
      labels: { singular: 'Foto', plural: 'Foto' },
      maxRows: 15,
      fields: [{ name: 'image', type: 'upload', label: 'Fotoja', relationTo: 'media', required: true }],
    },

    {
      name: 'hasDocumentation',
      type: 'checkbox',
      label: 'Pronari konfirmon se dokumentacioni është në rregull',
    },

    // Consent record — §20 of the vision doc.
    //
    // Deliberately NOT hidden behind `adminOnlyInPanel`, unlike the other
    // plumbing below. An `admin.condition` on a required field relaxes it to
    // optional in the generated types, because a field the panel never renders
    // may never be submitted — Payload will happily tell you so if you add one
    // and re-run `generate:types`. These two are the consent trail and stay
    // required. They are read-only and two lines long; an agent can scroll past.
    {
      name: 'termsVersion',
      type: 'text',
      label: 'Versioni i kushteve',
      required: true,
      admin: { readOnly: true },
    },
    {
      name: 'termsAcceptedAt',
      type: 'date',
      label: 'Kushtet pranuar më',
      required: true,
      admin: { readOnly: true },
    },
    {
      name: 'submittedLocale',
      type: 'text',
      label: 'Gjuha e dërgimit',
      admin: { readOnly: true, condition: adminOnlyInPanel },
    },

    // Salted hash of the submitter's IP — rate limiting and abuse triage
    // without keeping raw addresses. Same field as on Enquiries.
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

    {
      name: 'assignedAgent',
      type: 'relationship',
      label: 'Agjenti përgjegjës',
      relationTo: 'users',
      filterOptions: { role: { in: ['agent', 'admin'] } },
      admin: { position: 'sidebar' },
    },
    { name: 'internalNotes', type: 'textarea', label: 'Shënime të brendshme' },
    {
      name: 'rejectionReason',
      type: 'textarea',
      label: 'Arsyeja e refuzimit',
      admin: { condition: (data) => data?.requestStatus === 'rejected' },
    },
    {
      name: 'linkedProperty',
      type: 'relationship',
      label: 'Prona e krijuar',
      relationTo: 'properties',
      admin: { position: 'sidebar', description: 'Lidhe pasi prona të jetë publikuar.' },
    },
  ],
}
