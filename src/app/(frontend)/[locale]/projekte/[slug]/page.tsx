import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { getProjectDetail } from '@/lib/projects'
import { getProjectUnits, getProjectRooms } from '@/lib/listings'
import {
  isLocale,
  t,
  DEFAULT_LOCALE,
  PROJECT_PHASE_LABELS,
  type Locale,
} from '@/messages/sq'
import { parseUnitParams, DEFAULT_UNIT_SORT } from '@/lib/search-params'
import { formatDate } from '@/lib/format'
import { buildAlternates, breadcrumbLd, residenceLd, localeUrl } from '@/lib/seo'
import { PropertyGallery } from '@/components/PropertyGallery'
import { PropertySpecs } from '@/components/PropertySpecs'
import { LocationPanel } from '@/components/LocationPanel'
import { UnitTable } from '@/components/UnitTable'
import { Badge } from '@/components/Badge'
import { JsonLd } from '@/components/JsonLd'

/**
 * This route is server-rendered on demand, not prerendered — deliberately, and
 * unlike the unit pages beneath it, which are `generateStaticParams` + ISR.
 *
 * The unit table's sort and filter state lives in the query string (docs/06 —
 * no React state, a shareable URL). Reading `searchParams` opts a route out of
 * static generation in Next: not per-request, but wholesale, so adding
 * `generateStaticParams` and `revalidate` here would prerender nothing and only
 * document an intention the build ignores. `next build` reports the route as
 * `ƒ` either way; the difference is whether this file lies about it.
 *
 * That matches the line the rest of the site already draws: pure entity pages
 * (/prona/[slug], /kompani/[slug], and each unit) are static + ISR; pages
 * carrying URL-driven query state (/prona, and this one) are dynamic. The
 * crawlable long tail here is the unit pages, and those are prerendered.
 *
 * To make this static too, the table's state would have to leave the query
 * string — or the app would have to turn on `cacheComponents` so a Suspense
 * boundary could hold the dynamic part inside a static shell. Both are bigger
 * decisions than this slice.
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const loc: Locale = isLocale(locale) ? locale : DEFAULT_LOCALE
  const detail = await getProjectDetail(slug, loc)
  if (!detail) return {}

  const { project, areaName, developer } = detail
  const title =
    project.seo?.metaTitle || [project.name, areaName].filter(Boolean).join(' — ')
  const description =
    project.seo?.metaDescription ||
    project.tagline ||
    `${project.name}${areaName ? `, ${areaName}` : ''}. ${
      PROJECT_PHASE_LABELS[project.constructionPhase ?? ''] ?? ''
    }${developer ? ` — ${developer.name}` : ''}.`

  return {
    title,
    description,
    // The project page is one page whatever order its table is in — the same
    // units, the same copy. Unlike a search permutation it stays indexable
    // regardless of the query string, and the canonical below is always the
    // bare URL, so sorted variants consolidate onto it.
    alternates: buildAlternates(loc, `/projekte/${slug}`),
    robots: project.seo?.noindex ? { index: false, follow: true } : undefined,
  }
}

export default async function ProjectDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { locale, slug } = await params
  if (!isLocale(locale)) notFound()

  const detail = await getProjectDetail(slug, locale)
  if (!detail) notFound() // draft or unknown slug → 404 for anonymous

  const { project, areaName, developer, images, sitePlan, brochureUrl } = detail

  const unitFilters = parseUnitParams(locale, await searchParams)
  const basePath = `/${locale}/projekte/${slug}`
  const url = localeUrl(locale, `/projekte/${slug}`)

  const [units, allUnits, roomOptions] = await Promise.all([
    getProjectUnits(project.id, unitFilters),
    // The unfiltered set: structured data and the availability line describe the
    // development, not the visitor's current view of the table.
    getProjectUnits(project.id, { status: null, rooms: null, sort: DEFAULT_UNIT_SORT }),
    getProjectRooms(project.id),
  ])

  const available = allUnits.filter((u) => u.status === 'available').length
  const showBuilding = allUnits.some((u) => u.building)
  const phaseLabel =
    PROJECT_PHASE_LABELS[project.constructionPhase ?? ''] ?? project.constructionPhase

  const breadcrumb = breadcrumbLd([
    { name: t.brand, url: localeUrl(locale, '') },
    { name: t.nav.projects, url: localeUrl(locale, '/projekte') },
    { name: project.name, url },
  ])

  const residence = residenceLd(detail, allUnits, url, (unitSlug) =>
    localeUrl(locale, `/projekte/${slug}/${unitSlug}`),
  )

  return (
    <main className="container">
      <JsonLd data={breadcrumb} />
      <JsonLd data={residence} />

      <div className="detail">
        <div className="detail__main">
          <PropertyGallery images={images} title={project.name} />

          <header className="detail-head">
            <div className="detail-head__badges">
              <Badge>{phaseLabel}</Badge>
              {developer?.verifiedPartner && <Badge>{t.company.verifiedPartner}</Badge>}
            </div>
            {/* Project name is the h1, exactly as written — it is a proper name
                and is not localized (docs/03). */}
            <h1 className="detail-head__title">{project.name}</h1>
            {areaName && <p className="detail-head__place">{areaName}</p>}
            {project.tagline && <p className="detail-head__tagline">{project.tagline}</p>}
            <p className="detail-head__availability">
              {available > 0
                ? `${available} ${available === 1 ? t.project.unitsAvailableOne : t.project.unitsAvailable}`
                : allUnits.length > 0
                  ? t.project.unitsAllTaken
                  : ''}
            </p>
          </header>

          {project.description && (
            <section className="detail__block prose">
              <h2 className="section__heading">{t.detail.description}</h2>
              <RichText data={project.description} />
            </section>
          )}

          <div className="detail__block">
            <UnitTable
              units={units}
              values={unitFilters}
              roomOptions={roomOptions}
              locale={locale}
              basePath={basePath}
              showBuilding={showBuilding}
            />
          </div>

          {sitePlan && (
            <section className="detail__block">
              <h2 className="section__heading">{t.project.sitePlan}</h2>
              <figure className="site-plan">
                <Image
                  src={sitePlan.url}
                  alt={`${t.project.sitePlan} — ${project.name}`}
                  width={sitePlan.width ?? 1200}
                  height={sitePlan.height ?? 800}
                  sizes="(max-width: 900px) 100vw, 66vw"
                />
              </figure>
            </section>
          )}

          <div className="detail__block">
            <LocationPanel
              areaName={areaName}
              street={null}
              location={project.location as [number, number] | null}
              tone="project"
            />
          </div>
        </div>

        <aside className="detail__aside">
          {developer && (
            <div className="developer-card">
              <h2 className="section__heading">{t.project.developer}</h2>
              <Link className="developer-card__link" href={`/${locale}/kompani/${developer.slug}`}>
                <span className="developer-card__logo" aria-hidden={developer.logoUrl ? undefined : 'true'}>
                  {developer.logoUrl ? (
                    <Image src={developer.logoUrl} alt="" width={56} height={56} />
                  ) : (
                    <span className="company-head__monogram">{developer.name.charAt(0)}</span>
                  )}
                </span>
                <span className="developer-card__name">{developer.name}</span>
              </Link>
              {developer.verifiedPartner && <Badge>{t.company.verifiedPartner}</Badge>}
              <dl className="company-contact__list">
                {developer.phone && (
                  <div className="company-contact__row">
                    <dt>{t.company.phone}</dt>
                    <dd>
                      <a href={`tel:${developer.phone.replace(/\s/g, '')}`}>{developer.phone}</a>
                    </dd>
                  </div>
                )}
                {developer.email && (
                  <div className="company-contact__row">
                    <dt>{t.company.email}</dt>
                    <dd>
                      <a href={`mailto:${developer.email}`}>{developer.email}</a>
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          <div className="company-contact">
            <PropertySpecs
              items={[
                { label: t.project.phase, value: phaseLabel },
                {
                  label: t.project.completion,
                  value: project.completionDate
                    ? formatDate(project.completionDate, locale)
                    : null,
                },
                { label: t.filters.area, value: areaName },
              ]}
            />
            {brochureUrl && (
              <a
                className="btn btn--primary developer-card__brochure"
                href={brochureUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t.project.brochure}
              </a>
            )}
          </div>

          <p className="dates">
            {project.publishedAt && (
              <>
                {t.detail.published}: {formatDate(project.publishedAt, locale)}
                <br />
              </>
            )}
            {t.detail.updated}: {formatDate(project.updatedAt, locale)}
          </p>
        </aside>
      </div>
    </main>
  )
}
