'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { Locale } from '@/messages/sq'
import { t } from '@/messages/sq'
import { setMapState } from '@/lib/search-params'
import type { ListingCard, CardThumb } from '@/lib/listings'
import { PropertyCard } from './PropertyCard'

/**
 * The property map. A client-only MapLibre GL map over MapTiler vector tiles,
 * loaded via next/dynamic(ssr:false) from PropertyMap so MapLibre never reaches
 * the server render or the main bundle (docs/06-search-map.md).
 *
 * Data comes from /[locale]/prona/map as GeoJSON, refetched (debounced) on every
 * pan/zoom against the current viewport — PostGIS filters by bbox, the client
 * never holds listings outside the box. Markers are coloured by listing type
 * from tokens.css; points cluster below zoom 13; a marker click opens the shared
 * PropertyCard in a compact popup. Centre and zoom are written back to the URL
 * with replaceState, so a pan is shareable but never re-runs the server list.
 */

const DEFAULT_CENTER: [number, number] = [19.8187, 41.3275] // Tiranë
const DEFAULT_ZOOM = 12
const CLUSTER_MAX_ZOOM = 12 // cluster below zoom 13 (docs/06)
const FETCH_DEBOUNCE_MS = 300

type Selected = { card: ListingCard; thumbnail: CardThumb | null }

/** Marker properties come back from queried features JSON-stringified — parse
 *  back to the object the popup needs. */
const parseProp = <T,>(v: unknown): T => (typeof v === 'string' ? (JSON.parse(v) as T) : (v as T))

