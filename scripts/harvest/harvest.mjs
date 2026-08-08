/**
 * duashpi.al listing-photo harvester — Atmos Real Estate site rebuild.
 *
 * NOT part of the app build. Standalone Node ESM (built-in fetch, stdlib only).
 * Run from the repo root:
 *
 *   node scripts/harvest/harvest.mjs            # page 1 only (default)
 *   node scripts/harvest/harvest.mjs --pages 1-10
 *   node scripts/harvest/harvest.mjs --page 3
 *
 * Scope is deliberately narrow: it only ever follows listing URLs collected
 * from THIS agency profile's paginated result pages. It never follows the
 * "related / similar listing" links on a detail page, so nothing outside the
 * profile is touched.
 *
 * Politeness: one request at a time, a fixed delay between every network call,
 * a real browser User-Agent, and robots.txt-respecting scope (the profile and
 * property paths are all under Allow: /). It stops hard on 403/429/503 — the
 * signatures of a block or rate limit — and writes whatever it has so far.
 */
import { mkdir, writeFile, readFile, access } from 'node:fs/promises'
import { createWriteStream } from 'node:fs'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const PHOTOS_DIR = path.join(HERE, 'photos')
const INVENTORY = path.join(HERE, 'inventory.json')

const PROFILE_URL =
  'https://duashpi.al/en/profile/67ab2195a81c38e6dd02b329/atmos-real-estate.html'
const PROPERTY_RE =
  /https:\/\/duashpi\.al\/en\/property\/[a-f0-9]+\/[^"'\s]+?\.html/gi
// A listing's own gallery originals live under a /main/ path segment, on either
// host the agency uses: crm-cdn.…digitaloceanspaces.com (CRM uploads) or
// cdn.duashpi.al/uploads/images/main (portal uploads). Related-listing images
// on a detail page are /thumbnail/ variants, so the /main/ segment scopes us to
// this listing. The per-listing "N images" count is cross-checked as a guard.
const GALLERY_RE =
  /https:\/\/[a-z0-9.-]+\/[^"'\s\\]*\/main\/[^"'\s\\]+?\.(?:jpg|jpeg|png|webp)/gi

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
const DELAY_MS = 1500 // between every network request
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/* --------------------------------- args --------------------------------- */

const argv = process.argv.slice(2)
const getArg = (name) => {
  const i = argv.indexOf(name)
  return i >= 0 ? argv[i + 1] : undefined
}
let pages = [1]
if (getArg('--pages')) {
  const [a, b] = getArg('--pages').split('-').map(Number)
  pages = []
  for (let p = a; p <= (b ?? a); p++) pages.push(p)
} else if (getArg('--page')) {
  pages = [Number(getArg('--page'))]
}

/* ------------------------------ networking ------------------------------ */

class Blocked extends Error {}

/** GET with a real UA. Throws Blocked on 403/429/503 so the run can stop. */
async function get(url, { asBuffer = false } = {}) {
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: asBuffer ? '*/*' : 'text/html,*/*' },
    redirect: 'follow',
  })
  if ([403, 429, 503].includes(res.status)) {
    throw new Blocked(`HTTP ${res.status} on ${url} — looks like a block or rate limit.`)
  }
  if (!res.ok) {
    const e = new Error(`HTTP ${res.status} on ${url}`)
    e.status = res.status
    throw e
  }
  return res
}

/* ------------------------------- parsing -------------------------------- */

