import Link from 'next/link'
import type { ListingCard } from '@/lib/listings'
import { listingHref } from '@/lib/listings'
import type { Locale } from '@/messages/sq'
import { STATUS_LABELS, t } from '@/messages/sq'
import {
  unitParamName,
  toUnitParams,
  hasActiveUnitFilters,
  type UnitFilterValues,
  type UnitSortKey,
} from '@/lib/search-params'
import { formatPrice, formatArea, pricePerSqm } from '@/lib/format'
import { StatusBadge } from './StatusBadge'

/**
 * The unit table — the important part of a project page (docs/03).
 *
 * Floor, unit code, rooms, area, price, price per m², status. Sortable by floor
 * and price, filterable by status and rooms.
 *
 * **Sold units stay listed.** Filtering them out by default would be the
 * obvious thing and the wrong one: a table showing four of nineteen units reads
 * as a small project, while nineteen rows where fifteen say "Shitur" reads as a
 * development that is nearly gone. That visible scarcity is what makes the page
 * persuasive, and the client asked for it (docs/03 §32, docs/12). Sold rows are
 * muted and unlinked, not hidden.
 *
 * No client JS. Sorting is anchor links that rewrite the query string, filters
 * are a `<form method="get">` — the same discipline as the search filter panel,
 * so a sorted or filtered table is a shareable, server-rendered URL.
 */

const isSortedBy = (sort: UnitSortKey, column: 'floor' | 'price'): 'asc' | 'desc' | null => {
  if (sort === `${column}-asc`) return 'asc'
  if (sort === `${column}-desc`) return 'desc'
  return null
}

/** A sortable column header. Clicking it sorts ascending; clicking the active
 *  ascending column flips to descending. `aria-sort` carries the state to
 *  screen readers, which a styled arrow alone would not. */
function SortableHeader({
  label,
  column,
  values,
  locale,
  basePath,
}: {
  label: string
  column: 'floor' | 'price'
  values: UnitFilterValues
  locale: Locale
  basePath: string
}) {
  const direction = isSortedBy(values.sort, column)
  const next: UnitSortKey = direction === 'asc' ? `${column}-desc` : `${column}-asc`
  const query = toUnitParams(locale, values, { sort: next }).toString()

  return (
    <th
      scope="col"
      className="unit-table__th unit-table__th--sortable"
      aria-sort={direction === 'asc' ? 'ascending' : direction === 'desc' ? 'descending' : 'none'}
    >
      <Link
        className="unit-table__sort"
        href={query ? `${basePath}?${query}` : basePath}
        title={next.endsWith('asc') ? t.unitTable.sortAsc : t.unitTable.sortDesc}
      >
        {label}
        <span className="unit-table__arrow" aria-hidden="true">
          {direction === 'asc' ? '↑' : direction === 'desc' ? '↓' : '↕'}
        </span>
      </Link>
    </th>
  )
}

