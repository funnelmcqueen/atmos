/**
 * Attach harvested duashpi.al photos to the seeded properties, so the design
 * can be judged against real listing imagery instead of placeholders.
 *
 *   pnpm exec tsx scripts/attach-photos.ts     # (or: node --import=tsx/esm ...)
 *
 * It does NOT import new listings. For each seeded property it uploads the
 * photos of ONE type-matched harvested listing into the media collection and
 * sets them as that property's gallery. Alt text is the property title + area.
 *
 * Pairing was chosen by property type first (apartment→apartment, villa→villa,
 * shop→shop), then the closest listing by typology/size. The seeded land plot
 * has no counterpart — page-1 inventory holds zero land listings — and it is
 * deliberately LEFT WITHOUT PHOTOS rather than deleted or mismatched. Land with
 * no photography is a real case in the client's inventory, and it is what
 * exercises the marked "no photo" placeholder (docs/12-design.md: a missing
 * photo must not look like a bug). The empty state is tested, not avoided.
 *
 * Run once after `pnpm seed`. Re-running re-uploads (leaving orphan media); if
 * you need a clean slate, re-seed first.
 */
import 'dotenv/config'
import path from 'node:path'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { getPayload } from 'payload'
import config from '../src/payload.config'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const HARVEST_DIR = path.join(HERE, 'harvest')

/** seeded property slug → harvested listing slug (type-matched). */
const PAIRING: { property: string; listing: string; note: string }[] = [
  { property: 'apartament-2-1-2-me-pamje-nga-liqeni', listing: 'for-sale-apartment-212-in-lake-view-3700-eurom2', note: 'apt 2+1+2 · 150 m² · lake view' },
  { property: 'apartament-1-1-ne-astir', listing: 'for-sale-apartment-11-astir', note: 'apt 1+1 · 50 m² · Astir' },
  { property: 'apartament-2-1-me-qira-rruga-e-barrikadave', listing: '21-apartment-for-rent-zogu-i-boulevard', note: 'apt 2+1 · rent · central' },
  { property: 'vile-me-pishine-swan-lake', listing: 'villa-for-sale-with-pool-swan-lake', note: 'villa + pool · Swan Lake' },
  { property: 'apartament-2-1-ne-ekspozita-building', listing: 'apartment-for-sale-21-ekspozita-building', note: 'apt 2+1 · 177 m² · same building' },
  { property: 'dyqan-ne-univers-city-80-m', listing: 'shop---business-premises-for-rent-in-astir', note: 'shop (only shop in inventory)' },
  { property: 'apartament-2-1-ne-kompleksin-aura', listing: 'for-sale-21-apartment-near-delijorgji', note: 'apt 2+1 · ~105 m²' },
]

/**
 * Seeded property with no type match in the harvest. Kept, and kept photo-less:
 * it is the fixture for the card's "no photo" placeholder.
 */
const NO_PHOTO_PROPERTY_SLUG = 'truall-per-ndertim-golem'

interface HarvestListing {
  slug: string
  title: string
  images: { url: string; localPath: string }[]
}

const idOf = (rel: number | { id: number } | null | undefined): number | null =>
  rel == null ? null : typeof rel === 'number' ? rel : rel.id

async function main() {
  const payload = await getPayload({ config })

  const inventory = JSON.parse(await readFile(path.join(HARVEST_DIR, 'inventory.json'), 'utf8'))
  const bySlug = new Map<string, HarvestListing>(
    inventory.listings.map((l: HarvestListing) => [l.slug, l]),
  )

  let attachedProps = 0
  let attachedPhotos = 0

  for (const pair of PAIRING) {
    const { docs } = await payload.find({
      collection: 'properties',
      where: { slug: { equals: pair.property } },
      depth: 0,
      limit: 1,
      overrideAccess: true,
    })
    const property = docs[0]
    if (!property) {
      console.warn(`⚠ seeded property not found: ${pair.property} — skipping`)
      continue
    }

    const listing = bySlug.get(pair.listing)
    if (!listing || listing.images.length === 0) {
      console.warn(`⚠ no harvested photos for ${pair.listing} — skipping ${pair.property}`)
      continue
    }

    // Alt text from the property's own title + area (docs asked for this).
    let areaName = ''
    const areaId = idOf(property.area)
    if (areaId) {
      const area = await payload.findByID({ collection: 'areas', id: areaId, depth: 0, overrideAccess: true })
      areaName = area?.name ?? ''
    }
    const alt = [property.title, areaName].filter(Boolean).join(' — ')

    console.log(`\n▸ ${property.title}`)
    console.log(`  ← ${pair.listing} (${pair.note}) — ${listing.images.length} photos`)

    const mediaIds: number[] = []
    for (const img of listing.images) {
      const filePath = path.join(HARVEST_DIR, img.localPath)
      const media = await payload.create({
        collection: 'media',
        data: { alt, credit: 'duashpi.al' },
        filePath,
        overrideAccess: true,
      })
      mediaIds.push(media.id as number)
      attachedPhotos++
    }

    await payload.update({
      collection: 'properties',
      id: property.id,
      data: {
        gallery: mediaIds.map((id) => ({ image: id })),
        _status: 'published', // keep it live so the gallery shows on the public page
      },
      overrideAccess: true,
    })
    attachedProps++
    console.log(`  ✓ gallery set (${mediaIds.length} photos), alt: "${alt}"`)
  }

  // The unmatchable land property stays, without a gallery — that is the point.
  // Confirm it is present and photo-less so the placeholder case is real data
  // rather than an assumption.
  const { docs: land } = await payload.find({
    collection: 'properties',
    where: { slug: { equals: NO_PHOTO_PROPERTY_SLUG } },
    depth: 0,
    limit: 1,
    overrideAccess: true,
  })
  if (land[0]) {
    const photos = land[0].gallery?.length ?? 0
    console.log(
      `\n📷 kept without photos: ${land[0].title} (gallery: ${photos})` +
        (photos > 0 ? '  ⚠ expected 0 — placeholder case will not render' : ''),
    )
  } else {
    console.log(`\n⚠ land property ${NO_PHOTO_PROPERTY_SLUG} not found — re-run pnpm seed`)
  }

  console.log(`\n✓ done. ${attachedProps} properties, ${attachedPhotos} photos attached.`)
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
