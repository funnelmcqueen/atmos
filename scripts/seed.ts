/**
 * Seed realistic Albanian data so every page renders against something real.
 *
 *   pnpm seed
 *
 * Idempotent: wipes the content collections first, leaves users alone.
 * Never run against production — it checks NODE_ENV.
 */
import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config'

const CITIES = [
  { name: 'Tiranë', center: [19.8187, 41.3275] as [number, number] },
  { name: 'Durrës', center: [19.4547, 41.3231] as [number, number] },
  { name: 'Vlorë', center: [19.4833, 40.4667] as [number, number] },
]

const NEIGHBOURHOODS = [
  { name: 'Bllok', city: 'Tiranë', center: [19.8172, 41.3197] as [number, number] },
  { name: 'Liqeni Artificial', city: 'Tiranë', center: [19.8203, 41.3139] as [number, number] },
  { name: 'Laprakë', city: 'Tiranë', center: [19.8005, 41.3403] as [number, number] },
  { name: 'Bulevardi i Ri', city: 'Tiranë', center: [19.8218, 41.3437] as [number, number] },
  { name: 'Astir', city: 'Tiranë', center: [19.7861, 41.3212] as [number, number] },
  { name: 'Qendra', city: 'Tiranë', center: [19.8189, 41.3275] as [number, number] },
  { name: 'Farkë', city: 'Tiranë', center: [19.8546, 41.3005] as [number, number] },
  { name: 'Univers City', city: 'Tiranë', center: [19.7503, 41.3358] as [number, number] },
  { name: 'Golem', city: 'Durrës', center: [19.5089, 41.2331] as [number, number] },
  { name: 'Dhërmi', city: 'Vlorë', center: [19.6437, 40.1503] as [number, number] },
]

const AREA_CENTERS: Record<string, [number, number]> = Object.fromEntries(
  NEIGHBOURHOODS.map((n) => [n.name, n.center]),
)

