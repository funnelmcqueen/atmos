/**
 * Single-property fetch for the detail page.
 *
 * Rule 4 (docs/01) keeps search, filters, the map and cards on `listing_index`.
 * A single entity render is none of those — it needs the rich, localized fields
 * the view omits (description, features, gallery, seo), so it reads the
 * `properties` collection through Payload.
 *
 * Security: the property is fetched with `overrideAccess: false` and no user.
 * That makes Payload apply `publishedOrStaff` (a draft slug returns nothing →
 * the page 404s) and field-level access (ownerName / ownerPhone / internalNotes
 * are stripped, not hand-omitted — docs/02). Relations are then loaded
 * explicitly at depth 0, exposing only the public fields the page renders, so
 * the Users collection's private read rule is never a factor.
 */
import { getPayload } from 'payload'
import config from '@/payload.config'
import type { Property } from '@/payload-types'
import type { Locale } from '@/messages/sq'
import { cacheLife } from 'next/cache'

export interface PublicAgent {
  name: string
  phone: string | null
}

export interface GalleryImage {
  url: string
  alt: string
  width: number | null
  height: number | null
}

export interface PropertyDetail {
  property: Property
  areaName: string | null
  areaSlug: string | null
  agent: PublicAgent | null
  images: GalleryImage[]
}

const idOf = (rel: number | { id: number } | null | undefined): number | null => {
  if (rel === null || rel === undefined) return null
  return typeof rel === 'number' ? rel : rel.id
}

export const getPropertyDetail = async (
  slug: string,
  locale: Locale,
): Promise<PropertyDetail | null> => {
  'use cache'
  cacheLife('content')
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'properties',
    where: { slug: { equals: slug } },
    locale,
    fallbackLocale: 'sq',
    depth: 0,
    limit: 1,
    overrideAccess: false, // anonymous: drafts excluded, owner fields stripped
  })

  const property = docs[0]
  if (!property) return null

  // Area — public name and slug only.
  let areaName: string | null = null
  let areaSlug: string | null = null
  const areaId = idOf(property.area)
  if (areaId) {
    const area = await payload.findByID({
      collection: 'areas',
      id: areaId,
      depth: 0,
      overrideAccess: true,
    })
    areaName = area?.name ?? null
    areaSlug = area?.slug ?? null
  }

  // Listing agent — professional contact is public on the listing.
  let agent: PublicAgent | null = null
  const agentId = idOf(property.agent)
  if (agentId) {
    const user = await payload.findByID({
      collection: 'users',
      id: agentId,
      depth: 0,
      overrideAccess: true,
    })
    if (user) agent = { name: user.name, phone: user.phone ?? null }
  }

  // Gallery — resolve each media to a public URL. Empty in the seed today.
  const images: GalleryImage[] = []
  for (const item of property.gallery ?? []) {
    const mediaId = idOf(item.image)
    if (!mediaId) continue
    const media = await payload.findByID({
      collection: 'media',
      id: mediaId,
      depth: 0,
      overrideAccess: true,
    })
    if (media?.url) {
      images.push({
        url: media.url,
        alt: media.alt ?? property.title,
        width: media.width ?? null,
        height: media.height ?? null,
      })
    }
  }

  return { property, areaName, areaSlug, agent, images }
}
