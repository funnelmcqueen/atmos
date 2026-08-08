import { test, expect, type Page } from '@playwright/test'
import { getPayload } from 'payload'
import config from '../../src/payload.config.js'

/**
 * Forms and email slice (docs/05). Assumes `pnpm seed` has run.
 *
 * Records are asserted through Payload's Local API rather than the admin UI:
 * these tests are about what got *stored* — the consent record, the routed
 * agent, the absence of a row after a rejection — and clicking through the
 * admin to read a field back would test the admin instead.
 *
 * Email never leaves the process. `playwright.config.ts` starts the dev server
 * with `ATMOS_EMAIL_TRANSPORT=stub`, and `lib/email.ts` checks that before the
 * API key, so a developer with a real key in `.env` still gets stubbed sends.
 */
const BASE = 'http://localhost:3000'
const PROPERTY = `${BASE}/sq/prona/apartament-1-1-ne-astir`

/** The timing check rejects anything faster than three seconds (docs/05). */
const MIN_FILL_MS = 3_000
const waitOutTimingCheck = () => new Promise((r) => setTimeout(r, MIN_FILL_MS + 500))

const countEnquiries = async (phone: string): Promise<number> => {
  const payload = await getPayload({ config })
  const { totalDocs } = await payload.count({
    collection: 'enquiries',
    where: { phone: { equals: phone } },
    overrideAccess: true,
  })
  return totalDocs
}

const latestEnquiry = async (phone: string) => {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'enquiries',
    where: { phone: { equals: phone } },
    sort: '-createdAt',
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  return docs[0]
}

/** A phone number unique to one test, so counts never collide across the file. */
const uniquePhone = (tag: string): string => `+355 69 ${tag}`

const fillEnquiry = async (page: Page, phone: string) => {
  await page.fill('#field-name', 'Testues Playwright')
  await page.fill('#field-phone', phone)
  await page.fill('#field-message', 'A është ende e lirë?')
}

test.describe('Enquiry form', () => {
  test('submit stores the enquiry and confirms in place', async ({ page }) => {
    const phone = uniquePhone('00 00 001')
    await page.goto(PROPERTY)

    const form = page.locator('.enquiry form')
    await expect(form).toBeVisible()

    await fillEnquiry(page, phone)
    await page.check('input[name="terms"]')

    // The form must be older than three seconds when it posts.
    await waitOutTimingCheck()
    await page.click('.form__submit')

    // Confirmation replaces the form on the same page — no redirect (docs/05).
    await expect(page.locator('.enquiry__success')).toBeVisible()
    await expect(page.locator('.enquiry__success')).toContainText('Kërkesa u dërgua')
    expect(new URL(page.url()).pathname).toBe('/sq/prona/apartament-1-1-ne-astir')
    await expect(page.locator('.enquiry form')).toHaveCount(0)

    // And the record exists, with the consent fields set server-side.
    expect(await countEnquiries(phone)).toBe(1)
    const doc = await latestEnquiry(phone)
    expect(doc?.sourceType).toBe('property')
    expect(doc?.termsVersion).toBeTruthy()
    expect(doc?.termsAcceptedAt).toBeTruthy()
    expect(doc?.locale).toBe('sq')
  })

  test('the terms checkbox is never pre-ticked', async ({ page }) => {
    await page.goto(PROPERTY)
    await expect(page.locator('.enquiry input[name="terms"]')).not.toBeChecked()
  })

  test('missing terms blocks the submit', async ({ page }) => {
    const phone = uniquePhone('00 00 002')
    await page.goto(PROPERTY)

    await fillEnquiry(page, phone)
    // Terms deliberately left unticked.
    await waitOutTimingCheck()
    await page.click('.form__submit')

    // The form is still there, no confirmation, and nothing was written.
    await expect(page.locator('.enquiry form')).toBeVisible()
    await expect(page.locator('.enquiry__success')).toHaveCount(0)
    expect(await countEnquiries(phone)).toBe(0)
  })

  test('a honeypot submission is rejected and stores nothing', async ({ page }) => {
    const phone = uniquePhone('00 00 003')
    await page.goto(PROPERTY)

    await fillEnquiry(page, phone)
    await page.check('input[name="terms"]')

    // Fill the hidden field the way a bot would. It is off-screen, so set the
    // value directly rather than pretending a human could type into it.
    await page.locator('input[name="company_website"]').fill('https://spam.example')

    await waitOutTimingCheck()
    await page.click('.form__submit')

    await expect(page.locator('.form__error')).toBeVisible()
    await expect(page.locator('.enquiry__success')).toHaveCount(0)
    expect(await countEnquiries(phone)).toBe(0)
  })

  test('a submission faster than three seconds is rejected', async ({ page }) => {
    const phone = uniquePhone('00 00 004')
    await page.goto(PROPERTY)

    await fillEnquiry(page, phone)
    await page.check('input[name="terms"]')
    // No wait — straight to submit.
    await page.click('.form__submit')

    await expect(page.locator('.form__error')).toBeVisible()
    expect(await countEnquiries(phone)).toBe(0)
  })

  test('a unit enquiry routes to the parent project agent', async ({ page }) => {
    const phone = uniquePhone('00 00 005')
    await page.goto(`${BASE}/sq/projekte/orbital-3-residence/orbital-3-residence-a-7-2`)

    await fillEnquiry(page, phone)
    await page.check('input[name="terms"]')
    await waitOutTimingCheck()
    await page.click('.form__submit')

    await expect(page.locator('.enquiry__success')).toBeVisible()

    const doc = await latestEnquiry(phone)
    expect(doc?.sourceType).toBe('unit')
    // Orbital 3 has a seeded agent; the unit inherits it (docs/03, docs/05).
    expect(doc?.assignedAgent).toBeTruthy()
    expect(doc?.sourceTitle).toContain('Orbital 3 Residence')
  })

  test('an unassigned project falls back to the shared inbox', async ({ page }) => {
    const phone = uniquePhone('00 00 006')
    // Laprakë Garden is seeded without an agent on purpose.
    await page.goto(`${BASE}/sq/projekte/laprake-garden`)

    await fillEnquiry(page, phone)
    await page.check('input[name="terms"]')
    await waitOutTimingCheck()
    await page.click('.form__submit')

    await expect(page.locator('.enquiry__success')).toBeVisible()

    const doc = await latestEnquiry(phone)
    expect(doc?.sourceType).toBe('project')
    expect(doc?.assignedAgent).toBeFalsy() // shared inbox, flagged for triage
  })

  test('the contact bar offers the form beside call and WhatsApp', async ({ page }) => {
    // The bar is mobile-only by design — hidden above 900px, where the aside
    // carries the same actions (docs/12). Asserting it at Playwright's default
    // desktop viewport would be asserting the wrong breakpoint.
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(PROPERTY)

    const bar = page.locator('.contact-bar')
    await expect(bar.locator('a[href^="tel:"]')).toBeVisible()
    await expect(bar.locator('a[href^="https://wa.me/"]')).toBeVisible()
    // The form is an addition, not a replacement (docs/12).
    await expect(bar.locator('a[href="#pyet"]')).toBeVisible()
  })
})

