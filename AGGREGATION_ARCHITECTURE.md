# Property aggregation architecture

Betoch may ingest only sources that are legally authorized for automated access. Adding a row to the source registry does not authorize crawling it. Sources are created in `paused` state and activation requires an administrator to confirm review of terms, robots.txt, licensing, privacy, rate limits and opt-out requirements.

## Data flow

`Approved source → independent adapter → raw listing → normalizer → validator → aggregated_properties → unified catalogue`

Each adapter implements `discover()`, `fetch()`, `parse()`, `normalize()` and `validate()` through the contract in `src/lib/aggregation.ts`. Source-specific selectors, credentials and parsing rules stay inside that adapter. Adapters return normalized data and do not write directly to the database.

The importer should run one source at a time, write a `property_source_crawls` record, upsert on `(source_id, source_listing_id)`, record changed prices, and continue when another source fails. A missing listing is first marked `unavailable`; it is not immediately deleted. No importer or scheduled crawl is enabled in this release because no external source has been legally approved.

## Public behavior

Direct and aggregated inventory share the internal `Property` read model. Aggregated listings:

- are labeled with the external source;
- show last-checked freshness and stale state;
- link to the original URL with `noopener`, `noreferrer` and `nofollow`;
- do not expose Betoch inquiry, favorite, report or seller-profile actions that require an internal property owner;
- currently use a neutral fallback image rather than copying third-party media without explicit permission.

## Security and failure boundaries

- Source and crawl administration is admin-only; ingestion should use a server-side service credential.
- No adapter may bypass authentication, CAPTCHA, paywalls, access controls or anti-bot protections.
- Ambiguous conversions are stored in `normalization_warnings`, not guessed.
- One broken adapter must not stop other approved sources.
- Crawl attempts retain counts, timestamps and a safe error summary for operations review.
- The frontend never imports or branches on a named external website.

## Deployment

Apply `supabase/migrations/202608160004_property_aggregation.sql` before adding sources. Existing direct listings continue to work if the migration has not yet been applied; the repository deliberately treats a missing aggregation table as an empty aggregated catalogue.
