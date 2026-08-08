/**
 * Read layer for the projects and units slice (docs/03-projects-units.md).
 *
 * Same split as every other slice. The card surfaces — the unit table, the
 * company page's unit grid — read `listing_index` through `lib/listings.ts`
 * (rule 4). Single-entity renders read the collections through Payload, because
 * they need the localized, rich fields the view deliberately omits:
 * description, gallery, site plan, brochure, seo.
 *
 * Security: every fetch uses `overrideAccess: false` with no user, so Payload
 * applies `publishedOrStaff` — a draft slug returns nothing and the page 404s,
 * rather than us filtering `_status` by hand. Media and areas are resolved
 * afterwards, exposing only public fields.
 */
import { getPayload } from 'payload'
import config from '@/payload.config'
import type { Project, ProjectUnit, Company } from '@/payload-types'
import type { Locale } from '@/messages/sq'
import type { GalleryImage } from '@/lib/property-detail'
import { cacheLife } from 'next/cache'

const idOf = (rel: number | { id: number } | null | undefined): number | null => {
  if (rel === null || rel === undefined) return null
  return typeof rel === 'number' ? rel : rel.id
}

type PayloadClient = Awaited<ReturnType<typeof getPayload>>

/** Resolve a media relation to a public image, or null. */
const image = async (
  payload: PayloadClient,
  rel: number | { id: number } | null | undefined,
  fallbackAlt: string,
): Promise<GalleryImage | null> => {
  const id = idOf(rel)
  if (!id) return null
  const media = await payload.findByID({ collection: 'media', id, depth: 0, overrideAccess: true })
  if (!media?.url) return null
  return {
    url: media.url,
    alt: media.alt ?? fallbackAlt,
    width: media.width ?? null,
    height: media.height ?? null,
  }
}

const areaNameOf = async (
  payload: PayloadClient,
  rel: number | { id: number } | null | undefined,
): Promise<string | null> => {
  const id = idOf(rel)
  if (!id) return null
  const area = await payload.findByID({ collection: 'areas', id, depth: 0, overrideAccess: true })
  return area?.name ?? null
}

/* -------------------------------------------------------------------------- */
/* List                                                                       */
/* -------------------------------------------------------------------------- */

/** What a ProjectCard needs, and nothing more. */
export interface ProjectListItem {
  id: number // keys the batched unit-stats lookup; never rendered
  name: string
  slug: string
  tagline: string | null
  phase: Project['constructionPhase']
  completionDate: string | null
  areaName: string | null
  cover: GalleryImage | null
  developerName: string | null
  developerSlug: string | null
}

/** The cover photo is the first gallery image — the same rule the listing card
 *  follows, so a project and a property never disagree about which photo leads. */
const coverOf = async (
  payload: PayloadClient,
  project: Project,
): Promise<GalleryImage | null> => image(payload, project.gallery?.[0]?.image, project.name)

const toListItem = async (
  payload: PayloadClient,
  p: Project,
): Promise<ProjectListItem> => {
  let developerName: string | null = null
  let developerSlug: string | null = null
  const devId = idOf(p.developer)
  if (devId) {
    const dev = await payload.findByID({
      collection: 'companies',
      id: devId,
      depth: 0,
      overrideAccess: false, // an unpublished developer simply goes unnamed
    })
    developerName = dev?.name ?? null
    developerSlug = dev?.slug ?? null
  }

  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    tagline: p.tagline ?? null,
    phase: p.constructionPhase,
    completionDate: p.completionDate ?? null,
    areaName: await areaNameOf(payload, p.area),
    cover: await coverOf(payload, p),
    developerName,
    developerSlug,
  }
}

/**
 * Published projects for /[locale]/projekte.
 *
 * Ordered featured first, then newest — the same order the properties grid
 * uses, so "what the site is pushing" means one thing across the site. There is
 * no pagination: the client has a handful of projects, not 274, and a paginated
 * index of six cards is furniture with nothing to hold.
 */
export const getProjectList = async (locale: Locale): Promise<ProjectListItem[]> => {
  'use cache'
  cacheLife('content')
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'projects',
    locale,
    fallbackLocale: 'sq',
    sort: ['-featured', '-publishedAt'],
    depth: 0,
    limit: 200,
    overrideAccess: false,
  })

  const items: ProjectListItem[] = []
  for (const p of docs) items.push(await toListItem(payload, p))
  return items
}

/** Published project slugs — feeds generateStaticParams. */
export const getProjectSlugs = async (): Promise<string[]> => {
  'use cache'
  cacheLife('content')
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'projects',
    sort: 'slug',
    depth: 0,
    limit: 200,
    overrideAccess: false,
  })
  return docs.map((p) => p.slug)
}

