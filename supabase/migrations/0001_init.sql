-- ─────────────────────────────────────────────────────────────────────────────
-- Kelder — Supabase schema (Postgres)
-- South-Africa-first wine app. Every user table has RLS enabled.
-- ─────────────────────────────────────────────────────────────────────────────

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ── Reference: Wine of Origin (WO) appellation hierarchy ─────────────────────
-- Four-tier: Geographical Unit → Region → District → Ward (per WSB/SAWIS)
create table if not exists wo_appellations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  level text not null check (level in ('unit','region','district','ward')),
  parent_id uuid references wo_appellations(id) on delete set null,
  slug text not null unique,
  terroir_note text,
  created_at timestamptz not null default now()
);
create index if not exists idx_wo_parent on wo_appellations(parent_id);
create index if not exists idx_wo_level on wo_appellations(level);

-- ── Varietals ────────────────────────────────────────────────────────────────
create table if not exists varietals (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,            -- 'chenin-blanc', 'pinotage'
  name text not null,
  aliases text[] default '{}',          -- ['Steen']
  type text not null check (type in ('red','white','rose','sparkling','fortified','dessert','orange')),
  is_signature boolean not null default false,
  character text,
  typical_aromas text[] default '{}',
  created_at timestamptz not null default now()
);

-- ── Estates / wine farms ─────────────────────────────────────────────────────
create table if not exists estates (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,
  name text not null,
  wo_appellation_id uuid references wo_appellations(id),
  wine_route text,                      -- 'Stellenbosch Wine Routes', 'Franschhoek Wine Tram'
  founded_year int,
  about text,
  famous_for text,
  latitude double precision,
  longitude double precision,
  website_url text,
  logo_url text,
  cover_image_url text,
  -- Verified estate (B2B SaaS subscriber)
  is_verified boolean not null default false,
  owner_user_id uuid references auth.users(id) on delete set null,
  subscription_tier text check (subscription_tier in ('free','small','mid','large')),
  tasting_room_hours jsonb,
  contact jsonb,                        -- {phone, email, booking_url}
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_estates_appellation on estates(wo_appellation_id);
create index if not exists idx_estates_verified on estates(is_verified);

-- ── Certifications / seals (WO, IPW, WIETA, OVP, Fairtrade, ROC, BWI) ────────
create table if not exists certifications (
  id uuid primary key default uuid_generate_v4(),
  code text not null unique,            -- 'WO', 'IPW', 'WIETA', 'OVP', 'FAIRTRADE', 'ROC', 'BWI'
  name text not null,
  description text,
  is_export_relevant boolean default false
);
create table if not exists estate_certifications (
  estate_id uuid references estates(id) on delete cascade,
  certification_id uuid references certifications(id),
  primary key (estate_id, certification_id)
);

-- ── Wines ────────────────────────────────────────────────────────────────────
create table if not exists wines (
  id uuid primary key default uuid_generate_v4(),
  estate_id uuid references estates(id) on delete cascade,
  slug text not null unique,
  name text not null,
  type text not null check (type in ('red','white','rose','sparkling','fortified','dessert','orange')),
  blend_type text,                      -- 'varietal', 'bordeaux-blend', 'rhone-blend', 'cape-blend'
  wo_appellation_id uuid references wo_appellations(id),
  -- Aggregated community rating (denormalized for perf)
  avg_stars numeric(2,1) default 0,
  rating_count int default 0,
  barcode text,
  image_url text,
  about text,
  cellar_flag boolean default false,
  created_at timestamptz not null default now()
);
create index if not exists idx_wines_estate on wines(estate_id);
create index if not exists idx_wines_type on wines(type);
create index if not exists idx_wines_barcode on wines(barcode);

-- Wine ↔ varietal (many-to-many; with blend %)
create table if not exists wine_varietals (
  wine_id uuid references wines(id) on delete cascade,
  varietal_id uuid references varietals(id),
  percentage int,                       -- 100 for varietal; null for unknown blend
  primary key (wine_id, varietal_id)
);

-- ── Vintages (year-specific) ─────────────────────────────────────────────────
create table if not exists vintages (
  id uuid primary key default uuid_generate_v4(),
  wine_id uuid references wines(id) on delete cascade,
  year int not null check (year between 1990 and 2100),
  abv numeric(3,1),
  residual_sugar numeric(5,1),          -- g/L
  ph numeric(3,2),
  drink_window_start int,
  drink_window_end int,
  -- Vintage notes (drought/rainfall context)
  harvest_note text,
  label_image_url text,
  unique (wine_id, year)
);
create index if not exists idx_vintages_wine on vintages(wine_id);
create index if not exists idx_vintages_year on vintages(year);

-- ── Awards (Platter 5★, Veritas, Tim Atkin, DWWA, IWSC, Michelangelo) ────────
create table if not exists award_bodies (
  id uuid primary key default uuid_generate_v4(),
  code text not null unique,            -- 'PLATTER', 'VERITAS', 'ATKIN', 'DWWA', 'IWSC', 'MICHELANGELO'
  name text not null,
  scale text                             -- '5-star', '100-point', '20-point', 'medal'
);
create table if not exists awards (
  id uuid primary key default uuid_generate_v4(),
  vintage_id uuid references vintages(id) on delete cascade,
  award_body_id uuid references award_bodies(id),
  year int not null,
  result text not null,                 -- '5-star', '95', 'Double Gold', 'Platinum'
  created_at timestamptz not null default now()
);
create index if not exists idx_awards_vintage on awards(vintage_id);

-- ── Profiles (consumer) ──────────────────────────────────────────────────────
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  bio text,
  is_pro boolean not null default false,
  pro_since timestamptz,
  -- Cached palate profile (rebuilt by background job)
  palate_profile jsonb,
  palate_updated_at timestamptz,
  preferences jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ── Tasting notes (the structured review) ────────────────────────────────────
create table if not exists tasting_notes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  vintage_id uuid references vintages(id) on delete cascade not null,
  stars numeric(2,1) not null check (stars >= 0.5 and stars <= 5 and (stars * 10) % 5 = 0),
  tasted_at timestamptz not null default now(),
  -- Structured tasting (maps to @kelder/engine TastingNote)
  appearance jsonb,
  nose jsonb,
  palate jsonb,
  conclusions jsonb,
  free_text text,
  -- Purchase metadata (optional)
  price_paid numeric(8,2),
  currency text default 'ZAR',
  purchased_at text,
  created_at timestamptz not null default now()
);
create index if not exists idx_notes_user on tasting_notes(user_id, tasted_at desc);
create index if not exists idx_notes_vintage on tasting_notes(vintage_id);

