/**
 * Constants shared by the public forms and the server actions behind them.
 *
 * This module exists to stay importable from a client component. The obvious
 * homes for these were `lib/anti-spam.ts` and the action files, and both are
 * traps:
 *
 * - `lib/anti-spam.ts` imports Payload to run its rate-limit query. A client
 *   component importing one string constant from it pulls Payload into the
 *   browser bundle, and the build fails while compiling `payload/dist/...`
 *   for the client — an error that names Payload internals and points nowhere
 *   near the import that caused it.
 * - A `'use server'` file may only export async functions. Exporting a number
 *   from an action module is invalid regardless of who imports it.
 *
 * So: no imports here, ever. Values only.
 */

/** The field a person never sees and a bot usually fills. */
export const HONEYPOT_FIELD = 'company_website'

/** The signed render-time stamp the three-second timing check reads. */
export const TOKEN_FIELD = 'form_token'

/** docs/05: photos, up to 15. */
export const MAX_PHOTOS = 15

/** Per-file ceiling. A phone photo is 2–5 MB; 8 leaves room for a big one
 *  without letting a single file eat the whole request budget. */
export const MAX_PHOTO_BYTES = 8 * 1024 * 1024

/**
 * Total upload ceiling, matched to `serverActions.bodySizeLimit` in
 * next.config.ts with room left for the rest of the form. The form checks this
 * on selection and blocks with a real message; the action re-checks it, because
 * a request over the framework's limit is rejected before the action runs and
 * the visitor would otherwise see a blank failure after a long upload.
 */
export const MAX_TOTAL_BYTES = 22 * 1024 * 1024
