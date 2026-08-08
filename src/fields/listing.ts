import type { Field } from 'payload'
import { slugField } from './slug'

export const PROPERTY_TYPES = [
  'apartment', 'villa', 'house', 'shop', 'office', 'warehouse', 'land',
] as const

/** Types with no rooms, floor or orientation. */
export const LANDLIKE_TYPES: readonly string[] = ['land']

export const FEATURE_OPTIONS = [
  'parking', 'elevator', 'balcony', 'terrace', 'garden', 'pool', 'furnished',
  'seaView', 'cityView', 'lakeView', 'heating', 'airConditioning', 'security',
  'storage', 'streetFront',
] as const

export const ORIENTATIONS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'] as const

/**
 * Albanian market convention for an existing building's finish level.
 * Buyers filter on this — it is not the same as a project's constructionPhase.
 */
export const BUILDING_PHASES = [
  { label: 'Fazë tulle', value: 'brick' },
  { label: 'Fazë fasade', value: 'facade' },
  { label: 'E përfunduar', value: 'finished' },
  { label: 'Ndërtim ekzistues', value: 'existing' },
] as const

/**
 * Lek per euro, used only to populate `priceEur` so mixed-currency listings
 * sort and filter correctly. Display always uses the original price and
 * currency. Update in env when the rate moves materially.
 */
export const ALL_PER_EUR = Number(process.env.ALL_PER_EUR ?? 100)

const requiredUnlessLand = (label: string) =>
  (value: unknown, { data }: { data?: Record<string, unknown> }) => {
    if (LANDLIKE_TYPES.includes(String(data?.propertyType))) return true
    if (value === undefined || value === null || value === '') return `${label} is required.`
    return true
  }

/**
 * Shared by `properties` and `project-units`.
 *
 * Field names here are load-bearing: db/listing-index.sql unions both tables on
 * exactly these columns. Rename one and you must update the view in the same
 * commit. See docs/01-data-model.md.
 */
