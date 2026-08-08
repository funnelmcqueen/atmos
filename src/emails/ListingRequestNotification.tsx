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
 * Sent to the shared inbox when an owner submits a property through
 * /[locale]/dergo-pronen.
 *
 * Unlike an enquiry this has no assigned agent yet — verification is the
 * product (docs/05), and someone picks it up from the queue. So the email leads
 * with what a person needs to decide whether to call: where it is, what it is,
 * and what they are asking for it.
 */
export interface ListingRequestNotificationProps {
  ownerName: string
  ownerPhone: string
  ownerEmail?: string | null
  city: string
  areaName?: string | null
  listingTypeLabel: string
  propertyType?: string | null
  rooms?: string | null
  areaSqm?: number | null
  askingPrice?: string | null
  photoCount: number
  hasDocumentation: boolean
  description?: string | null
  adminUrl: string
}

export function ListingRequestNotification({
  ownerName,
  ownerPhone,
  ownerEmail,
  city,
  areaName,
  listingTypeLabel,
  propertyType,
  rooms,
  areaSqm,
  askingPrice,
  photoCount,
  hasDocumentation,
  description,
  adminUrl,
}: ListingRequestNotificationProps) {
  const place = [areaName, city].filter(Boolean).join(', ')
  const spec = [propertyType, rooms, areaSqm ? `${areaSqm} m²` : null]
    .filter(Boolean)
    .join(' · ')

  return (
    <Html lang="sq">
      <Head />
      <Preview>{`${ownerName} · ${place} · ${askingPrice ?? 'pa çmim'}`}</Preview>
      <Body style={s.body}>
        <Container style={s.container}>
          <Text style={s.eyebrow}>Pronë e re për verifikim</Text>
          <Heading style={s.heading}>{place || city}</Heading>
          <Text style={{ ...s.value, marginTop: 6 }}>
            {listingTypeLabel}
            {spec ? ` · ${spec}` : ''}
          </Text>

          {askingPrice ? (
            <>
              <Text style={s.label}>Çmimi i kërkuar</Text>
              <Text style={{ ...s.value, color: s.colors.accentInk, fontSize: '18px' }}>
                {askingPrice}
              </Text>
            </>
          ) : null}

          <Hr style={s.hr} />

          <Text style={s.label}>Pronari</Text>
          <Text style={s.value}>
            {ownerName}
            {' · '}
            <Link href={`tel:${ownerPhone.replace(/\s/g, '')}`} style={{ color: s.colors.text }}>
              {ownerPhone}
            </Link>
            {ownerEmail ? (
              <>
                {' · '}
                <Link href={`mailto:${ownerEmail}`} style={{ color: s.colors.text }}>
                  {ownerEmail}
                </Link>
              </>
            ) : null}
          </Text>

          <Text style={s.label}>Foto dhe dokumentacion</Text>
          <Text style={s.value}>
            {photoCount} foto ·{' '}
            {hasDocumentation
              ? 'pronari konfirmon se dokumentacioni është në rregull'
              : 'dokumentacioni nuk është konfirmuar'}
          </Text>

          {description ? (
            <Section>
              <Text style={s.label}>Përshkrimi</Text>
              <Text style={s.messageBox}>{description}</Text>
            </Section>
          ) : null}

          <Section>
            <Link href={adminUrl} style={s.button}>
              Shqyrto kërkesën
            </Link>
          </Section>

          <Hr style={s.hr} />
          <Text style={s.footnote}>
            Atmos — njoftim automatik. Prona nuk publikohet derisa të verifikohet.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default ListingRequestNotification
