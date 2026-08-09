'use server'

import { getPayload } from 'payload'
import config from '@/payload.config'
import {
  checkHoneypotAndTiming,
  checkRateLimit,
  hashIp,
} from '@/lib/anti-spam'
import { TERMS_VERSION } from '@/lib/terms'
import { resolveEnquiryTarget, sendEnquiryNotification, type EnquirySourceType } from '@/lib/email'
import { isLocale, DEFAULT_LOCALE } from '@/messages/sq'
import { GENERIC_REJECTION, type FormState } from './form-state'

/**
 * Enquiry submission from a property, unit or project detail page (docs/05).
 *
 * This is the only way a row reaches the `enquiries` collection — `create` is
 * closed on the collection itself, so every submission passes the checks below
 * rather than only the ones that come through the form.
 *
 * Order matters. The cheap local checks run before anything touches the
 * database, and the terms check is repeated here even though the input is
 * `required` in the markup: client-side validation is a convenience for people,
 * never a control. Consent is recorded from the server's clock and the server's
 * copy of the version string, so a forged post cannot claim to have accepted
 * terms that were never shown.
 */

const SOURCE_TYPES: readonly EnquirySourceType[] = ['property', 'unit', 'project']

const text = (form: FormData, key: string): string => (form.get(key)?.toString() ?? '').trim()

/** Deliberately permissive — this only rejects what is certainly not an address. */
const looksLikeEmail = (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

export async function submitEnquiry(
  _previous: FormState,
  form: FormData,
): Promise<FormState> {
  // 1. Honeypot and signed timing, before any I/O.
  const spam = checkHoneypotAndTiming(form)
  if (!spam.ok) return { status: 'error', message: GENERIC_REJECTION }

  // 2. Field validation.
  const name = text(form, 'name')
  const phone = text(form, 'phone')
  const email = text(form, 'email')
  const message = text(form, 'message')
  const acceptedTerms = form.get('terms') === 'on'

  const errors: Record<string, string> = {}
  if (name.length < 2) errors.name = 'Shkruaj emrin tënd.'
  if (phone.length < 6) errors.phone = 'Shkruaj një numër telefoni ku të të gjejmë.'
  if (email && !looksLikeEmail(email)) errors.email = 'Ky email nuk duket i saktë.'
  // Re-checked server-side: the markup marks it required, which stops honest
  // mistakes, not a crafted request.
  if (!acceptedTerms) errors.terms = 'Duhet të pranosh kushtet për të vazhduar.'

  if (Object.keys(errors).length > 0) return { status: 'error', errors }

  // 3. Rate limit by hashed IP.
  const ipHash = await hashIp()
  const limit = await checkRateLimit('enquiries', ipHash)
  if (!limit.ok) {
    return {
      status: 'error',
      message: 'Ke dërguar disa kërkesa së fundmi. Provo më vonë ose na telefono.',
    }
  }

  // 4. Source, trusted only as far as it can be validated. An unknown type is
  //    rejected rather than coerced, so a bad post cannot create rows with a
  //    sourceType nothing in the admin filters by.
  const rawType = text(form, 'sourceType')
  if (!SOURCE_TYPES.includes(rawType as EnquirySourceType)) {
    return { status: 'error', message: GENERIC_REJECTION }
  }
  const sourceType = rawType as EnquirySourceType
  const sourceId = text(form, 'sourceId')
  if (!sourceId) return { status: 'error', message: GENERIC_REJECTION }

  const rawLocale = text(form, 'locale')
  const locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE

  // The label and the recipient come from the database, never from the form.
  const target = await resolveEnquiryTarget(sourceType, sourceId, locale)

  // 5. Store.
  const payload = await getPayload({ config })
  let enquiryId: string | number
  try {
    const created = await payload.create({
      collection: 'enquiries',
      data: {
        name,
        phone,
        email: email || undefined,
        message: message || undefined,
        sourceType,
        sourceId,
        sourceTitle: target.label,
        locale,
        assignedAgent: target.agentId,
        termsVersion: TERMS_VERSION,
        termsAcceptedAt: new Date().toISOString(),
        ipHash,
      },
      overrideAccess: true, // the collection is closed; this action is the gate
    })
    enquiryId = created.id
  } catch (err) {
    // Nothing was stored, so this one *is* worth telling the visitor about.
    console.error('[enquiry] create failed', err)
    return { status: 'error', message: GENERIC_REJECTION }
  }

  // 6. Notify. A failed send is logged, never surfaced — the lead is already
  //    saved and asking the visitor to try again would duplicate it.
  const result = await sendEnquiryNotification({
    to: target.email,
    unassigned: target.agentId === null,
    enquiryId,
    name,
    phone,
    email: email || null,
    message: message || null,
    sourceLabel: target.label,
    sourcePath: target.path,
  })
  if (result.sent) {
    // Logged on success too, not just failure: "did the agent get it?" is the
    // first question after a lead goes cold, and silence in the log is not an
    // answer. The id looks the message up in the Resend dashboard.
    console.info(`[enquiry] ${enquiryId} notified ${target.email} (resend ${result.id})`)
  } else if (!result.skipped) {
    console.warn(`[enquiry] ${enquiryId} stored but notification failed: ${result.error}`)
  }

  return { status: 'success' }
}
