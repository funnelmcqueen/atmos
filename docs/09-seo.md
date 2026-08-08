# SEO

The company profile pages and the property pages are the traffic. Treat SEO as a
build requirement, not a later pass.

## Per page

- One `<h1>`, containing the entity name
- Unique `<title>` and meta description per entity per locale, editable in the
  admin via a `seo` field group, with a sensible generated fallback
- Canonical to the current locale's absolute URL
- `hreflang` alternates for every locale plus `x-default` pointing at `sq`
- Open Graph image: the entity's cover image, 1200x630, generated with
  `next/og` when no image exists

## Structured data

| Page | Type |
| --- | --- |
| Property, unit | `RealEstateListing` |
| Project | `Residence` plus `Offer` per available unit |
| Company | `Organization` |
| Article | `Article` with author, datePublished, dateModified |
| Homepage FAQ | `FAQPage` |
| All pages | `BreadcrumbList` |

Emit as `application/ld+json` in the page's server component. Validate against
Google's Rich Results Test before shipping any of these.

## Sitemaps

Generated, not hand-written. One index at `/sitemap.xml` pointing at
`/sitemap-properties.xml`, `/sitemap-projects.xml`, `/sitemap-companies.xml`,
`/sitemap-articles.xml`, each with per-locale entries and `lastmod` from
`updatedAt`. Only published documents.

## Rendering

Detail pages use `generateStaticParams` plus ISR with a revalidate window, and
`revalidateTag` on publish. Search result pages are dynamic and carry
`noindex, follow` when any filter param is present — filtered permutations are a
crawl trap. Unfiltered category pages are indexable.

## Images

`next/image` everywhere, `alt` built from the entity title and area, real width
and height to avoid layout shift. Never ship a gallery image over 1600px wide.
