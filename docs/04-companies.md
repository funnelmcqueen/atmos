# Companies and developers

Each construction company or investor gets a public profile page that acts as a
mini-site inside Atmos. This is a deliberate SEO play: when someone searches the
company name, Atmos should appear near the company's own site (§14).

## Fields

- `name` — not localized
- `legalName`, `nipt` (Albanian tax ID) — optional, admin-visible
- `slug`, `logo` (media), `coverImage` (media)
- `about` — richText, localized
- `foundedYear`, `website`, `phone`, `email`
- `socials` — array of `{ platform, url }`
- `areasOfOperation` — relationship to areas, hasMany
- `verifiedPartner` — checkbox, drives the badge
- `certifications` — array of `{ title, issuer, year, document }`

## Company page

Route: `/[locale]/kompani/[slug]`

Logo, name, verified badge, about, areas of operation, contact, then: active
projects, completed projects, available units across all projects, and any
articles tagged to the company.

The projects and units come from queries, not from a stored list. A company with
zero published projects still gets a page — it just shows the profile.

## SEO requirements

Non-negotiable for this collection:

- Company name is the `<h1>`, exactly as written, no marketing suffix
- Unique `<title>` and meta description per company per locale
- `Organization` JSON-LD with name, logo, url, sameAs (socials), address
- Logo file named with the company slug
- Internal links from every project page back to the company page
- Canonical points at the current locale's URL, `hreflang` for the others

Never promise a ranking outcome in copy or comments. Google decides.
