# Roadmap and scope

## v1 — the only thing being built now

Properties for sale and long-term rent, property detail pages, projects with
unit inventory, company profiles, search with filters, map, "send your property"
form, enquiry forms, blog, Albanian and English.

Ship this before anything else is discussed.

## Explicitly out of scope for v1

| Deferred | Why |
| --- | --- |
| Daily rentals | Availability calendars, booking and cancellation rules are a separate product |
| Atmos Match | Worthless until the database has real listing volume |
| Saved searches, alert emails | Depends on Match |
| Client accounts | v1 needs no login for the public side; favourites can live in a cookie |
| Company self-service panel | Atmos staff manage company content by hand at this scale |
| Property comparison | Nice to have, zero effect on lead volume |
| Mortgage and cost calculators | Same |
| Virtual tours | Embed a third party when a client actually has one |
| Atmos Market | Highest cost, highest risk, no payoff without traffic |
| Automatic translation | Manual English for a launch-sized catalogue |
| Italian locale | Add when there is Italian demand to serve |

## Sequencing inside v1

1. Payload config, collections, seed data
2. Design tokens and shared components
3. Properties slice, end to end
4. Projects and units slice
5. Companies slice
6. Search and filters
7. Map
8. Blog
9. Forms and email
10. English locale, sitemaps, structured data

Do not start step N+1 while step N is red.

## A note on Atmos Market

When it is eventually built: aggregate by summarising and linking out. Do not
reproduce article text from other publications, and label every estimate as an
estimate. The legal exposure of getting this wrong is larger than the feature's
value.
