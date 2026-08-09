import type { Field } from 'payload'
import { adminOnlyInPanel } from '../access'

/**
 * Per-locale overrides. Empty means "generate from the entity" — the page
 * builds a sensible default so editors only fill this in when they care.
 *
 * Hidden from agents. Nothing here changes what a visitor sees on the listing
 * itself, the defaults are good, and an agent guessing at meta descriptions is
 * worse than the generated ones. Admins still get the whole group.
 */
export const seoGroup: Field = {
  name: 'seo',
  type: 'group',
  label: 'SEO',
  admin: { position: 'sidebar', condition: adminOnlyInPanel },
  fields: [
    {
      name: 'metaTitle',
      type: 'text',
      label: 'Titulli për Google',
      localized: true,
      maxLength: 70,
      admin: { description: 'Lëre bosh që të krijohet vetë nga titulli.' },
    },
    {
      name: 'metaDescription',
      type: 'textarea',
      label: 'Përshkrimi për Google',
      localized: true,
      maxLength: 175,
    },
    {
      name: 'ogImage',
      type: 'upload',
      label: 'Fotoja për rrjetet sociale',
      relationTo: 'media',
      admin: { description: 'Nëse bosh, merret fotoja e parë e galerisë.' },
    },
    {
      name: 'noindex',
      type: 'checkbox',
      label: 'Mos e indeksho në Google',
      defaultValue: false,
    },
  ],
}
