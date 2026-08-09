import path from 'path'
import { fileURLToPath } from 'url'
import { test, expect, type Page } from '@playwright/test'
import { getPayload } from 'payload'
import config from '../../src/payload.config.js'
import { login } from '../helpers/login'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const FIXTURE_PHOTO = path.resolve(dirname, '../fixtures/prone-test.jpg')

const ADMIN = 'http://localhost:3000/admin'

const agent = {
  name: 'Agjent E2E',
  email: 'agjent-e2e@atmos.al',
  password: 'agjent-e2e-pw',
  phone: '+355 69 20 11 557',
}

/**
 * The create-a-property flow an agent actually walks, on a phone.
 *
 * 390x844 is an iPhone 14 Pro — the narrowest mainstream viewport, and the one
 * an agent standing in an empty apartment is holding. Anything that only works
 * at desktop width does not work.
 *
 * Runs as an agent rather than an admin, so it also covers the role rules in
 * docs/11-roles.md: the SEO group and the derived price stay hidden, and the
 * listing can only ever reach draft.
 *
 * Two things about this collection shape the test:
 *
 * - `versions.drafts.autosave` means opening `/create` creates the row straight
 *   away and redirects to `/properties/{id}`. There is no save button to click
 *   and every visit leaves a draft behind, so `afterAll` sweeps everything this
 *   agent owns rather than tracking ids by hand.
 * - The upload field has no inline file input. "Krijo të re" opens a media
 *   drawer, the file goes in there, and the drawer's own save attaches it.
 */
