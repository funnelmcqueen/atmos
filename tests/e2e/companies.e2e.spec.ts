import { test, expect } from '@playwright/test'

/**
 * Companies slice smoke tests. Assumes `pnpm seed` has run: two published
 * companies — `orbital-construction` (one project, five units) and
 * `adria-invest` (no projects, no logo, no cover, no articles).
 */
const BASE = 'http://localhost:3000'

test.describe('Companies', () => {
  test('list renders seeded companies', async ({ page }) => {
    await page.goto(`${BASE}/sq/kompani`)

    await expect(page.locator('h1')).toHaveText('Kompani ndërtimi dhe investitorë')

    const cards = page.locator('.company-card')
    expect(await cards.count()).toBeGreaterThan(0)

    // Orbital is in the seed and links to its profile page.
    await expect(
      page.locator('a[href="/sq/kompani/orbital-construction"]').first(),
    ).toBeVisible()
  })

  test('profile renders for a seeded slug', async ({ page }) => {
    const res = await page.goto(`${BASE}/sq/kompani/orbital-construction`)
    expect(res?.status()).toBe(200)

    // Company name is the h1, exactly as written (docs/04).
    await expect(page.locator('h1')).toHaveText('Orbital Construction')

    // Available units reuse the shared listing card.
    expect(await page.locator('.card').count()).toBeGreaterThan(0)

    // Organization structured data is emitted server-side. Read the script
    // text directly — Playwright's text filters ignore <script> content.
    const ldBlocks = await page.locator('script[type="application/ld+json"]').allTextContents()
    expect(ldBlocks.some((b) => b.includes('"@type":"Organization"'))).toBeTruthy()
  })

  test('company with zero published projects still renders', async ({ page }) => {
    const res = await page.goto(`${BASE}/sq/kompani/adria-invest`)
    expect(res?.status()).toBe(200)

    await expect(page.locator('h1')).toHaveText('Adria Invest')
    // The active-projects section falls back to its empty state.
    await expect(page.locator('.empty').first()).toBeVisible()
  })
})
