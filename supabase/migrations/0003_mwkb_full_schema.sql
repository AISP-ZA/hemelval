-- ─────────────────────────────────────────────────────────────────────────────
-- Decanta MWKB — Full Schema Migration (0003)
-- Deploys the complete canonical schema to Supabase.
-- Run: supabase db push  OR  paste into Supabase SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. WINE REGIONS (WO Appellation Hierarchy — 4-tier tree)
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS wine_regions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  level text NOT NULL CHECK (level IN ('unit','region','district','ward')),
  parent_id uuid REFERENCES wine_regions(id) ON DELETE SET NULL,
  description text,
  average_rainfall_mm numeric(6,1),
  average_temp_c numeric(4,1),
  dominant_soils text,
  terroir_note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_wine_regions_parent ON wine_regions(parent_id);
CREATE INDEX IF NOT EXISTS idx_wine_regions_level ON wine_regions(level);
CREATE INDEX IF NOT EXISTS idx_wine_regions_slug ON wine_regions(slug);

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. WINE ROUTES
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS wine_routes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  description text,
  website text,
  region text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════════════════
-- 3. VARIETALS (normalised — covers all SA + international varieties planted)
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS varietals (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  aliases text[] DEFAULT '{}',
  type text NOT NULL CHECK (type IN ('red','white','rose','sparkling','fortified','dessert','orange')),
  color text,
  origin text,
  is_signature boolean DEFAULT false,
  character text,
  typical_aromas text[] DEFAULT '{}',
  body_profile text,
  acidity_profile text,
  tannin_profile text,
  sa_plantings_ha numeric(8,1),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════════════════
-- 4. CERTIFICATIONS
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS certifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  is_export_relevant boolean DEFAULT false
);

-- ═══════════════════════════════════════════════════════════════════════════
-- 5. AWARD BODIES
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS award_bodies (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  scale text
);

