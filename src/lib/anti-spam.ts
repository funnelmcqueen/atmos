/**
 * Anti-spam for the two public forms (docs/05): honeypot, timing check, and a
 * rate limit by IP. No CAPTCHA — it costs conversions and the volume does not
 * justify it yet.
 *
 * None of this is worth anything on its own. It works because both collections
 * have `create` closed, so a bot cannot skip straight to the REST endpoint; the
 * server actions are the only way in, and every one of these runs there.
 */
import { createHash } from 'node:crypto'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { verifyFormToken } from '@/lib/terms'
// Field names live in a Payload-free module so the client components can import
// them without dragging this file — and Payload — into the browser bundle.
import { HONEYPOT_FIELD, TOKEN_FIELD } from '@/lib/form-constants'

/** docs/05: reject submissions faster than three seconds. */
const MIN_FILL_MS = 3_000

/**
 * And an upper bound. A token from yesterday is either a tab left open for a
 * day or a bot replaying one it harvested; both should get a fresh form rather
 * than a submission accepted against stale terms.
 */
const MAX_TOKEN_AGE_MS = 12 * 60 * 60 * 1000

export type RejectionReason =
  | 'honeypot'
  | 'too-fast'
  | 'bad-token'
  | 'stale-token'
  | 'rate-limited'

export interface SpamVerdict {
  ok: boolean
  reason?: RejectionReason
}

/**
 * Honeypot and timing, from the raw form data.
 *
 * The honeypot is checked first and, when it trips, nothing else runs — there
 * is no point rate-limiting a request that is already going in the bin.
 */
export const checkHoneypotAndTiming = (form: FormData): SpamVerdict => {
  const honeypot = form.get(HONEYPOT_FIELD)
  if (typeof honeypot === 'string' && honeypot.trim() !== '') {
    return { ok: false, reason: 'honeypot' }
  }

  const { valid, ageMs } = verifyFormToken(form.get(TOKEN_FIELD)?.toString())
  if (!valid || ageMs === null) return { ok: false, reason: 'bad-token' }
  if (ageMs < MIN_FILL_MS) return { ok: false, reason: 'too-fast' }
  if (ageMs > MAX_TOKEN_AGE_MS) return { ok: false, reason: 'stale-token' }

  return { ok: true }
}

/**
 * A salted, one-way hash of the submitter's IP.
 *
 * Rate limiting needs to recognise a repeat source; it does not need to know
 * who that source is, and an unhashed address on every enquiry row would be a
 * log of who enquired about what. The salt is `PAYLOAD_SECRET`, so the hashes
 * are useless outside this deployment.
 *
 * Vercel sets `x-forwarded-for`; the client-controllable part is everything
 * after the first entry, so only the first is used.
 */
export const hashIp = async (): Promise<string> => {
  const h = await headers()
  const forwarded = h.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() || h.get('x-real-ip') || 'unknown'
  return createHash('sha256')
    .update(`${process.env.PAYLOAD_SECRET ?? ''}:${ip}`)
    .digest('hex')
}

/** Per-collection limits. Deliberately generous: a false positive here is a
 *  lost lead, which costs more than a spam row someone deletes. */
export const RATE_LIMITS = {
  enquiries: { max: 5, windowMs: 60 * 60 * 1000 }, // 5 per hour
  'listing-requests': { max: 3, windowMs: 24 * 60 * 60 * 1000 }, // 3 per day
} as const

export type RateLimitedCollection = keyof typeof RATE_LIMITS

/**
 * Count this IP's recent rows and compare against the limit.
 *
 * Counting existing rows is the whole mechanism — there is no separate store,
 * no Redis, and nothing to keep in sync. It survives cold starts and works
 * across serverless instances, which an in-memory Map does not: on Vercel each
 * instance would keep its own counter and a burst spread over several instances
 * would pass every one of them.
 */
export const checkRateLimit = async (
  collection: RateLimitedCollection,
  ipHash: string,
): Promise<SpamVerdict> => {
  const { max, windowMs } = RATE_LIMITS[collection]
  const since = new Date(Date.now() - windowMs).toISOString()

  const payload = await getPayload({ config })
  const { totalDocs } = await payload.count({
    collection,
    where: {
      and: [{ ipHash: { equals: ipHash } }, { createdAt: { greater_than: since } }],
    },
    overrideAccess: true,
  })

  return totalDocs >= max ? { ok: false, reason: 'rate-limited' } : { ok: true }
}