test.describe('Listing request form', () => {
  const countRequests = async (phone: string): Promise<number> => {
    const payload = await getPayload({ config })
    const { totalDocs } = await payload.count({
      collection: 'listing-requests',
      where: { ownerPhone: { equals: phone } },
      overrideAccess: true,
    })
    return totalDocs
  }

  test('submit stores the request with its consent record', async ({ page }) => {
    const phone = uniquePhone('11 00 001')
    await page.goto(`${BASE}/sq/dergo-pronen`)

    await expect(page.locator('h1')).toHaveText('Dërgo pronën')

    await page.fill('#field-ownerName', 'Pronari Testues')
    await page.fill('#field-ownerPhone', phone)
    await page.fill('#field-city', 'Tiranë')
    await page.selectOption('#field-listingType', 'sale')
    await page.fill('#field-askingPrice', '120000')
    await page.check('#field-terms')

    await waitOutTimingCheck()
    await page.click('.form__submit')

    await expect(page.locator('.form-success')).toBeVisible()
    await expect(page.locator('.form-success')).toContainText('Prona u dërgua')

    expect(await countRequests(phone)).toBe(1)

    const payload = await getPayload({ config })
    const { docs } = await payload.find({
      collection: 'listing-requests',
      where: { ownerPhone: { equals: phone } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    expect(docs[0]?.requestStatus).toBe('new')
    expect(docs[0]?.termsVersion).toBeTruthy()
    expect(docs[0]?.termsAcceptedAt).toBeTruthy()
  })

  test('missing terms blocks the submit', async ({ page }) => {
    const phone = uniquePhone('11 00 002')
    await page.goto(`${BASE}/sq/dergo-pronen`)

    await page.fill('#field-ownerName', 'Pronari Testues')
    await page.fill('#field-ownerPhone', phone)
    await page.fill('#field-city', 'Tiranë')
    await page.selectOption('#field-listingType', 'sale')
    // Terms left unticked.

    await waitOutTimingCheck()
    await page.click('.form__submit')

    await expect(page.locator('.form-success')).toHaveCount(0)
    expect(await countRequests(phone)).toBe(0)
  })

  test('a honeypot submission is rejected and stores nothing', async ({ page }) => {
    const phone = uniquePhone('11 00 003')
    await page.goto(`${BASE}/sq/dergo-pronen`)

    await page.fill('#field-ownerName', 'Bot')
    await page.fill('#field-ownerPhone', phone)
    await page.fill('#field-city', 'Tiranë')
    await page.selectOption('#field-listingType', 'sale')
    await page.check('#field-terms')
    await page.locator('input[name="company_website"]').fill('https://spam.example')

    await waitOutTimingCheck()
    await page.click('.form__submit')

    await expect(page.locator('.form__error')).toBeVisible()
    expect(await countRequests(phone)).toBe(0)
  })

  test('the terms checkbox is never pre-ticked', async ({ page }) => {
    await page.goto(`${BASE}/sq/dergo-pronen`)
    await expect(page.locator('#field-terms')).not.toBeChecked()
  })
})

test.afterAll(async () => {
  // Remove only what these tests created — every row is keyed by a phone number
  // in the reserved +355 69 [01]0 00 00X range, so this cannot touch seed data.
  const payload = await getPayload({ config })
  await payload.delete({
    collection: 'enquiries',
    where: { phone: { like: '+355 69 00 00' } },
    overrideAccess: true,
  })
  await payload.delete({
    collection: 'listing-requests',
    where: { ownerPhone: { like: '+355 69 11 00' } },
    overrideAccess: true,
  })
})
