import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminField } from '../access'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    tokenExpiration: 60 * 60 * 8,
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000,
  },
  labels: { singular: 'Përdorues', plural: 'Përdoruesit' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'role', 'phone', 'updatedAt'],
    group: 'Sistemi',
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      if ((user as { role?: string }).role === 'admin') return true
      return { id: { equals: user.id } }
    },
    create: isAdmin,
    update: ({ req: { user }, id }) => {
      if (!user) return false
      if ((user as { role?: string }).role === 'admin') return true
      return user.id === id
    },
    delete: isAdmin,
  },
  fields: [
    { name: 'name', type: 'text', label: 'Emri dhe mbiemri', required: true },
    {
      name: 'role',
      type: 'select',
      label: 'Roli',
      required: true,
      defaultValue: 'client',
      options: [
        { label: 'Administrator', value: 'admin' },
        { label: 'Agjent', value: 'agent' },
        { label: 'Klient', value: 'client' },
      ],
      access: { update: isAdminField, create: isAdminField },
      admin: { description: 'Vetëm administratori mund ta ndryshojë rolin.' },
    },
    {
      name: 'phone',
      type: 'text',
      label: 'Telefoni',
      admin: {
        description:
          'Shfaqet publikisht te pronat e këtij agjenti dhe përdoret për WhatsApp. Me kod shteti, p.sh. +355 69 20 11 555.',
      },
    },
    { name: 'photo', type: 'upload', label: 'Fotoja', relationTo: 'media' },
    {
      name: 'bio',
      type: 'textarea',
      label: 'Përshkrimi',
      localized: true,
      admin: {
        condition: (d) => d?.role === 'agent',
        description: 'Publik. Shfaqet te kartela e agjentit në faqen e pronës.',
      },
    },
  ],
}
