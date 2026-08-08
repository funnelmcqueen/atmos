import { test, expect } from '@playwright/test'

/**
 * Property map smoke tests. Assumes `pnpm seed` has run: 16 published standalone
 * properties, 15 in Tiranë neighbourhoods and exactly one (the land) in Golem,
 * near Durrës. That split makes a bounding box a deterministic subset check.
 *
 * The bbox feed is server-side (PostGIS ST_MakeEnvelope), so these assertions
 * hold without a MapTiler key or a rendered map — they exercise the query, which
 * is the part docs/06 says must never happen on the client.
 */
const BASE = 'http://localhost:3000'
const MAP = `${BASE}/sq/prona/map`

// A generous Tiranë rectangle: covers every seeded Tiranë neighbourhood centre,
// excludes Golem (lng ~19.51) and Dhërmi (lat ~40.15).
const TIRANE_BBOX = '19.70,41.25,19.90,41.40'
// Whole of Albania — every published property, Tiranë and the Golem land.
const ALBANIA_BBOX = '19.00,39.50,21.00,42.50'

const landCount = (features: Array<{ properties: { card: { propertyType: string } } }>) =>
  features.filter((f) => f.properties.card.propertyType === 'land').length

test.describe('Property map', () => {
  test('the map container renders on the listings page', async ({ page }) => {
    await page.goto(`${BASE}/sq/prona`)
    // Mounted via dynamic(ssr:false); the wrapper is present regardless of whether
    // a MapTiler key is configured for the run.
    await expect(page.locator('.property-map')).toBeVisible()
  })

  test('a bbox query returns exactly the properties inside it', async ({ request }) => {
    // Tiranë: the 15 Tiranë properties, and none of them is the Golem land.
    const tirane = await request.get(`${MAP}?bbox=${TIRANE_BBOX}`)
    expect(tirane.ok()).toBeTruthy()
    const tiraneData = await tirane.json()
    expect(tiraneData.type).toBe('FeatureCollection')
    expect(tiraneData.features).toHaveLength(15)
    expect(landCount(tiraneData.features)).toBe(0)

    // Widen to the whole country: the 16th property — the Golem land — appears.
    // The difference of exactly one proves the envelope, not the client, filters.
    const albania = await request.get(`${MAP}?bbox=${ALBANIA_BBOX}`)
    expect(albania.ok()).toBeTruthy()
    const albaniaData = await albania.json()
    expect(albaniaData.features).toHaveLength(16)
    expect(landCount(albaniaData.features)).toBe(1)
  })

  test('active filters narrow the map, not just the list', async ({ request }) => {
    // `transaksioni=rent` (the sq listing-type param) must apply to the map feed
    // too: only the rental listings inside the Tiranë box come back.
    const rent = await request.get(`${MAP}?transaksioni=rent&bbox=${TIRANE_BBOX}`)
    expect(rent.ok()).toBeTruthy()
    const rentData = await rent.json()
    expect(rentData.features.length).toBeGreaterThan(0)
    expect(
      rentData.features.every(
        (f: { properties: { listingType: string } }) => f.properties.listingType === 'rent',
      ),
    ).toBeTruthy()
  })

  test('a malformed bbox is rejected', async ({ request }) => {
    await expect((await request.get(`${MAP}?bbox=notanumber`)).status()).toBe(400)
    await expect((await request.get(MAP)).status()).toBe(400)
  })
})
