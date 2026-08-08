import { t } from '@/messages/sq'

/**
 * Location block: area, street and coordinates.
 *
 * docs/02 calls for "a map with a single marker". MapLibre is the chosen map
 * stack (docs/06) but is not installed, and this slice adds no dependencies —
 * so the interactive map lands with the map slice. Until then this renders the
 * same facts in an accessible, crawlable panel.
 */
export function LocationPanel({
  areaName,
  street,
  location,
}: {
  areaName: string | null
  street: string | null
  location: [number, number] | null
}) {
  const place = [street, areaName].filter(Boolean).join(', ')
  if (!place && !location) return null

  return (
    <section className="location">
      <h2 className="section__heading">{t.detail.location}</h2>
      {place && <p className="location__place">{place}</p>}
      {location && (
        <p className="location__coords">
          {t.detail.coordinates}: {location[1].toFixed(5)}, {location[0].toFixed(5)}
        </p>
      )}
      <div className="location__map-placeholder" aria-hidden="true" />
    </section>
  )
}
