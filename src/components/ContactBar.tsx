import { t } from '@/messages/sq'

/**
 * Mobile-only sticky contact bar for the detail page — always visible at thumb
 * height while scrolling. Albanian property contact happens on the phone, and
 * this bar is where the leads come from (docs/12-design.md); on desktop it is
 * hidden and the aside carries the same actions.
 *
 * Three options: call, WhatsApp, and the enquiry form. The form is an
 * *addition*, not a replacement — someone standing in a stairwell is going to
 * tap WhatsApp, and someone browsing at 1am wants to leave their number without
 * starting a conversation. Taking either away to make room would cost leads.
 *
 * WhatsApp keeps the accent as the single primary action. `formHref` is an
 * in-page anchor, so tapping it scrolls to the form rather than navigating —
 * the listing stays on screen.
 *
 * Built from the agent's public phone only, never the owner's. With no phone
 * the bar still renders for the form alone; with neither it renders nothing.
 */
export function ContactBar({
  phone,
  formHref = '#pyet',
}: {
  phone: string | null
  formHref?: string | null
}) {
  if (!phone && !formHref) return null

  const digits = phone ? phone.replace(/[^\d]/g, '') : null
  const tel = phone ? phone.replace(/\s/g, '') : null

  return (
    <div className="contact-bar" role="group" aria-label={t.detail.contactBarLabel}>
      {tel && (
        <a className="btn contact-bar__action" href={`tel:${tel}`}>
          {t.detail.call}
        </a>
      )}
      {formHref && (
        <a className="btn contact-bar__action" href={formHref}>
          {t.enquiry.contactBar}
        </a>
      )}
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
