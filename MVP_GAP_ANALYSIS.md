# Betoch MVP — remaining gap analysis

Updated: 2026-08-16

This document intentionally lists only incomplete work. Completed pages, APIs, migrations, responsive UI, request-based stay flows, manual moderation foundations, deployment configuration, and local build/test work have been removed.

## Release status

Betoch's Supabase-backed build is deployed at `https://betoch-property-marketplace.vercel.app`. The Auth-profile trigger, database connection, SSR session middleware, owner login, protected dashboard, property creation API and non-admin denial from admin APIs have been verified against production Supabase. The production catalogue is intentionally empty until real sellers submit listings and an administrator publishes them.

## Critical launch blockers

1. Register and confirm the project owner's account, then run `npm run promote-admin -- owner@example.com` to create the first administrator. Public registration correctly excludes the admin role.
2. Complete production email-confirmation and password-reset delivery tests with a real inbox; disposable confirmed-owner login/session/property creation already pass.
3. Publish the first real listing so catalogue, favorite, inquiry, report and booking journeys can be verified with production UUID records.
4. Finish listing submission, images and complete persisted analytics; seller profiles, listing editing and seller summary cards are database-backed.

## Public marketplace gaps

| Area | Remaining work |
|---|---|
| Search | Move filtering to query parameters/server API; add min/max price, bathrooms, area, furnished, parking, city/subcity/neighborhood, dates, guest capacity and stay amenities. Add pagination. |
| Availability search | Exclude blocked, reserved and maintenance date ranges; enforce minimum/maximum stay during search and request creation. |
| Real map | Select a provider, add geocoding/address search, draggable markers, bounds search, selected-card synchronization and exact/approximate privacy behavior. |
| Property gallery | Add selectable gallery/lightbox, database images, loading/error states and unavailable/private listing handling. |
| Reviews | Show persisted property/host reviews publicly and recalculate host rating/review count from completed-booking reviews. |
| Wishlists | Favorites exist, but named collections such as “Bole Apartments” or “Investment Properties” do not. |
| SEO | Generate sitemap and property metadata from published database records and return noindex/404 for non-public listings. |

## Authentication and account gaps

| Area | Remaining work |
|---|---|
| Account settings | Add a buyer account page. The owner/broker profile editor is database-backed. |
| Email delivery | Verify confirmation and password-reset templates, redirect URLs, sender identity and deliverability in production. |
| Guest verification | Expose email/phone verification state; phone verification remains optional until a phone provider is selected. |

## Seller and host gaps

| Area | Remaining work |
|---|---|
| Listing workflow | Persist full property/stay fields, validation and status transitions; add explicit “submit for review” after saving a draft. |
| Editing/resubmission | Show rejection reasons and support explicit resubmission; owner-authorized database reads and updates are connected. |
| Delete/archive | Add confirmation UI; archive published listings by default and reserve permanent deletion for drafts/admin use. |
| Photographs | Generate stored thumbnail derivatives, add per-file byte-level progress/retry and validate decoded image content server-side. The owner UI, client resize/compression and metadata removal, previews, ordering, primary selection, deletion and 20-photo enforcement are connected. |
| Stay availability | Build the host calendar editor for available/blocked/maintenance ranges and minimum/maximum stays. |
| Fixed pricing/rules | Add seller editors for nightly/weekly/monthly pricing, fees, deposits, guest capacity, beds, furnishing details and stay rules. |
| Inquiries | Add conversation/detail UI and a real reply/contact workflow; current status management is not a messaging system. |
| Analytics | Replace fixture counts with database aggregates for views, favorites, inquiries, requests, reviews, calls, WhatsApp and response rate. |

## Administration and trust gaps

| Area | Remaining work |
|---|---|
| Verification submission | Add owner/broker private-document upload, submission history and status display. |
| Secure document review | Complete admin document viewing with authorization, safe content disposition, audit history and approve/reject notes. |
| Verification extensions | Persist and manage verified host, location, photos and amenities checks independently. |
| Enforcement | Define what resolving a report does: warning, unpublish listing, suspend user or dismiss report; record the admin actor and reason. |
| Audit log | Record sensitive admin changes, verification decisions, suspensions and publication transitions. |
| Admin analytics | Replace fixture statistics with aggregate database queries and date filters. |

## Backend and security gaps

- Add database-backed host-rating calculation from persisted property reviews.
- Tighten booking status RLS so guests can only cancel and hosts can only approve/reject/complete valid transitions at the database level, not only in the route handler.
- Add rate limiting for authentication, inquiries, reports, booking requests, uploads and analytics.
- Replace hand-written validation with shared typed schemas and response allowlists.
- Add CSRF/origin protections where cookie-based SSR authentication is introduced.
- Add structured server logs, request correlation IDs and safe error responses.
- Validate actual uploaded file content, not only MIME metadata; generate server-controlled object names and remove abandoned uploads.
- Review all service-role usage and confirm it is limited to server-only administrative operations.

## Tests still required

- Supabase Auth signup/login/logout/confirmation/reset integration tests.
- RLS tests proving users cannot access admin data, private verification documents, another owner’s property, another user’s favorites or unauthorized booking transitions.
- Database-backed property creation, editing, submission, moderation, archive and publication tests.
- Search/filter/date-availability integration tests.
- Image upload, reordering, primary-image and 20-image-limit tests.
- Favorites, inquiries, reports, bookings and completed-stay review tests using real UUID records.
- Admin user suspension, verification and report-enforcement tests.
- Browser end-to-end tests for buyer, seller/host and admin critical paths on desktop and mobile.
- Accessibility checks for keyboard navigation, focus management, dialogs, form errors and contrast.