const seed = async () => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Refusing to seed in production.')
  }

  const payload = await getPayload({ config })

  for (const slug of ['project-units', 'projects', 'properties', 'companies', 'areas', 'articles'] as const) {
    const { docs } = await payload.find({ collection: slug, limit: 500, depth: 0 })
    for (const doc of docs) {
      await payload.delete({ collection: slug, id: doc.id })
    }
    payload.logger.info(`cleared ${slug}`)
  }

  const cityIds: Record<string, number> = {}
  for (const city of CITIES) {
    const doc = await payload.create({
      collection: 'areas',
      // slug is required on the type; the slugField hook slugifies whatever we
      // pass, so handing it the source name is equivalent to letting the hook
      // derive it and keeps `tsc` happy.
      data: { name: city.name, slug: city.name, kind: 'city', center: city.center },
    })
    cityIds[city.name] = doc.id
  }

  const areaIds: Record<string, number> = {}
  for (const n of NEIGHBOURHOODS) {
    const doc = await payload.create({
      collection: 'areas',
      data: { name: n.name, slug: n.name, kind: 'neighbourhood', parent: cityIds[n.city], center: n.center },
    })
    areaIds[n.name] = doc.id
  }

  const company = await payload.create({
    collection: 'companies',
    data: {
      name: 'Orbital Construction',
      slug: 'orbital-construction',
      foundedYear: 2011,
      phone: '+355 69 20 11 445',
      email: 'info@orbital.al',
      verifiedPartner: true,
      areasOfOperation: [areaIds['Bulevardi i Ri'], areaIds['Laprakë']],
      _status: 'published',
    },
  })

  const project = await payload.create({
    collection: 'projects',
    data: {
      name: 'Orbital 3 Residence',
      slug: 'orbital-3-residence',
      tagline: 'Rezidencë moderne në Bulevardin e Ri',
      developer: company.id,
      area: areaIds['Bulevardi i Ri'],
      location: [19.8218, 41.3437],
      constructionPhase: 'underConstruction',
      completionDate: '2027-06-01',
      _status: 'published',
      publishedAt: new Date().toISOString(),
    },
  })

  const unitPlan = [
    { unitCode: 'A-4-1', floor: 4, rooms: '1+1', areaGross: 62, areaNet: 55, price: 96000, status: 'sold' },
    { unitCode: 'A-7-2', floor: 7, rooms: '2+1', areaGross: 104, areaNet: 92, price: 168000, status: 'available' },
    { unitCode: 'A-9-3', floor: 9, rooms: '2+1', areaGross: 111, areaNet: 98, price: 182000, status: 'reserved' },
    { unitCode: 'B-6-1', floor: 6, rooms: '3+1', areaGross: 131.14, areaNet: 116.2, price: 258500, status: 'available' },
    { unitCode: 'B-13-2', floor: 13, rooms: '3+1+2', areaGross: 152, areaNet: 134, price: 312000, status: 'available' },
  ] as const

  for (const u of unitPlan) {
    await payload.create({
      collection: 'project-units',
      data: {
        unitCode: u.unitCode,
        floor: u.floor,
        rooms: u.rooms,
        areaGross: u.areaGross,
        areaNet: u.areaNet,
        terraceSqm: u.unitCode === 'B-6-1' ? 34.1 : undefined,
        price: u.price,
        status: u.status,
        project: project.id,
        propertyType: 'apartment',
        title: `${u.rooms} në ${project.name}`,
        slug: `orbital-3-${u.unitCode.toLowerCase()}`,
        currency: 'EUR',
        priceOnRequest: false,
        listingType: 'sale',
        bedrooms: Number(u.rooms.split('+')[0]),
        bathrooms: u.rooms.endsWith('+2') ? 2 : 1,
        orientation: ['SW'],
        buildingPhase: 'facade',
        mortgageEligible: true,
        gallery: [],
        _status: 'published',
        publishedAt: new Date().toISOString(),
      },
    })
  }

  // Shapes taken from the client's live inventory: mixed currencies, gross and
  // net areas, price-on-request, land with no rooms, shops, mortgage flags.
  const properties = [
    { title: 'Apartament 2+1+2 me pamje nga liqeni', type: 'apartment', area: 'Liqeni Artificial', street: 'Rruga Kristo Luarasi', rooms: '2+1+2', gross: 150.5, net: 131, terrace: 19.2, price: 550000, currency: 'EUR', listing: 'sale', status: 'available', floor: 13, mortgage: true, phase: 'finished' },
    { title: 'Apartament 1+1 në Astir', type: 'apartment', area: 'Astir', street: 'Rruga Tom Plezha', rooms: '1+1', gross: 50, net: 44.1, price: 107000, currency: 'EUR', listing: 'sale', status: 'available', floor: 3, mortgage: true, phase: 'existing' },
    { title: 'Apartament 2+1 me qira, Rruga e Barrikadave', type: 'apartment', area: 'Qendra', street: 'Rruga e Barrikadave', rooms: '2+1', gross: 67, price: 75000, currency: 'ALL', listing: 'rent', status: 'available', floor: 2, mortgage: false, phase: 'finished' },
    { title: 'Vilë me pishinë, Swan Lake', type: 'villa', area: 'Farkë', street: 'Panorama e Liqenit', rooms: '3+1', gross: 242.3, price: 510000, currency: 'EUR', listing: 'sale', status: 'available', floor: 0, mortgage: true, phase: 'finished' },
    { title: 'Apartament 2+1 në Ekspozita Building', type: 'apartment', area: 'Qendra', street: 'Bulevardi Gjergj Fishta', rooms: '2+1', gross: 176.59, net: 132.78, common: 43.81, priceOnRequest: true, currency: 'EUR', listing: 'sale', status: 'available', floor: 8, mortgage: true, phase: 'finished' },
    { title: 'Dyqan në Univers City, 80 m²', type: 'shop', area: 'Univers City', street: 'Rruga Gryka e Kaçanikut', rooms: '1', gross: 79.6, price: 206960, currency: 'EUR', listing: 'sale', status: 'available', floor: 0, mortgage: false, phase: 'finished' },
    { title: 'Truall për ndërtim, Golem', type: 'land', area: 'Golem', street: 'Afër Fafa', gross: 800, price: 135000, currency: 'EUR', listing: 'sale', status: 'available', mortgage: true },
    { title: 'Apartament 2+1 në Kompleksin Aura', type: 'apartment', area: 'Laprakë', street: 'Rruga Dritan Hoxha', rooms: '2+1', gross: 105.6, price: 184800, currency: 'EUR', listing: 'sale', status: 'sold', floor: 2, mortgage: true, phase: 'finished' },
  ] as const

  // Properties require an owning agent (access.updateOwnListing). The seed
  // leaves existing users alone, so find-or-create a dedicated agent to assign
  // every seeded listing to. The `agent` beforeChange hook only fills this from
  // req.user, which the Local API has none of here.
  const agentEmail = 'seed-agent@atmos.al'
  const existingAgent = await payload.find({
    collection: 'users',
    where: { email: { equals: agentEmail } },
    limit: 1,
    depth: 0,
  })
  const agent =
    existingAgent.docs[0] ??
    (await payload.create({
      collection: 'users',
      data: {
        name: 'Seed Agent',
        email: agentEmail,
        password: 'seed-agent-pw',
        role: 'agent',
      },
    }))

  let counter = 1
  for (const p of properties) {
    await payload.create({
      collection: 'properties',
      data: {
        title: p.title,
        slug: p.title,
        agent: agent.id,
        propertyType: p.type,
        price: 'price' in p ? p.price : undefined,
        currency: p.currency,
        priceOnRequest: 'priceOnRequest' in p ? p.priceOnRequest : false,
        areaGross: p.gross,
        areaNet: 'net' in p ? p.net : undefined,
        terraceSqm: 'terrace' in p ? p.terrace : undefined,
        commonAreaSqm: 'common' in p ? p.common : undefined,
        rooms: 'rooms' in p ? p.rooms : undefined,
        bedrooms: 'rooms' in p ? Number(String(p.rooms).split('+')[0]) : undefined,
        bathrooms: 1,
        floor: 'floor' in p ? p.floor : undefined,
        orientation: ['S'],
        listingType: p.listing,
        rentPeriod: p.listing === 'rent' ? 'monthly' : undefined,
        status: p.status,
        buildingPhase: 'phase' in p ? p.phase : undefined,
        mortgageEligible: p.mortgage,
        area: areaIds[p.area],
        street: p.street,
        location: AREA_CENTERS[p.area],
        reference: `ATM-2026-${String(counter++).padStart(4, '0')}`,
        verified: true,
        featured: counter <= 3,
        gallery: [],
        ownerName: 'Seed owner',
        ownerPhone: '+355 68 50 89 999',
        _status: 'published',
        publishedAt: new Date().toISOString(),
      },
    })
  }

  payload.logger.info('seed complete')
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
