# Design

Read this before building any component or page. It is not a style guide —
`src/styles/tokens.css` is the style guide. This is how decisions get made.

## The premise

Almost nobody enters through the homepage. They arrive on a listing from Google
or Instagram, or on a filtered result set from a link someone sent them. Design
for arrival on a detail page, not for a tour that starts at the top.

That is why the build order is card → grid → detail page → homepage, and why the
homepage is the last thing built rather than the first.

## The card is the design system

Get the listing card right and every other surface follows. It appears in the
results grid, the map popup, similar properties, and company pages. One
component, one file.

- Fixed 4:3 image ratio, object-fit cover. Photos come off agent phones at every
  ratio. A ragged grid reads as broken.
- Same information, same position, every time. Price, typology, m², floor, area.
  People compare by scanning down a column. Move the price and the scan breaks.
- Gradient scrim under any text over a photo. Half the photography is dim or
  badly lit. Text must stay readable regardless of what is behind it.
- Badges are the exception, not decoration. Sold, reserved, verified, mortgage.
  Nothing else earns a badge.

## One accent, two uses

The brass in tokens.css marks exactly two things: the price and the primary
action. Nothing else.

The moment a third element takes the accent, the price stops being the loudest
thing on screen, and the price is what people came for.

Everything else is text, muted, surface, and line.

## Density over elegance

Results grid: three across on desktop, two on tablet, one on mobile.

Generous whitespace on a listing grid reads as "this agency has few properties".
The client has 274. The layout should feel like abundance, not a gallery show.

## Mobile is the product

Albanian property traffic is overwhelmingly mobile, and contact happens on
WhatsApp.

- Sticky bottom bar on the detail page. Call and WhatsApp, always visible, at
  thumb height. This bar is where the leads come from.
- Filters open as a full-screen sheet on mobile, not a cramped sidebar.
- Tap targets 44px minimum. Agents use this standing in apartments.
- Test on a real phone before calling anything done. Narrow browser windows lie
  about touch.

## Design for the bad cases

Every state below exists in the real data. Design each one deliberately — do not
discover them in production.

| State | What it must not do |
| --- | --- |
| Price on request | Leave an empty space where the price was |
| Rent | Show a price per m² (11 €/m² beside 1,971 €/m² is nonsense) |
| Land | Render an empty layout block for rooms and floor |
| Two photos | Show a gallery built for twenty |
| No photos | Look like a bug — use a marked placeholder |
| Sold or reserved | Disappear. Visible scarcity sells |
| Zero results | Show a blank grid with no explanation or way back |
| No logo on a company | Leave a broken image or a hole |

## Typography

Georgia for display — property titles, page headings, prices. System sans for
everything else. No third family.

Prices are the largest non-heading element on any card. If a label competes with
a price for attention, the label is wrong.

Albanian text runs longer than English. Any component that fits its label
exactly will break in translation. Leave room.

## Photography

Assume the worst photo in the set, not the best.

- Never full-bleed a client photo across a hero unless that specific photo was
  chosen for it
- Dark surfaces are forgiving; a light theme makes a dim photo look dirty
- Never ship a gallery image wider than 1600px
- Every image needs real width and height attributes — layout shift on a listing
  grid is the most visible performance failure there is

## Motion

Almost none. Fade and short translate on entry, nothing longer than 200ms.

Respect prefers-reduced-motion — the rule is already in tokens.css.

A property site is a tool people use quickly. Animation that delays information
is a cost, not a feature.

## Component inventory

Everything on this site is a composition of these. Build them once.

Listing card · price block · badge · filter panel · filter chip · pagination ·
gallery · sticky contact bar · agent card · unit table · project card · company
card · map marker · article card · form field set · empty state

If a slice needs something outside this list, that is a signal to check whether
an existing component should take a variant prop instead.

## The homepage, when it comes

Last, and deliberately restrained. It has three jobs:

- Search, immediately — the primary action on arrival
- A small set of featured listings, real ones
- Proof: number of listings, areas covered, verified partners

Not a brand film. People arriving at a property site are looking for property.
