import { t } from '@/messages/sq'

/**
 * Mobile-only sticky contact bar for the detail page — Call and WhatsApp at
 * thumb height, always visible while scrolling. Albanian property contact
 * happens on the phone, and this bar is where the leads come from
 * (docs/12-design.md); on desktop it is hidden and `AgentCard` in the aside
 * carries the same actions. Built from the agent's public phone only, never the
 * owner's. Renders nothing when there is no phone to act on.
 *
 * WhatsApp is the primary action (accent); Call is secondary — the accent stays
 * on the price and the single primary action, nothing else.
 */
export function ContactBar({ phone }: { phone: string | null }) {
  if (!phone) return null
  const digits = phone.replace(/[^\d]/g, '')
  const tel = phone.replace(/\s/g, '')

  return (
    <div className="contact-bar" role="group" aria-label={t.detail.contactBarLabel}>
      <a className="btn contact-bar__action" href={`tel:${tel}`}>
        {t.detail.call}
      </a>
      {digits && (
        <a
          className="btn btn--primary contact-bar__action"
          href={`https://wa.me/${digits}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t.detail.enquiryWhatsapp}
        </a>
      )}
    </div>
  )
}
