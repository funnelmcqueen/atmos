import { STATUS_LABELS } from '@/messages/sq'

/**
 * Market status pill. Reserved and sold listings stay visible (docs/02) —
 * the badge is how a searcher learns the state, so it is never hidden.
 * Colours come from the --status-* tokens.
 */
export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`status-badge status-badge--${status}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  )
}
