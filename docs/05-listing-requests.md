# Listing requests and enquiries

The only two public write operations in v1.

## Listing request — "Dërgo pronën"

An owner submits a property. Atmos verifies, then creates a real Property from
it. The request itself is never public.

Route: `/[locale]/dergo-pronen`

Fields: full name, phone, email, city, area, address, listing type (sale/rent),
property type, rooms, area in m2, floor, asking price, description, photos
(up to 15), documentation checkbox, terms acceptance checkbox.

Stored in `listing-requests` with `requestStatus`:
`new` → `contacted` → `verified` → `published` → `rejected`

Admin fields on the request: `assignedAgent`, `internalNotes`, `rejectionReason`,
`linkedProperty` (relationship, set once published).

There is no automated conversion from request to property in v1. An agent reads
the request and creates the listing by hand. That is intentional — the
verification step is the product.

## Enquiry

Attached to any listing or project. Fields: name, phone, email, message,
`sourceType` (`property`, `unit`, `project`), `sourceId`, `locale`, `createdAt`.

Posted from the detail page, no dedicated URL.

On submit: store the enquiry, send a notification email to the assigned agent
via Resend, show a confirmation state on the page. No client-facing
auto-responder in v1.

## Anti-spam

Honeypot field plus a timing check (reject submissions faster than 3 seconds).
Rate limit by IP. No CAPTCHA in v1 — it costs conversions and the volume doesn't
justify it yet.

## Terms

Both forms require an explicit terms checkbox. Store the accepted terms version
string and the timestamp alongside the submission (§20). The checkbox must not
be pre-ticked.
