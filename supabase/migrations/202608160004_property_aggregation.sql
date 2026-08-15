-- Authorized property aggregation foundation. This migration does not configure
-- or crawl any external website; sources must be approved by an administrator.
create type public.property_source_type as enum ('api','feed','website','partner');
create type public.property_source_status as enum ('active','paused','disabled');
create type public.aggregated_source_status as enum ('active','unavailable','stale');

create table public.property_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (length(name) between 2 and 120),
  base_url text not null,
  source_type public.property_source_type not null,
  status public.property_source_status not null default 'paused',
  crawl_frequency interval not null default interval '24 hours',
  terms_reviewed_at timestamptz,
  robots_reviewed_at timestamptz,
  authorization_notes text,
  last_crawled_at timestamptz,
  last_successful_crawl_at timestamptz,
  last_failed_crawl_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (base_url ~ '^https?://'),
  check (status <> 'active' or terms_reviewed_at is not null)
);

create table public.aggregated_properties (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.property_sources(id),
  source_listing_id text not null,
  source_url text not null check (source_url ~ '^https?://'),
  title text not null check (length(title) between 3 and 160),
  description text not null default '' check (length(description) <= 5000),
  property_type text not null check (property_type in ('apartment','house','villa','condominium','land','commercial','office','warehouse','other')),
  listing_type text not null check (listing_type in ('sale','rent','long_term_rent','medium_term_rent','short_term_stay')),
  price numeric(16,2) check (price > 0),
  currency char(3),
  area_sqm numeric(10,2) check (area_sqm > 0),
  bedrooms smallint check (bedrooms >= 0),
  bathrooms smallint check (bathrooms >= 0),
  furnished boolean,
  parking_spaces smallint check (parking_spaces >= 0),
  address_text text,
  source_location_text text,
  city text,
  subcity text,
  neighborhood text,
  latitude double precision check (latitude between -90 and 90),
  longitude double precision check (longitude between -180 and 180),
  image_urls jsonb not null default '[]'::jsonb check (jsonb_typeof(image_urls) = 'array'),
  source_agent_name text,
  source_agent_url text,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  last_updated_at timestamptz not null default now(),
  source_status public.aggregated_source_status not null default 'active',
  normalized_property_id uuid references public.properties(id) on delete set null,
  normalization_warnings jsonb not null default '[]'::jsonb,
  duplicate_confidence numeric(4,3) check (duplicate_confidence between 0 and 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(source_id, source_listing_id)
);

create table public.property_source_crawls (
  id bigint generated always as identity primary key,
  source_id uuid not null references public.property_sources(id) on delete cascade,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  status text not null check (status in ('running','succeeded','failed','partial')),
  discovered_count integer not null default 0,
  imported_count integer not null default 0,
  error_count integer not null default 0,
  error_summary text
);

create table public.location_aliases (
  id uuid primary key default gen_random_uuid(),
  original_text text not null,
  city text not null,
  subcity text,
  neighborhood text,
  confidence numeric(4,3) not null check (confidence between 0 and 1),
  approved_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  unique(original_text, city, subcity, neighborhood)
);

create table public.property_price_history (
  id bigint generated always as identity primary key,
  direct_property_id uuid references public.properties(id) on delete cascade,
  aggregated_property_id uuid references public.aggregated_properties(id) on delete cascade,
  price numeric(16,2) not null check (price > 0),
  currency char(3) not null,
  source text not null,
  recorded_at timestamptz not null default now(),
  check ((direct_property_id is not null)::integer + (aggregated_property_id is not null)::integer = 1)
);

create index aggregated_properties_status_idx on public.aggregated_properties(source_status, last_seen_at desc);
create index aggregated_properties_search_idx on public.aggregated_properties(city, listing_type, property_type, price);
create index aggregated_properties_location_idx on public.aggregated_properties(subcity, neighborhood);
create index source_crawls_source_idx on public.property_source_crawls(source_id, started_at desc);

alter table public.property_sources enable row level security;
alter table public.aggregated_properties enable row level security;
alter table public.property_source_crawls enable row level security;
alter table public.location_aliases enable row level security;
alter table public.property_price_history enable row level security;

create policy "admins manage sources" on public.property_sources for all using(public.is_admin()) with check(public.is_admin());
create policy "active aggregated listings public" on public.aggregated_properties for select using(source_status in ('active','stale'));
create policy "admins manage aggregated listings" on public.aggregated_properties for all using(public.is_admin()) with check(public.is_admin());
create policy "admins review crawl history" on public.property_source_crawls for select using(public.is_admin());
create policy "admins manage location aliases" on public.location_aliases for all using(public.is_admin()) with check(public.is_admin());
create policy "price history public for visible listings" on public.property_price_history for select using(
  (direct_property_id is not null and exists(select 1 from public.properties p where p.id=direct_property_id and p.status='published'))
  or (aggregated_property_id is not null and exists(select 1 from public.aggregated_properties a where a.id=aggregated_property_id and a.source_status in ('active','stale')))
);

comment on table public.property_sources is 'Registry of legally reviewed APIs, feeds, partners, or authorized websites.';
comment on column public.aggregated_properties.normalization_warnings is 'Ambiguous fields are retained as warnings and are never silently guessed.';
