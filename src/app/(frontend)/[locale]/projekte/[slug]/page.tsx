import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { Suspense } from 'react'
import { getProjectDetail, getProjectSlugs } from '@/lib/projects'
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
import { EnquiryFormSlot, EnquiryFormFallback } from '@/components/EnquiryFormSlot'
import { ContactBar } from '@/components/ContactBar'
import { Badge } from '@/components/Badge'
import { JsonLd } from '@/components/JsonLd'

/**
 * A static shell with one dynamic hole.
 *
 * Everything that describes the development — gallery, heading, availability
 * count, description, site plan, map, developer, and both JSON-LD blocks — is
 * prerendered, because none of it depends on the request. The unit *table*
 * does: its sort and filter live in the query string (docs/06 — no React state,
 * a shareable URL), so it sits behind a <Suspense> boundary and streams in.
 *
 * `cacheComponents` is what makes that split possible. Without it, reading
 * `searchParams` anywhere in a route opts the whole route out of static
 * generation, which is why this page was previously `ƒ` in the route table.
 * Now the shell is prerendered and only the table is deferred.
 *
 * Two consequences worth keeping in mind when editing this file:
 *
 * 1. The Residence + Offer structured data is built from the UNFILTERED unit
 *    set in the shell, not from whatever the table is currently showing. A
 *    crawler must see the whole development, and a page sorted by price must
 *    not emit different markup than the same page unsorted.
 * 2. Anything moved out of the Suspense boundary must not touch `searchParams`,
 *    and anything moved in should still be cheap — it is what the visitor waits
 *    for after the shell paints.
 */

export async function generateStaticParams() {
  const slugs = await getProjectSlugs()
  return slugs.map((slug) => ({ locale: DEFAULT_LOCALE, slug }))
}

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

/**
 * The dynamic hole: the unit table under the visitor's current sort and filter.
 *
 * It takes the `searchParams` promise rather than the resolved object, so the
 * shell above never awaits it and stays prerenderable — awaiting it here, past
 * the Suspense boundary, is what confines the dynamic part to this subtree.
 */
async function FilteredUnitTable({
  locale,
  projectId,
  basePath,
  showBuilding,
  searchParams,
}: {
  locale: Locale
  projectId: number
  basePath: string
  showBuilding: boolean
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const values = parseUnitParams(locale, await searchParams)

  const [units, roomOptions] = await Promise.all([
    getProjectUnits(projectId, values),
    getProjectRooms(projectId),
  ])

  return (
    <UnitTable
      units={units}
      values={values}
      roomOptions={roomOptions}
      locale={locale}
      basePath={basePath}
      showBuilding={showBuilding}
    />
  )
}

/** Holds the table's height while it streams, so the shell does not reflow. */
function UnitTableFallback() {
  return (
    <section className="unit-table-block">
      <h2 className="section__heading">{t.project.units}</h2>
      <div className="unit-table__loading" aria-hidden="true" />
    </section>
  )
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

  const basePath = `/${locale}/projekte/${slug}`
  const url = localeUrl(locale, `/projekte/${slug}`)

  // The unfiltered set. Structured data and the availability line describe the
  // development, not the visitor's current view of the table — and being
  // request-independent is what keeps them in the prerendered shell.
  const allUnits = await getProjectUnits(project.id, {
    status: null,
    rooms: null,
    sort: DEFAULT_UNIT_SORT,
  })

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
            <Suspense fallback={<UnitTableFallback />}>
              <FilteredUnitTable
                locale={locale}
                projectId={project.id}
                basePath={basePath}
                showBuilding={showBuilding}
                searchParams={searchParams}
              />
            </Suspense>
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

          {/* Enquiries here route to the project's agent (docs/05). */}
          <div className="detail__block">
            <Suspense fallback={<EnquiryFormFallback />}>
              <EnquiryFormSlot sourceType="project" sourceId={project.id} locale={locale} />
            </Suspense>
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

      {/* The project page had no sticky bar before this slice — the developer's
          phone was desktop-aside only. Same three thumb-height options as a
          listing (docs/12). */}
      <ContactBar phone={developer?.phone ?? null} />
    </main>
  )
}
