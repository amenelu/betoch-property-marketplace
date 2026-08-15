# Betoch MVP — remaining gap analysis

Updated: 2026-08-15

This document intentionally lists only incomplete work. Completed pages, APIs, migrations, responsive UI, request-based stay flows, manual moderation foundations, deployment configuration, and local build/test work have been removed.

## Release status

Betoch is deployed, but the currently published Vercel build predates the new Supabase-backed authentication client. The new authentication implementation builds successfully locally but must not be promoted until `202608150003_auth_profiles.sql` is applied and the critical real-user flows pass against Supabase.

## Critical launch blockers

1. Apply `supabase/migrations/202608150003_auth_profiles.sql` to production Supabase. This installs the secure Auth-user-to-marketplace-profile trigger and controlled role onboarding.
2. Test a real buyer, owner and broker signup, email confirmation, login, logout, session restoration and password reset against production Supabase.
3. Create the first administrator through a controlled SQL/server process; public registration must never accept the admin role.
4. Add server-side route guards for `/admin` and `/dashboard`. Current client gates improve the interface but are not a substitute for server authorization; RLS remains the final data boundary.
5. Replace public fixture-backed property browse/detail/seller pages with database queries. Current sample cards use fixture IDs, so database favorites, inquiries, reports and bookings cannot safely operate on those sample listings.
6. Connect the admin and seller dashboard tables/statistics to database queries. Several dashboard controls still update component state rather than persisted records.
7. Redeploy the Supabase-backed build to Vercel and run end-to-end production verification.

## Public marketplace gaps

| Area | Remaining work |
|---|---|
| Database-backed catalogue | Load published properties, images, pricing, rules, host profiles, reviews and verification checks from Supabase; retain fixtures only as explicit development seeds. |
| Search | Move filtering to query parameters/server API; add min/max price, bathrooms, area, furnished, parking, city/subcity/neighborhood, dates, guest capacity and stay amenities. Add pagination. |
| Availability search | Exclude blocked, reserved and maintenance date ranges; enforce minimum/maximum stay during search and request creation. |
| Real map | Select a provider, add geocoding/address search, draggable markers, bounds search, selected-card synchronization and exact/approximate privacy behavior. |
| Property gallery | Add selectable gallery/lightbox, database images, loading/error states and unavailable/private listing handling. |
| Reviews | Persist review submission through an API, show property/host reviews, and recalculate host rating/review count from completed-booking reviews. |
| Wishlists | Favorites exist, but named collections such as “Bole Apartments” or “Investment Properties” do not. |
| SEO | Generate sitemap and property metadata from published database records and return noindex/404 for non-public listings. |

## Authentication and account gaps

| Area | Remaining work |
|---|---|
| Production migration | Apply and verify `202608150003_auth_profiles.sql`. |
| SSR sessions | Add a Supabase SSR cookie client and middleware/session refresh so protected routes are decided before client hydration. |
| Account settings | Add a buyer account page and database-backed owner/broker profile editor for name, phone, WhatsApp, agency, bio and contact visibility. |
| Suspension enforcement | Check `suspended_at` during session/route authorization and sign suspended users out of protected workflows. |
| Email delivery | Verify confirmation and password-reset templates, redirect URLs, sender identity and deliverability in production. |
| Guest verification | Expose email/phone verification state; phone verification remains optional until a phone provider is selected. |

## Seller and host gaps

| Area | Remaining work |
|---|---|
| Listing workflow | Persist full property/stay fields, validation and status transitions; add explicit “submit for review” after saving a draft. |
| Editing/resubmission | Connect the edit page to owner-authorized database reads/updates, show rejection reasons and support resubmission. |
| Delete/archive | Add confirmation UI; archive published listings by default and reserve permanent deletion for drafts/admin use. |
| Photographs | Connect the existing image APIs to the UI; add client compression/EXIF removal, thumbnails, upload progress, reorder, primary selection, retry and 20-image enforcement. |
| Stay availability | Build the host calendar editor for available/blocked/maintenance ranges and minimum/maximum stays. |
| Fixed pricing/rules | Add seller editors for nightly/weekly/monthly pricing, fees, deposits, guest capacity, beds, furnishing details and stay rules. |
| Inquiries | Add conversation/detail UI and a real reply/contact workflow; current status management is not a messaging system. |
| Analytics | Replace fixture counts with database aggregates for views, favorites, inquiries, requests, reviews, calls, WhatsApp and response rate. |

## Administration and trust gaps

| Area | Remaining work |
|---|---|
| Admin UI persistence | Connect moderation, users, verification and reports screens to their authenticated admin APIs instead of component-local state. |
| Verification submission | Add owner/broker private-document upload, submission history and status display. |
| Secure document review | Complete admin document viewing with authorization, safe content disposition, audit history and approve/reject notes. |
| Verification extensions | Persist and manage verified host, location, photos and amenities checks independently. |
| Enforcement | Define what resolving a report does: warning, unpublish listing, suspend user or dismiss report; record the admin actor and reason. |
| Audit log | Record sensitive admin changes, verification decisions, suspensions and publication transitions. |
| Admin analytics | Replace fixture statistics with aggregate database queries and date filters. |

## Backend and security gaps

- Add the missing property-review API and database-backed host-rating calculation.
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

1. Apply the auth-profile migration and verify real authentication.
2. Make public catalogue/detail pages database-backed and seed valid UUID development data.
3. Add SSR route protection and production account/profile management.
4. Finish persisted seller listing/image/location/stay management.
5. Connect admin moderation, verification, reports and suspensions end to end.
6. Add security hardening and database/RLS/integration tests.
7. Add legal/operations/monitoring, redeploy and run production browser verification.
