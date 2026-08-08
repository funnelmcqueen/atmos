import { test, expect } from '@playwright/test'

/**
 * Properties slice smoke tests. Assumes `pnpm seed` has run: eight published
 * properties plus one draft (`draft-property-test`).
 */
const BASE = 'http://localhost:3000'

test.describe('Properties', () => {
  test('list renders seeded properties', async ({ page }) => {
    await page.goto(`${BASE}/sq/prona`)

    await expect(page.locator('h1')).toHaveText('Prona në shitje dhe me qira')

    const cards = page.locator('.card')
    expect(await cards.count()).toBeGreaterThan(0)

    // The Astir apartment is in the seed and links to its detail page.
    await expect(
      page.locator('a[href="/sq/prona/apartament-1-1-ne-astir"]').first(),
    ).toBeVisible()
  })

  test('detail renders for a seeded slug', async ({ page }) => {
    const res = await page.goto(`${BASE}/sq/prona/apartament-1-1-ne-astir`)
    expect(res?.status()).toBe(200)

    await expect(page.locator('h1')).toContainText('Astir')
    // RealEstateListing structured data is emitted server-side.
    await expect(page.locator('script[type="application/ld+json"]').first()).toBeAttached()
  })

  test('draft property 404s for an anonymous request', async ({ page }) => {
    const res = await page.goto(`${BASE}/sq/prona/draft-property-test`)
    expect(res?.status()).toBe(404)
  })
})
