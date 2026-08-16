# Betoch federated property search MVP

## Product decision

Betoch will use an AutoTempest-style hybrid search model. One buyer search produces:

1. **Betoch results** — direct listings and aggregated listings supplied through an authorized API, feed, partner or permitted source.
2. **External searches** — outbound links that transfer supported search criteria to property sites that have not licensed their inventory to Betoch.

External searches are not aggregated listings. Betoch does not fetch, copy, cache or display the destination's listings, descriptions, photographs or contact details.

## User promise

“Search Addis Ababa property across multiple sources from one starting point.”

The interface must distinguish inventory from navigation:

- `Direct listing`: submitted and managed on Betoch.
- `Aggregated listing`: imported under source authorization and clearly attributed.
- `External search`: a link that opens another website; no listing data is imported.
- `Betoch partner`: shown only after a documented partnership is active.
- `Sponsored`: shown on every paid placement and never disguised as organic ranking.

## Implemented MVP flow

The property results page generates external searches for Ethiopia Property Centre, EthiopianProperties.com, Properties in Addis, Addis Property Listings and Facebook Marketplace. Active location, property type, listing type and minimum-bedroom criteria are converted into keywords; Ethiopia Property Centre also receives a native sale/rent path. Each card states what was and was not transferred.

Outbound clicks are recorded as `analytics_events.event_type = search` with `metadata.action = external_search_click`, the source ID and active filters. The click must continue even if analytics fails.

Every outbound link:

- opens in a new tab;
- uses `noopener`, `noreferrer` and `nofollow`;
- displays a non-affiliation disclosure;
- avoids automated access to the destination;
- transfers only search terms, not Betoch user identity or contact details.

## Architecture

Source-specific URL construction lives in `src/lib/external-search.ts`, separate from the search UI. A source can be paused or removed by changing one definition. The UI never parses source pages.

An external source may move into the aggregated-results tier only after the source registry contains documented authorization and an independent adapter passes normalization, attribution, freshness and failure-handling tests.

## Acceptance criteria

- A Bole, apartment, sale, 2+ bedroom search creates five valid HTTPS external links.
- Source cards never look like property cards and never show copied inventory.
- Each card discloses transferred and unsupported filters.
- Clicking a source records a non-blocking outbound event.
- Facebook opens a Marketplace search; Betoch never automates Facebook or collects its results.
- Missing internal results still show external search options.
- Source links remain keyboard accessible and have descriptive names.

## Remaining iterations

1. Synchronize active filters to the Betoch URL so searches are shareable.
2. Add server-side filters for price, bathrooms, area, furnished state and amenities.
3. Add an admin-managed external-source registry with pause, ordering and URL-template controls.
4. Add automated link health checks that do not crawl result content.
5. Build an admin report for outbound searches, click-through rate and high-demand/low-inventory queries.
6. Add saved searches and email alerts for Betoch/authorized inventory; external sites remain outbound-only.
7. Establish written partnerships and promote approved sources from external-link status to normalized inventory.

## Non-goals

- No scraping Facebook or sites whose terms prohibit automated access.
- No copying descriptions, photographs, contacts or exact locations from external-search destinations.
- No claims that Betoch is affiliated with an external source.
- No proxying destination pages or bypassing login, CAPTCHA, paywalls or access controls.
