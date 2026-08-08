# Approval and publishing

Nothing reaches the public site without an admin publishing it. This is the
client's core positioning, not a nice-to-have.

## Mechanism

Payload drafts, enabled on every publishable collection:

```ts
versions: {
  drafts: { autosave: { interval: 800 } },
  maxPerDoc: 25,
}
```

Two independent flags per document:

- `_status` — Payload's own, `draft` or `published`. Controls public visibility.
- `status` — the listing's market state: `available`, `reserved`, `sold`.

Do not conflate them. A sold property is still published; it just shows a sold
badge.

## Public queries

Every public-facing query passes `draft: false`. The `listing_index` view filters
on `_status = 'published'` internally, so search is safe by construction. Detail
pages must pass it explicitly.

Preview for admins uses Payload's draft preview with a signed token — never a
query param an anonymous visitor could guess.

## Roles

| Role | Can |
| --- | --- |
| `admin` | everything, including user management and publishing |
| `agent` | create and edit listings, save drafts, cannot publish |
| `client` | own favourites and enquiries only |

Publishing is admin-only in v1. Enforce it in collection `access.update` by
checking whether `_status` is being changed to `published`, not just by hiding
the button.

## Audit

Payload versions give you who changed what and when, for free. Do not build a
separate audit log in v1. Do not disable versions to save database space.

## Listing requests

`listing-requests` and `enquiries` have `read: admin/agent only` and
`create: anyone`. They are never published — they have no public route at all.
