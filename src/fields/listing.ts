import type { Field } from 'payload'
import { slugField } from './slug'
import { adminOnlyInPanel } from '../access'
import {
  BUILDING_PHASE_LABELS,
  CURRENCY_LABELS,
  FEATURE_LABELS,
  LISTING_TYPE_LABELS,
  ORIENTATION_LABELS,
  PROPERTY_TYPE_LABELS,
  STATUS_LABELS,
} from '../messages/sq'

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

export const LISTING_TYPES = ['sale', 'rent'] as const
export const LISTING_STATUSES = ['available', 'reserved', 'sold'] as const
export const CURRENCIES = ['EUR', 'ALL'] as const

/**
 * Albanian market convention for an existing building's finish level.
 * Buyers filter on this — it is not the same as a project's constructionPhase.
 */
export const BUILDING_PHASES = ['brick', 'facade', 'finished', 'existing'] as const

/**
 * Lek per euro, used only to populate `priceEur` so mixed-currency listings
 * sort and filter correctly. Display always uses the original price and
 * currency. Update in env when the rate moves materially.
 */
export const ALL_PER_EUR = Number(process.env.ALL_PER_EUR ?? 100)

/**
 * Builds Payload select options from a value list and the Albanian label map in
 * `src/messages/sq.ts`. Both the admin and the public site read the same map,
 * so a label can never say one thing in the panel and another on the card.
 */
const optionsFrom = (values: readonly string[], labels: Record<string, string>) =>
  values.map((value) => ({ label: labels[value] ?? value, value }))

const requiredUnlessLand = (label: string) =>
  (value: unknown, { data }: { data?: Record<string, unknown> }) => {
    if (LANDLIKE_TYPES.includes(String(data?.propertyType))) return true
    if (value === undefined || value === null || value === '') return `${label} është e detyrueshme.`
    return true
  }

const notLand = (data?: Record<string, unknown>) =>
  !LANDLIKE_TYPES.includes(String(data?.propertyType))

/**
 * Shared listing fields for `properties` and `project-units`, grouped into the
 * sections an agent fills in, in the order they fill them: what it is, where it
 * is, what it costs, how big, how it is laid out, what it has, photos, and only
 * then the words. Each collection composes these itself — a unit has no
 * location section of its own, it inherits the project's.
 *
 * Two things constrain edits here:
 *
 * - Field `name`s are load-bearing. `db/listing-index.sql` unions both tables on
 *   exactly these columns; rename one and the view must change in the same
 *   commit. Order, labels and `admin` metadata are free to move.
 * - The sections are `collapsible`, which is presentational. A `group` would
 *   nest the columns and break that union, so never reach for one here.
 *
 * Nothing starts collapsed. `initCollapsed` is a single static boolean shared by
 * the create and the edit form — Payload only reads a per-document preference
 * once the document has an id, so there is no way to open a section on create
 * and close it on edit from config. Given the choice, an agent creating a
 * listing has to see everything being asked of them; a collapsed required field
 * is a half-filled listing. See docs/11-roles.md.
 */

// --- 1. What it is ----------------------------------------------------------
export const typeAndMarketSection: Field = {
  type: 'collapsible',
  label: 'Lloji dhe transaksioni',
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'propertyType',
          type: 'select',
          label: 'Lloji i pronës',
          required: true,
          defaultValue: 'apartment',
          options: optionsFrom(PROPERTY_TYPES, PROPERTY_TYPE_LABELS),
          admin: {
            width: '50%',
            description: 'Për truall fshihen dhomat, kati dhe orientimi.',
          },
        },
        {
          name: 'listingType',
          type: 'select',
          label: 'Transaksioni',
          required: true,
          options: optionsFrom(LISTING_TYPES, LISTING_TYPE_LABELS),
          admin: { width: '50%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'status',
          // `dbName` gives this select its own enum type. Without it, Payload
          // derives `enum_<table>_status`, which collides with the drafts
          // `_status` field's enum of the same name — the market values
          // (available/reserved/sold) get silently overwritten by draft/published.
          // The column stays `status`; only the Postgres enum type is renamed.
          dbName: 'listing_status',
          type: 'select',
          label: 'Gjendja në treg',
          required: true,
          defaultValue: 'available',
          options: optionsFrom(LISTING_STATUSES, STATUS_LABELS),
          admin: {
            width: '50%',
            description:
              'Gjendja te blerësi. Nuk ka lidhje me publikimin: një pronë e rezervuar mbetet e publikuar në sajt.',
          },
        },
        {
          name: 'buildingPhase',
          type: 'select',
          label: 'Faza e ndërtimit',
          options: optionsFrom(BUILDING_PHASES, BUILDING_PHASE_LABELS),
          admin: {
            width: '50%',
            description:
              'Niveli i përfundimit të kësaj ndërtese. Ndryshe nga faza e një projekti të ri.',
          },
        },
      ],
    },
    {
      name: 'mortgageEligible',
      type: 'checkbox',
      label: 'Pranohet me hipotekë',
      defaultValue: false,
      admin: {
        description:
          'Prona pranohet për kredi bankare. Filtër kryesor në këtë treg — mos e lër bosh nëse e di përgjigjen.',
      },
    },
  ],
}

