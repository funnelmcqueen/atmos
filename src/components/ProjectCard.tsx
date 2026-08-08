import Link from 'next/link'
import Image from 'next/image'
import type { ProjectListItem } from '@/lib/projects'
import type { ProjectUnitStats } from '@/lib/listings'
import type { Locale } from '@/messages/sq'
import { PROJECT_PHASE_LABELS, t } from '@/messages/sq'
import { formatPrice, formatDate } from '@/lib/format'

/**
 * One project on a grid. Reused by the projects index and the company page, the
 * same way `PropertyCard` is reused everywhere a listing appears — one
 * component, one file (docs/12).
 *
 * It follows the listing card's rules rather than inventing its own: fixed 4:3
 * cover with a marked placeholder when there is no photo, the same information
 * in the same position every time, and the accent reserved for the price.
 *
 * The construction phase sits in the chip over the photo — the slot a listing
 * card gives the property type — because it is the equivalent fact: what kind
 * of thing this is, and whether a buyer can move in this year. It appears once.
 * Repeating it as a badge underneath would be decoration, and badges are the
 * exception, not decoration (docs/12).
 *
 * `stats` comes from `listing_index`, not from `unitTypesSummary`, so the "from"
 * price and available count can never contradict the unit table on the page the
 * card links to.
 */
export function ProjectCard({
  project,
  stats,
  locale,
}: {
  project: ProjectListItem
  stats?: ProjectUnitStats | null
  locale: Locale
}) {
  const phaseLabel = PROJECT_PHASE_LABELS[project.phase ?? ''] ?? project.phase
  const href = `/${locale}/projekte/${project.slug}`

  const meta = [
    project.areaName,
    project.completionDate
      ? `${t.project.completion} ${formatDate(project.completionDate, locale)}`
      : null,
  ]
    .filter(Boolean)
    .join(' · ')

  // Price is the loudest thing on the card, so it only appears when it is real:
  // an available unit with an actual asking price. A project whose units are all
  // sold or price-on-request says so instead of leaving a gap (docs/12).
  const priceText =
    stats && stats.available > 0 && stats.priceFromEur !== null
      ? `${t.project.priceFrom} ${formatPrice(stats.priceFromEur, 'EUR')}`
      : stats && stats.total > 0 && stats.available === 0
        ? t.project.unitsAllTaken
        : null

  const availability =
    stats && stats.available > 0
      ? `${stats.available} ${stats.available === 1 ? t.project.unitsAvailableOne : t.project.unitsAvailable}`
      : null

  return (
    <article className="card project-card">
      <Link href={href} className="card__link">
        <div className="card__media" aria-hidden="true">
          {project.cover ? (
            <Image
              src={project.cover.url}
              alt=""
              fill
              sizes="(max-width: 700px) 100vw, 300px"
              className="card__img"
            />
          ) : (
            <span className="card__placeholder">{t.card.noPhoto}</span>
          )}
          <span className="card__type">{phaseLabel}</span>
        </div>

        <div className="card__body">
          <h3 className="card__title">{project.name}</h3>
          {meta && <p className="card__location">{meta}</p>}

          <div className="card__price-row">
            {priceText && <span className="card__price">{priceText}</span>}
            {availability && <span className="card__psqm">{availability}</span>}
          </div>

          {project.developerName && (
            <p className="card__meta">{project.developerName}</p>
          )}
        </div>
      </Link>
    </article>
  )
}
