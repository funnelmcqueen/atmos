/**
 * Inline styles for the notification emails.
 *
 * Email clients do not read `tokens.css`, and half of them strip `<style>`
 * blocks and do not understand custom properties — so these values are copied
 * from `src/styles/tokens.css` by hand rather than referenced. That is the one
 * place in the app where a literal colour is correct (CLAUDE.md rule 8 is about
 * the site's themeable surfaces). If the palette changes, change it here too.
 *
 * Light mode only, and deliberately plain. These are working documents an agent
 * reads on a phone between viewings, not marketing.
 */
/*
 * The navy palette, read as a light document. Emails stay light: a dark HTML
 * email is repainted or inverted by enough clients that it is not worth it, and
 * these are working documents read on a phone between viewings.
 *
 * `air` is the only light colour in the palette, so the page and the card are
 * now one tone rather than two — the card is held by its border instead of by
 * contrast. `line` is the flattened equivalent of the site's `--line`
 * (haze at 24% over air); email clients cannot be trusted with rgba borders.
 */
export const colors = {
  bg: '#f2f1ee', // air
  surface: '#f2f1ee', // air
  text: '#101720', // deep
  muted: '#8a94a3', // haze
  line: '#d9dbdc', // haze @ 24% over air, flattened
  accent: '#c8a882', // bronze
  accentInk: '#101720', // deep
} as const

export const body = {
  backgroundColor: colors.bg,
  color: colors.text,
  fontFamily: "system-ui, -apple-system, 'Segoe UI', Arial, sans-serif",
  margin: 0,
  padding: '24px 0',
}

export const container = {
  backgroundColor: colors.surface,
  border: `1px solid ${colors.line}`,
  borderRadius: '3px',
  margin: '0 auto',
  maxWidth: '560px',
  padding: '28px',
}

export const heading = {
  fontFamily: "Georgia, 'Times New Roman', serif",
  fontSize: '22px',
  fontWeight: 400,
  lineHeight: 1.25,
  margin: '0 0 4px',
}

export const eyebrow = {
  color: colors.muted,
  fontSize: '12px',
  letterSpacing: '0.08em',
  margin: '0 0 16px',
  textTransform: 'uppercase' as const,
}

export const label = {
  color: colors.muted,
  fontSize: '13px',
  margin: '0 0 2px',
}

export const value = {
  fontSize: '15px',
  margin: '0 0 14px',
}

export const messageBox = {
  backgroundColor: colors.bg,
  border: `1px solid ${colors.line}`,
  borderRadius: '3px',
  fontSize: '15px',
  lineHeight: 1.5,
  margin: '0 0 18px',
  padding: '14px',
  whiteSpace: 'pre-wrap' as const,
}

export const button = {
  backgroundColor: colors.accent,
  borderRadius: '3px',
  color: colors.accentInk,
  display: 'inline-block',
  fontSize: '15px',
  padding: '11px 20px',
  textDecoration: 'none',
}

export const hr = {
  border: 'none',
  borderTop: `1px solid ${colors.line}`,
  margin: '22px 0',
}

export const footnote = {
  color: colors.muted,
  fontSize: '12px',
  lineHeight: 1.5,
  margin: 0,
}
