import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import * as s from './styles'

/**
 * Sent to the agent who owns the listing the moment an enquiry lands.
 *
 * Written so the whole lead is legible in a phone's notification preview and
 * the first screenful: who, what they asked about, and their phone number. The
 * Albanian market runs on callbacks, so the number is the payload — the buttons
 * below are for when the agent is at a desk.
 */
export interface EnquiryNotificationProps {
  name: string
  phone: string
  email?: string | null
  message?: string | null
  sourceLabel: string
  sourceUrl: string
  adminUrl: string
  unassigned?: boolean
}

export function EnquiryNotification({
  name,
  phone,
  email,
  message,
  sourceLabel,
  sourceUrl,
  adminUrl,
  unassigned = false,
}: EnquiryNotificationProps) {
  return (
    <Html lang="sq">
      <Head />
      {/* The inbox preview line: name and number, because that is what decides
          whether this gets opened now or after lunch. */}
      <Preview>{`${name} · ${phone} · ${sourceLabel}`}</Preview>
      <Body style={s.body}>
        <Container style={s.container}>
          <Text style={s.eyebrow}>Kërkesë e re</Text>
          <Heading style={s.heading}>{name}</Heading>
          <Text style={{ ...s.value, marginTop: 6 }}>
            <Link href={`tel:${phone.replace(/\s/g, '')}`} style={{ color: s.colors.text }}>
              {phone}
            </Link>
            {email ? (
              <>
                {' · '}
                <Link href={`mailto:${email}`} style={{ color: s.colors.text }}>
                  {email}
                </Link>
              </>
            ) : null}
          </Text>

          {unassigned ? (
            <Text style={{ ...s.label, color: s.colors.accentInk }}>
              Kjo kërkesë nuk ka agjent të caktuar — po shkon te kutia e përbashkët.
            </Text>
          ) : null}

          <Hr style={s.hr} />

          <Text style={s.label}>Prona</Text>
          <Text style={s.value}>
            <Link href={sourceUrl} style={{ color: s.colors.text }}>
              {sourceLabel}
            </Link>
          </Text>

          {message ? (
            <Section>
              <Text style={s.label}>Mesazhi</Text>
              <Text style={s.messageBox}>{message}</Text>
            </Section>
          ) : null}

          <Section>
            <Link href={adminUrl} style={s.button}>
              Hap në panel
            </Link>
          </Section>

          <Hr style={s.hr} />
          <Text style={s.footnote}>
            Atmos — njoftim automatik. Mos u përgjigj këtij emaili; kontakto klientin
            drejtpërdrejt.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default EnquiryNotification
