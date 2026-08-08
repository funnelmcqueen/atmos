import type { PublicAgent } from '@/lib/property-detail'
import { t } from '@/messages/sq'

/** Site contact for enquiries until the Enquiries slice adds a real form. */
const CONTACT_EMAIL = 'info@atmos.al'

/**
 * Listing agent plus enquiry actions. WhatsApp and call are built from the
 * agent's public phone; "send enquiry" opens a prefilled mailto carrying the
 * reference (the Enquiries collection wires the real form later). Only the
 * agent's professional name and phone are shown — never owner contact.
 */
export function AgentCard({
  agent,
  reference,
  title,
}: {
  agent: PublicAgent | null
  reference: string | null
  title: string
}) {
  const digits = agent?.phone ? agent.phone.replace(/[^\d]/g, '') : null
  const subject = reference ? `${title} (${reference})` : title

  return (
    <aside className="agent">
      <h2 className="section__heading">{t.detail.agent}</h2>
      {agent && <p className="agent__name">{agent.name}</p>}
      {agent?.phone && <p className="agent__phone">{agent.phone}</p>}

      <div className="agent__actions">
        <a className="btn btn--primary" href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`}>
          {t.detail.enquiryForm}
        </a>
        {digits && (
          <a
            className="btn"
            href={`https://wa.me/${digits}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t.detail.enquiryWhatsapp}
          </a>
        )}
        {agent?.phone && (
          <a className="btn" href={`tel:${agent.phone.replace(/\s/g, '')}`}>
            {t.detail.enquiryCall}
          </a>
        )}
      </div>
    </aside>
  )
}