test.describe('Agent creates a property on a phone', () => {
  let page: Page
  let agentId: number | string

  test.beforeAll(async ({ browser }, testInfo) => {
    // Same cold-compile budget as admin.e2e.spec.ts — see the note there.
    testInfo.setTimeout(180_000)

    const payload = await getPayload({ config })
    await payload.delete({ collection: 'users', where: { email: { equals: agent.email } } })
    const created = await payload.create({
      collection: 'users',
      data: { ...agent, role: 'agent' },
    })
    agentId = created.id

    const context = await browser.newContext({ viewport: { width: 390, height: 844 } })
    page = await context.newPage()
    await login({ page, user: agent })
  })

  test.afterAll(async () => {
    const payload = await getPayload({ config })

    // Every /create visit autosaved a draft. Collect their photos first —
    // uploads land in Vercel Blob and a leaked one costs real storage.
    const drafts = await payload.find({
      collection: 'properties',
      where: { agent: { equals: agentId } },
      limit: 100,
      depth: 0,
      draft: true,
    })

    const mediaIds = drafts.docs.flatMap((doc) =>
      (doc.gallery ?? [])
        .map((row) => row.image)
        .map((image) => (typeof image === 'object' && image ? image.id : image))
        .filter((id): id is number => typeof id === 'number'),
    )

    for (const doc of drafts.docs) {
      await payload.delete({ collection: 'properties', id: doc.id }).catch(() => undefined)
    }
    for (const id of mediaIds) {
      await payload.delete({ collection: 'media', id }).catch(() => undefined)
    }
    await payload.delete({ collection: 'users', where: { email: { equals: agent.email } } })
  })

  test('the properties list is Albanian and leads with the neighbourhood', async () => {
    await page.goto(`${ADMIN}/collections/properties`)

    await expect(page.locator('h1', { hasText: 'Prona' }).first()).toBeVisible()

    const headerText = await page.locator('thead').innerText()
    expect(headerText).toContain('Titulli')
    expect(headerText).toContain('Zona')
    expect(headerText).toContain('Çmimi')

    // The neighbourhood earns its column ahead of the price.
    expect(headerText.indexOf('Zona')).toBeLessThan(headerText.indexOf('Çmimi'))
  })

  test('the create form is Albanian, ordered for an agent, and hides what they do not need', async () => {
    test.setTimeout(120_000)

    await page.goto(`${ADMIN}/collections/properties/create`)
    await expect(page.locator('#field-title')).toBeVisible({ timeout: 60_000 })

    // Sections, in the order an agent fills them in.
    const labels = await page
      .locator('[id^="field-collapsible-_index-"] .collapsible-field__row-label-wrap')
      .allInnerTexts()

    expect(labels.map((s) => s.trim())).toEqual([
      'Lloji dhe transaksioni',
      'Vendndodhja',
      'Çmimi',
      'Sipërfaqja',
      'Planimetria',
      'Karakteristikat',
      'Fotot',
      'Titulli dhe përshkrimi',
      'Të dhënat e pronarit',
    ])

    // Nothing starts collapsed, so no required field is hidden behind a fold.
    const folds = page.locator('[id^="field-collapsible-_index-"] .collapsible__toggle')
    const open = page.locator(
      '[id^="field-collapsible-_index-"] .collapsible__toggle--open',
    )
    expect(await open.count()).toBe(await folds.count())

    for (const id of ['#field-areaGross', '#field-rooms', '#field-title', '#field-gallery']) {
      await expect(page.locator(id)).toBeVisible()
    }

    // The private owner block renders — a `row` here would silently swallow it,
    // see the note in src/collections/Properties.ts.
    await expect(page.locator('#field-ownerName')).toBeVisible()
    await expect(page.locator('#field-ownerPhone')).toBeVisible()

    // Hidden from an agent: derived and SEO.
    await expect(page.locator('#field-priceEur')).toHaveCount(0)
    await expect(page.locator('#field-seo__metaTitle')).toHaveCount(0)
  })

  test('fills every required field, uploads a photo, and the draft persists', async () => {
    test.setTimeout(180_000)

    await page.goto(`${ADMIN}/collections/properties/create`)
    await expect(page.locator('#field-title')).toBeVisible({ timeout: 60_000 })

    // Autosave has already created the row and moved us off /create.
    await page.waitForURL(/\/admin\/collections\/properties\/\d+/, { timeout: 60_000 })
    const id = Number(page.url().split('/').pop())
    expect(Number.isFinite(id)).toBe(true)

    // 1. Lloji dhe transaksioni — propertyType already defaults to apartment.
    await selectOption(page, 'listingType', 'Në shitje')

    // 2. Vendndodhja
    await page.locator('#field-area .rs__control').click()
    await page.locator('.rs__option').first().click()
    await page.fill('#field-longitude-location', '19.8187')
    await page.fill('#field-latitude-location', '41.3275')

    // 3. Çmimi
    await page.fill('#field-price', '145000')

    // 4. Sipërfaqja — gross, the one price per m² divides by.
    await page.fill('#field-areaGross', '96')

    // 5. Planimetria — the Albanian rooms notation the description warns about.
    await page.fill('#field-rooms', '2+1')

    // 7. Fotot — a real upload, through the drawer, into Vercel Blob.
    await page.locator('#field-gallery button.array-field__add-row').click()
    await page.locator('#field-gallery__0__image').waitFor()
    await page.locator('#field-gallery__0__image button:has-text("Krijo të re")').click()

    // The input is deliberately `hidden` — Payload drives it from the dropzone —
    // so wait for it to be attached, not visible. setInputFiles works either way.
    const fileInput = page.locator('input.file-field__hidden-input').first()
    await fileInput.waitFor({ state: 'attached', timeout: 30_000 })
    await fileInput.setInputFiles(FIXTURE_PHOTO)

    // The drawer swaps the picker for a preview once the file is staged. Assert
    // on the picker going away, not on the preview's edit button — at 390px that
    // button is in a hover-only overlay and never reports visible.
    await expect(page.locator('button:has-text("Zgjidh një skedar")')).toHaveCount(0, {
      timeout: 30_000,
    })

    // `#action-save` belongs to the drawer. The property form itself has no save
    // button at all — autosave is the save — so this is unambiguous.
    await page.locator('#action-save').click()
    await expect(page.locator('#action-save')).toHaveCount(0, { timeout: 60_000 })

    // 8. Titulli — written last, once the facts are on the page.
    await page.fill('#field-title', 'Apartament 2+1 te Bllok, 96 m²')

    // No save button exists: autosave is the save. Poll the row until it lands.
    const payload = await getPayload({ config })
    await expect
      .poll(
        async () => {
          const doc = await payload
            .findByID({ collection: 'properties', id, depth: 0, draft: true })
            .catch(() => null)
          return doc?.title ?? null
        },
        { timeout: 60_000, intervals: [1000] },
      )
      .toBe('Apartament 2+1 te Bllok, 96 m²')

    const doc = await payload.findByID({ collection: 'properties', id, depth: 0, draft: true })

    // slugField strips ë/ç and turns every other non-alphanumeric run into one
    // hyphen, so the "+" in the rooms notation becomes one too.
    expect(doc.slug).toBe('apartament-2-1-te-bllok-96-m')
    expect(doc.propertyType).toBe('apartment')
    expect(doc.listingType).toBe('sale')
    expect(doc.status).toBe('available')
    expect(doc.areaGross).toBe(96)
    expect(doc.rooms).toBe('2+1')
    expect(doc.price).toBe(145000)
    expect(doc.currency).toBe('EUR')
    expect(doc.gallery?.length).toBe(1)

    // An agent cannot publish, and never touched the agent field — the
    // beforeChange hook assigned it (docs/11-roles.md).
    expect(doc._status).toBe('draft')
    const assigned = typeof doc.agent === 'object' ? doc.agent?.id : doc.agent
    expect(assigned).toBe(agentId)

    // priceEur is derived even though the agent never sees the field.
    expect(doc.priceEur).toBe(145000)
  })
})

/** Picks an option out of one of Payload's react-select fields by its label. */
async function selectOption(page: Page, field: string, label: string): Promise<void> {
  await page.locator(`#field-${field} .rs__control`).click()
  await page.locator('.rs__option', { hasText: label }).first().click()
}