const decode = (s) =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&euro;/g, '€')
    .replace(/&#0?39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&#x?[0-9a-f]+;/gi, ' ')
const stripTags = (s) => decode(s.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim()

function jsonLdBlocks(html) {
  const re = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi
  const out = []
  let m
  while ((m = re.exec(html))) {
    try {
      out.push(JSON.parse(m[1].trim()))
    } catch {
      /* ignore malformed block */
    }
  }
  return out
}

const slugFromUrl = (url) => {
  const m = url.match(/\/property\/([a-f0-9]+)\/([^/]+)\.html/i)
  return { id: m?.[1] ?? null, slug: (m?.[2] ?? 'listing').replace(/^-+|-+$/g, '') }
}

/** Pull one listing's metadata + gallery from its detail HTML. */
function parseListing(html, url) {
  const { id, slug } = slugFromUrl(url)
  const lds = jsonLdBlocks(html)
  const product = lds.find((j) => j?.['@type'] === 'Product') ?? {}
  const crumbs = lds.find((j) => j?.['@type'] === 'BreadcrumbList')
  const text = stripTags(html)

  // Header <h3> tagged with the map-marker icon holds the location line.
  const locM = html.match(/map-marker-icon[\s\S]*?<\/svg>([\s\S]*?)<\/h3>/i)
  const location = locM ? stripTags(locM[1]) : null

  const areaM = html.match(/([\d.,]+)\s*m\s*<sup>\s*2/i) || text.match(/([\d.,]+)\s*m2\b/i)
  const areaSqm = areaM ? Number(areaM[1].replace(/,/g, '')) : null

  const num = (re) => {
    const m = text.match(re)
    return m ? Number(m[1]) : null
  }
  // "rooms" = Albanian typology (e.g. 3+1+2), taken from the title.
  const roomsM = (product.name ?? '').match(/\b(\d\+\d(?:\+\d)?)\b/)
  const floorM = text.match(/\bFloor\s*[:\-]?\s*(\d{1,2})\b/i)

  // Type/category from the breadcrumb (second item), e.g. "House for sale".
  const cat = crumbs?.itemListElement?.[1]?.item?.name
  const category = cat ? stripTags(cat) : null
  const listingType = /rent/i.test(category ?? url) ? 'rent' : /sale/i.test(category ?? url) ? 'sale' : null

  const offers = product.offers ?? {}
  const price = typeof offers.price === 'number' && offers.price > 0 ? offers.price : null

  // Union the gallery /main/ images with the JSON-LD hero image (also a /main/
  // URL), deduped and order-stable.
  const heroFirst = typeof product.image === 'string' ? [product.image] : []
  const images = [...new Set([...heroFirst, ...(html.match(GALLERY_RE) || [])])]
  const reportedM = text.match(/\b(\d+)\s+images?\b/i)

  return {
    id,
    slug,
    url,
    title: product.name ? decode(product.name) : stripTags((html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1] ?? ''),
    price,
    currency: price ? offers.priceCurrency ?? null : null,
    area: areaSqm != null ? `${areaSqm} m2` : null,
    areaSqm,
    rooms: roomsM?.[1] ?? null,
    beds: num(/\b(\d+)\s+Beds?\b/i),
    baths: num(/\b(\d+)\s+Baths?\b/i),
    livingRooms: num(/\b(\d+)\s+Living rooms?\b/i),
    floor: floorM ? Number(floorM[1]) : null,
    type: category,
    listingType,
    location,
    reference: (text.match(/\bDSH-\d+\b/) || [])[0] ?? null,
    imageCountReported: reportedM ? Number(reportedM[1]) : null,
    imageUrls: images,
    images: [], // filled after download
  }
}

/* ------------------------------- download ------------------------------- */

const exists = (p) =>
  access(p)
    .then(() => true)
    .catch(() => false)

const safeName = (url) => {
  const base = decodeURIComponent(url.split('/').pop().split('?')[0])
  return base.replace(/[^\w.\-]+/g, '_').replace(/_{2,}/g, '_')
}

/** Download a listing's images sequentially into photos/<slug>/. */
async function downloadImages(listing) {
  if (listing.imageUrls.length === 0) return
  const dir = path.join(PHOTOS_DIR, listing.slug)
  await mkdir(dir, { recursive: true })
  for (const url of listing.imageUrls) {
    const file = path.join(dir, safeName(url))
    const rel = path.relative(HERE, file).split(path.sep).join('/')
    if (await exists(file)) {
      listing.images.push({ url, localPath: rel })
      continue
    }
    await sleep(DELAY_MS)
    const res = await get(url, { asBuffer: true })
    await pipeline(Readable.fromWeb(res.body), createWriteStream(file))
    listing.images.push({ url, localPath: rel })
    console.log(`      · ${path.basename(file)}`)
  }
}

/* --------------------------------- main --------------------------------- */

async function collectListingUrls(page) {
  const url = page === 1 ? PROFILE_URL : `${PROFILE_URL}?page=${page}`
  console.log(`\n▸ profile page ${page}`)
  await sleep(DELAY_MS)
  const res = await get(url)
  const html = await res.text()
  const urls = [...new Set((html.match(PROPERTY_RE) || []))]
  console.log(`  found ${urls.length} listing URLs`)
  return urls
}

async function loadInventory() {
  try {
    return JSON.parse(await readFile(INVENTORY, 'utf8'))
  } catch {
    return { source: PROFILE_URL, harvestedPages: [], listings: [] }
  }
}

async function main() {
  await mkdir(PHOTOS_DIR, { recursive: true })
  const inventory = await loadInventory()
  const seen = new Set(inventory.listings.map((l) => l.url))

  try {
    for (const page of pages) {
      const urls = await collectListingUrls(page)
      let n = 0
      for (const url of urls) {
        n++
        if (seen.has(url)) {
          console.log(`  [${n}/${urls.length}] skip (already harvested) ${url}`)
          continue
        }
        await sleep(DELAY_MS)
        const res = await get(url)
        const listing = parseListing(await res.text(), url)
        const flag =
          listing.imageCountReported != null &&
          listing.imageCountReported !== listing.imageUrls.length
            ? ` ⚠ reported ${listing.imageCountReported} images`
            : ''
        console.log(
          `  [${n}/${urls.length}] ${listing.slug} — ${listing.imageUrls.length} imgs${flag}`,
        )
        await downloadImages(listing)
        inventory.listings.push(listing)
        seen.add(url)
        await writeFile(INVENTORY, JSON.stringify(inventory, null, 2)) // checkpoint
      }
      if (!inventory.harvestedPages.includes(page)) inventory.harvestedPages.push(page)
      await writeFile(INVENTORY, JSON.stringify(inventory, null, 2))
    }
  } catch (err) {
    await writeFile(INVENTORY, JSON.stringify(inventory, null, 2))
    if (err instanceof Blocked) {
      console.error(`\n⛔ STOPPED — ${err.message}`)
      console.error('   Progress saved to inventory.json. Not retrying; tell the human.')
      process.exit(2)
    }
    throw err
  }

  const imgTotal = inventory.listings.reduce((s, l) => s + l.images.length, 0)
  console.log(
    `\n✓ done. ${inventory.listings.length} listings, ${imgTotal} photos. Pages: ${inventory.harvestedPages.join(', ')}`,
  )
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