-- ── Cellar (user's owned bottles) ────────────────────────────────────────────
create table if not exists cellar_items (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  vintage_id uuid references vintages(id) on delete cascade not null,
  quantity int not null default 1 check (quantity > 0),
  bin_location text,
  acquired_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  unique (user_id, vintage_id)
);
create index if not exists idx_cellar_user on cellar_items(user_id);

-- ── Wishlist ─────────────────────────────────────────────────────────────────
create table if not exists wishlist (
  user_id uuid references auth.users(id) on delete cascade,
  wine_id uuid references wines(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, wine_id)
);

-- ── Wine events / festivals ──────────────────────────────────────────────────
create table if not exists events (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  description text,
  starts_at timestamptz,
  ends_at timestamptz,
  -- Recurring hint (month) for annual festivals that shift dates
  recurring_month int check (recurring_month between 1 and 12),
  venue_name text,
  wo_appellation_id uuid references wo_appellations(id),
  latitude double precision,
  longitude double precision,
  ticket_url text,
  ticketing_platform text,              -- 'Quicket', 'Webtickets', 'Howler'
  price_min_zar numeric(8,2),
  price_max_zar numeric(8,2),
  format text,                          -- 'grand-tasting', 'open-cellars', 'trade-show', 'hop-between'
  is_18_plus boolean default true,
  cover_image_url text,
  website_url text,
  created_at timestamptz not null default now()
);
create index if not exists idx_events_starts on events(starts_at);
create index if not exists idx_events_recurring on events(recurring_month);

-- Event ↔ participating estates
create table if not exists event_estates (
  event_id uuid references events(id) on delete cascade,
  estate_id uuid references estates(id) on delete cascade,
  primary key (event_id, estate_id)
);

-- ── Vintage notes (drought/rainfall context for a harvest year) ──────────────
create table if not exists vintage_reports (
  id uuid primary key default uuid_generate_v4(),
  year int not null unique,
  quality_note text,                    -- 'exceptional', 'strong', 'challenging'
  weather_summary text,                 -- drought/rainfall context
  harvest_tonnes numeric(10,1),
  is_recommended boolean default false,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────────────────────────────────────

alter table profiles enable row level security;
alter table tasting_notes enable row level security;
alter table cellar_items enable row level security;
alter table wishlist enable row level security;

-- Public read for wine catalog (everyone can browse SA wines)
alter table wo_appellations enable row level security;
alter table varietals enable row level security;
alter table estates enable row level security;
alter table wines enable row level security;
alter table vintages enable row level security;
alter table awards enable row level security;
alter table award_bodies enable row level security;
alter table certifications enable row level security;
alter table estate_certifications enable row level security;
alter table wine_varietals enable row level security;
alter table events enable row level security;
alter table event_estates enable row level security;
alter table vintage_reports enable row level security;

-- Catalog = public read (anon allowed to browse; writes via service role only)
create policy "catalog public read" on wo_appellations for select using (true);
create policy "catalog public read" on varietals for select using (true);
create policy "catalog public read" on estates for select using (true);
create policy "catalog public read" on wines for select using (true);
create policy "catalog public read" on vintages for select using (true);
create policy "catalog public read" on awards for select using (true);
create policy "catalog public read" on award_bodies for select using (true);
create policy "catalog public read" on certifications for select using (true);
create policy "catalog public read" on estate_certifications for select using (true);
create policy "catalog public read" on wine_varietals for select using (true);
create policy "catalog public read" on events for select using (true);
create policy "catalog public read" on event_estates for select using (true);
create policy "catalog public read" on vintage_reports for select using (true);

-- Profiles: owner read + update
create policy "profile self read" on profiles for select using (auth.uid() = id);
create policy "profile self upsert" on profiles for insert with check (auth.uid() = id);
create policy "profile self update" on profiles for update using (auth.uid() = id);

-- Tasting notes: owner full control; others read (community ratings)
create policy "notes owner all" on tasting_notes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "notes public read" on tasting_notes for select using (true);

-- Cellar: owner only
create policy "cellar owner all" on cellar_items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Wishlist: owner only
create policy "wishlist owner all" on wishlist for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── Updated_at triggers ──────────────────────────────────────────────────────
create or replace function set_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end; $$ language plpgsql;
drop trigger if exists trg_estates_updated on estates;
create trigger trg_estates_updated before update on estates for each row execute function set_updated_at();
