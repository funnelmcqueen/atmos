/**
 * Read layer for the companies slice (docs/04-companies.md).
 *
 * A company profile is a single-entity render — not search, the map or a card
 * grid — so it reads the `companies`, `projects` and `articles` collections
 * through Payload for their rich, localized fields, exactly as the property
 * detail page reads `properties`. The company's *units* are the one card
 * surface here, and those still come from `listing_index` via
 * `getCompanyUnits` (lib/listings.ts) so rule 4 holds.
 *
 * Security: every fetch uses `overrideAccess: false` with no user, so Payload
 * applies `publishedOrStaff` (a draft slug returns nothing → the page 404s) and
 * strips admin-only fields (legalName, nipt) rather than us hand-omitting them.
 * Media and areas are then resolved explicitly, exposing only public fields.
 */
import { getPayload } from 'payload'
import config from '@/payload.config'
import type { Company, Project } from '@/payload-types'
import type { Locale } from '@/messages/sq'

const idOf = (rel: number | { id: number } | null | undefined): number | null => {
  if (rel === null || rel === undefined) return null
  return typeof rel === 'number' ? rel : rel.id
}

/** Resolve a media relation to its public URL, or null. */
const mediaUrl = async (
  payload: Awaited<ReturnType<typeof getPayload>>,
  rel: Company['logo'],
): Promise<string | null> => {
  const id = idOf(rel)
  if (!id) return null
  const media = await payload.findByID({ collection: 'media', id, depth: 0, overrideAccess: true })
  return media?.url ?? null
}

/** Resolve an area-relationship list to public area names, order preserved. */
const areaNames = async (
  payload: Awaited<ReturnType<typeof getPayload>>,
  rels: (number | { id: number })[] | null | undefined,
): Promise<string[]> => {
  const names: string[] = []
  for (const rel of rels ?? []) {
    const id = idOf(rel)
    if (!id) continue
    const area = await payload.findByID({ collection: 'areas', id, depth: 0, overrideAccess: true })
    if (area?.name) names.push(area.name)
  }
  return names
}

/* -------------------------------------------------------------------------- */
/* List                                                                       */
/* -------------------------------------------------------------------------- */

export interface CompanyListItem {
  name: string
  slug: string
  logoUrl: string | null
  verifiedPartner: boolean
  areaNames: string[]
}

/** Published companies for the /kompani index, alphabetical by name. */
export const getCompanyList = async (): Promise<CompanyListItem[]> => {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'companies',
    sort: 'name',
    depth: 0,
    limit: 200,
    overrideAccess: false,
  })

  const items: CompanyListItem[] = []
  for (const c of docs) {
    items.push({
      name: c.name,
      slug: c.slug,
      logoUrl: await mediaUrl(payload, c.logo),
      verifiedPartner: Boolean(c.verifiedPartner),
      areaNames: await areaNames(payload, c.areasOfOperation),
    })
  }
  return items
}

/** Published company slugs — feeds generateStaticParams. */
export const getCompanySlugs = async (): Promise<string[]> => {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'companies',
    sort: 'slug',
    depth: 0,
    limit: 200,
    overrideAccess: false,
  })
  return docs.map((c) => c.slug)
}

/* -------------------------------------------------------------------------- */
/* Profile                                                                    */
/* -------------------------------------------------------------------------- */

export interface CompanyProfile {
  company: Company
  logoUrl: string | null
  coverUrl: string | null
  areaNames: string[]
}

export const getCompanyProfile = async (
  slug: string,
  locale: Locale,
): Promise<CompanyProfile | null> => {
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'companies',
    where: { slug: { equals: slug } },
    locale,
    fallbackLocale: 'sq',
    depth: 0,
    limit: 1,
    overrideAccess: false, // anonymous: drafts excluded, admin fields stripped
  })

  const company = docs[0]
  if (!company) return null

  return {
    company,
    logoUrl: await mediaUrl(payload, company.logo),
    coverUrl: await mediaUrl(payload, company.coverImage),
    areaNames: await areaNames(payload, company.areasOfOperation),
  }
}

/* -------------------------------------------------------------------------- */
/* Projects                                                                   */
/* -------------------------------------------------------------------------- */

export interface CompanyProject {
  name: string
  slug: string
  phase: Project['constructionPhase']
  completionDate: string | null
  areaName: string | null
  unitTypes: NonNullable<Project['unitTypesSummary']>
}

export interface CompanyProjects {
  active: CompanyProject[]
  completed: CompanyProject[]
}

/**
 * A company's published projects, split into active (planning / under
 * construction) and completed. Queried by developer relation — never a stored
 * list on the company (docs/04).
 */
export const getCompanyProjects = async (companyId: number): Promise<CompanyProjects> => {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'projects',
    where: { developer: { equals: companyId } },
    sort: '-publishedAt',
    depth: 0,
    limit: 200,
    overrideAccess: false,
  })

  const active: CompanyProject[] = []
  const completed: CompanyProject[] = []

  for (const p of docs) {
    const [areaName] = await areaNames(payload, p.area ? [p.area] : [])
    const project: CompanyProject = {
      name: p.name,
      slug: p.slug,
      phase: p.constructionPhase,
      completionDate: p.completionDate ?? null,
      areaName: areaName ?? null,
      unitTypes: p.unitTypesSummary ?? [],
    }
    if (p.constructionPhase === 'completed') completed.push(project)
    else active.push(project)
  }

  return { active, completed }
}

/* -------------------------------------------------------------------------- */
/* Articles                                                                   */
/* -------------------------------------------------------------------------- */

export interface CompanyArticle {
  title: string
  slug: string
  excerpt: string | null
  category: string
}

/** Published articles tagged to the company (docs/04). Empty in the seed. */
export const getCompanyArticles = async (
  companyId: number,
  locale: Locale,
): Promise<CompanyArticle[]> => {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'articles',
    where: { relatedCompanies: { contains: companyId } },
    locale,
    fallbackLocale: 'sq',
    sort: '-publishedAt',
    depth: 0,
    limit: 50,
    overrideAccess: false,
  })

  return docs.map((a) => ({
    title: a.title,
    slug: a.slug,
    excerpt: a.excerpt ?? null,
    category: a.category,
  }))
}
