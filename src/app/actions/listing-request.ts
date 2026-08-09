'use server'

import { getPayload } from 'payload'
import config from '@/payload.config'
import { checkHoneypotAndTiming, checkRateLimit, hashIp } from '@/lib/anti-spam'
import { MAX_PHOTOS, MAX_PHOTO_BYTES, MAX_TOTAL_BYTES } from '@/lib/form-constants'
import { TERMS_VERSION } from '@/lib/terms'
import { sendListingRequestNotification } from '@/lib/email'
import { isLocale, DEFAULT_LOCALE, LISTING_TYPE_LABELS } from '@/messages/sq'
import { formatPrice } from '@/lib/format'
import { GENERIC_REJECTION, type FormState } from './form-state'

/**
 * Owner submission from /[locale]/dergo-pronen (docs/05).
 *
 * Same gate as the enquiry action — honeypot, signed timing, rate limit, terms
 * re-checked server-side — plus photo handling, which is the part with teeth.
 * `listing-requests.create` is closed, and `media.create` is staff-only, so an
 * anonymous visitor can cause an upload only by coming through here.
 *
 * The request is stored with `requestStatus: 'new'` and nothing else happens
 * automatically. An agent reads it and creates the Property by hand; the
 * verification step is the product (docs/05), not a step to optimise away.
 */

const text = (form: FormData, key: string): string => (form.get(key)?.toString() ?? '').trim()

