import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { getUnitDetail } from '@/lib/projects'
import { getUnitRoutes } from '@/lib/listings'
import {
  isLocale,
  t,
  DEFAULT_LOCALE,
  BUILDING_PHASE_LABELS,
  type Locale,
} from '@/messages/sq'
import { formatPrice, formatArea, pricePerSqm, formatDate } from '@/lib/format'
import { buildAlternates, breadcrumbLd, unitListingLd, localeUrl } from '@/lib/seo'
import { PropertyGallery } from '@/components/PropertyGallery'
import { PropertySpecs } from '@/components/PropertySpecs'
import { FeatureGrid } from '@/components/FeatureGrid'
import { LocationPanel } from '@/components/LocationPanel'
import { ContactBar } from '@/components/ContactBar'
import { StatusBadge } from '@/components/StatusBadge'
import { Badge } from '@/components/Badge'
import { JsonLd } from '@/components/JsonLd'

// Prebuilt sq unit pages, served from cache; the revalidate window lives on the
// `content` cache profile in the read functions (see next.config.ts).

export async function generateStaticParams() {
  const routes = await getUnitRoutes()
  return routes.map((r) => ({ locale: DEFAULT_LOCALE, slug: r.project, unit: r.unit }))
}

type RouteParams = { locale: string; slug: string; unit: string }

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>
}): Promise<Metadata> {
  const { locale, slug, unit } = await params
  const loc: Locale = isLocale(locale) ? locale : DEFAULT_LOCALE
  const detail = await getUnitDetail(slug, unit, loc)
  if (!detail) return {}

  const { unit: u, project, areaName } = detail
  const title = u.seo?.metaTitle || `${u.title} — ${project.name}`
  const description =
    u.seo?.metaDescription ||
    `${u.unitCode ? `${u.unitCode}, ` : ''}${project.name}${areaName ? `, ${areaName}` : ''}. ${formatArea(u.areaGross)}${
      u.priceOnRequest || typeof u.price !== 'number' || !u.currency
        ? `. ${t.card.priceOnRequest}`
        : `, ${formatPrice(u.price, u.currency)}`
    }.`

  return {
    title,
    description,
    alternates: buildAlternates(loc, `/projekte/${slug}/${unit}`),
    robots: u.seo?.noindex ? { index: false, follow: true } : undefined,
  }
}

