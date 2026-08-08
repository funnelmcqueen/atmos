import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  PayloadRequest,
} from 'payload'

/**
 * Keeps `projects.unitTypesSummary` in step with the project's published units.
 *
 * `Projects.ts` denormalizes this on purpose (docs/03): a project card shows
 * "1+1 · nga €96 000" wherever it appears — the projects index, the company
 * page, later the homepage — and none of those surfaces should aggregate units
 * on every render. Denormalized data is only worth having if something keeps it
 * true, which is this hook.
 *
 * ## Everything here runs inside the caller's transaction
 *
 * Every read and write passes `req`. That is not tidiness, it is the difference
 * between working and hanging. An afterChange/afterDelete hook runs inside the
 * operation's transaction, which already holds locks on the unit row and a
 * key-share lock on its parent project. A read or write issued on a *separate*
 * connection — a raw `payload.db.pool` query, or a Local API call without `req`
 * — waits on those locks while the transaction waits on the hook. Neither side
 * moves, and the first thing anyone sees is Postgres killing the connection
 * with `25P03 idle-in-transaction timeout` several minutes later.
 *
 * The same constraint is why the aggregate is a Local API `find` rather than
 * the SQL aggregate over `listing_index` the read layer uses elsewhere: a raw
 * pool query cannot see this transaction's uncommitted rows, so publishing a
 * unit would recompute the summary from the state *before* the publish and
 * write back a number that is already stale. `_status: 'published'` as an
 * explicit filter buys the same "only published units count" semantics the view
 * gives, from inside the transaction.
 */

interface SummaryRow {
  rooms: string | null
  areaFrom: number | null
  areaTo: number | null
  priceFrom: number | null
  availableCount: number | null
}

/** A project cannot plausibly hold more units than this, and an unbounded read
 *  inside a transaction is not something to leave to chance. */
const MAX_UNITS = 500

const minOf = (values: number[]): number | null => (values.length ? Math.min(...values) : null)
const maxOf = (values: number[]): number | null => (values.length ? Math.max(...values) : null)

/**
 * One row per room type among the project's published units: the area range,
 * the cheapest asking price, and how many are still available.
 *
 * `priceFrom` and `availableCount` count only available units — a card that
 * says "nga €96 000" when the €96 000 unit sold last month is worse than no
 * card. The area range spans every published unit, sold included, because it
 * describes the building, not the inventory. Rows are ordered by smallest area,
 * so a card reads 1+1 before 3+1.
 */
const buildSummary = async (req: PayloadRequest, projectId: number): Promise<SummaryRow[]> => {
  const { docs } = await req.payload.find({
    collection: 'project-units',
    where: {
      and: [{ project: { equals: projectId } }, { _status: { equals: 'published' } }],
    },
    depth: 0,
    limit: MAX_UNITS,
    pagination: false,
    overrideAccess: true,
    req,
  })

  const byRooms = new Map<string, typeof docs>()
  for (const unit of docs) {
    const key = unit.rooms ?? ''
    const bucket = byRooms.get(key)
    if (bucket) bucket.push(unit)
    else byRooms.set(key, [unit])
  }

  const rows: SummaryRow[] = []
  for (const [rooms, units] of byRooms) {
    const areas = units.map((u) => u.areaGross).filter((n): n is number => typeof n === 'number')
    const available = units.filter((u) => u.status === 'available')
    const prices = available
      .filter((u) => !u.priceOnRequest)
      .map((u) => u.priceEur)
      .filter((n): n is number => typeof n === 'number')

    rows.push({
      rooms: rooms === '' ? null : rooms,
      areaFrom: minOf(areas),
      areaTo: maxOf(areas),
      priceFrom: minOf(prices),
      availableCount: available.length,
    })
  }

  rows.sort((a, b) => (a.areaFrom ?? Infinity) - (b.areaFrom ?? Infinity))
  return rows
}

/**
 * Field-by-field compare. The stored array is the Payload array-field shape —
 * every property optional, plus an `id` per row — so a deep-equal against the
 * freshly built rows never matches and would rewrite the project on every save.
 */
const sameSummary = (
  stored: Partial<SummaryRow>[] | null | undefined,
  next: SummaryRow[],
): boolean => {
  const current = stored ?? []
  if (current.length !== next.length) return false
  return current.every((row, i) => {
    const n = next[i]
    return (
      (row.rooms ?? null) === n.rooms &&
      (row.areaFrom ?? null) === n.areaFrom &&
      (row.areaTo ?? null) === n.areaTo &&
      (row.priceFrom ?? null) === n.priceFrom &&
      (row.availableCount ?? null) === n.availableCount
    )
  })
}

/**
 * Recompute one project's summary and write it back if it moved.
 *
 * The write carries only `unitTypesSummary` and targets the published row, so
 * an editor's in-progress draft of the project is untouched — a unit selling
 * must never promote unrelated draft copy to live. Skipping the write when
 * nothing changed is what keeps this off the hot path: units autosave every
 * 800ms, and editing a published unit's description would otherwise rewrite the
 * parent project on every keystroke.
 */
export const recalcProjectUnitTypes = async (
  req: PayloadRequest,
  projectId: number,
): Promise<void> => {
  const next = await buildSummary(req, projectId)

  const project = await req.payload.findByID({
    collection: 'projects',
    id: projectId,
    depth: 0,
    overrideAccess: true,
    // A unit whose project was deleted in the same operation has nothing to
    // update; `disableErrors` turns that into null instead of a thrown 404.
    disableErrors: true,
    req,
  })
  if (!project) return
  if (sameSummary(project.unitTypesSummary, next)) return

  await req.payload.update({
    collection: 'projects',
    id: projectId,
    data: { unitTypesSummary: next },
    overrideAccess: true,
    req,
  })
}

const projectIdOf = (rel: unknown): number | null => {
  if (typeof rel === 'number') return rel
  if (rel && typeof rel === 'object' && 'id' in rel) return Number((rel as { id: number }).id)
  return null
}

export const recalcUnitTypesAfterChange: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  req,
}) => {
  // Draft → draft cannot move a published aggregate. Skips autosave churn on a
  // unit that has never been published.
  if (doc?._status !== 'published' && previousDoc?._status !== 'published') return doc

  // Reassigning a unit to another project changes two summaries, not one.
  const ids = new Set(
    [projectIdOf(doc?.project), projectIdOf(previousDoc?.project)].filter(
      (id): id is number => id !== null,
    ),
  )
  for (const id of ids) await recalcProjectUnitTypes(req, id)

  return doc
}

export const recalcUnitTypesAfterDelete: CollectionAfterDeleteHook = async ({ doc, req }) => {
  const id = projectIdOf(doc?.project)
  if (id !== null) await recalcProjectUnitTypes(req, id)
  return doc
}
