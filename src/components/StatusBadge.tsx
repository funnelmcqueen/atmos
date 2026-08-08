import { STATUS_LABELS } from '@/messages/sq'

/**
 * Market status pill — only for sold and reserved. A badge is the exception,
 * not decoration (docs/12-design.md): "available" is the default state and earns
 * nothing, so a green pill does not ride on nearly every card. Sold and reserved
 * stay visible because their scarcity is what sells (docs/02). Renders nothing
 * for any other status, so an all-clear card carries no status pill.
 */
export function StatusBadge({ status }: { status: string }) {
  if (status !== 'sold' && status !== 'reserved') return null
  return (
    <span className={`status-badge status-badge--${status}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  )
}
