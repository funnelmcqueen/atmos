import { t } from '@/messages/sq'
import { PointMap } from './PointMap'
import type { MarkerTone } from './PointMapView'

/**
 * Location block: area, street, a single-marker map, and the coordinates.
 *
 * The facts are server-rendered text, not map chrome — they stay readable and
 * crawlable whether or not MapLibre loads, whether or not the MapTiler key is
 * configured, and in the seconds before the tiles arrive. The map is added to
 * that, never in place of it.
 *
 * Shared by the property page, the project page and the unit page, which is why
 * the heading and marker colour are props: a project's marker matches the
 * project colour in tokens.css, a listing's matches its listing type, exactly as
 * on the search map (docs/06).
 */
export function LocationPanel({
  areaName,
  street,
  location,
  heading = t.detail.location,
  tone = 'sale',
}: {
  areaName: string | null
  street: string | null
  location: [number, number] | null
  heading?: string
  tone?: MarkerTone
}) {
  const place = [street, areaName].filter(Boolean).join(', ')
  if (!place && !location) return null

  return (
    <section className="location">
      <h2 className="section__heading">{heading}</h2>
      {place && <p className="location__place">{place}</p>}
      {location && <PointMap location={location} label={place || heading} tone={tone} />}
      {location && (
        <p className="location__coords">
          {t.detail.coordinates}: {location[1].toFixed(5)}, {location[0].toFixed(5)}
        </p>
      )}
    </section>
  )
}
