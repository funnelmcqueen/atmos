import type { Locale } from '@/messages/sq'
import { PROPERTY_TYPE_LABELS, LISTING_TYPE_LABELS, STATUS_LABELS, t } from '@/messages/sq'
import type { ListingFacets } from '@/lib/listings'
import {
  paramName,
  SORT_KEYS,
  LAND_TYPE,
  type FilterValues,
  type SortKey,
} from '@/lib/search-params'

/**
 * The search filter panel: a plain `<form method="get">`, so all state lives in
 * the URL and there is no client JS or React state (docs/06-search-map.md). Each
 * control's `name` is the locale's param name, so submitting the form produces
 * exactly the shareable URLs `parseSearchParams` reads back.
 *
 * Property type comes first: it decides which other filters make sense. When
 * land is the active type, rooms is dropped from the panel — a land listing has
 * none, and offering the filter looks broken. Because there is no JS, that
 * choice is applied on submit (server re-render), not live as the select
 * changes; the same "no React state" rule is what makes the URL the single
 * source of truth.
 *
 * Reset is a link to the bare path, not a button — the cleanest possible URL.
 */

const SORT_LABELS: Record<SortKey, string> = {
  newest: t.filters.sortOptions.newest,
  'price-asc': t.filters.sortOptions.priceAsc,
  'price-desc': t.filters.sortOptions.priceDesc,
  'per-sqm': t.filters.sortOptions.perSqm,
}

export function FilterPanel({
  locale,
  values,
  facets,
}: {
  locale: Locale
  values: FilterValues
  facets: ListingFacets
}) {
  const name = (field: Parameters<typeof paramName>[1]) => paramName(locale, field)
  const isLand = values.propertyType === LAND_TYPE

  return (
    <form className="filters" method="get" action={`/${locale}/prona`} role="search">
      <h2 className="filters__heading">{t.filters.heading}</h2>

      <div className="filters__grid">
        {/* Property type first — it changes which other filters make sense. */}
        <label className="filters__field">
          <span className="filters__label">{t.filters.propertyType}</span>
          <select className="filters__control" name={name('propertyType')} defaultValue={values.propertyType ?? ''}>
            <option value="">{t.filters.all}</option>
            {Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label className="filters__field">
          <span className="filters__label">{t.filters.area}</span>
          <select className="filters__control" name={name('area')} defaultValue={values.area ?? ''}>
            <option value="">{t.filters.all}</option>
            {facets.areas.map((a) => (
              <option key={a.slug} value={a.slug}>
                {a.name}
              </option>
            ))}
          </select>
        </label>

        <label className="filters__field">
          <span className="filters__label">{t.filters.listingType}</span>
          <select className="filters__control" name={name('listingType')} defaultValue={values.listingType ?? ''}>
            <option value="">{t.filters.all}</option>
            {Object.entries(LISTING_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <fieldset className="filters__field filters__field--range">
          <legend className="filters__label">{t.filters.price}</legend>
          <div className="filters__range">
            <input
              className="filters__control"
              type="number"
              min={0}
              inputMode="numeric"
              name={name('priceMin')}
              defaultValue={values.priceMin ?? ''}
              aria-label={`${t.filters.price} — ${t.filters.min}`}
              placeholder={t.filters.min}
            />
            <input
              className="filters__control"
              type="number"
              min={0}
              inputMode="numeric"
              name={name('priceMax')}
              defaultValue={values.priceMax ?? ''}
              aria-label={`${t.filters.price} — ${t.filters.max}`}
              placeholder={t.filters.max}
            />
          </div>
        </fieldset>

        <fieldset className="filters__field filters__field--range">
          <legend className="filters__label">{t.filters.size}</legend>
          <div className="filters__range">
            <input
              className="filters__control"
              type="number"
              min={0}
              inputMode="numeric"
              name={name('areaMin')}
              defaultValue={values.areaMin ?? ''}
              aria-label={`${t.filters.size} — ${t.filters.min}`}
              placeholder={t.filters.min}
            />
            <input
              className="filters__control"
              type="number"
              min={0}
              inputMode="numeric"
              name={name('areaMax')}
              defaultValue={values.areaMax ?? ''}
              aria-label={`${t.filters.size} — ${t.filters.max}`}
              placeholder={t.filters.max}
            />
          </div>
        </fieldset>

        {/* Land has no rooms — drop the control entirely for it. */}
        {!isLand && (
          <label className="filters__field">
            <span className="filters__label">{t.filters.rooms}</span>
            <select className="filters__control" name={name('rooms')} defaultValue={values.rooms ?? ''}>
              <option value="">{t.filters.all}</option>
              {facets.rooms.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
        )}

        <label className="filters__field">
          <span className="filters__label">{t.filters.status}</span>
          <select className="filters__control" name={name('status')} defaultValue={values.status ?? ''}>
            <option value="">{t.filters.all}</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label className="filters__field">
          <span className="filters__label">{t.filters.sort}</span>
          <select className="filters__control" name={name('sort')} defaultValue={values.sort}>
            {SORT_KEYS.map((key) => (
              <option key={key} value={key}>
                {SORT_LABELS[key]}
              </option>
            ))}
          </select>
        </label>

        <label className="filters__field filters__field--check">
          <input type="checkbox" name={name('mortgage')} value="1" defaultChecked={values.mortgage} />
          <span className="filters__label">{t.filters.mortgage}</span>
        </label>
      </div>

      <div className="filters__actions">
        <button className="btn btn--primary" type="submit">
          {t.filters.apply}
        </button>
        <a className="btn filters__reset" href={`/${locale}/prona`}>
          {t.filters.reset}
        </a>
      </div>
    </form>
  )
}
