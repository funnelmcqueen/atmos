import { test, expect } from '@playwright/test'

/**
 * Projects + units slice smoke tests. Assumes `pnpm seed` has run:
 *
 * - `orbital-3-residence` — under construction, 6 published units, one of each
 *   market state (sold / reserved / available) plus a price-on-request one, and
 *   a seventh unit left in draft.
 * - `laprake-garden` — completed, 3 published units across two buildings.
 */
const BASE = 'http://localhost:3000'
const PROJECT = `${BASE}/sq/projekte/orbital-3-residence`

/** Unit codes in the order the table currently renders them. */
const unitCodes = async (page: import('@playwright/test').Page): Promise<string[]> =>
  page.locator('.unit-table__cell--code').allInnerTexts()

/**
 * The table's column labels as one string, upper-cased.
 *
 * `allInnerTexts` returns *rendered* text, and the headers carry
 * `text-transform: uppercase`, so "Kati" comes back "KATI". Normalising here
 * keeps the assertions written in the labels a reader would look for, and stops
 * a purely visual style change from reading as a broken column.
 */
const headerText = async (page: import('@playwright/test').Page): Promise<string> =>
  (await page.locator('.unit-table thead th').allInnerTexts()).join(' ').toUpperCase()

test.describe('Projects', () => {
  test('index lists seeded projects and links to them', async ({ page }) => {
    await page.goto(`${BASE}/sq/projekte`)

    await expect(page.locator('h1')).toHaveText('Projekte të reja ndërtimi')

    const cards = page.locator('.project-card')
    expect(await cards.count()).toBeGreaterThanOrEqual(2)

    await expect(
      page.locator('a[href="/sq/projekte/orbital-3-residence"]').first(),
    ).toBeVisible()
    await expect(page.locator('a[href="/sq/projekte/laprake-garden"]').first()).toBeVisible()
  })

  test('project page renders the unit table', async ({ page }) => {
    const res = await page.goto(PROJECT)
    expect(res?.status()).toBe(200)

    // Project name is the h1, exactly as written — it is a proper name (docs/03).
    await expect(page.locator('h1')).toHaveText('Orbital 3 Residence')

    // Every column docs/03 asks for.
    const headers = await headerText(page)
    for (const label of ['Kati', 'Njësia', 'Dhoma', 'Sipërfaqja', 'Çmimi', 'Çmimi/m²', 'Statusi']) {
      expect(headers).toContain(label.toUpperCase())
    }

    // All six published units; the draft one is not among them.
    await expect(page.locator('.unit-table__row')).toHaveCount(6)
    expect(await unitCodes(page)).not.toContain('A-11-9')

    // Single-building project: no building column of one repeated value.
    expect(headers).not.toContain('GODINA')
  })

  test('sold units stay listed, with a badge', async ({ page }) => {
    await page.goto(PROJECT)

    // A-4-1 is sold in the seed. It must still be in the table — visible
    // scarcity is the point (docs/03, docs/12).
    const soldRow = page.locator('.unit-table__row--sold')
    await expect(soldRow).toHaveCount(1)
    await expect(soldRow).toContainText('A-4-1')
    await expect(soldRow.locator('.status-badge--sold')).toHaveText('Shitur')

    // Reserved stays visible too, with its own badge.
    const reservedRow = page.locator('.unit-table__row--reserved')
    await expect(reservedRow).toContainText('A-9-3')
    await expect(reservedRow.locator('.status-badge--reserved')).toHaveText('Rezervuar')
  })

  test('unit links resolve to a unit page', async ({ page }) => {
    await page.goto(PROJECT)

    const link = page.locator('.unit-table__cell--code a').first()
    const href = await link.getAttribute('href')
    expect(href).toMatch(/^\/sq\/projekte\/orbital-3-residence\/[a-z0-9-]+$/)

    await link.click()
    await page.waitForURL(/\/sq\/projekte\/orbital-3-residence\/.+/)

    // The unit's own title is the h1, and the page names its parent project.
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('.detail-head__parent')).toContainText('Orbital 3 Residence')
    await expect(
      page.locator('a[href="/sq/projekte/orbital-3-residence"]').first(),
    ).toBeVisible()
  })

  test('every unit link in the table resolves — none 404', async ({ page, request }) => {
    await page.goto(PROJECT)

    const hrefs = await page.locator('.unit-table__cell--code a').evaluateAll((els) =>
      els.map((el) => (el as HTMLAnchorElement).getAttribute('href')),
    )
    expect(hrefs.length).toBeGreaterThan(0)

    for (const href of hrefs) {
      const res = await request.get(`${BASE}${href}`)
      expect(res.status(), `${href} should resolve`).toBe(200)
    }
  })

  test('sorting by price reorders the rows', async ({ page }) => {
    await page.goto(PROJECT)

    // Default is floor ascending: the ground-floor unit leads.
    const byFloor = await unitCodes(page)
    expect(byFloor[0]).toBe('B-0-1')

    await page.locator('.unit-table__th--sortable', { hasText: 'Çmimi' }).locator('a').click()
    await page.waitForURL(/rendit=price-asc/)

    const byPrice = await unitCodes(page)
    expect(byPrice).not.toEqual(byFloor)
    // Cheapest first; the price-on-request unit has no price_eur and sorts last.
    expect(byPrice[0]).toBe('A-4-1')
    expect(byPrice[byPrice.length - 1]).toBe('B-0-1')

    // Clicking the active ascending column flips it to descending.
    await page.locator('.unit-table__th--sortable', { hasText: 'Çmimi' }).locator('a').click()
    await page.waitForURL(/rendit=price-desc/)
    expect((await unitCodes(page))[0]).toBe('B-13-2')
  })

  test('status filter narrows the table and can be cleared', async ({ page }) => {
    await page.goto(`${PROJECT}?statusi=available`)

    const codes = await unitCodes(page)
    expect(codes).not.toContain('A-4-1') // sold
    expect(codes).not.toContain('A-9-3') // reserved
    expect(codes).toContain('A-7-2')

    // Reset returns to the full table, sold units included.
    await page.locator('.filters__reset').click()
    await page.waitForURL(PROJECT)
    expect(await unitCodes(page)).toContain('A-4-1')
  })

  test('multi-building project shows the building column', async ({ page }) => {
    await page.goto(`${BASE}/sq/projekte/laprake-garden`)

    expect(await headerText(page)).toContain('GODINA')
  })

  test('project page emits Residence structured data with unit offers', async ({ page }) => {
    await page.goto(PROJECT)

    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents()
    const residence = blocks.find((b) => b.includes('"@type":"Residence"'))
    expect(residence).toBeTruthy()

    const ld = JSON.parse(residence as string)
    expect(ld.numberOfAccommodationUnits).toBe(6)
    expect(ld.numberOfAvailableAccommodationUnits).toBe(4)

    // An Offer per available unit that has a price — the price-on-request one
    // is available but has nothing to offer, so it is not among them.
    expect(Array.isArray(ld.makesOffer)).toBe(true)
    expect(ld.makesOffer).toHaveLength(3)
    const offered = ld.makesOffer.map((o: { name: string }) => o.name)
    expect(offered).toContain('A-7-2')
    expect(offered).not.toContain('A-4-1') // sold
    expect(offered).not.toContain('B-0-1') // price on request
  })

  test('unit page emits RealEstateListing structured data', async ({ page }) => {
    await page.goto(`${PROJECT}/orbital-3-residence-a-7-2`)

    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents()
    const listing = blocks.find((b) => b.includes('"@type":"RealEstateListing"'))
    expect(listing).toBeTruthy()

    const ld = JSON.parse(listing as string)
    expect(ld.containedInPlace?.name).toBe('Orbital 3 Residence')
    expect(ld.offers?.price).toBe(168000)
    expect(ld.offers?.availability).toBe('https://schema.org/InStock')
  })

  test('a draft unit 404s for anonymous visitors', async ({ page }) => {
    const res = await page.goto(`${PROJECT}/orbital-3-residence-draft-unit`)
    expect(res?.status()).toBe(404)
  })

  test('a unit addressed under the wrong project 404s', async ({ page }) => {
    // A real, published unit — but of the other project.
    const res = await page.goto(`${PROJECT}/laprake-garden-g-3-4`)
    expect(res?.status()).toBe(404)
  })

  test('company page shows linked project cards and linked unit cards', async ({ page }) => {
    await page.goto(`${BASE}/sq/kompani/orbital-construction`)

    // The inline unlinked block is gone — projects are cards that link out.
    expect(await page.locator('.project-card').count()).toBeGreaterThanOrEqual(2)
    await expect(
      page.locator('a[href="/sq/projekte/orbital-3-residence"]').first(),
    ).toBeVisible()

    // Available units now carry a real href into the unit route.
    const unitLink = page
      .locator('a[href^="/sq/projekte/"][href*="/orbital-3-residence-"]')
      .first()
    await expect(unitLink).toBeVisible()
  })
})
