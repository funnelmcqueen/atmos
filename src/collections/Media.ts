import type { CollectionConfig } from 'payload'
import { anyone, isAdmin, isStaff } from '../access'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Skedar', plural: 'Media' },
  admin: { group: 'Sistemi', defaultColumns: ['filename', 'alt', 'updatedAt'] },
  access: { read: anyone, create: isStaff, update: isStaff, delete: isAdmin },
  upload: {
    mimeTypes: ['image/*', 'application/pdf'],
    imageSizes: [
      { name: 'thumb', width: 400, height: 300, position: 'centre' },
      { name: 'card', width: 800, height: 600, position: 'centre' },
      { name: 'hero', width: 1600, height: 900, position: 'centre' },
      { name: 'og', width: 1200, height: 630, position: 'centre' },
    ],
    focalPoint: true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Përshkrimi i fotos',
      localized: true,
      admin: {
        description:
          'Përshkruaj çfarë duket në foto. E nevojshme për çdo foto që shfaqet te vizitorët.',
      },
    },
    { name: 'credit', type: 'text', label: 'Kredia' },
  ],
}
