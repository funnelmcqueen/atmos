/**
 * Outbound notification email via Resend (docs/05).
 *
 * Only transactional notifications to staff live here. Client-facing
 * auto-responders are explicitly not in v1, and alert emails (saved searches
 * and the like) are deferred with Atmos Match — docs/10-roadmap.md.
 *
 * ## Sending never fails a submission
 *
 * Every function here returns a result instead of throwing, and the callers
 * treat a failed send as a logged warning rather than a failed submit. The lead
 * is already committed to the database by the time we get here; telling the
 * visitor "something went wrong" because our mail provider had a bad minute
 * would invite them to submit again and turn one lead into two. The row is the
 * source of truth, the email is a convenience on top of it.
 */
import { Resend } from 'resend'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { SITE_URL } from '@/lib/seo'
import { EnquiryNotification } from '@/emails/EnquiryNotification'
import { ListingRequestNotification } from '@/emails/ListingRequestNotification'

/**
 * Tests set this so a suite run never reaches Resend. It is checked before the
 * API key so that a developer with a real key in `.env` still gets stubbed
 * sends under `pnpm test:e2e`.
 */
const isStubbed = (): boolean => process.env.ATMOS_EMAIL_TRANSPORT === 'stub'

const FROM = process.env.ATMOS_FROM_EMAIL ?? 'Atmos <njoftime@atmos.al>'

/** The shared triage queue: anything with no agent lands here. */
const INBOX = process.env.ATMOS_INBOX_EMAIL ?? 'info@atmos.al'

/** Admin bcc on every notification, per the slice brief. */
const ADMIN_BCC = process.env.ATMOS_ADMIN_EMAIL ?? INBOX

export interface SendResult {
  sent: boolean
  skipped?: 'stubbed' | 'no-api-key'
  error?: string
}

const send = async (args: {
  to: string
  subject: string
  react: React.ReactElement
  replyTo?: string
}): Promise<SendResult> => {
  if (isStubbed()) return { sent: false, skipped: 'stubbed' }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return { sent: false, skipped: 'no-api-key' }

  try {
    const resend = new Resend(apiKey)
    const { error } = await resend.emails.send({
      from: FROM,
      to: args.to,
      bcc: ADMIN_BCC === args.to ? undefined : ADMIN_BCC,
      replyTo: args.replyTo,
      subject: args.subject,
      react: args.react,
    })
    if (error) return { sent: false, error: error.message }
    return { sent: true }
  } catch (err) {
    return { sent: false, error: err instanceof Error ? err.message : String(err) }
  }
}

/* -------------------------------------------------------------------------- */
/* Recipient resolution                                                       */
/* -------------------------------------------------------------------------- */

export type EnquirySourceType = 'property' | 'unit' | 'project'

export interface EnquiryTarget {
  /** Where the notification goes. */
  email: string
  /** Null when nobody owns it and it fell through to the shared inbox. */
  agentId: number | null
  /** Human label for the subject line, the email body and `sourceTitle`. */
  label: string
  /** Locale-prefixed path back to the listing. */
  path: string
}

/**
 * Who gets the lead, and what it is about — resolved in one pass because the
 * action needs the label for `sourceTitle` and the sender needs the recipient,
 * and they come from the same documents.
 *
 * Routing:
 * - **property** — the listing's own agent (`properties.agent`).
 * - **unit** — the agent on its parent project. Units inherit their agent the
 *   same way they inherit area, location and developer (docs/03); they have no
 *   agent field of their own to look at.
 * - **project** — `projects.agent`.
 *
 * Anything unresolved goes to the shared inbox with `agentId: null`, so the
 * admin row shows plainly that nobody owns it yet.
 *
 * Everything here is read with `overrideAccess` on purpose: an enquiry about a
 * listing that has since been unpublished still has to reach someone.
 */
