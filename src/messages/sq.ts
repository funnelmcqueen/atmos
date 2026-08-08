/**
 * Albanian UI copy and enum→label maps for the public site.
 *
 * This is the single place interface strings live. There is no next-intl yet
 * (no new dependencies this slice), so components import from here instead of
 * hardcoding Albanian text. When next-intl lands it can consume these maps
 * without a rewrite — keys are already namespaced by feature.
 *
 * Anything factual (price, area, dates) is formatted in lib/format.ts, not here.
 */

/** Locales the public site routes and emits hreflang for this session. */
export const LOCALES = ['sq', 'en'] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'sq'

export const isLocale = (value: string): value is Locale =>
  (LOCALES as readonly string[]).includes(value)

export const PROPERTY_TYPE_LABELS: Record<string, string> = {
  apartment: 'Apartament',
  villa: 'Vilë',
  house: 'Shtëpi private',
  shop: 'Dyqan',
  office: 'Zyrë',
  warehouse: 'Magazinë',
  land: 'Truall / Tokë',
}

export const LISTING_TYPE_LABELS: Record<string, string> = {
  sale: 'Në shitje',
  rent: 'Me qira',
}

export const STATUS_LABELS: Record<string, string> = {
  available: 'Disponueshme',
  reserved: 'Rezervuar',
  sold: 'Shitur',
}

export const PROJECT_PHASE_LABELS: Record<string, string> = {
  planning: 'Në planifikim',
  underConstruction: 'Në ndërtim',
  completed: 'Përfunduar',
}

export const BUILDING_PHASE_LABELS: Record<string, string> = {
  brick: 'Fazë tulle',
  facade: 'Fazë fasade',
  finished: 'E përfunduar',
  existing: 'Ndërtim ekzistues',
}

export const FEATURE_LABELS: Record<string, string> = {
  parking: 'Parkim',
  elevator: 'Ashensor',
  balcony: 'Ballkon',
  terrace: 'Tarracë',
  garden: 'Kopsht',
  pool: 'Pishinë',
  furnished: 'I mobiluar',
  seaView: 'Pamje nga deti',
  cityView: 'Pamje nga qyteti',
  lakeView: 'Pamje nga liqeni',
  heating: 'Ngrohje',
  airConditioning: 'Kondicioner',
  security: 'Siguri',
  storage: 'Depo',
  streetFront: 'Ballë rruge',
}

/** Interface strings, namespaced by feature. */
export const t = {
  brand: 'Atmos',
  nav: {
    properties: 'Prona',
    companies: 'Kompani',
  },
  companies: {
    title: 'Kompani ndërtimi dhe investitorë',
    metaTitle: 'Kompani ndërtimi dhe investitorë në Shqipëri',
    metaDescription:
      'Profile të verifikuara të kompanive të ndërtimit dhe investitorëve, projektet dhe njësitë e tyre në Atmos.',
    empty: 'Nuk u gjet asnjë kompani.',
    resultsOne: 'kompani',
    resultsMany: 'kompani',
  },
  company: {
    verifiedPartner: 'Partner i verifikuar',
    contact: 'Kontakt',
    founded: 'Themeluar',
    website: 'Uebsajti',
    phone: 'Telefon',
    email: 'Email',
    areasOfOperation: 'Zonat e operimit',
    activeProjects: 'Projekte aktive',
    completedProjects: 'Projekte të përfunduara',
    units: 'Njësi të disponueshme',
    articles: 'Artikuj',
    completion: 'Përfundimi',
    unitsFrom: 'Nga',
    noProjects: 'Kjo kompani nuk ka ende projekte të publikuara.',
    noUnits: 'Nuk ka njësi të disponueshme për momentin.',
  },
  list: {
    title: 'Prona në shitje dhe me qira',
    metaTitle: 'Prona në shitje dhe me qira në Shqipëri',
    metaDescription:
      'Apartamente, vila, dyqane dhe troje në shitje dhe me qira. Prona të verifikuara nga Atmos.',
    empty: 'Nuk u gjet asnjë pronë.',
    resultsOne: 'pronë',
    resultsMany: 'prona',
  },
  pagination: {
    previous: 'E mëparshme',
    next: 'Në vijim',
    page: 'Faqe',
  },
  filters: {
    heading: 'Filtro pronat',
    propertyType: 'Lloji i pronës',
    area: 'Zona',
    listingType: 'Transaksioni',
    price: 'Çmimi (EUR)',
    size: 'Sipërfaqja (m²)',
    min: 'Nga',
    max: 'Deri',
    rooms: 'Dhoma',
    mortgage: 'Vetëm me hipotekë',
    status: 'Statusi',
    all: 'Të gjitha',
    sort: 'Rendit',
    apply: 'Filtro',
    reset: 'Pastro filtrat',
    sortOptions: {
      newest: 'Më të rejat',
      priceAsc: 'Çmimi: nga më i ulëti',
      priceDesc: 'Çmimi: nga më i larti',
      perSqm: 'Çmimi për m²',
    },
  },
  card: {
    perMonth: '/muaj',
    priceOnRequest: 'Çmimi me kërkesë',
    perSqm: '/m²',
    noPhoto: 'Pa foto',
  },
  map: {
    regionLabel: 'Harta e pronave',
    useMyLocation: 'Përdor vendndodhjen time',
    locating: 'Duke gjetur vendndodhjen…',
    locationError: 'Nuk u mor dot vendndodhja.',
    missingKey: 'Harta nuk mund të shfaqet: mungon çelësi i hartës.',
  },
  badge: {
    verified: 'Pronë e verifikuar',
    mortgage: 'Me hipotekë',
  },
  detail: {
    reference: 'Referenca',
    description: 'Përshkrimi',
    features: 'Karakteristikat',
    location: 'Vendndodhja',
    coordinates: 'Koordinatat',
    documentation: 'Dokumentacioni',
    agent: 'Agjenti',
    similar: 'Prona të ngjashme',
    published: 'Publikuar',
    updated: 'Përditësuar',
    enquiryForm: 'Dërgo kërkesë',
    enquiryWhatsapp: 'WhatsApp',
    enquiryCall: 'Kërko një telefonatë',
    contactBarLabel: 'Kontakto agjentin',
    call: 'Telefono',
    specs: {
      rooms: 'Dhoma',
      bedrooms: 'Dhoma gjumi',
      bathrooms: 'Tualete',
      floor: 'Kati',
      orientation: 'Orientimi',
      areaGross: 'Sipërfaqe totale',
      areaNet: 'Sipërfaqe neto',
      terrace: 'Verandë / tarracë',
      buildingPhase: 'Faza e ndërtimit',
    },
  },
} as const
