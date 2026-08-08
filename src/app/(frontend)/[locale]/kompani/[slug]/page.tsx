import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { RichText } from '@payloadcms/richtext-lexical/react'
import {
  getCompanyProfile,
  getCompanyArticles,
  getCompanySlugs,
} from '@/lib/companies'
import { getCompanyProjectCards, type ProjectListItem } from '@/lib/projects'
import { getCompanyUnits, getProjectUnitStats, listingHref } from '@/lib/listings'
import { isLocale, t, DEFAULT_LOCALE, type Locale } from '@/messages/sq'
import { buildAlternates, breadcrumbLd, organizationLd, localeUrl } from '@/lib/seo'
import { PropertyCard } from '@/components/PropertyCard'
import { ProjectCard } from '@/components/ProjectCard'
import { Badge } from '@/components/Badge'
import { JsonLd } from '@/components/JsonLd'

// Prebuild sq profiles, then serve from cache and revalidate hourly (ISR).
// docs/09 also wants revalidateTag on publish — that hook lands with the
// approval-workflow slice; time-based revalidation covers this one.
export const revalidate = 3600

export async function generateStaticParams() {
  const slugs = await getCompanySlugs()
  return slugs.map((slug) => ({ locale: DEFAULT_LOCALE, slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const loc: Locale = isLocale(locale) ? locale : DEFAULT_LOCALE
  const profile = await getCompanyProfile(slug, loc)
  if (!profile) return {}

  const { company, areaNames } = profile
  const title = company.seo?.metaTitle || company.name
  const description =
    company.seo?.metaDescription ||
    `${company.name}${areaNames.length ? ` — ${areaNames.join(', ')}` : ''}. ${t.companies.metaDescription}`

  return {
    title,
    description,
    alternates: buildAlternates(loc, `/kompani/${slug}`),
    robots: company.seo?.noindex ? { index: false, follow: true } : undefined,
  }
}

/**
 * A company's projects, as the same ProjectCard the projects index uses — one
 * component, one file (docs/12). Replaces the inline, unlinked block this page
 * carried while units and projects had no routes of their own.
 */
function ProjectGrid({
  projects,
  stats,
  locale,
}: {
  projects: ProjectListItem[]
  stats: Map<number, import('@/lib/listings').ProjectUnitStats>
  locale: Locale
}) {
  return (
    <div className="grid">
      {projects.map((p) => (
        <ProjectCard key={p.slug} project={p} stats={stats.get(p.id) ?? null} locale={locale} />
      ))}
    </div>
  )
}

export default async function CompanyProfilePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  if (!isLocale(locale)) notFound()

  const profile = await getCompanyProfile(slug, locale)
  if (!profile) notFound() // draft or unknown slug → 404 for anonymous

  const { company, logoUrl, coverUrl, areaNames } = profile

  const [projects, units, articles] = await Promise.all([
    getCompanyProjectCards(company.id, locale),
    getCompanyUnits(company.id),
    getCompanyArticles(company.id, locale),
  ])

  // One batched aggregate across both project groups, so a card's "from" price
  // and available count come from the same read model as its unit table.
  const projectStats = await getProjectUnitStats(
    [...projects.active, ...projects.completed].map((p) => p.id),
  )

  const url = localeUrl(locale, `/kompani/${slug}`)
  const socials = (company.socials ?? []).map((s) => s.url).filter(Boolean)

  const breadcrumb = breadcrumbLd([
    { name: t.brand, url: localeUrl(locale, '') },
    { name: t.nav.companies, url: localeUrl(locale, '/kompani') },
    { name: company.name, url },
  ])
  const org = organizationLd({ name: company.name, url, logoUrl, sameAs: socials })

  return (
    <main className="container">
      <JsonLd data={breadcrumb} />
      <JsonLd data={org} />

      {coverUrl && (
        <div className="company-cover">
          <Image src={coverUrl} alt={company.name} width={1180} height={360} priority />
        </div>
      )}

      <header className="company-head">
        <div className="company-head__logo" aria-hidden={logoUrl ? undefined : 'true'}>
          {logoUrl ? (
            <Image src={logoUrl} alt={company.name} width={112} height={112} />
          ) : (
            <span className="company-head__monogram">{company.name.charAt(0)}</span>
          )}
        </div>
        <div className="company-head__intro">
          <div className="company-head__badges">
            {company.verifiedPartner && <Badge>{t.company.verifiedPartner}</Badge>}
          </div>
          {/* Company name is the h1, exactly as written, no suffix (docs/04). */}
          <h1 className="company-head__title">{company.name}</h1>
          {areaNames.length > 0 && (
            <p className="company-head__areas">{areaNames.join(', ')}</p>
          )}
        </div>
      </header>

      <div className="company-grid">
        <div className="company-grid__main">
          {company.about && (
            <section className="detail__block prose">
              <RichText data={company.about} />
            </section>
          )}

          <section className="detail__block">
            <h2 className="section__heading">{t.company.activeProjects}</h2>
            {projects.active.length > 0 ? (
              <ProjectGrid projects={projects.active} stats={projectStats} locale={locale} />
            ) : (
              <p className="empty">{t.company.noProjects}</p>
            )}
          </section>

          {projects.completed.length > 0 && (
            <section className="detail__block">
              <h2 className="section__heading">{t.company.completedProjects}</h2>
              <ProjectGrid projects={projects.completed} stats={projectStats} locale={locale} />
            </section>
          )}

          <section className="detail__block">
            <h2 className="section__heading">{t.company.units}</h2>
            {units.length > 0 ? (
              <div className="grid">
                {units.map((card) => (
                  // Units now have a detail route under their project, so each
                  // card links to it — /projekte/[project]/[unit].
                  <PropertyCard
                    key={card.slug}
                    card={card}
                    locale={locale}
                    href={listingHref(card, locale)}
                  />
                ))}
              </div>
            ) : (
              <p className="empty">{t.company.noUnits}</p>
            )}
          </section>

          {articles.length > 0 && (
            <section className="detail__block">
              <h2 className="section__heading">{t.company.articles}</h2>
              <ul className="article-list">
                {articles.map((a) => (
                  <li className="article-list__item" key={a.slug}>
                    <Link href={`/${locale}/artikuj/${a.slug}`}>{a.title}</Link>
                    {a.excerpt && <p className="article-list__excerpt">{a.excerpt}</p>}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="company-grid__aside">
          <div className="company-contact">
            <h2 className="section__heading">{t.company.contact}</h2>
            <dl className="company-contact__list">
              {company.foundedYear && (
                <div className="company-contact__row">
                  <dt>{t.company.founded}</dt>
                  <dd>{company.foundedYear}</dd>
                </div>
              )}
              {company.phone && (
                <div className="company-contact__row">
                  <dt>{t.company.phone}</dt>
                  <dd>
                    <a href={`tel:${company.phone}`}>{company.phone}</a>
                  </dd>
                </div>
              )}
              {company.email && (
                <div className="company-contact__row">
                  <dt>{t.company.email}</dt>
                  <dd>
                    <a href={`mailto:${company.email}`}>{company.email}</a>
                  </dd>
                </div>
              )}
              {company.website && (
                <div className="company-contact__row">
                  <dt>{t.company.website}</dt>
                  <dd>
                    <a href={company.website} target="_blank" rel="noopener noreferrer">
                      {company.website.replace(/^https?:\/\//, '')}
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {areaNames.length > 0 && (
            <div className="company-contact">
              <h2 className="section__heading">{t.company.areasOfOperation}</h2>
              <ul className="area-tags">
                {areaNames.map((name) => (
                  <li className="area-tags__item" key={name}>
                    {name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </main>
  )
}
