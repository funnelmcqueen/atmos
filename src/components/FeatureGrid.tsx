import { FEATURE_LABELS, t } from '@/messages/sq'

/** Feature facets with Albanian labels. Renders nothing when there are none. */
export function FeatureGrid({ features }: { features: string[] }) {
  if (features.length === 0) return null

  return (
    <section className="features">
      <h2 className="section__heading">{t.detail.features}</h2>
      <ul className="features__grid">
        {features.map((f) => (
          <li className="features__item" key={f}>
            {FEATURE_LABELS[f] ?? f}
          </li>
        ))}
      </ul>
    </section>
  )
}