export const listingFields: Field[] = [
  { name: 'title', type: 'text', required: true, localized: true },
  slugField('title'),
  { name: 'description', type: 'richText', localized: true },

  {
    name: 'propertyType',
    type: 'select',
    required: true,
    defaultValue: 'apartment',
    options: [
      { label: 'Apartament', value: 'apartment' },
      { label: 'Vilë', value: 'villa' },
      { label: 'Shtëpi private', value: 'house' },
      { label: 'Dyqan', value: 'shop' },
      { label: 'Zyrë', value: 'office' },
      { label: 'Magazinë', value: 'warehouse' },
      { label: 'Truall / Tokë', value: 'land' },
    ],
    admin: { description: 'Land hides rooms, floor and orientation.' },
  },

  // --- Price -----------------------------------------------------------------
  {
    type: 'row',
    fields: [
      {
        name: 'price',
        type: 'number',
        min: 0,
        admin: {
          width: '40%',
          condition: (data) => !data?.priceOnRequest,
        },
        validate: (value: unknown, { data }: { data?: Record<string, unknown> }) => {
          if (data?.priceOnRequest) return true
          if (typeof value !== 'number') return 'Enter a price or tick "price on request".'
          return true
        },
      },
      {
        name: 'currency',
        type: 'select',
        required: true,
        defaultValue: 'EUR',
        options: ['EUR', 'ALL'],
        admin: { width: '25%', condition: (data) => !data?.priceOnRequest },
      },
      {
        name: 'priceOnRequest',
        type: 'checkbox',
        defaultValue: false,
        label: 'Çmimi me kërkesë',
        admin: { width: '35%' },
      },
    ],
  },
  {
    // Normalised for sorting and range filters across mixed currencies.
    // Never shown to visitors — the card renders price + currency as entered.
    name: 'priceEur',
    type: 'number',
    index: true,
    admin: { readOnly: true, position: 'sidebar', description: 'Derived. For sorting only.' },
    hooks: {
      beforeChange: [
        ({ data }) => {
          if (data?.priceOnRequest || typeof data?.price !== 'number') return null
          return data.currency === 'ALL'
            ? Math.round(data.price / ALL_PER_EUR)
            : data.price
        },
      ],
    },
  },
  {
    name: 'rentPeriod',
    type: 'select',
    defaultValue: 'monthly',
    options: [
      { label: 'Në muaj', value: 'monthly' },
      { label: 'Në natë', value: 'nightly' },
    ],
    admin: { condition: (data) => data?.listingType === 'rent' },
  },

  // --- Areas -----------------------------------------------------------------
  {
    type: 'row',
    fields: [
      {
        name: 'areaGross',
        type: 'number',
        required: true,
        min: 1,
        label: 'Sipërfaqe totale (m²)',
        admin: { width: '50%', description: 'Price per m² is calculated from this.' },
      },
      {
        name: 'areaNet',
        type: 'number',
        min: 1,
        label: 'Sipërfaqe neto (m²)',
        admin: { width: '50%' },
      },
    ],
  },
  {
    type: 'row',
    fields: [
      {
        name: 'terraceSqm',
        type: 'number',
        label: 'Verandë / tarracë (m²)',
        admin: { width: '50%' },
      },
      {
        name: 'commonAreaSqm',
        type: 'number',
        label: 'Sipërfaqe e përbashkët (m²)',
        admin: { width: '50%' },
      },
    ],
  },

  // --- Layout ----------------------------------------------------------------
  {
    type: 'row',
    admin: { condition: (data) => !LANDLIKE_TYPES.includes(data?.propertyType) },
    fields: [
      {
        name: 'rooms',
        type: 'text',
        admin: { width: '33%', description: 'Albanian convention: 2+1, 1+1+2' },
        validate: requiredUnlessLand('Rooms'),
      },
      { name: 'bedrooms', type: 'number', min: 0, admin: { width: '33%' } },
      { name: 'bathrooms', type: 'number', min: 0, admin: { width: '33%' } },
    ],
  },
  {
    type: 'row',
    admin: { condition: (data) => !LANDLIKE_TYPES.includes(data?.propertyType) },
    fields: [
      { name: 'floor', type: 'number', admin: { width: '50%' } },
      {
        name: 'orientation',
        type: 'select',
        hasMany: true,
        options: [...ORIENTATIONS],
        admin: { width: '50%', description: 'Listings often quote two or three.' },
      },
    ],
  },

  // --- Market ----------------------------------------------------------------
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
      {
        name: 'status',
        // `dbName` gives this select its own enum type. Without it, Payload
        // derives `enum_<table>_status`, which collides with the drafts
        // `_status` field's enum of the same name — the market values
        // (available/reserved/sold) get silently overwritten by draft/published.
        // The column stays `status`; only the Postgres enum type is renamed.
        dbName: 'listing_status',
        type: 'select',
        required: true,
        defaultValue: 'available',
        options: [
          { label: 'Disponueshme', value: 'available' },
          { label: 'Rezervuar', value: 'reserved' },
          { label: 'Shitur', value: 'sold' },
        ],
        admin: { width: '50%', description: 'Market state. Separate from published/draft.' },
      },
    ],
  },
  {
    type: 'row',
    fields: [
      {
        name: 'buildingPhase',
        type: 'select',
        options: [...BUILDING_PHASES],
        admin: { width: '50%' },
      },
      {
        name: 'mortgageEligible',
        type: 'checkbox',
        label: 'Me hipotekë',
        defaultValue: false,
        admin: { width: '50%', description: 'A primary filter in this market.' },
      },
    ],
  },

  {
    name: 'features',
    type: 'select',
    hasMany: true,
    options: [...FEATURE_OPTIONS],
    admin: { description: 'Filter facets. Add options in code, never free text.' },
  },

  {
    name: 'gallery',
    type: 'array',
    minRows: 1,
    labels: { singular: 'Photo', plural: 'Photos' },
    fields: [
      { name: 'image', type: 'upload', relationTo: 'media', required: true },
      { name: 'caption', type: 'text', localized: true },
    ],
  },

  {
    name: 'publishedAt',
    type: 'date',
    admin: { position: 'sidebar', description: 'Set automatically on first publish.' },
    hooks: {
      beforeChange: [
        ({ value, data }) => {
          if (value) return value
          if (data?._status === 'published') return new Date().toISOString()
          return value
        },
      ],
    },
  },
]
