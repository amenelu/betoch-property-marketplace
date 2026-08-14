# Betoch — Ethiopian Property Marketplace MVP

Betoch is a mobile-first property marketplace focused on Addis Ababa. It combines search, listing management, approximate map discovery, seller contact, manual verification, moderation, and basic price intelligence. If Supabase is not configured, the public app uses realistic demo data so the interface can be reviewed immediately.

## Local setup

Requirements: Node.js 20+, npm, and (for the full backend) Docker plus the Supabase CLI.

```bash
npm install
copy .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. Main routes: `/`, `/properties`, `/properties/[slug]`, `/dashboard`, `/dashboard/new`, `/admin`, and `/login`.

## Database setup

The canonical schema is `supabase/migrations/202608140001_initial_marketplace.sql`. It includes enums, checks, search indexes, RLS policies, storage buckets, and strict private access for verification documents.

```bash
npx supabase init
npx supabase start
npx supabase db reset
```

`db reset` runs migrations followed by `supabase/seed.sql`. Copy the printed local API URL, anon key, service role key, and database URL into `.env.local`. To deploy schema changes to a linked Supabase project, run `npx supabase link` and `npx supabase db push`.

Authentication uses Supabase email/password. User-facing requests should use the anon client plus the user's bearer token; the service-role key is server-only. RLS—not client role state—is the final authorization boundary.

## Architecture decisions

- Next.js App Router keeps the web UI and HTTP APIs together. Public listings can be indexed; drafts and moderation data are protected by RLS.
- Supabase provides PostgreSQL, authentication, and object storage, while domain validation and API contracts remain ordinary TypeScript/SQL to reduce provider coupling.
- Public photographs and private verification documents use separate buckets. Only admins can read verification files. A signed URL must be generated after a server-side admin check; document paths never belong in public responses.
- Public coordinates are approximate by default. The database stores seller intent in `location_precision`; a production serializer must round coordinates unless exact sharing was explicitly enabled.
- Verification is manual and granular. “Documents reviewed” is never represented as a legal ownership guarantee. No government integration is implied.
- Duplicate detection is advisory: compare normalized title similarity plus owner, price, type, area, and nearby coordinates; set `possible_duplicate` for admin review and never auto-delete.
- Image upload accepts JPEG/PNG/WebP, up to 10 MB each and 20 images per property. Production upload handling should decode, resize, strip metadata, create a thumbnail, and persist only generated safe paths.

## API

Implemented foundations include `GET/POST /api/properties`, `GET/PATCH/DELETE /api/properties/:id`, and favorites endpoints. The migration models inquiries, reports, verification, analytics, and all specified moderation permissions. Mutating APIs require a Supabase bearer token and rely on RLS ownership/admin checks.

## Tests

```bash
npm test
npm run build
```

Tests cover property validation, negative values, coordinate safety, ownership authorization, admin authorization, and approximate-location privacy. The SQL policies additionally prevent cross-user favorites, cross-owner property edits, non-admin approvals, and public verification document access.

## Production deployment

1. Create a Supabase production project and run `npx supabase db push`.
2. Configure all variables from `.env.example` in the hosting platform. Never expose the service-role key.
3. Configure the production app URL and allowed Supabase Auth redirect URLs.
4. Deploy to Vercel with `vercel` or connect the Git repository.
5. Confirm storage policies, create the first admin role through a controlled SQL/admin process, and remove all development seed data.

The MVP intentionally excludes payments, mortgages, escrow, legal advice, automated valuation, nationwide rollout, and Ethiopian government integrations.