export default async function UnitDetailPage({ params }: { params: Promise<RouteParams> }) {
  const { locale, slug, unit } = await params
  if (!isLocale(locale)) notFound()

  const detail = await getUnitDetail(slug, unit, locale)
  // Draft unit, unknown slug, or a unit that belongs to a different project
  // than the URL claims — all 404 rather than render something misleading.
  if (!detail) notFound()

  const { unit: u, project, areaName, developer, images, floorPlan } = detail

  const price =
    u.priceOnRequest || typeof u.price !== 'number' || !u.currency
      ? t.card.priceOnRequest
      : formatPrice(u.price, u.currency)
  const psqm = pricePerSqm(u.priceEur, u.areaGross, u.listingType, u.priceOnRequest)

  const url = localeUrl(locale, `/projekte/${slug}/${unit}`)
  const projectUrl = localeUrl(locale, `/projekte/${slug}`)

  const breadcrumb = breadcrumbLd([
    { name: t.brand, url: localeUrl(locale, '') },
    { name: t.nav.projects, url: localeUrl(locale, '/projekte') },
    { name: project.name, url: projectUrl },
    { name: u.title, url },
  ])

  return (
    <main className="container">
      <JsonLd data={breadcrumb} />
      <JsonLd data={unitListingLd(detail, url, projectUrl)} />

      <div className="detail">
        <div className="detail__main">
          <PropertyGallery images={images} title={u.title} />

          <header className="detail-head">
            <div className="detail-head__badges">
              <StatusBadge status={u.status} />
              {u.mortgageEligible && <Badge tone="accent">{t.badge.mortgage}</Badge>}
            </div>

            {/* The parent development, above the title: a unit is never read in
                isolation, and this is the way back to the table it came from. */}
            <p className="detail-head__parent">
              {t.project.partOf}{' '}
              <Link href={`/${locale}/projekte/${slug}`}>{project.name}</Link>
            </p>

            <h1 className="detail-head__title">{u.title}</h1>
            {areaName && <p className="detail-head__place">{areaName}</p>}

            <div className="detail-head__price-row">
              <span className="detail-head__price">{price}</span>
              {psqm && <span className="detail-head__psqm">{psqm}</span>}
            </div>

            {u.unitCode && (
              <p className="detail-head__reference">
                {t.unitTable.unit}: {u.unitCode}
                {u.building ? ` · ${t.unitTable.building} ${u.building}` : ''}
              </p>
            )}
          </header>

          {u.description && (
            <section className="detail__block prose">
              <h2 className="section__heading">{t.detail.description}</h2>
              <RichText data={u.description} />
            </section>
          )}

          <div className="detail__block">
            <PropertySpecs
              items={[
                { label: t.detail.specs.rooms, value: u.rooms },
                { label: t.detail.specs.bedrooms, value: u.bedrooms },
                { label: t.detail.specs.bathrooms, value: u.bathrooms },
                {
                  label: t.detail.specs.floor,
                  value: u.floor === 0 ? t.unitTable.groundFloor : u.floor,
                },
                {
                  label: t.detail.specs.orientation,
                  value: u.orientation?.length ? u.orientation.join(', ') : null,
                },
              ]}
            />
            <PropertySpecs
              items={[
                { label: t.detail.specs.areaGross, value: formatArea(u.areaGross) },
                {
                  label: t.detail.specs.areaNet,
                  value: u.areaNet ? formatArea(u.areaNet) : null,
                },
                {
                  label: t.detail.specs.terrace,
                  value: u.terraceSqm ? formatArea(u.terraceSqm) : null,
                },
                {
                  label: t.detail.specs.buildingPhase,
                  value: u.buildingPhase
                    ? BUILDING_PHASE_LABELS[u.buildingPhase] ?? u.buildingPhase
                    : null,
                },
              ]}
            />
          </div>

          {floorPlan && (
            <section className="detail__block">
              <h2 className="section__heading">{t.detail.specs.floor}</h2>
              <figure className="site-plan">
                <Image
                  src={floorPlan.url}
                  alt={`${u.title} — ${t.detail.specs.floor}`}
                  width={floorPlan.width ?? 1000}
                  height={floorPlan.height ?? 800}
                  sizes="(max-width: 900px) 100vw, 66vw"
                />
              </figure>
            </section>
          )}

          <div className="detail__block">
            <FeatureGrid features={u.features ?? []} />
          </div>

          <div className="detail__block">
            {/* A unit inherits its location from the project (docs/03) — there
                is no separate point to show, and inventing one would be a lie
                about where the building is. */}
            <LocationPanel
              areaName={areaName}
              street={null}
              location={project.location as [number, number] | null}
              tone="project"
            />
          </div>
        </div>

        <aside className="detail__aside">
          {/* Units have no listing agent — the developer is the counterparty
              (docs/03), so the contact block is the developer, not an AgentCard. */}
          {developer && (
            <div className="developer-card">
              <h2 className="section__heading">{t.project.developer}</h2>
              <Link className="developer-card__link" href={`/${locale}/kompani/${developer.slug}`}>
                <span
                  className="developer-card__logo"
                  aria-hidden={developer.logoUrl ? undefined : 'true'}
                >
                  {developer.logoUrl ? (
                    <Image src={developer.logoUrl} alt="" width={56} height={56} />
                  ) : (
                    <span className="company-head__monogram">{developer.name.charAt(0)}</span>
                  )}
                </span>
                <span className="developer-card__name">{developer.name}</span>
              </Link>
              <div className="agent__actions">
                {developer.email && (
                  <a
                    className="btn btn--primary"
                    href={`mailto:${developer.email}?subject=${encodeURIComponent(
                      `${u.title} (${u.unitCode ?? u.slug}) — ${project.name}`,
                    )}`}
                  >
                    {t.detail.enquiryForm}
                  </a>
                )}
                {developer.phone && (
                  <a className="btn" href={`tel:${developer.phone.replace(/\s/g, '')}`}>
                    {t.detail.enquiryCall}
                  </a>
                )}
              </div>
            </div>
          )}

          <div className="company-contact">
            <Link className="btn" href={`/${locale}/projekte/${slug}`}>
              {t.project.backToProject}
            </Link>
          </div>

          <p className="dates">
            {u.publishedAt && (
              <>
                {t.detail.published}: {formatDate(u.publishedAt, locale)}
                <br />
              </>
            )}
            {t.detail.updated}: {formatDate(u.updatedAt, locale)}
          </p>
        </aside>
      </div>

      <ContactBar phone={developer?.phone ?? null} />
    </main>
  )
}