// --- 3. What it costs -------------------------------------------------------
export const priceSection: Field = {
  type: 'collapsible',
  label: 'Çmimi',
  fields: [
    {
      name: 'priceOnRequest',
      type: 'checkbox',
      label: 'Çmimi me kërkesë',
      defaultValue: false,
      admin: {
        description:
          'Zgjidhe kur pronari nuk do çmim publik. Fusha e çmimit fshihet dhe prona shfaqet si “Çmimi me kërkesë”.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'price',
          type: 'number',
          label: 'Çmimi',
          min: 0,
          admin: {
            width: '50%',
            condition: (data) => !data?.priceOnRequest,
          },
          validate: (value: unknown, { data }: { data?: Record<string, unknown> }) => {
            if (data?.priceOnRequest) return true
            if (typeof value !== 'number') return 'Shkruaj një çmim ose zgjidh “Çmimi me kërkesë”.'
            return true
          },
        },
        {
          name: 'currency',
          type: 'select',
          label: 'Monedha',
          required: true,
          defaultValue: 'EUR',
          options: optionsFrom(CURRENCIES, CURRENCY_LABELS),
          admin: {
            width: '50%',
            condition: (data) => !data?.priceOnRequest,
            description: 'Shkruaje çmimin siç e jep pronari. Konvertimi bëhet vetë.',
          },
        },
      ],
    },
    {
      name: 'rentPeriod',
      type: 'select',
      label: 'Periudha e qirasë',
      defaultValue: 'monthly',
      options: [
        { label: 'Në muaj', value: 'monthly' },
        { label: 'Në natë', value: 'nightly' },
      ],
      admin: { condition: (data) => data?.listingType === 'rent' },
    },
  ],
}

/**
 * Sidebar. Normalised for sorting and range filters across mixed currencies,
 * never shown to visitors — the card renders price + currency as entered.
 * Hidden from agents: it is derived, and a read-only number they cannot act on
 * is one more thing to scroll past.
 */
export const priceEurField: Field = {
  name: 'priceEur',
  type: 'number',
  label: 'Çmimi në euro',
  index: true,
  admin: {
    readOnly: true,
    position: 'sidebar',
    condition: adminOnlyInPanel,
    description: 'I llogaritur. Vetëm për renditje dhe filtra.',
  },
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
}

// --- 4. How big -------------------------------------------------------------
export const areaSection: Field = {
  type: 'collapsible',
  label: 'Sipërfaqja',
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'areaGross',
          type: 'number',
          required: true,
          min: 1,
          label: 'Sipërfaqe totale — bruto (m²)',
          admin: {
            width: '50%',
            description:
              'Bruto: me muret dhe pjesën takuese, siç shitet. Çmimi për m² llogaritet mbi këtë fushë.',
          },
        },
        {
          name: 'areaNet',
          type: 'number',
          min: 1,
          label: 'Sipërfaqe neto (m²)',
          admin: {
            width: '50%',
            description:
              'Vetëm sipërfaqja e brendshme e shfrytëzueshme. Gjithmonë më e vogël se bruto.',
          },
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
          admin: { width: '50%', description: 'Jashtë sipërfaqes neto.' },
        },
        {
          name: 'commonAreaSqm',
          type: 'number',
          label: 'Sipërfaqe e përbashkët (m²)',
          admin: { width: '50%', description: 'Pjesa takuese e shkallëve dhe korridoreve.' },
        },
      ],
    },
  ],
}