/** A company's published projects as cards, for the company page (docs/04). */
export const getCompanyProjectCards = async (
  companyId: number,
  locale: Locale,
): Promise<{ active: ProjectListItem[]; completed: ProjectListItem[] }> => {
  'use cache'
  cacheLife('content')
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'projects',
    where: { developer: { equals: companyId } },
    locale,
    fallbackLocale: 'sq',
    sort: '-publishedAt',
    depth: 0,
    limit: 200,
    overrideAccess: false,
  })

  const active: ProjectListItem[] = []
  const completed: ProjectListItem[] = []
  for (const p of docs) {
    const item = await toListItem(payload, p)
    if (p.constructionPhase === 'completed') completed.push(item)
    else active.push(item)
  }
  return { active, completed }
}

/* -------------------------------------------------------------------------- */
/* Project detail                                                             */
/* -------------------------------------------------------------------------- */

/** The developer as the project page shows it: a card linking to the profile. */
export interface ProjectDeveloper {
  name: string
  slug: string
  logoUrl: string | null
  verifiedPartner: boolean
  phone: string | null
  email: string | null
}

export interface ProjectDetail {
  project: Project
  areaName: string | null
  developer: ProjectDeveloper | null
  images: GalleryImage[]
  sitePlan: GalleryImage | null
  brochureUrl: string | null
}

export const getProjectDetail = async (
  slug: string,
  locale: Locale,
): Promise<ProjectDetail | null> => {
  'use cache'
  cacheLife('content')
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'projects',
    where: { slug: { equals: slug } },
    locale,
    fallbackLocale: 'sq',
    depth: 0,
    limit: 1,
    overrideAccess: false, // anonymous: drafts excluded
  })

  const project = docs[0]
  if (!project) return null

  let developer: ProjectDeveloper | null = null
  const devId = idOf(project.developer)
  if (devId) {
    const dev: Company | null = await payload.findByID({
      collection: 'companies',
      id: devId,
      depth: 0,
      overrideAccess: false, // a draft developer yields no card, not a broken link
    })
    if (dev) {
      const logo = await image(payload, dev.logo, dev.name)
      developer = {
        name: dev.name,
        slug: dev.slug,
        logoUrl: logo?.url ?? null,
        verifiedPartner: Boolean(dev.verifiedPartner),
        phone: dev.phone ?? null,
        email: dev.email ?? null,
      }
    }
  }

  const images: GalleryImage[] = []
  for (const item of project.gallery ?? []) {
    const img = await image(payload, item.image, project.name)
    if (img) images.push(img)
  }

  const brochure = idOf(project.brochure)
  let brochureUrl: string | null = null
  if (brochure) {
    const media = await payload.findByID({
      collection: 'media',
      id: brochure,
      depth: 0,
      overrideAccess: true,
    })
    brochureUrl = media?.url ?? null
  }

  return {
    project,
    areaName: await areaNameOf(payload, project.area),
    developer,
    images,
    sitePlan: await image(payload, project.sitePlan, project.name),
    brochureUrl,
  }
}

/* -------------------------------------------------------------------------- */
/* Unit detail                                                                */
/* -------------------------------------------------------------------------- */

/**
 * A unit's own page. It inherits area, location and developer from its project
 * (docs/03), so the detail carries the parent alongside the unit rather than
 * duplicating those fields.
 */
export interface UnitDetail {
  unit: ProjectUnit
  project: Project
  areaName: string | null
  developer: ProjectDeveloper | null
  images: GalleryImage[]
  floorPlan: GalleryImage | null
}

/**
 * One unit, addressed the way the route addresses it: project slug *and* unit
 * slug. The project match is verified rather than assumed — slugs are unique per
 * collection, not globally, so /projekte/orbital-3/some-other-projects-unit must
 * 404 instead of rendering a unit under the wrong development.
 */
export const getUnitDetail = async (
  projectSlug: string,
  unitSlug: string,
  locale: Locale,
): Promise<UnitDetail | null> => {
  'use cache'
  cacheLife('content')
  const payload = await getPayload({ config })

  const parent = await getProjectDetail(projectSlug, locale)
  if (!parent) return null // draft or unknown project → the unit has no home

  const { docs } = await payload.find({
    collection: 'project-units',
    where: {
      and: [{ slug: { equals: unitSlug } }, { project: { equals: parent.project.id } }],
    },
    locale,
    fallbackLocale: 'sq',
    depth: 0,
    limit: 1,
    overrideAccess: false, // anonymous: drafts excluded
  })

  const unit = docs[0]
  if (!unit) return null

  const images: GalleryImage[] = []
  for (const item of unit.gallery ?? []) {
    const img = await image(payload, item.image, unit.title)
    if (img) images.push(img)
  }

  return {
    unit,
    project: parent.project,
    areaName: parent.areaName,
    developer: parent.developer,
    images,
    floorPlan: await image(payload, unit.floorPlan, unit.title),
  }
}
