import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

export interface LoginOptions {
  page: Page
  serverURL?: string
  user: {
    email: string
    password: string
  }
}

/**
 * Logs the user into the admin panel via the login page.
 */
export async function login({
  page,
  serverURL = 'http://localhost:3000',
  user,
}: LoginOptions): Promise<void> {
  await page.goto(`${serverURL}/admin/login`)

  await page.fill('#field-email', user.email)
  await page.fill('#field-password', user.password)
  await page.click('button[type="submit"]')

  await page.waitForURL(`${serverURL}/admin`)

  // The panel is Albanian-only (src/i18n/sq.ts), so the step nav reads
  // "Faqja kryesore". Asserting the translated string is deliberate: if the
  // custom language pack ever fails to register, every admin test fails here
  // with an obvious cause instead of somewhere further in.
  const dashboardArtifact = page.locator('span[title="Faqja kryesore"]')
  await expect(dashboardArtifact).toBeVisible()
}
