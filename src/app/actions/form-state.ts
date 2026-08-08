/**
 * The shape both public forms hand back to `useActionState`.
 *
 * Shared so the two forms report failure identically: a field-level map for
 * things the person can fix, and a single message for everything else. Keeping
 * validation results as data — rather than throwing — is what lets the page
 * render a confirmation in place instead of redirecting (docs/05).
 */
export type FormStatus = 'idle' | 'success' | 'error'

export interface FormState {
  status: FormStatus
  /** Keyed by field name; rendered next to the input. */
  errors?: Record<string, string>
  /** Shown above the form when the failure is not about one field. */
  message?: string
}

export const IDLE: FormState = { status: 'idle' }

/**
 * What a rejected submission is told.
 *
 * A honeypot hit or a too-fast submit gets the **same** generic message as any
 * other refusal, and never says which check tripped. Telling a bot "you filled
 * the hidden field" is free tuning advice, and the handful of humans who ever
 * see this (a password manager filling every input, say) are better served by
 * "try again" than by a technical explanation.
 */
export const GENERIC_REJECTION =
  'Nuk arritëm ta dërgojmë kërkesën. Provo përsëri pas pak, ose na telefono.'
