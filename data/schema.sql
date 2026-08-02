-- Decanta Master Wine Knowledge Base (MWKB) — Canonical Schema
-- This is the authoritative schema for the Decanta platform.
-- Database: Supabase (Postgres 15)
-- Deploy: psql or Supabase SQL Editor

-- ═══════════════════════════════════════════════════════════════════════════
-- WINE REGIONS (WO Appellation Hierarchy)
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS wine_regions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  level text NOT NULL CHECK (level IN ('unit','region','district','ward')),
  parent_id uuid REFERENCES wine_regions(id),
  description text,
  average_rainfall_mm numeric(6,1),
  average_temp_c numeric(4,1),
  dominant_soils text,
  terroir_note text,
  created_at timestamptz DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════════════════
-- WINE ROUTES
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS wine_routes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  description text,
  website text,
  region text,
  created_at timestamptz DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════════════════
-- VARIETALS
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
  created_at timestamptz DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════════════════
-- WINE ESTATES (the master table — 60+ fields)
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS estates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- Identity
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
  -- Wine classification
  region text,
  district text,
  ward text,
  wine_route text,
  wine_route_id uuid REFERENCES wine_routes(id),
  -- Production
  year_established int,
  currently_producing boolean DEFAULT true,
  estate_size_ha numeric(8,2),
  vineyard_size_ha numeric(8,2),
  -- Facilities (boolean flags)
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
  -- Visitor info
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
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════════════════
-- WINES
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
  created_at timestamptz DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════════════════
-- ESTATE ↔ VARIETAL (many-to-many)
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS estate_varietals (
  estate_id uuid REFERENCES estates(id) ON DELETE CASCADE,
  varietal_id uuid REFERENCES varietals(id),
  primary_varietal boolean DEFAULT false,
  signature_varietal boolean DEFAULT false,
  PRIMARY KEY (estate_id, varietal_id)
);

-- ═══════════════════════════════════════════════════════════════════════════
-- WINE ↔ VARIETAL (many-to-many, with blend %)
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS wine_varietals (
  wine_id uuid REFERENCES wines(id) ON DELETE CASCADE,
  varietal_id uuid REFERENCES varietals(id),
  percentage int,
  PRIMARY KEY (wine_id, varietal_id)
);

-- ═══════════════════════════════════════════════════════════════════════════
-- ESTATE FACILITIES (many-to-many, detailed)
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS estate_facilities (
  estate_id uuid REFERENCES estates(id) ON DELETE CASCADE,
  facility text NOT NULL,
  details text,
  PRIMARY KEY (estate_id, facility)
);

-- ═══════════════════════════════════════════════════════════════════════════
-- RESTAURANTS
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
  created_at timestamptz DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════════════════
-- ACCOMMODATION
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
  created_at timestamptz DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════════════════
-- EVENTS
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
  created_at timestamptz DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════════════════
-- CERTIFICATIONS
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS certifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  is_export_relevant boolean DEFAULT false
);

CREATE TABLE IF NOT EXISTS estate_certifications (
  estate_id uuid REFERENCES estates(id) ON DELETE CASCADE,
  certification_id uuid REFERENCES certifications(id),
  PRIMARY KEY (estate_id, certification_id)
);

-- ═══════════════════════════════════════════════════════════════════════════
-- AWARDS
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS award_bodies (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  scale text
);

CREATE TABLE IF NOT EXISTS awards (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  wine_id uuid REFERENCES wines(id) ON DELETE CASCADE,
  award_body_id uuid REFERENCES award_bodies(id),
  year int NOT NULL,
  result text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_estates_slug ON estates(slug);
CREATE INDEX IF NOT EXISTS idx_estates_region ON estates(region);
CREATE INDEX IF NOT EXISTS idx_estates_route ON estates(wine_route);
CREATE INDEX IF NOT EXISTS idx_estates_verified ON estates(is_verified);
CREATE INDEX IF NOT EXISTS idx_wines_estate ON wines(estate_id);
CREATE INDEX IF NOT EXISTS idx_wines_type ON wines(type);
CREATE INDEX IF NOT EXISTS idx_wines_slug ON wines(slug);
CREATE INDEX IF NOT EXISTS idx_events_month ON events(recurring_month);

-- ═══════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════════════════
ALTER TABLE estates ENABLE ROW LEVEL SECURITY;
ALTER TABLE wines ENABLE ROW LEVEL SECURITY;
ALTER TABLE varietals ENABLE ROW LEVEL SECURITY;
ALTER TABLE wine_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE accommodation ENABLE ROW LEVEL SECURITY;

CREATE POLICY "catalog public read" ON estates FOR SELECT USING (true);
CREATE POLICY "catalog public read" ON wines FOR SELECT USING (true);
CREATE POLICY "catalog public read" ON varietals FOR SELECT USING (true);
CREATE POLICY "catalog public read" ON wine_routes FOR SELECT USING (true);
CREATE POLICY "catalog public read" ON events FOR SELECT USING (true);
CREATE POLICY "catalog public read" ON restaurants FOR SELECT USING (true);
CREATE POLICY "catalog public read" ON accommodation FOR SELECT USING (true);