export const resolveEnquiryTarget = async (
  sourceType: EnquirySourceType,
  sourceId: string,
  locale: string,
): Promise<EnquiryTarget> => {
  const payload = await getPayload({ config })
  const base: Omit<EnquiryTarget, 'label' | 'path'> = { email: INBOX, agentId: null }
  const fallback = (label: string, path: string): EnquiryTarget => ({ ...base, label, path })

  const idOf = (rel: unknown): number | null => {
    if (typeof rel === 'number') return rel
    if (rel && typeof rel === 'object' && 'id' in rel) return Number((rel as { id: number }).id)
    return null
  }

  const recipientFor = async (
    agentId: number | null,
  ): Promise<{ email: string; agentId: number | null }> => {
    if (!agentId) return base
    const user = await payload.findByID({
      collection: 'users',
      id: agentId,
      depth: 0,
      overrideAccess: true,
      disableErrors: true,
    })
    return user?.email ? { email: user.email, agentId } : base
  }

  const numericId = Number(sourceId)
  if (!Number.isFinite(numericId)) return fallback(`#${sourceId}`, `/${locale}`)

  const read = <T extends 'properties' | 'projects' | 'project-units'>(collection: T, id: number) =>
    payload.findByID({
      collection,
      id,
      locale: locale as 'sq' | 'en',
      fallbackLocale: 'sq',
      depth: 0,
      overrideAccess: true,
      disableErrors: true,
    })

  try {
    if (sourceType === 'property') {
      const doc = await read('properties', numericId)
      if (!doc) return fallback(`#${sourceId}`, `/${locale}`)
      return {
        ...(await recipientFor(idOf(doc.agent))),
        label: doc.title,
        path: `/${locale}/prona/${doc.slug}`,
      }
    }

    if (sourceType === 'project') {
      const doc = await read('projects', numericId)
      if (!doc) return fallback(`#${sourceId}`, `/${locale}`)
      return {
        ...(await recipientFor(idOf(doc.agent))),
        label: doc.name,
        path: `/${locale}/projekte/${doc.slug}`,
      }
    }

    // unit → its project's agent, and a label naming the development
    const unit = await read('project-units', numericId)
    if (!unit) return fallback(`#${sourceId}`, `/${locale}`)

    const projectId = idOf(unit.project)
    const project = projectId ? await read('projects', projectId) : null

    return {
      ...(await recipientFor(idOf(project?.agent))),
      label: project ? `${unit.title} — ${project.name}` : unit.title,
      path: project
        ? `/${locale}/projekte/${project.slug}/${unit.slug}`
        : `/${locale}/projekte`,
    }
  } catch {
    // A deleted or unreadable source must not lose the lead — the row is
    // already stored, so fall back to the inbox and let a human sort it out.
    return fallback(`#${sourceId}`, `/${locale}`)
  }
}

/* -------------------------------------------------------------------------- */
/* Senders                                                                    */
/* -------------------------------------------------------------------------- */

export const sendEnquiryNotification = async (args: {
  to: string
  unassigned: boolean
  enquiryId: string | number
  name: string
  phone: string
  email?: string | null
  message?: string | null
  sourceLabel: string
  sourcePath: string
}): Promise<SendResult> =>
  send({
    to: args.to,
    // Name and property in the subject: an agent triaging on a phone should not
    // have to open it to know which listing this is about.
    subject: `Kërkesë e re — ${args.name} · ${args.sourceLabel}`,
    replyTo: args.email ?? undefined,
    react: EnquiryNotification({
      name: args.name,
      phone: args.phone,
      email: args.email,
      message: args.message,
      sourceLabel: args.sourceLabel,
      sourceUrl: `${SITE_URL}${args.sourcePath}`,
      adminUrl: `${SITE_URL}/admin/collections/enquiries/${args.enquiryId}`,
      unassigned: args.unassigned,
    }),
  })

export const sendListingRequestNotification = async (args: {
  requestId: string | number
  ownerName: string
  ownerPhone: string
  ownerEmail?: string | null
  city: string
  areaName?: string | null
  listingTypeLabel: string
  propertyType?: string | null
  rooms?: string | null
  areaSqm?: number | null
  askingPrice?: string | null
  photoCount: number
  hasDocumentation: boolean
  description?: string | null
}): Promise<SendResult> =>
  send({
    to: INBOX,
    subject: `Pronë e re për verifikim — ${[args.areaName, args.city].filter(Boolean).join(', ')}`,
    replyTo: args.ownerEmail ?? undefined,
    react: ListingRequestNotification({
      ...args,
      adminUrl: `${SITE_URL}/admin/collections/listing-requests/${args.requestId}`,
    }),
  })