// --- 5. How it is laid out --------------------------------------------------
export const layoutSection: Field = {
  type: 'collapsible',
  label: 'Planimetria',
  admin: { condition: (data) => notLand(data) },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'rooms',
          type: 'text',
          label: 'Dhomat',
          admin: {
            width: '33%',
            description:
              'Konventa shqiptare: 2+1, 1+1+2. Numri para “+” janë dhomat e gjumit, pas tij dhoma e ndenjes.',
          },
          validate: requiredUnlessLand('Dhomat'),
        },
        {
          name: 'bedrooms',
          type: 'number',
          label: 'Dhoma gjumi',
          min: 0,
          admin: { width: '33%', description: 'Vetëm numri, për filtrat.' },
        },
        { name: 'bathrooms', type: 'number', label: 'Tualete', min: 0, admin: { width: '33%' } },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'floor',
          type: 'number',
          label: 'Kati',
          admin: { width: '50%', description: '0 = përdhesë. Nëntokë shkruhet me minus, p.sh. -1.' },
        },
        {
          name: 'orientation',
          type: 'select',
          label: 'Orientimi',
          hasMany: true,
          options: optionsFrom(ORIENTATIONS, ORIENTATION_LABELS),
          admin: { width: '50%', description: 'Zgjidh të gjitha anët që ka prona, shpesh dy ose tre.' },
        },
      ],
    },
  ],
}

// --- 6. What it has ---------------------------------------------------------
export const featuresSection: Field = {
  type: 'collapsible',
  label: 'Karakteristikat',
  fields: [
    {
      name: 'features',
      type: 'select',
      label: 'Karakteristikat',
      hasMany: true,
      options: optionsFrom(FEATURE_OPTIONS, FEATURE_LABELS),
      admin: {
        description:
          'Këto janë filtrat e kërkimit. Opsionet shtohen në kod — mos shkruaj tekst të lirë.',
      },
    },
  ],
}

// --- 7. Photos --------------------------------------------------------------
export const gallerySection: Field = {
  type: 'collapsible',
  label: 'Fotot',
  fields: [
    {
      name: 'gallery',
      type: 'array',
      label: 'Galeria',
      minRows: 1,
      labels: { singular: 'Foto', plural: 'Foto' },
      admin: {
        description: 'Foto e parë është ajo që shfaqet në listë. Të paktën një foto është e detyrueshme.',
      },
      fields: [
        { name: 'image', type: 'upload', label: 'Fotoja', relationTo: 'media', required: true },
        { name: 'caption', type: 'text', label: 'Përshkrimi i fotos', localized: true },
      ],
    },
  ],
}

// --- 8. The words, written once the facts are in ----------------------------
export const titleSection = (extraFields: Field[] = []): Field => ({
  type: 'collapsible',
  label: 'Titulli dhe përshkrimi',
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Titulli',
      required: true,
      localized: true,
      admin: {
        description:
          'Shkruaje pasi ke plotësuar të dhënat. P.sh. “Apartament 2+1 te Bllok, 96 m²”.',
      },
    },
    {
      name: 'description',
      type: 'richText',
      label: 'Përshkrimi',
      localized: true,
      admin: { description: 'Gjendja, pozicioni, ç’ka afër. Pa numra telefoni dhe pa çmim.' },
    },
    ...extraFields,
  ],
})

/** Sidebar. Set automatically on first publish. */
export const publishedAtField: Field = {
  name: 'publishedAt',
  type: 'date',
  label: 'Publikuar më',
  admin: { position: 'sidebar', description: 'Vendoset vetë kur publikohet për herë të parë.' },
  hooks: {
    beforeChange: [
      ({ value, data }) => {
        if (value) return value
        if (data?._status === 'published') return new Date().toISOString()
        return value
      },
    ],
  },
}

/** Sidebar. Generated from the Albanian title. */
export const listingSlugField: Field = slugField('title')
