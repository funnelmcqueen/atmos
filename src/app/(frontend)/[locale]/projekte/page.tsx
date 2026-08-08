import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getProjectList } from '@/lib/projects'
import { getProjectUnitStats } from '@/lib/listings'
import { isLocale, t, DEFAULT_LOCALE, LOCALES, type Locale } from '@/messages/sq'
import { buildAlternates, breadcrumbLd, localeUrl } from '@/lib/seo'
import { ProjectCard } from '@/components/ProjectCard'
import { JsonLd } from '@/components/JsonLd'

const PATH = '/projekte'

// Prebuilt and served from cache. Unlike /prona this index takes no filters and
// no query params, so there is exactly one version of it per locale. The
// revalidate window lives on the `content` cache profile in the read functions
// (see next.config.ts). docs/09 also wants revalidateTag on publish — that
// lands with the approval-workflow slice.

// Without this the dynamic [locale] segment leaves the route server-rendered on
// demand for want of knowing which locales exist. The list is fixed and short.
export async function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const loc: Locale = isLocale(locale) ? locale : DEFAULT_LOCALE

  return {
    title: t.projects.metaTitle,
    description: t.projects.metaDescription,
    alternates: buildAlternates(loc, PATH),
  }
}

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  const projects = await getProjectList(locale)
  // One batched aggregate for the whole grid rather than a query per card.
  const stats = await getProjectUnitStats(projects.map((p) => p.id))

  const breadcrumb = breadcrumbLd([
    { name: t.brand, url: localeUrl(locale, '') },
    { name: t.nav.projects, url: localeUrl(locale, PATH) },
  ])

  return (
    <main className="container">
      <JsonLd data={breadcrumb} />

      <div className="page-head">
        <p className="page-head__eyebrow">{t.nav.projects}</p>
        <h1 className="page-head__title">{t.projects.title}</h1>
        <p className="page-head__count">
          {projects.length}{' '}
          {projects.length === 1 ? t.projects.resultsOne : t.projects.resultsMany}
        </p>
      </div>

      {projects.length === 0 ? (
        <p className="empty">{t.projects.empty}</p>
      ) : (
        <div className="grid">
          {projects.map((project) => (
            <ProjectCard
              key={project.slug}
              project={project}
              stats={stats.get(project.id) ?? null}
              locale={locale}
            />
          ))}
        </div>
      )}
    </main>
  )
}
