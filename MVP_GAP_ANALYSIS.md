# Betoch MVP gap analysis

Status legend: **Implemented** means a usable route or backend capability exists; **Partial** means a visual/demo foundation exists but is not production-connected; **Missing** means no implementation exists yet.

## Executive summary

The repository is currently a polished frontend prototype plus an initial PostgreSQL/RLS schema. It is not yet a complete production MVP. The public browse and property-detail experience is the strongest area. Authentication, seller workflows, administration, storage processing, and most mutation APIs remain demo-only or absent.

## Public marketplace

| Requirement | Status | Remaining work |
|---|---|---|
| Homepage, featured/recent listings, locations | Partial | Replace static fixtures with database queries; manage featured status and locations in admin. |
| Search and filtering | Partial | Current client demo supports keyword, listing type, property type, bedrooms and verified. Add price, bathrooms, area, furnished, parking, city/subcity/neighborhood, URL persistence and server pagination. |
| Sorting | Partial | Newest, price and area work. Add price/m² and recently updated. |
| List view | Implemented as demo | Connect favorites and results to authenticated/database state. |
| Map discovery | Partial | Current map is a visual approximation. Integrate environment-configured provider, marker clustering, bounds search and selected-card synchronization. |
| Property details | Partial | Gallery, amenities, price/m², seller and verification display exist. Add real image gallery controls, database loading, view analytics and unavailable/private states. |
| Seller profile page | Missing | Add `/sellers/[id]` with role, agency, bio, verification, active listings and public contact preferences. |
| Favorites page | Missing | Add `/favorites`; current card state is local only. |
| Report listing flow | Missing | Add report dialog/page with specified reasons, validation and confirmation. |
| SEO | Partial | Metadata, sitemap and robots exist for demo data. Generate from database; ensure non-published properties return noindex/404. |

## Authentication and accounts

| Requirement | Status | Remaining work |
|---|---|---|
| Email/password sign-up and sign-in | Partial | Login is visual only. Connect Supabase Auth, add registration, email confirmation, errors and loading states. |
| Session handling | Missing | Add Supabase SSR cookie client and session refresh middleware/proxy. |
| Password reset | Missing | Add request/reset pages and safe redirect handling. |
| Role onboarding | Missing | Choose buyer/owner/broker; prevent client-side role escalation. |
| Profile management | Missing | Add `/account/profile`, contact visibility controls and agency fields. |
| Route protection | Missing in Next.js | RLS exists, but `/admin` and `/dashboard` are publicly reachable demo pages. Add server-side guards and suspension checks. |

## Seller and broker experience

| Requirement | Status | Remaining work |
|---|---|---|
| Seller dashboard | Partial | Metrics/table use fixtures; connect per-owner queries and real status actions. |
| Broker profile/agency | Missing | Add creation/editing, verification state and multi-listing management. |
| Listing creation | Partial | Ten-step UI exists but does not persist data, validate between steps, autosave or detect duplicates. |
| Listing editing/resubmission | Missing | Add `/dashboard/properties/[id]/edit`, ownership checks, rejection reason and resubmit action. |
| Listing deletion/archive | API foundation | Add confirmation UI and prefer archive for published records. |
| Image management | Missing | Upload, resize/compress, metadata stripping, thumbnails, reordering, primary image and delete are absent. |
| Location picker | Missing | Add geocoding/address search, draggable marker and exact/approximate choice. |
| Inquiry inbox | Missing | Dashboard tab is visual only. Add list/detail/status/reply workflow. |
| Property analytics | Partial | Dashboard metrics are fixtures. Aggregate views, favorites, inquiries, phone/WhatsApp clicks by listing/date. |

## Verification and moderation