## Operations and launch gaps

- Seed production-safe reference locations; keep demo users/listings out of production or label them clearly.
- Configure Supabase backups and document/perform a restore drill.
- Add error monitoring, uptime monitoring and alert ownership.
- Add Terms, Privacy, Trust & Safety, verification explanation and support/contact pages.
- Configure a custom domain and transactional email sender.
- Resolve the local Git/GitHub SSL certificate issue so recent commits reach the connected repository and future Git pushes trigger the same code deployed through the CLI.
- Define retention/deletion rules for accounts, inquiries, reports and sensitive verification documents.

## Recommended completion order

1. Create the first administrator and publish a real owner-submitted listing.
2. Finish production account/profile management and listing edit/submit/archive flows.
3. Finish image, location and stay availability/pricing/rules management.
4. Complete verification-document submission/review and enforcement audit logging.
5. Add security hardening and database/RLS/integration tests.
6. Add legal/operations/monitoring and run full production buyer/seller/admin browser verification.

## Property aggregation extension — remaining work

The Phase A schema and production migration, normalized adapter contract, admin source registry, unified direct/aggregated read model, inventory filter, attribution, freshness display, crawl health storage, location aliases and price-history storage are complete. No external source or crawler has been invented or enabled; the remaining Phase A work begins with legally approving a real source.

| Priority | Remaining work |
|---|---|
| Phase A operations | Legally approve the first API/feed/partner source; implement its independent adapter and a rate-limited importer; schedule it only after terms, robots/licensing and opt-out review; add admin crawl-run/error metrics. |
| Phase A search | Move unified filtering/ranking to a paginated server query or search index; add price, bathrooms, area, amenities and freshness filters; track searches, zero results and popular locations. |
| Phase A media | Decide source-by-source whether remote images may be displayed, proxied or stored. Current aggregated listings deliberately use a neutral fallback image. |
| Phase B deduplication | Implement explainable confidence scoring, candidate review, property groups and conservative merge controls. The schema only stores an initial confidence field. |
| Phase B claiming | Add claim requests, claimant documents, admin approval/rejection, audit logs and conversion/linking to an owner-managed direct listing. Keep claim status separate from legal ownership verification. |
| Phase B alerts/history | Add saved-search CRUD and email delivery; record price changes during imports and expose history only where legally permitted. |
| Phase C promotion | Add admin-controlled promotions, sponsored labels and date/status validation. Do not add payments yet. |
| Phase C business accounts | Add configurable subscription tiers/entitlements, agencies and team membership without hard-coded prices. |
| Phase C leads | Persist inquiry, phone, WhatsApp, viewing and booking-request leads; add seller aggregates and prevent page views from being counted as leads. |
| Phase C developers/ads | Add developer/project profiles, clearly labeled campaigns, placement controls and campaign analytics. |
| Phase D future models | Service-provider records, property intelligence reporting and future booking/referral commission architecture remain intentionally unimplemented. No payments, mortgages or official-value claims. |
| Compliance/operations | Add takedown and source opt-out workflows, retention rules, per-source audit evidence, source reliability scoring, crawl alerts and review by Ethiopian legal counsel before production aggregation. |

## Federated external search — remaining work

The AutoTempest-style MVP behavior is implemented: active filters generate clearly labeled outbound searches for five external sources, unsupported filters are disclosed, no destination content is fetched, non-affiliation is explicit and outbound clicks are recorded through analytics metadata. See `AUTOTEMPEST_SEARCH_MVP.md`.

| Area | Remaining work |
|---|---|
| Shareable search | Synchronize filters with URL query parameters and restore them on reload/back navigation. |
| Expanded transfer | Add Betoch price, bathroom, area, furnished and amenity filters, then transfer only fields each destination supports. |
| Source operations | Move external URL templates, ordering and enabled state into an admin-controlled registry; add safe link-health monitoring without fetching result inventories. |
| Partnership funnel | Report outbound searches, clicks, click-through rates and high-demand/low-inventory combinations for source partnership outreach. |
| Saved demand | Persist saved searches and email alerts for Betoch and authorized inventory. Never represent external-site coverage as alert coverage. |
| Compliance | Periodically review source terms and remove links on request; never upgrade a source to aggregation without documented authorization. |

## Monetization — remaining work

The commercial priorities and sequencing are documented in `MONETIZATION_STRATEGY.md`. Basic search remains free and payments remain outside the MVP.

| Priority | Remaining work |
|---|---|
| Featured inventory | Build admin-controlled promotions with dates, placement validation and a mandatory `Sponsored` label. |
| Professional plans | Add configurable plans and entitlements for brokers/agencies without hard-coded prices or payment enforcement. |
| Developer products | Add project profiles, unit types, campaigns and lead analytics. |
| Qualified leads | Define billable lead qualification, consent, deduplication and disputes before enabling charges. Page views must never be billable leads. |
| Listing services | Define operational pricing and fulfillment for photography, measurement, listing preparation and verification visits. |
| Referrals/intelligence | Add vetted service-provider referrals later; offer property intelligence only after sufficient licensed historical data exists. |
