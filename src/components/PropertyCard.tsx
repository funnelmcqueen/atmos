import Link from 'next/link'
import Image from 'next/image'
import type { ListingCard, CardThumb } from '@/lib/listings'
import type { Locale } from '@/messages/sq'
import { PROPERTY_TYPE_LABELS, t } from '@/messages/sq'
import { formatPrice, formatArea, pricePerSqm } from '@/lib/format'
import { StatusBadge } from './StatusBadge'
import { Badge } from './Badge'

/**
 * One listing on a grid. Reused by the /prona list, similar-properties, and
 * the company page — so it takes a `listing_index` row (via ListingCard) and
 * nothing route-specific.
 *
 * The view has no title column (title is localized), so the heading is composed
 * from structured columns: "Apartament 2+1 në Astir", or "Truall / Tokë në
 * Golem" for land, which has no rooms.
 *
 * `href` overrides the link target; default is /[locale]/prona/[slug], which is
 * right for a standalone property. A unit's page lives under its project, so
 * callers rendering units pass `listingHref(card, locale)`. Passing `null`
 * renders the card unlinked — still supported for surfaces that have no
 * destination, though nothing needs it now that units have a route.
 *
 * `thumbnail` is the listing's cover photo (the first gallery image). When
 * absent the media area falls back to a token-styled placeholder, so cards work
 * whether or not a listing has photos.
 *
 * `variant="compact"` is the same card with the status/verified/mortgage badge
 * row dropped — the map popup wants photo, price, rooms and area only, without
 * forking a second card component.
 */
export function PropertyCard({
  card,
  locale,
  href,
  thumbnail,
  variant = 'default',
}: {
  card: ListingCard
  locale: Locale
  href?: string | null
  thumbnail?: CardThumb | null
  variant?: 'default' | 'compact'
}) {
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

  // Guarded helper: null for rent, price-on-request or missing inputs, so a
  // rental never shows a nonsensical €/m² (docs/12-design.md). Never render the
  // view's raw price_per_sqm here — it is computed for rent rows too.
  const psqm = pricePerSqm(card.priceEur, card.areaGross, card.listingType, card.priceOnRequest)

  const location = [card.street, card.areaName].filter(Boolean).join(', ')

  const target = href === undefined ? `/${locale}/prona/${card.slug}` : href

  const inner = (
    <>
      <div className="card__media" aria-hidden="true">
        {thumbnail ? (
          <Image
            src={thumbnail.url}
            alt=""
            fill
            sizes="(max-width: 700px) 100vw, 300px"
            className="card__img"
          />
        ) : (
          // A marked placeholder, not a bare grey box — an empty media area must
          // not read as a broken image (docs/12-design.md).
          <span className="card__placeholder">{t.card.noPhoto}</span>
        )}
        <span className="card__type">{typeLabel}</span>
      </div>
      <div className="card__body">
        {variant !== 'compact' && (
          <div className="card__badges">
            <StatusBadge status={card.status} />
            {card.verified && <Badge>{t.badge.verified}</Badge>}
            {card.mortgageEligible && <Badge tone="accent">{t.badge.mortgage}</Badge>}
          </div>
        )}

        <h3 className="card__title">{heading}</h3>
        {location && <p className="card__location">{location}</p>}

        <div className="card__price-row">
          <span className="card__price">{priceText}</span>
          {psqm && <span className="card__psqm">{psqm}</span>}
        </div>

        <p className="card__meta">
          {formatArea(card.areaGross)}
          {card.floor !== null ? ` · ${t.detail.specs.floor} ${card.floor}` : ''}
        </p>
      </div>
    </>
  )

  return (
    <article className="card">
      {target === null ? (
        <div className="card__link">{inner}</div>
      ) : (
        <Link href={target} className="card__link">
          {inner}
        </Link>
      )}
    </article>
  )
}
