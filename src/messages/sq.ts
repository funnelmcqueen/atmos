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
    projects: 'Projekte',
    companies: 'Kompani',
  },
  projects: {
    title: 'Projekte të reja ndërtimi',
    metaTitle: 'Projekte të reja ndërtimi në Shqipëri',
    metaDescription:
      'Rezidenca dhe komplekse të reja nga investitorë të verifikuar. Njësi të disponueshme, çmime dhe faza ndërtimi.',
    empty: 'Nuk ka ende projekte të publikuara.',
    resultsOne: 'projekt',
    resultsMany: 'projekte',
  },
  project: {
    developer: 'Investitori',
    phase: 'Faza e ndërtimit',
    completion: 'Përfundimi',
    sitePlan: 'Plani i sitit',
    brochure: 'Shkarko broshurën',
    units: 'Njësitë',
    unitsAvailable: 'njësi të lira',
    unitsAvailableOne: 'njësi e lirë',
    unitsAllTaken: 'Të gjitha njësitë janë shitur',
    priceFrom: 'Nga',
    viewProject: 'Shiko projektin',
    backToProject: 'Kthehu te projekti',
    partOf: 'Njësi në',
  },
  unitTable: {
    caption: 'Njësitë e projektit',
    floor: 'Kati',
    unit: 'Njësia',
    building: 'Godina',
    rooms: 'Dhoma',
    area: 'Sipërfaqja',
    price: 'Çmimi',
    perSqm: 'Çmimi/m²',
    status: 'Statusi',
    empty: 'Nuk u gjet asnjë njësi me këto filtra.',
    sortAsc: 'Rendit rritës',
    sortDesc: 'Rendit zbritës',
    groundFloor: 'Përdhesë',
    // The table lists every unit, sold included — the filter is opt-in.
    showAll: 'Të gjitha njësitë',
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
    pointLabel: 'Vendndodhja në hartë',
    useMyLocation: 'Përdor vendndodhjen time',
    locating: 'Duke gjetur vendndodhjen…',
    locationError: 'Nuk u mor dot vendndodhja.',
    missingKey: 'Harta nuk mund të shfaqet: mungon çelësi i hartës.',
  },
  badge: {
    verified: 'Pronë e verifikuar',
    mortgage: 'Me hipotekë',
  },
  form: {
    // Shared labels. The same word for the same thing everywhere in the flow.
    name: 'Emri',
    fullName: 'Emri dhe mbiemri',
    phone: 'Telefoni',
    email: 'Email',
    message: 'Mesazhi',
    optional: 'me dëshirë',
    required: 'Fusha e detyrueshme',
    sending: 'Duke dërguar…',
    terms: 'Pranoj kushtet e përdorimit dhe përpunimin e të dhënave të mia.',
    termsLink: 'Lexo kushtet',
    fixErrors: 'Kontrollo fushat e shënuara.',
  },
  enquiry: {
    heading: 'Pyet për këtë pronë',
    headingProject: 'Pyet për këtë projekt',
    intro: 'Lër numrin dhe të kontaktojmë ne. Zakonisht përgjigjemi brenda ditës.',
    messagePlaceholder: 'P.sh. dua ta shoh këtë javë, a është ende e lirë?',
    submit: 'Dërgo kërkesën',
    // The confirmation replaces the form in place — no redirect (docs/05).
    successTitle: 'Kërkesa u dërgua',
    successBody: 'Agjenti do të të kontaktojë në numrin që la. Faleminderit.',
    contactBar: 'Pyet',
  },
  listingRequest: {
    title: 'Dërgo pronën',
    metaTitle: 'Dërgo pronën tënde — Atmos',
    metaDescription:
      'Dërgo pronën tënde për shitje ose qira. Atmos e verifikon dhe e publikon me foto dhe të dhëna të sakta.',
    intro:
      'Plotëso të dhënat e pronës dhe një agjent do të të kontaktojë për ta verifikuar. Prona publikohet vetëm pasi ta kemi kontrolluar.',
    sectionOwner: 'Të dhënat e tua',
    sectionProperty: 'Prona',
    sectionPhotos: 'Fotot',
    sectionTerms: 'Konfirmimi',
    city: 'Qyteti',
    areaName: 'Zona',
    address: 'Adresa',
    listingType: 'Transaksioni',
    propertyType: 'Lloji i pronës',
    rooms: 'Dhoma',
    areaSqm: 'Sipërfaqja (m²)',
    floor: 'Kati',
    askingPrice: 'Çmimi i kërkuar (EUR)',
    description: 'Përshkrimi',
    descriptionPlaceholder: 'Çfarë duhet të dijë blerësi? Gjendja, pozicioni, ç’ka afër.',
    photos: 'Ngarko foto',
    photosHint: 'Deri në 15 foto. Sa më shumë foto, aq më shumë kontakte.',
    photosSelected: 'foto të zgjedhura',
    photosTooMany: 'Zgjodhe më shumë se 15 foto. Hiq disa para se ta dërgosh.',
    photosTooLarge:
      'Fotot së bashku janë shumë të mëdha për t’u dërguar njëherësh. Zgjidh më pak, ose foto më të vogla.',
    hasDocumentation: 'Dokumentacioni i pronës është në rregull.',
    submit: 'Dërgo pronën',
    successTitle: 'Prona u dërgua',
    successBody:
      'E morëm. Një agjent do të të kontaktojë për ta verifikuar përpara se të publikohet.',
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
