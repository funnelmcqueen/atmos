'use client'

import dynamic from 'next/dynamic'
import type { MarkerTone } from './PointMapView'

/**
 * Client mount point for the single-marker map. Exists only to load
 * `PointMapView` with `next/dynamic(ssr:false)`: MapLibre touches `window` at
 * import time and must never run on the server or land in the main bundle
 * (CLAUDE.md performance rule, docs/06). The `ssr:false` boundary has to live
 * inside a client component, so a server page renders this and not the view.
 *
 * Same arrangement as PropertyMap → MapView.
 */
const PointMapView = dynamic(() => import('./PointMapView'), {
  ssr: false,
  loading: () => <div className="point-map point-map--loading" aria-hidden="true" />,
})

export function PointMap(props: {
  location: [number, number]
  label: string
  tone?: MarkerTone
}) {
  return <PointMapView {...props} />
}