const numberOrNull = (form: FormData, key: string): number | null => {
  const raw = text(form, key)
  if (!raw) return null
  const n = Number(raw.replace(/\s/g, '').replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

const looksLikeEmail = (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

export async function submitListingRequest(
  _previous: FormState,
  form: FormData,
): Promise<FormState> {
  const spam = checkHoneypotAndTiming(form)
  if (!spam.ok) return { status: 'error', message: GENERIC_REJECTION }

  const ownerName = text(form, 'ownerName')
  const ownerPhone = text(form, 'ownerPhone')
  const ownerEmail = text(form, 'ownerEmail')
  const city = text(form, 'city')
  const areaName = text(form, 'areaName')
  const address = text(form, 'address')
  const listingType = text(form, 'listingType')
  const propertyType = text(form, 'propertyType')
  const rooms = text(form, 'rooms')
  const areaSqm = numberOrNull(form, 'areaSqm')
  const floor = numberOrNull(form, 'floor')
  const askingPrice = numberOrNull(form, 'askingPrice')
  const description = text(form, 'description')
  const hasDocumentation = form.get('hasDocumentation') === 'on'
  const acceptedTerms = form.get('terms') === 'on'

  const errors: Record<string, string> = {}
  if (ownerName.length < 2) errors.ownerName = 'Shkruaj emrin dhe mbiemrin.'
  if (ownerPhone.length < 6) errors.ownerPhone = 'Shkruaj një numër telefoni ku të të gjejmë.'
  if (ownerEmail && !looksLikeEmail(ownerEmail)) errors.ownerEmail = 'Ky email nuk duket i saktë.'
  if (city.length < 2) errors.city = 'Shkruaj qytetin.'
  if (listingType !== 'sale' && listingType !== 'rent') {
    errors.listingType = 'Zgjidh nëse është për shitje apo me qira.'
  }
  if (areaSqm !== null && areaSqm <= 0) errors.areaSqm = 'Sipërfaqja duhet të jetë më e madhe se 0.'
  if (askingPrice !== null && askingPrice < 0) errors.askingPrice = 'Çmimi nuk mund të jetë negativ.'
  if (!acceptedTerms) errors.terms = 'Duhet të pranosh kushtet për të vazhduar.'

  // Photos: validated before anything is uploaded, so a bad set costs no blob
  // writes and leaves no orphans behind.
  const photos = form
    .getAll('photos')
    .filter((entry): entry is File => entry instanceof File && entry.size > 0)

  if (photos.length > MAX_PHOTOS) {
    errors.photos = `Mund të ngarkosh deri në ${MAX_PHOTOS} foto.`
  }
  if (photos.some((file) => !file.type.startsWith('image/'))) {
    errors.photos = 'Ngarko vetëm foto.'
  }
  if (photos.some((file) => file.size > MAX_PHOTO_BYTES)) {
    errors.photos = `Secila foto duhet të jetë nën ${Math.round(MAX_PHOTO_BYTES / 1024 / 1024)} MB.`
  }
  const totalBytes = photos.reduce((sum, file) => sum + file.size, 0)
  if (totalBytes > MAX_TOTAL_BYTES) {
    errors.photos = `Fotot së bashku janë shumë të mëdha. Provo me më pak ose më të vogla.`
  }

  if (Object.keys(errors).length > 0) return { status: 'error', errors }

  const ipHash = await hashIp()
  const limit = await checkRateLimit('listing-requests', ipHash)
  if (!limit.ok) {
    return {
      status: 'error',
      message: 'Ke dërguar disa prona së fundmi. Provo më vonë ose na telefono.',
    }
  }

  const rawLocale = text(form, 'locale')
  const locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE
  const payload = await getPayload({ config })

  // Upload first: a request row pointing at photos that failed to store would
  // be worse than a failed submit the owner can retry.
  const photoIds: number[] = []
  try {
    for (const file of photos) {
      const buffer = Buffer.from(await file.arrayBuffer())
      const media = await payload.create({
        collection: 'media',
        data: { alt: `${ownerName} — ${[areaName, city].filter(Boolean).join(', ')}` },
        file: {
          data: buffer,
          mimetype: file.type,
          name: file.name,
          size: file.size,
        },
        overrideAccess: true, // media.create is staff-only; this action is the gate
      })
      photoIds.push(media.id)
    }
  } catch (err) {
    console.error('[listing-request] photo upload failed', err)
    return {
      status: 'error',
      errors: { photos: 'Fotot nuk u ngarkuan dot. Provo përsëri ose dërgo pronën pa foto.' },
    }
  }

  let requestId: string | number
  try {
    const created = await payload.create({
      collection: 'listing-requests',
      data: {
        requestStatus: 'new',
        ownerName,
        ownerPhone,
        ownerEmail: ownerEmail || undefined,
        city,
        areaName: areaName || undefined,
        address: address || undefined,
        listingType: listingType as 'sale' | 'rent',
        propertyType: propertyType || undefined,
        rooms: rooms || undefined,
        areaSqm: areaSqm ?? undefined,
        floor: floor ?? undefined,
        askingPrice: askingPrice ?? undefined,
        description: description || undefined,
        photos: photoIds.map((id) => ({ image: id })),
        hasDocumentation,
        termsVersion: TERMS_VERSION,
        termsAcceptedAt: new Date().toISOString(),
        submittedLocale: locale,
        ipHash,
      },
      overrideAccess: true,
    })
    requestId = created.id
  } catch (err) {
    console.error('[listing-request] create failed', err)
    return { status: 'error', message: GENERIC_REJECTION }
  }

  const result = await sendListingRequestNotification({
    requestId,
    ownerName,
    ownerPhone,
    ownerEmail: ownerEmail || null,
    city,
    areaName: areaName || null,
    listingTypeLabel: LISTING_TYPE_LABELS[listingType] ?? listingType,
    propertyType: propertyType || null,
    rooms: rooms || null,
    areaSqm,
    askingPrice: askingPrice !== null ? formatPrice(askingPrice, 'EUR') : null,
    photoCount: photoIds.length,
    hasDocumentation,
    description: description || null,
  })
  if (result.sent) {
    console.info(`[listing-request] ${requestId} notified (resend ${result.id})`)
  } else if (!result.skipped) {
    console.warn(`[listing-request] ${requestId} stored but notification failed: ${result.error}`)
  }

  return { status: 'success' }
}
