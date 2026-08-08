/**
 * A labelled definition list. Null/empty values are dropped; if nothing is
 * left the whole block renders nothing — that is what keeps land listings from
 * showing an empty layout block (docs/02).
 */
export interface Spec {
  label: string
  value: string | number | null | undefined
}

export function PropertySpecs({ heading, items }: { heading?: string; items: Spec[] }) {
  const rows = items.filter(
    (s) => s.value !== null && s.value !== undefined && String(s.value).trim() !== '',
  )
  if (rows.length === 0) return null

  return (
    <div className="specs">
      {heading && <h3 className="specs__heading">{heading}</h3>}
      <dl className="specs__list">
        {rows.map((s) => (
          <div className="specs__row" key={s.label}>
            <dt className="specs__label">{s.label}</dt>
            <dd className="specs__value">{s.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