export default function MapView({
  locale,
  filterQuery,
  initialCenter,
  initialZoom,
}: {
  locale: Locale
  filterQuery: string
  initialCenter: [number, number] | null
  initialZoom: number | null
}) {
  const mapKey = process.env.NEXT_PUBLIC_MAPTILER_KEY
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Latest filter query, read inside stable map handlers without re-binding them.
  const filterQueryRef = useRef(filterQuery)
  useEffect(() => {
    filterQueryRef.current = filterQuery
  }, [filterQuery])

  // A stable DOM node MapLibre owns as popup content; React portals the card in.
  const popupNode = useMemo(
    () => (typeof document === 'undefined' ? null : document.createElement('div')),
    [],
  )

  const [selected, setSelected] = useState<Selected | null>(null)
  const [locating, setLocating] = useState(false)
  const [locError, setLocError] = useState(false)

  useEffect(() => {
    if (!mapKey || !containerRef.current || !popupNode) return

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${mapKey}`,
      center: initialCenter ?? DEFAULT_CENTER,
      zoom: initialZoom ?? DEFAULT_ZOOM,
      attributionControl: { compact: true },
    })
    mapRef.current = map
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')

    const popup = new maplibregl.Popup({
      closeButton: true,
      closeOnClick: false,
      maxWidth: '300px',
      className: 'map-popup',
    })
    popup.setDOMContent(popupNode)
    popup.on('close', () => setSelected(null))

    // Every colour resolves from tokens.css via computed styles, so the markers
    // match the badge palette and follow the active theme (CLAUDE.md rule 8).
    const css = getComputedStyle(containerRef.current)
    const token = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback
    const colorSale = token('--type-sale', '#d1aa63')
    const colorRent = token('--type-rent', '#5f8eae')
    const colorCluster = token('--accent', '#c6a46d')
    const colorClusterInk = token('--accent-ink', '#211f1a')
    const colorStroke = token('--surface', '#ffffff')

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const fetchInBounds = async () => {
      const b = map.getBounds()
      const bbox = [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()].join(',')
      const qs = filterQueryRef.current
      try {
        const res = await fetch(`/${locale}/prona/map?${qs ? `${qs}&` : ''}bbox=${bbox}`)
        if (!res.ok) return
        const data = await res.json()
        const src = map.getSource('listings') as maplibregl.GeoJSONSource | undefined
        src?.setData(data)
      } catch {
        // Transient error (e.g. a pan aborted the previous fetch) — the next
        // moveend refetches, so there is nothing to recover here.
      }
    }

    const scheduleFetch = () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(fetchInBounds, FETCH_DEBOUNCE_MS)
    }

    // Centre/zoom → URL, preserving the active filter params. replaceState (not
    // a navigation) so panning never re-runs the server list or resets paging.
    const syncUrl = () => {
      const c = map.getCenter()
      const params = new URLSearchParams(window.location.search)
      setMapState(locale, params, { center: [c.lng, c.lat], zoom: map.getZoom() })
      window.history.replaceState(
        window.history.state,
        '',
        `${window.location.pathname}?${params.toString()}`,
      )
    }

    map.on('load', () => {
      map.addSource('listings', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
        cluster: true,
        clusterMaxZoom: CLUSTER_MAX_ZOOM,
        clusterRadius: 50,
      })

      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'listings',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': colorCluster,
          'circle-opacity': 0.92,
          'circle-radius': ['step', ['get', 'point_count'], 16, 10, 22, 50, 30],
          'circle-stroke-width': 2,
          'circle-stroke-color': colorStroke,
        },
      })
      map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'listings',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': ['get', 'point_count_abbreviated'],
          'text-font': ['Open Sans Bold', 'Noto Sans Bold', 'Arial Unicode MS Bold'],
          'text-size': 13,
        },
        paint: { 'text-color': colorClusterInk },
      })
      map.addLayer({
        id: 'points',
        type: 'circle',
        source: 'listings',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': [
            'match',
            ['get', 'listingType'],
            'sale',
            colorSale,
            'rent',
            colorRent,
            colorSale,
          ],
          'circle-radius': 8,
          'circle-stroke-width': 2,
          'circle-stroke-color': colorStroke,
        },
      })

      fetchInBounds()
    })

    map.on('moveend', () => {
      syncUrl()
      scheduleFetch()
    })

    // Cluster click → zoom to expansion level.
    map.on('click', 'clusters', (e: maplibregl.MapLayerMouseEvent) => {
      const feature = map.queryRenderedFeatures(e.point, { layers: ['clusters'] })[0]
      const clusterId = feature?.properties?.cluster_id
      const src = map.getSource('listings') as maplibregl.GeoJSONSource | undefined
      if (clusterId == null || !src || feature.geometry.type !== 'Point') return
      const center = feature.geometry.coordinates as [number, number]
      src.getClusterExpansionZoom(clusterId).then((zoom: number) => {
        map.easeTo({ center, zoom, duration: prefersReduced ? 0 : 400 })
      })
    })

    // Point click → compact PropertyCard popup.
    map.on('click', 'points', (e: maplibregl.MapLayerMouseEvent) => {
      const feature = e.features?.[0]
      if (!feature || feature.geometry.type !== 'Point') return
      const card = parseProp<ListingCard>(feature.properties?.card)
      const rawThumb = feature.properties?.thumbnail
      const thumbnail = rawThumb ? parseProp<CardThumb>(rawThumb) : null
      setSelected({ card, thumbnail })
      popup.setLngLat(feature.geometry.coordinates as [number, number]).addTo(map)
    })

    for (const layer of ['clusters', 'points'] as const) {
      map.on('mouseenter', layer, () => {
        map.getCanvas().style.cursor = 'pointer'
      })
      map.on('mouseleave', layer, () => {
        map.getCanvas().style.cursor = ''
      })
    }

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      popup.remove()
      map.remove()
      mapRef.current = null
    }
    // Init once. Filter changes are handled by the refetch effect below; initial
    // centre/zoom are read only at construction on purpose.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapKey, locale, popupNode])

  // When the active filters change (a form submit re-renders the page and passes
  // a new query), refetch the current viewport under them — without reinitialising
  // the map. No-ops on first mount: the source is added asynchronously on `load`,
  // where the initial fetch already runs.
  useEffect(() => {
    const map = mapRef.current
    const src = map?.getSource('listings') as maplibregl.GeoJSONSource | undefined
    if (!map || !src) return
    const b = map.getBounds()
    const bbox = [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()].join(',')
    const controller = new AbortController()
    fetch(`/${locale}/prona/map?${filterQuery ? `${filterQuery}&` : ''}bbox=${bbox}`, {
      signal: controller.signal,
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && src.setData(d))
      .catch(() => {})
    return () => controller.abort()
  }, [filterQuery, locale])

  const handleLocate = () => {
    const map = mapRef.current
    if (!map || !('geolocation' in navigator)) {
      setLocError(true)
      return
    }
    setLocError(false)
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false)
        map.flyTo({ center: [pos.coords.longitude, pos.coords.latitude], zoom: 14 })
      },
      () => {
        setLocating(false)
        setLocError(true)
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    )
  }

  if (!mapKey) {
    return (
      <div className="property-map property-map--error" role="status">
        {t.map.missingKey}
      </div>
    )
  }

  return (
    <div className="property-map">
      <div
        ref={containerRef}
        className="property-map__canvas"
        role="region"
        aria-label={t.map.regionLabel}
      />
      <button
        type="button"
        className="btn map-locate"
        onClick={handleLocate}
        disabled={locating}
      >
        {locating ? t.map.locating : t.map.useMyLocation}
      </button>
      {locError && (
        <p className="map-locate__error" role="alert">
          {t.map.locationError}
        </p>
      )}
      {popupNode &&
        selected &&
        createPortal(
          <div className="map-popup__card">
            <PropertyCard
              card={selected.card}
              locale={locale}
              thumbnail={selected.thumbnail}
              variant="compact"
            />
          </div>,
          popupNode,
        )}
    </div>
  )
}
