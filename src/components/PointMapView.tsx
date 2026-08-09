'use client'

import { useEffect, useRef } from 'react'
import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { t } from '@/messages/sq'

/**
 * A single-marker map for one entity's location — a property, a project, a
 * unit's parent development.
 *
 * Deliberately not a variant of `MapView`. That component is the search map:
 * it owns clustering, bbox refetching against /prona/map, URL sync on pan, and
 * a popup card. None of that applies to "here is where this building is", and
 * a flag-driven fork of it would carry all of it anyway. What the two do share
 * is the part worth sharing — the same MapTiler style, the same token-derived
 * marker colours, the same reduced-motion handling — so there is still one map
 * library and one visual language.
 *
 * Interaction is trimmed to match the job: scroll-zoom is off so a page scroll
 * on mobile never gets captured by the map, and there is no geolocation button
 * — the visitor is looking at a specific address, not searching an area.
 */

/** Close enough to read the street, wide enough to place the neighbourhood. */
const POINT_ZOOM = 15

export type MarkerTone = 'sale' | 'rent' | 'project'

const TONE_TOKENS: Record<MarkerTone, { name: string; fallback: string }> = {
  sale: { name: '--type-sale', fallback: '#536e93' },
  rent: { name: '--type-rent', fallback: '#396f64' },
  project: { name: '--type-project', fallback: '#7b5185' },
}

export default function PointMapView({
  location,
  label,
  tone = 'sale',
}: {
  location: [number, number]
  label: string
  tone?: MarkerTone
}) {
  const mapKey = process.env.NEXT_PUBLIC_MAPTILER_KEY
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!mapKey || !containerRef.current) return

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${mapKey}`,
      center: location,
      zoom: POINT_ZOOM,
      attributionControl: { compact: true },
      // A page-scroll on a phone must not be swallowed by the map. Zoom stays
      // available through the control and pinch.
      scrollZoom: false,
    })
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')

    // Colours resolve from tokens.css through computed styles, so the marker
    // matches the search map and follows the active theme (CLAUDE.md rule 8).
    const css = getComputedStyle(containerRef.current)
    const token = ({ name, fallback }: { name: string; fallback: string }) =>
      css.getPropertyValue(name).trim() || fallback

    const marker = new maplibregl.Marker({
      color: token(TONE_TOKENS[tone]),
    })
      .setLngLat(location)
      .addTo(map)

    marker.getElement().setAttribute('aria-label', label)

    return () => {
      marker.remove()
      map.remove()
    }
  }, [mapKey, location, label, tone])

  if (!mapKey) {
    return (
      <div className="point-map point-map--error" role="status">
        {t.map.missingKey}
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="point-map"
      role="region"
      aria-label={`${t.map.pointLabel} — ${label}`}
    />
  )
}