export function UnitTable({
  units,
  values,
  roomOptions,
  locale,
  basePath,
  showBuilding,
}: {
  units: ListingCard[]
  values: UnitFilterValues
  roomOptions: string[]
  locale: Locale
  /** Locale-prefixed project path — the form action and every sort link. */
  basePath: string
  /** Multi-building projects get a building column; single-building ones don't
   *  get a column of the same repeated letter. */
  showBuilding: boolean
}) {
  return (
    <section className="unit-table-block">
      <h2 className="section__heading">{t.project.units}</h2>

      <form className="unit-filters" method="get" action={basePath}>
        <label className="unit-filters__field">
          <span className="filters__label">{t.filters.status}</span>
          <select
            className="filters__control"
            name={unitParamName(locale, 'status')}
            defaultValue={values.status ?? ''}
          >
            <option value="">{t.unitTable.showAll}</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        {roomOptions.length > 1 && (
          <label className="unit-filters__field">
            <span className="filters__label">{t.unitTable.rooms}</span>
            <select
              className="filters__control"
              name={unitParamName(locale, 'rooms')}
              defaultValue={values.rooms ?? ''}
            >
              <option value="">{t.filters.all}</option>
              {roomOptions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
        )}

        {/* The active sort rides along as a hidden field, so applying a filter
            does not silently throw away the column the visitor sorted by. */}
        <input type="hidden" name={unitParamName(locale, 'sort')} value={values.sort} />

        <button className="btn btn--primary unit-filters__submit" type="submit">
          {t.filters.apply}
        </button>
        {hasActiveUnitFilters(values) && (
          <a className="btn filters__reset" href={basePath}>
            {t.filters.reset}
          </a>
        )}
      </form>

      {units.length === 0 ? (
        <p className="empty">{t.unitTable.empty}</p>
      ) : (
        <div className="unit-table__scroll">
          <table className="unit-table">
            <caption className="unit-table__caption">{t.unitTable.caption}</caption>
            <thead>
              <tr>
                <SortableHeader
                  label={t.unitTable.floor}
                  column="floor"
                  values={values}
                  locale={locale}
                  basePath={basePath}
                />
                <th scope="col" className="unit-table__th">
                  {t.unitTable.unit}
                </th>
                {showBuilding && (
                  <th scope="col" className="unit-table__th">
                    {t.unitTable.building}
                  </th>
                )}
                <th scope="col" className="unit-table__th">
                  {t.unitTable.rooms}
                </th>
                <th scope="col" className="unit-table__th unit-table__th--num">
                  {t.unitTable.area}
                </th>
                <SortableHeader
                  label={t.unitTable.price}
                  column="price"
                  values={values}
                  locale={locale}
                  basePath={basePath}
                />
                <th scope="col" className="unit-table__th unit-table__th--num">
                  {t.unitTable.perSqm}
                </th>
                <th scope="col" className="unit-table__th">
                  {t.unitTable.status}
                </th>
              </tr>
            </thead>
            <tbody>
              {units.map((u) => {
                const href = listingHref(u, locale)
                const psqm = pricePerSqm(u.priceEur, u.areaGross, u.listingType, u.priceOnRequest)
                const price =
                  u.priceOnRequest || u.price === null || u.currency === null
                    ? t.card.priceOnRequest
                    : formatPrice(u.price, u.currency)
                const label = u.unitCode ?? u.slug

                return (
                  <tr
                    key={u.slug}
                    className={`unit-table__row unit-table__row--${u.status}`}
                    data-status={u.status}
                  >
                    <td className="unit-table__cell">
                      {u.floor === null
                        ? '—'
                        : u.floor === 0
                          ? t.unitTable.groundFloor
                          : u.floor}
                    </td>
                    <th scope="row" className="unit-table__cell unit-table__cell--code">
                      {/* Sold units keep their row but lose the link — there is
                          nothing left to enquire about, and a dead-end click is
                          worse than plain text. */}
                      {href && u.status !== 'sold' ? (
                        <Link href={href}>{label}</Link>
                      ) : (
                        <span>{label}</span>
                      )}
                    </th>
                    {showBuilding && <td className="unit-table__cell">{u.building ?? '—'}</td>}
                    <td className="unit-table__cell">{u.rooms ?? '—'}</td>
                    <td className="unit-table__cell unit-table__cell--num">
                      {formatArea(u.areaGross)}
                    </td>
                    <td className="unit-table__cell unit-table__cell--price">{price}</td>
                    <td className="unit-table__cell unit-table__cell--num">{psqm ?? '—'}</td>
                    <td className="unit-table__cell">
                      {/* StatusBadge renders nothing for `available` — the
                          default state earns no pill (docs/12) — so the label
                          carries it instead and the column is never blank. */}
                      <StatusBadge status={u.status} />
                      {u.status === 'available' && (
                        <span className="unit-table__available">{STATUS_LABELS.available}</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