| Requirement | Status | Remaining work |
|---|---|---|
| Verification schema and private bucket | Implemented | Migration models granular manual checks and admin-only document reads. |
| Seller verification submission | Missing | Private upload form, submission history and status UI. |
| Admin verification queue | Partial | Visual queue only; add list/detail, secure document streaming/signed URLs, approve/reject and notes. |
| Listing moderation | Partial | Schema/statuses and visual queue exist; add review detail, approve/reject reason, publication and seller notification. |
| Reports administration | Partial | Schema and visual navigation exist; add report list/detail, resolve/dismiss and enforcement actions. |
| User administration | Partial | Visual navigation only; add searchable user list, role/status detail and suspend/reactivate actions. |
| Duplicate detection | Missing | Implement advisory score using owner, coordinates, price, type, area and title similarity; flag only. |
| Admin statistics | Partial | Cards are fixtures; connect aggregate queries with date ranges. |

## APIs and backend

| API | Status |
|---|---|
| `GET/POST /api/properties` | Partial; validation/auth foundation exists |
| `GET/PATCH/DELETE /api/properties/:id` | Partial; add response allowlists, full validation and moderation constraints |
| Property image POST/DELETE | Missing |
| Favorites GET/POST/DELETE | Implemented foundation; UI not connected |
| Inquiries POST/GET/PATCH | Missing |
| Reports POST and admin GET/PATCH | Missing |
| Admin verifications GET/PATCH | Missing |
| Private verification document access | Missing route; storage RLS exists |
| Rate limiting | Missing for auth, inquiries, reports, uploads and analytics |
| Input sanitization/structured schemas | Partial; replace hand validation with shared typed schemas |
| Error/logging conventions | Missing |

## Data, tests and operations

- **Seed data:** Missing the specified ~30 auth users and ~50 relational properties. Current seed only inserts locations; UI fixtures are not database seed records.
- **Migrations:** Initial migration exists. It needs integration testing against a clean Supabase instance before production.
- **Tests:** Only 18 domain unit tests exist. Missing authentication, route-handler integration, RLS/database, image upload, search/filter, favorites, inquiries, reports, verification, admin actions and browser end-to-end tests.
- **Image security:** Bucket MIME/size policies exist; server-side content decoding, compression, filename generation and 20-image enforcement are missing.
- **Analytics:** Event table exists; event ingestion, deduplication, privacy controls and seller aggregation are missing.
- **Observability:** Missing structured logs, error reporting, uptime monitoring and alerting.
- **Backups/recovery:** Configure Supabase production backups and document restore procedure.
- **Legal/product pages:** Missing Terms, Privacy, Trust & Safety, verification explanation and contact/support pages.
- **Localization:** English only; Amharic/localization was not explicitly required but should be planned after MVP validation.

## Deployment readiness checklist

Completed in repository:

- Production build and unit-test scripts
- `.env.example` without secrets
- Health endpoint at `/api/health`
- Security response headers
- `robots.txt` and `sitemap.xml`
- Vercel framework/region configuration
- GitHub Actions quality gate for test and build
- Supabase migration and private-document RLS design

Required before a real production launch:

1. Finish authentication/session guards and remove public access to demo admin/seller routes.
2. Provision separate Supabase production project and apply/test migrations.
3. Configure all production environment variables and allowed auth redirects.
4. Replace fixture-backed pages with database queries or clearly mark a limited preview deployment.
5. Create the first admin through a controlled server/SQL process.
6. Complete private document delivery and image-processing pipeline.
7. Add rate limiting, integration/RLS tests and end-to-end critical-path tests.
8. Add legal pages, support contact, monitoring and backup/restore checks.
9. Run a browser-based desktop/mobile/accessibility audit; current local screenshot tooling was unavailable.

## Recommended delivery order

1. Authentication, SSR sessions and protected routes.
2. Database-backed property browse/detail and seller CRUD.
3. Image pipeline and location provider.
4. Favorites, inquiries and reports end to end.
5. Moderation and verification admin workflows.
6. Analytics, complete seed data and integration/E2E tests.
7. Accessibility/browser QA, performance pass and production deployment.
