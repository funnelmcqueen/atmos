'use client'

import dynamic from 'next/dynamic'
import type { Locale } from '@/messages/sq'

/**
 * Client mount point for the property map. It exists only to load `MapView` with
 * `next/dynamic(ssr:false)`: MapLibre touches `window` at import time and must
 * never run on the server or sit in the main bundle (CLAUDE.md performance rule,
 * docs/06). A server component (the /prona page) can render this directly; the
 * `ssr:false` boundary has to live inside a client component, which is this file.
 */
const MapView = dynamic(() => import('./MapView'), {
  ssr: false,
  loading: () => <div className="property-map property-map--loading" aria-hidden="true" />,
})

export function PropertyMap(props: {
  locale: Locale
  filterQuery: string
  initialCenter: [number, number] | null
  initialZoom: number | null
}) {
  return <MapView {...props} />
}
