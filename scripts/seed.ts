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

  // Second company with no projects, logo, cover, about or articles: proves the
  // profile still renders on a bare company and exercises every empty state
  // (docs/04 — "a company with zero published projects still gets a page").
  await payload.create({
    collection: 'companies',
    data: {
      name: 'Adria Invest',
      slug: 'adria-invest',
      foundedYear: 2019,
      phone: '+355 69 40 22 108',
      email: 'kontakt@adriainvest.al',
      verifiedPartner: false,
      areasOfOperation: [areaIds['Golem']],
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

  // A second, completed project on the same developer. It gives the projects
  // index more than one card, keeps the company page's completed-projects split
  // exercised, and — being multi-building with a `building` value on every unit
  // — proves the unit table's building column appears only when it carries
  // information.
  const completedProject = await payload.create({
    collection: 'projects',
    data: {
      name: 'Laprakë Garden',
      slug: 'laprake-garden',
      tagline: 'Banesa të përfunduara pranë Rrugës Dritan Hoxha',
      developer: company.id,
      area: areaIds['Laprakë'],
      location: [19.8005, 41.3403],
      constructionPhase: 'completed',
      completionDate: '2025-09-01',
      _status: 'published',
      // Published before Orbital, so "featured, then newest" puts the active
      // development above the finished one on the index. Without distinct
      // timestamps both projects land in the same second and the order is
      // whatever the database feels like.
      publishedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    },
  })

  // Every market state is represented on purpose: the project page must be
  // proven to keep sold and reserved units visible (docs/03), and one
  // price-on-request unit keeps the "no €/m², no empty cell" path honest.
  const unitPlan = [
    { project: 'orbital', unitCode: 'A-4-1', building: undefined, floor: 4, rooms: '1+1', areaGross: 62, areaNet: 55, price: 96000, status: 'sold' },
    { project: 'orbital', unitCode: 'A-7-2', building: undefined, floor: 7, rooms: '2+1', areaGross: 104, areaNet: 92, price: 168000, status: 'available' },
    { project: 'orbital', unitCode: 'A-9-3', building: undefined, floor: 9, rooms: '2+1', areaGross: 111, areaNet: 98, price: 182000, status: 'reserved' },
    { project: 'orbital', unitCode: 'B-6-1', building: undefined, floor: 6, rooms: '3+1', areaGross: 131.14, areaNet: 116.2, price: 258500, status: 'available' },
    { project: 'orbital', unitCode: 'B-13-2', building: undefined, floor: 13, rooms: '3+1+2', areaGross: 152, areaNet: 134, price: 312000, status: 'available' },
    { project: 'orbital', unitCode: 'B-0-1', building: undefined, floor: 0, rooms: '2+1', areaGross: 98, areaNet: 86, priceOnRequest: true, status: 'available' },
    { project: 'garden', unitCode: 'G-1-2', building: 'A', floor: 1, rooms: '1+1', areaGross: 58, areaNet: 51, price: 82000, status: 'sold' },
    { project: 'garden', unitCode: 'G-2-1', building: 'A', floor: 2, rooms: '2+1', areaGross: 92, areaNet: 81, price: 129000, status: 'sold' },
    { project: 'garden', unitCode: 'G-3-4', building: 'B', floor: 3, rooms: '2+1', areaGross: 94, areaNet: 83, price: 134000, status: 'available' },
  ] as const

  const projectsBySeedKey = { orbital: project, garden: completedProject } as const

  for (const u of unitPlan) {
    const parent = projectsBySeedKey[u.project]
    const priceOnRequest = 'priceOnRequest' in u && u.priceOnRequest === true

    await payload.create({
      collection: 'project-units',
      data: {
        unitCode: u.unitCode,
        building: u.building,
        floor: u.floor,
        rooms: u.rooms,
        areaGross: u.areaGross,
        areaNet: u.areaNet,
        terraceSqm: u.unitCode === 'B-6-1' ? 34.1 : undefined,
        price: 'price' in u ? u.price : undefined,
        priceOnRequest,
        status: u.status,
        project: parent.id,
        propertyType: 'apartment',
        title: `${u.rooms} në ${parent.name}`,
        slug: `${parent.slug}-${u.unitCode.toLowerCase()}`,
        currency: 'EUR',
        listingType: 'sale',
        bedrooms: Number(u.rooms.split('+')[0]),
        bathrooms: u.rooms.endsWith('+2') ? 2 : 1,
        orientation: ['SW'],
        buildingPhase: parent.constructionPhase === 'completed' ? 'finished' : 'facade',
        mortgageEligible: true,
        gallery: [],
        _status: 'published',
        publishedAt: new Date().toISOString(),
      },
    })
  }

  // One draft unit under a published project, so the unit route can be proven
  // to 404 drafts for anonymous visitors the same way /prona/[slug] is.
  await payload.create({
    collection: 'project-units',
    data: {
      unitCode: 'A-11-9',
      floor: 11,
      rooms: '2+1',
      areaGross: 100,
      price: 175000,
      priceOnRequest: false,
      status: 'available',
      project: project.id,
      propertyType: 'apartment',
      title: 'Njësi draft për test',
      slug: 'orbital-3-residence-draft-unit',
      currency: 'EUR',
      listingType: 'sale',
      bedrooms: 2,
      bathrooms: 1,
      mortgageEligible: false,
      gallery: [],
      _status: 'draft',
    },
  })

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

    // Eight more real apartments imported from scripts/harvest/inventory.json
    // (the client's live duashpi.al inventory). Real price, area m², rooms,
    // floor and street are preserved; each is bucketed under an existing seeded
    // Tiranë neighbourhood so no coordinates are invented. These bring the
    // published set to 16 properties / 13 apartments, so ?tipi=apartment
    // paginates past the 12-per-page limit.
    { title: 'Apartament 1+1 në shitje te Vasil Shanto', type: 'apartment', area: 'Qendra', street: 'Rruga Viktor Eftimiu', rooms: '1+1', gross: 60, price: 125000, currency: 'EUR', listing: 'sale', status: 'available', floor: 5, mortgage: true, phase: 'existing' },
    { title: 'Apartament 1+1 në shitje te Vasil Shanto, 135000 euro', type: 'apartment', area: 'Qendra', street: 'Rruga Viktor Eftimiu', rooms: '1+1', gross: 70, price: 135000, currency: 'EUR', listing: 'sale', status: 'available', floor: 6, mortgage: true, phase: 'existing' },
    { title: 'Apartament 1+1 me qira në Astir', type: 'apartment', area: 'Astir', street: 'Astir', rooms: '1+1', gross: 66, price: 600, currency: 'EUR', listing: 'rent', status: 'available', floor: 9, mortgage: false, phase: 'finished' },
    { title: 'Apartament 1+1 me qira, Rruga Dritan Hoxha', type: 'apartment', area: 'Laprakë', street: 'Rruga Dritan Hoxha', rooms: '1+1', gross: 69, price: 520, currency: 'EUR', listing: 'rent', status: 'available', floor: 5, mortgage: false, phase: 'finished' },
    { title: 'Apartament 2+1 me qira, Rruga Tish Dahia', type: 'apartment', area: 'Laprakë', street: 'Rruga Tish Dahia', rooms: '2+1', gross: 95, price: 750, currency: 'EUR', listing: 'rent', status: 'available', floor: 4, mortgage: false, phase: 'finished' },
    { title: 'Apartament 2+1 me qira, Bulevardi Zogu I', type: 'apartment', area: 'Qendra', street: 'Bulevardi Zogu I', rooms: '2+1', gross: 85, price: 550, currency: 'EUR', listing: 'rent', status: 'available', floor: 4, mortgage: false, phase: 'finished' },
    { title: 'Apartament 1+1 me qira, Rruga Xhanfize Keko', type: 'apartment', area: 'Qendra', street: 'Rruga Xhanfize Keko', rooms: '1+1', gross: 70, price: 600, currency: 'EUR', listing: 'rent', status: 'available', floor: 1, mortgage: false, phase: 'finished' },
    { title: 'Apartament 2+1 me qira, afër Stacionit të Trenit', type: 'apartment', area: 'Qendra', street: 'Rruga Panorama', rooms: '2+1', gross: 90, price: 700, currency: 'EUR', listing: 'rent', status: 'available', floor: 12, mortgage: false, phase: 'finished' },
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

  // One unpublished listing so the public site can be proven to 404 drafts for
  // anonymous requests. Kept out of the published set above on purpose.
  await payload.create({
    collection: 'properties',
    data: {
      title: 'Draft property test',
      slug: 'draft-property-test',
      agent: agent.id,
      propertyType: 'apartment',
      price: 100000,
      currency: 'EUR',
      priceOnRequest: false,
      areaGross: 60,
      rooms: '1+1',
      bedrooms: 1,
      bathrooms: 1,
      floor: 2,
      orientation: ['S'],
      listingType: 'sale',
      status: 'available',
      mortgageEligible: false,
      area: areaIds['Astir'],
      street: 'Rruga e Testit',
      location: AREA_CENTERS['Astir'],
      reference: `ATM-2026-${String(counter++).padStart(4, '0')}`,
      verified: false,
      featured: false,
      gallery: [],
      ownerName: 'Seed owner',
      ownerPhone: '+355 68 50 89 999',
      _status: 'draft',
    },
  })

  payload.logger.info('seed complete')
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
