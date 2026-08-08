/**
 * Terms acceptance and the signed form token (docs/05, §20).
 *
 * Both public forms must record *which* terms the person agreed to and *when*.
 * "They ticked a box" is not a consent record if nobody can say what the box
 * said at the time — so the version string is stored on the row alongside the
 * timestamp, and it changes whenever the terms text changes.
 */
import { createHmac, timingSafeEqual } from 'node:crypto'

/**
 * Bump this whenever the terms text changes. Rows keep the version they were
 * submitted under, so an old acceptance never silently becomes an acceptance of
 * something the person never read.
 */
export const TERMS_VERSION = '2026-08-v1'

/** The HMAC key. `PAYLOAD_SECRET` is already required for the app to boot. */
const secret = (): string => {
  const value = process.env.PAYLOAD_SECRET
  if (!value) throw new Error('PAYLOAD_SECRET is required to sign form tokens.')
  return value
}

/**
 * A form's "issued at" stamp, signed.
 *
 * The timing check (docs/05: reject submissions faster than 3 seconds) needs to
 * know when the form was rendered, and the only place to keep that is the form
 * itself — where the submitter can edit it. Unsigned, a bot sets the field to
 * ten minutes ago and walks through. The HMAC makes the timestamp the server's
 * claim rather than the client's.
 */
export const signFormToken = (issuedAt: number = Date.now()): string => {
  const payload = String(issuedAt)
  const mac = createHmac('sha256', secret()).update(payload).digest('base64url')
  return `${payload}.${mac}`
}

/** Constant-time compare — a plain `===` on a MAC leaks timing information. */
const macMatches = (expected: string, actual: string): boolean => {
  const a = Buffer.from(expected)
  const b = Buffer.from(actual)
  return a.length === b.length && timingSafeEqual(a, b)
}

export interface TokenCheck {
  valid: boolean
  ageMs: number | null
}

/**
 * Verify a token and report how old it is. An unparseable or badly signed token
 * is invalid — it is not treated as "just old", because a forged token is a
 * stronger signal than a fast one.
 */
export const verifyFormToken = (token: string | null | undefined): TokenCheck => {
  if (!token) return { valid: false, ageMs: null }

  const [payload, mac] = token.split('.')
  if (!payload || !mac) return { valid: false, ageMs: null }

  const expected = createHmac('sha256', secret()).update(payload).digest('base64url')
  if (!macMatches(expected, mac)) return { valid: false, ageMs: null }

  const issuedAt = Number(payload)
  if (!Number.isFinite(issuedAt)) return { valid: false, ageMs: null }

  return { valid: true, ageMs: Date.now() - issuedAt }
}
