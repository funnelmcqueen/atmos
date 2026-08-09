import { test, expect, Page } from '@playwright/test'
import { login } from '../helpers/login'
import { seedTestUser, cleanupTestUser, testUser } from '../helpers/seedUser'

test.describe('Admin Panel', () => {
  let page: Page

  /**
   * The default 30s hook timeout is not enough to reach the login form on a
   * cold `next dev`.
   *
   * Measured: the first request to `/admin/login` takes ~23s to compile the
   * Payload admin bundle, and this hook also seeds a user and opens a browser
   * context before it navigates — so a cold run lands right on the limit and
   * fails, while a warm one passes in a second. That made the whole describe
   * block pass or fail depending on what ran before it, and the margin gets
   * worse as the app grows.
   *
   * Raising it is not loosening the assertion: nothing here is asserting how
   * fast the dev server compiles, and every real check still has its own
   * default timeout. See also "Known quirks" in docs/progress.md.
   *
   * It has to be `testInfo.setTimeout` inside the hook — a describe-level
   * `test.setTimeout` applies to the tests, not to `beforeAll`, which is the
   * thing that was timing out.
   */
  test.beforeAll(async ({ browser }, testInfo) => {
    testInfo.setTimeout(180_000)

    await seedTestUser()

    const context = await browser.newContext()
    page = await context.newPage()

    await login({ page, user: testUser })
  })

  test.afterAll(async () => {
    await cleanupTestUser()
  })

  test('can navigate to dashboard', async () => {
    await page.goto('http://localhost:3000/admin')
    await expect(page).toHaveURL('http://localhost:3000/admin')
    const dashboardArtifact = page.locator('span[title="Dashboard"]').first()
    await expect(dashboardArtifact).toBeVisible()
  })

  test('can navigate to list view', async () => {
    await page.goto('http://localhost:3000/admin/collections/users')
    await expect(page).toHaveURL('http://localhost:3000/admin/collections/users')
    const listViewArtifact = page.locator('h1', { hasText: 'Users' }).first()
    await expect(listViewArtifact).toBeVisible()
  })

  test('can navigate to edit view', async () => {
    await page.goto('http://localhost:3000/admin/collections/users/create')
    await expect(page).toHaveURL(/\/admin\/collections\/users\/[a-zA-Z0-9-_]+/)
    const editViewArtifact = page.locator('input[name="email"]')
    await expect(editViewArtifact).toBeVisible()
  })
})
