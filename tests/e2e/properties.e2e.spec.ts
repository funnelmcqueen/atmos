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

  /**
   * The two photo states of the card, both from real data (docs/12-design.md).
   *
   * `scripts/attach-photos.ts` gives seven seeded properties a real gallery and
   * deliberately leaves the Golem land plot without one — land with no
   * photography is a case the client's inventory actually has. So the listing
   * grid renders both branches, and a missing photo must read as a marked
   * placeholder rather than a broken image.
   */
  test('listings with photos render an image, land without renders the placeholder', async ({
    page,
  }) => {
    await page.goto(`${BASE}/sq/prona`)

    // At least one card carries a real cover photo...
    const images = page.locator('.card__img')
    expect(await images.count()).toBeGreaterThan(0)

    // ...and it actually loads. Asserting the <img> exists would pass even if
    // the media route or the Blob object were broken; naturalWidth only becomes
    // non-zero once the bytes have decoded.
    const firstImage = images.first()
    await expect(firstImage).toBeVisible()
    await expect
      .poll(() => firstImage.evaluate((img: HTMLImageElement) => img.naturalWidth))
      .toBeGreaterThan(0)
  })

  test('the land listing shows the marked no-photo placeholder', async ({ page }) => {
    // Exactly one land listing in the seed, and it is the photo-less one.
    await page.goto(`${BASE}/sq/prona?tipi=land`)

    await expect(page.locator('.card')).toHaveCount(1)
    await expect(page.locator('.card__title')).toContainText('Truall')

    // Marked placeholder, no image — not an empty box (docs/12-design.md).
    await expect(page.locator('.card__placeholder')).toHaveText('Pa foto')
    await expect(page.locator('.card__img')).toHaveCount(0)
  })
})
