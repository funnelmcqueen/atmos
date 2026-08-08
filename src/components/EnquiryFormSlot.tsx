import { connection } from 'next/server'
import { signFormToken } from '@/lib/terms'
import type { Locale } from '@/messages/sq'
import { EnquiryForm } from './EnquiryForm'

/**
 * Server wrapper that mints the enquiry form's signed token per request.
 *
 * ## Why this exists
 *
 * The detail pages are prerendered (docs/13-caching.md). A token minted in the
 * page body would therefore be signed **at build time** and baked into the
 * static HTML — every visitor would submit the same one, and once it aged past
 * the token ceiling in `lib/anti-spam.ts` the timing check would reject every
 * submission on the site. The failure would look like "the form is broken" and
 * point nowhere near the cache.
 *
 * `connection()` is the fix: it marks this subtree as depending on an actual
 * request, so Next renders it per request rather than at build. Callers must
 * wrap it in `<Suspense>` — that is what keeps the dynamic part contained and
 * the rest of the page prerendered.
 *
 * Do not "optimise" this by hoisting the token into the page or adding
 * `'use cache'`. Both silently reintroduce the bug.
 */
export async function EnquiryFormSlot({
  sourceType,
  sourceId,
  locale,
  heading,
}: {
  sourceType: 'property' | 'unit' | 'project'
  sourceId: string | number
  locale: Locale
  heading?: string
}) {
  await connection()

  return (
    <EnquiryForm
      sourceType={sourceType}
      sourceId={sourceId}
      locale={locale}
      formToken={signFormToken()}
      heading={heading}
    />
  )
}

/** Holds the form's height while it streams, so the page does not reflow. */
export function EnquiryFormFallback() {
  return <div className="enquiry enquiry--loading" aria-hidden="true" />
}
