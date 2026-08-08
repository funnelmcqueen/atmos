import { test, expect } from '@playwright/test'

/**
 * Search + filters smoke tests. Assumes `pnpm seed` has run: 16 published
 * standalone properties, of which 13 are apartments and exactly one is land.
 * All are `available` or `sold` — none `reserved`. Filter state is entirely in
 * the URL (docs/06-search-map.md), so every case is just a navigation.
 */
const BASE = 'http://localhost:3000'

test.describe('Search and filters', () => {
  test('a filtered URL returns the right subset', async ({ page }) => {
    // Exactly one land listing in the seed.
    await page.goto(`${BASE}/sq/prona?tipi=land`)
    await expect(page.locator('.card')).toHaveCount(1)
    await expect(page.locator('.page-head__count')).toHaveText('1 pronë')
    await expect(page.locator('.card__title')).toContainText('Truall')

    // Thirteen apartments → a full first page of 12 and a second page.
    await page.goto(`${BASE}/sq/prona?tipi=apartment`)
    await expect(page.locator('.card')).toHaveCount(12)
    await expect(page.locator('.pagination')).toBeVisible()
  })

  test('an empty result shows the empty state', async ({ page }) => {
    // No property is reserved, so this filter matches nothing.
    await page.goto(`${BASE}/sq/prona?statusi=reserved`)
    await expect(page.locator('.card')).toHaveCount(0)
    await expect(page.locator('.empty')).toHaveText('Nuk u gjet asnjë pronë.')
    await expect(page.locator('.page-head__count')).toHaveText('0 prona')
  })

  test('pagination preserves the active filters', async ({ page }) => {
    await page.goto(`${BASE}/sq/prona?tipi=apartment`)

    // The page-2 link carries the filter forward, not just the page number.
    const pageTwo = page.locator('a.pagination__page', { hasText: '2' })
    const href = await pageTwo.getAttribute('href')
    expect(href).toContain('tipi=apartment')
    expect(href).toContain('faqe=2')

    // Page 2 of the apartment filter has the 13th apartment only — proof the
    // filter survived paging (unfiltered page 2 would show four properties).
    await page.goto(`${BASE}/sq/prona?tipi=apartment&faqe=2`)
    await expect(page.locator('.card')).toHaveCount(1)
  })

  test('filtered pages are noindex, clean pages are indexable', async ({ page }) => {
    await page.goto(`${BASE}/sq/prona?tipi=apartment`)
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)

    await page.goto(`${BASE}/sq/prona`)
    await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(0)
  })
})
