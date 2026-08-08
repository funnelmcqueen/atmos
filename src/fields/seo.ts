import type { Field } from 'payload'

/**
 * Per-locale overrides. Empty means "generate from the entity" — the page
 * builds a sensible default so editors only fill this in when they care.
 */
export const seoGroup: Field = {
  name: 'seo',
  type: 'group',
  admin: { position: 'sidebar' },
  fields: [
    {
      name: 'metaTitle',
      type: 'text',
      localized: true,
      maxLength: 70,
      admin: { description: 'Leave empty to generate from the title.' },
    },
    {
      name: 'metaDescription',
      type: 'textarea',
      localized: true,
      maxLength: 175,
    },
    {
      name: 'ogImage',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Falls back to the first gallery image.' },
    },
    {
      name: 'noindex',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
}