-- ═══════════════════════════════════════════════════════════════════════════
-- 6. WINE ESTATES (master table — 60+ fields)
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS estates (
  -- Identity
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  estate_name text NOT NULL,
  legal_name text,
  slug text NOT NULL UNIQUE,
  -- Contact
  website text,
  email text,
  phone text,
  facebook text,
  instagram text,
  linkedin text,
  youtube text,
  -- Location
  address text,
  city text,
  province text DEFAULT 'Western Cape',
  postcode text,
  latitude double precision,
  longitude double precision,
  google_maps_url text,
  -- Classification
  region text,
  district text,
  ward text,
  wine_route text,
  wine_route_id uuid REFERENCES wine_routes(id),
  wo_appellation_id uuid REFERENCES wine_regions(id),
  -- Production
  year_established int,
  currently_producing boolean DEFAULT true,
  estate_size_ha numeric(8,2),
  vineyard_size_ha numeric(8,2),
  -- Facilities
  restaurant boolean DEFAULT false,
  accommodation boolean DEFAULT false,
  wedding_venue boolean DEFAULT false,
  conference_facilities boolean DEFAULT false,
  family_friendly boolean DEFAULT false,
  pet_friendly boolean DEFAULT false,
  wheelchair_access boolean DEFAULT false,
  tasting_room boolean DEFAULT false,
  cellar_tours boolean DEFAULT false,
  picnic boolean DEFAULT false,
  cycling boolean DEFAULT false,
  running boolean DEFAULT false,
  hiking boolean DEFAULT false,
  live_music boolean DEFAULT false,
  market boolean DEFAULT false,
  events_venue boolean DEFAULT false,
  -- Certifications
  organic boolean DEFAULT false,
  biodynamic boolean DEFAULT false,
  sustainable boolean DEFAULT false,
  certifications text[] DEFAULT '{}',
  -- Visitor
  opening_hours jsonb,
  booking_required boolean DEFAULT false,
  price_range text,
  -- Ratings
  rating numeric(2,1),
  tripadvisor text,
  google_rating numeric(2,1),
  google_reviews int,
  -- Content
  description text,
  history text,
  winemaker text,
  owner text,
  about text,
  famous_for text,
  is_verified boolean DEFAULT false,
  subscription_tier text,
  logo_url text,
  cover_image_url text,
  notes text,
  last_verified date,
  data_source text DEFAULT 'decanta-mwkb',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_estates_slug ON estates(slug);
CREATE INDEX IF NOT EXISTS idx_estates_region ON estates(region);
CREATE INDEX IF NOT EXISTS idx_estates_route ON estates(wine_route);
CREATE INDEX IF NOT EXISTS idx_estates_verified ON estates(is_verified);
CREATE INDEX IF NOT EXISTS idx_estates_district ON estates(district);
CREATE INDEX IF NOT EXISTS idx_estates_name ON estates(estate_name);

-- ═══════════════════════════════════════════════════════════════════════════
-- 7. WINES
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS wines (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  estate_id uuid REFERENCES estates(id) ON DELETE CASCADE,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('red','white','rose','sparkling','fortified','dessert','orange')),
  blend_type text,
  vintage text,
  abv numeric(3,1),
  residual_sugar numeric(5,1),
  price_zar numeric(8,2),
  barcode text,
  image_url text,
  about text,
  avg_stars numeric(2,1) DEFAULT 0,
  rating_count int DEFAULT 0,
  cellar_flag boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_wines_estate ON wines(estate_id);
CREATE INDEX IF NOT EXISTS idx_wines_type ON wines(type);
CREATE INDEX IF NOT EXISTS idx_wines_slug ON wines(slug);
CREATE INDEX IF NOT EXISTS idx_wines_barcode ON wines(barcode);

-- ═══════════════════════════════════════════════════════════════════════════
-- 8. JUNCTION TABLES (many-to-many)
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS estate_varietals (
  estate_id uuid REFERENCES estates(id) ON DELETE CASCADE,
  varietal_id uuid REFERENCES varietals(id),
  primary_varietal boolean DEFAULT false,
  signature_varietal boolean DEFAULT false,
  PRIMARY KEY (estate_id, varietal_id)
);

CREATE TABLE IF NOT EXISTS wine_varietals (
  wine_id uuid REFERENCES wines(id) ON DELETE CASCADE,
  varietal_id uuid REFERENCES varietals(id),
  percentage int,
  PRIMARY KEY (wine_id, varietal_id)
);

CREATE TABLE IF NOT EXISTS estate_certifications (
  estate_id uuid REFERENCES estates(id) ON DELETE CASCADE,
  certification_id uuid REFERENCES certifications(id),
  PRIMARY KEY (estate_id, certification_id)
);

CREATE TABLE IF NOT EXISTS estate_facilities (
  estate_id uuid REFERENCES estates(id) ON DELETE CASCADE,
  facility text NOT NULL,
  details text,
  PRIMARY KEY (estate_id, facility)
);

CREATE TABLE IF NOT EXISTS event_estates (
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  estate_id uuid REFERENCES estates(id) ON DELETE CASCADE,
  PRIMARY KEY (event_id, estate_id)
);

-- ═══════════════════════════════════════════════════════════════════════════
-- 9. AWARDS
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS awards (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  wine_id uuid REFERENCES wines(id) ON DELETE CASCADE,
  award_body_id uuid REFERENCES award_bodies(id),
  year int NOT NULL,
  result text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_awards_wine ON awards(wine_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- 10. RESTAURANTS
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS restaurants (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  estate_id uuid REFERENCES estates(id) ON DELETE CASCADE,
  name text NOT NULL,
  cuisine text,
  price_range text,
  booking_required boolean DEFAULT false,
  phone text,
  website text,
  opening_hours jsonb,
  rating numeric(2,1),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════════════════
-- 11. ACCOMMODATION
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS accommodation (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  estate_id uuid REFERENCES estates(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text,
  price_from numeric(8,2),
  price_to numeric(8,2),
  currency text DEFAULT 'ZAR',
  booking_url text,
  rating numeric(2,1),
  amenities text[],
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════════════════
-- 12. EVENTS
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  starts_at timestamptz,
  ends_at timestamptz,
  recurring_month int CHECK (recurring_month BETWEEN 1 AND 12),
  venue_name text,
  estate_id uuid REFERENCES estates(id),
  latitude double precision,
  longitude double precision,
  ticket_url text,
  ticketing_platform text,
  price_min_zar numeric(8,2),
  price_max_zar numeric(8,2),
  format text,
  is_18_plus boolean DEFAULT true,
  cover_image_url text,
  website_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_events_month ON events(recurring_month);
CREATE INDEX IF NOT EXISTS idx_events_starts ON events(starts_at);

-- ═══════════════════════════════════════════════════════════════════════════
-- 13. VINTAGE REPORTS
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS vintage_reports (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  year int NOT NULL UNIQUE,
  quality_note text,
  weather_summary text,
  harvest_tonnes numeric(10,1),
  is_recommended boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════════════════
-- 14. USER TABLES (auth + tasting)
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  avatar_url text,
  bio text,
  is_pro boolean NOT NULL DEFAULT false,
  pro_since timestamptz,
  palate_profile jsonb,
  palate_updated_at timestamptz,
  preferences jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tasting_notes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  wine_id uuid REFERENCES wines(id) ON DELETE CASCADE NOT NULL,
  stars numeric(2,1) NOT NULL CHECK (stars >= 0.5 AND stars <= 5),
  tasted_at timestamptz NOT NULL DEFAULT now(),
  appearance jsonb,
  nose jsonb,
  palate jsonb,
  conclusions jsonb,
  free_text text,
  price_paid numeric(8,2),
  currency text DEFAULT 'ZAR',
  occasion text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notes_user ON tasting_notes(user_id, tasted_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_wine ON tasting_notes(wine_id);

CREATE TABLE IF NOT EXISTS cellar_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  wine_id uuid REFERENCES wines(id) ON DELETE CASCADE NOT NULL,
  quantity int NOT NULL DEFAULT 1 CHECK (quantity > 0),
  bin_location text,
  acquired_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wishlist (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  wine_id uuid REFERENCES wines(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, wine_id)
);

-- ═══════════════════════════════════════════════════════════════════════════
-- 15. ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════════════════
ALTER TABLE wine_regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE wine_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE varietals ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE award_bodies ENABLE ROW LEVEL SECURITY;
ALTER TABLE estates ENABLE ROW LEVEL SECURITY;
ALTER TABLE wines ENABLE ROW LEVEL SECURITY;
ALTER TABLE estate_varietals ENABLE ROW LEVEL SECURITY;
ALTER TABLE wine_varietals ENABLE ROW LEVEL SECURITY;
ALTER TABLE estate_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE estate_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_estates ENABLE ROW LEVEL SECURITY;
ALTER TABLE awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE accommodation ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE vintage_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasting_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE cellar_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

-- Catalog tables = public read (anyone can browse)
CREATE POLICY "catalog public read" ON wine_regions FOR SELECT USING (true);
CREATE POLICY "catalog public read" ON wine_routes FOR SELECT USING (true);
CREATE POLICY "catalog public read" ON varietals FOR SELECT USING (true);
CREATE POLICY "catalog public read" ON certifications FOR SELECT USING (true);
CREATE POLICY "catalog public read" ON award_bodies FOR SELECT USING (true);
CREATE POLICY "catalog public read" ON estates FOR SELECT USING (true);
CREATE POLICY "catalog public read" ON wines FOR SELECT USING (true);
CREATE POLICY "catalog public read" ON estate_varietals FOR SELECT USING (true);
CREATE POLICY "catalog public read" ON wine_varietals FOR SELECT USING (true);
CREATE POLICY "catalog public read" ON estate_certifications FOR SELECT USING (true);
CREATE POLICY "catalog public read" ON estate_facilities FOR SELECT USING (true);
CREATE POLICY "catalog public read" ON event_estates FOR SELECT USING (true);
CREATE POLICY "catalog public read" ON awards FOR SELECT USING (true);
CREATE POLICY "catalog public read" ON restaurants FOR SELECT USING (true);
CREATE POLICY "catalog public read" ON accommodation FOR SELECT USING (true);
CREATE POLICY "catalog public read" ON events FOR SELECT USING (true);
CREATE POLICY "catalog public read" ON vintage_reports FOR SELECT USING (true);

-- User tables = owner only (except tasting_notes which is community-readable)
CREATE POLICY "profile self read" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profile self insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profile self update" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "notes owner all" ON tasting_notes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "notes public read" ON tasting_notes FOR SELECT USING (true);
CREATE POLICY "cellar owner all" ON cellar_items FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "wishlist owner all" ON wishlist FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- 16. TRIGGERS
-- ═══════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_estates_updated ON estates;
CREATE TRIGGER trg_estates_updated BEFORE UPDATE ON estates
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════
-- DONE — Schema complete
-- ═══════════════════════════════════════════════════════════════════════════
