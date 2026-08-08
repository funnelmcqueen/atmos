import Link from 'next/link'
import type { ListingCard } from '@/lib/listings'
import type { Locale } from '@/messages/sq'
import { PROPERTY_TYPE_LABELS, t } from '@/messages/sq'
import { formatPrice, formatArea, formatPerSqm } from '@/lib/format'
import { StatusBadge } from './StatusBadge'
import { Badge } from './Badge'

/**
 * One listing on a grid. Reused by the /prona list, similar-properties, and
 * later the map popup and company page — so it takes a `listing_index` row
 * (via ListingCard) and nothing route-specific.
 *
 * The view has no title column (title is localized), so the heading is composed
 * from structured columns: "Apartament 2+1 në Astir", or "Truall / Tokë në
 * Golem" for land, which has no rooms.
 */
export function PropertyCard({ card, locale }: { card: ListingCard; locale: Locale }) {
  const typeLabel = PROPERTY_TYPE_LABELS[card.propertyType] ?? card.propertyType
  const heading = [typeLabel, card.rooms, card.areaName ? `në ${card.areaName}` : null]
    .filter(Boolean)
    .join(' ')

  const rentSuffix =
    card.listingType === 'rent'
      ? card.rentPeriod === 'nightly'
        ? '/natë'
        : t.card.perMonth
      : ''

  const priceText =
    card.priceOnRequest || card.price === null || card.currency === null
      ? t.card.priceOnRequest
      : `${formatPrice(card.price, card.currency)}${rentSuffix}`

  const location = [card.street, card.areaName].filter(Boolean).join(', ')

  return (
    <article className="card">
      <Link href={`/${locale}/prona/${card.slug}`} className="card__link">
        <div className="card__media" aria-hidden="true">
          <span className="card__type">{typeLabel}</span>
        </div>
        <div className="card__body">
          <div className="card__badges">
            <StatusBadge status={card.status} />
            {card.verified && <Badge>{t.badge.verified}</Badge>}
            {card.mortgageEligible && <Badge tone="accent">{t.badge.mortgage}</Badge>}
          </div>

          <h3 className="card__title">{heading}</h3>
          {location && <p className="card__location">{location}</p>}

          <div className="card__price-row">
            <span className="card__price">{priceText}</span>
            {card.pricePerSqm !== null && (
              <span className="card__psqm">{formatPerSqm(card.pricePerSqm)}</span>
            )}
          </div>

          <p className="card__meta">
            {formatArea(card.areaGross)}
            {card.floor !== null ? ` · ${t.detail.specs.floor} ${card.floor}` : ''}
          </p>
        </div>
      </Link>
    </article>
  )
}
