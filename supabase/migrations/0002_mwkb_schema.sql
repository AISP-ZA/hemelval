-- ─────────────────────────────────────────────────────────────────────────────
-- Decanta Master Wine Knowledge Base (MWKB) — Schema Expansion
-- Adds 60+ fields per estate, normalised varietals, routes, facilities,
-- restaurants, accommodation, and events tables.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Expanded estates table (add columns to existing) ────────────────────────
ALTER TABLE estates ADD COLUMN IF NOT EXISTS legal_name text;
ALTER TABLE estates ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE estates ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE estates ADD COLUMN IF NOT EXISTS facebook text;
ALTER TABLE estates ADD COLUMN IF NOT EXISTS instagram text;
ALTER TABLE estates ADD COLUMN IF NOT EXISTS linkedin text;
ALTER TABLE estates ADD COLUMN IF NOT EXISTS youtube text;
ALTER TABLE estates ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE estates ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE estates ADD COLUMN IF NOT EXISTS province text DEFAULT 'Western Cape';
ALTER TABLE estates ADD COLUMN IF NOT EXISTS postcode text;
ALTER TABLE estates ADD COLUMN IF NOT EXISTS google_maps_url text;
ALTER TABLE estates ADD COLUMN IF NOT EXISTS region text;
ALTER TABLE estates ADD COLUMN IF NOT EXISTS district text;
ALTER TABLE estates ADD COLUMN IF NOT EXISTS ward text;
ALTER TABLE estates ADD COLUMN IF NOT EXISTS currently_producing boolean DEFAULT true;
ALTER TABLE estates ADD COLUMN IF NOT EXISTS estate_size_ha numeric(8,2);
ALTER TABLE estates ADD COLUMN IF NOT EXISTS vineyard_size_ha numeric(8,2);
ALTER TABLE estates ADD COLUMN IF NOT EXISTS restaurant boolean DEFAULT false;
ALTER TABLE estates ADD COLUMN IF NOT EXISTS accommodation boolean DEFAULT false;
ALTER TABLE estates ADD COLUMN IF NOT EXISTS wedding_venue boolean DEFAULT false;
ALTER TABLE estates ADD COLUMN IF NOT EXISTS conference_facilities boolean DEFAULT false;
ALTER TABLE estates ADD COLUMN IF NOT EXISTS family_friendly boolean DEFAULT false;
ALTER TABLE estates ADD COLUMN IF NOT EXISTS pet_friendly boolean DEFAULT false;
ALTER TABLE estates ADD COLUMN IF NOT EXISTS wheelchair_access boolean DEFAULT false;
ALTER TABLE estates ADD COLUMN IF NOT EXISTS tasting_room boolean DEFAULT false;
ALTER TABLE estates ADD COLUMN IF NOT EXISTS cellar_tours boolean DEFAULT false;
ALTER TABLE estates ADD COLUMN IF NOT EXISTS picnic boolean DEFAULT false;
ALTER TABLE estates ADD COLUMN IF NOT EXISTS cycling boolean DEFAULT false;
ALTER TABLE estates ADD COLUMN IF NOT EXISTS running boolean DEFAULT false;
ALTER TABLE estates ADD COLUMN IF NOT EXISTS hiking boolean DEFAULT false;
ALTER TABLE estates ADD COLUMN IF NOT EXISTS live_music boolean DEFAULT false;
ALTER TABLE estates ADD COLUMN IF NOT EXISTS market boolean DEFAULT false;
ALTER TABLE estates ADD COLUMN IF NOT EXISTS events_venue boolean DEFAULT false;
ALTER TABLE estates ADD COLUMN IF NOT EXISTS organic boolean DEFAULT false;
ALTER TABLE estates ADD COLUMN IF NOT EXISTS biodynamic boolean DEFAULT false;
ALTER TABLE estates ADD COLUMN IF NOT EXISTS sustainable boolean DEFAULT false;
ALTER TABLE estates ADD COLUMN IF NOT EXISTS opening_hours jsonb;
ALTER TABLE estates ADD COLUMN IF NOT EXISTS booking_required boolean DEFAULT false;
ALTER TABLE estates ADD COLUMN IF NOT EXISTS price_range text;
ALTER TABLE estates ADD COLUMN IF NOT EXISTS rating numeric(2,1);
ALTER TABLE estates ADD COLUMN IF NOT EXISTS tripadvisor text;
ALTER TABLE estates ADD COLUMN IF NOT EXISTS google_rating numeric(2,1);
ALTER TABLE estates ADD COLUMN IF NOT EXISTS google_reviews int;
ALTER TABLE estates ADD COLUMN IF NOT EXISTS history text;
ALTER TABLE estates ADD COLUMN IF NOT EXISTS winemaker text;
ALTER TABLE estates ADD COLUMN IF NOT EXISTS owner text;
ALTER TABLE estates ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE estates ADD COLUMN IF NOT EXISTS last_verified date;
ALTER TABLE estates ADD COLUMN IF NOT EXISTS data_source text DEFAULT 'hemelval-research';

-- ── Wine routes (normalised) ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS wine_routes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  description text,
  website text,
  region text
);

INSERT INTO wine_routes (name, slug) VALUES
  ('Stellenbosch Wine Routes', 'stellenbosch'),
  ('Franschhoek Wine Valley', 'franschhoek'),
  ('Constantia Wine Route', 'constantia'),
  ('Paarl Wine Route', 'paarl'),
  ('Robertson Wine Valley', 'robertson'),
  ('Durbanville Wine Valley', 'durbanville'),
  ('Swartland Wine & Olive Route', 'swartland'),
  ('Elgin Wine Route', 'elgin'),
  ('Hemel-en-Aarde', 'hemel-en-aarde'),
  ('Walker Bay Wine Route', 'walker-bay'),
  ('Darling Wine Route', 'darling'),
  ('Tulbagh Wine Route', 'tulbagh'),
  ('Breedekloof Wine Valley', 'breedekloof'),
  ('Wellington Wine Route', 'wellington'),
  ('Bot River Wine Route', 'bot-river'),
  ('Cape Agulhas Wine Route', 'cape-agulhas'),
  ('Worcester Wine Route', 'worcester'),
  ('Klein Karoo Wine Route', 'klein-karoo'),
  ('Olifants River Wine Route', 'olifants-river'),
  ('Cederberg Wine Route', 'cederberg')
ON CONFLICT (slug) DO NOTHING;

-- Link estates to routes
ALTER TABLE estates ADD COLUMN IF NOT EXISTS wine_route_id uuid REFERENCES wine_routes(id);

-- ── Facilities (many-to-many) ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS estate_facilities (
  estate_id uuid REFERENCES estates(id) ON DELETE CASCADE,
  facility text NOT NULL,
  details text,
  PRIMARY KEY (estate_id, facility)
);

-- ── Restaurants ─────────────────────────────────────────────────────────────
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

-- ── Accommodation ───────────────────────────────────────────────────────────
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

-- ── Expand varietals table ──────────────────────────────────────────────────
ALTER TABLE varietals ADD COLUMN IF NOT EXISTS color text;
ALTER TABLE varietals ADD COLUMN IF NOT EXISTS origin text;
ALTER TABLE varietals ADD COLUMN IF NOT EXISTS body_profile text;
ALTER TABLE varietals ADD COLUMN IF NOT EXISTS acidity_profile text;
ALTER TABLE varietals ADD COLUMN IF NOT EXISTS tannin_profile text;
ALTER TABLE varietals ADD COLUMN IF NOT EXISTS sa_plantings_ha numeric(8,1);

-- Insert additional varietals to complete the SA catalogue
INSERT INTO varietals (slug, name, type, color, origin) VALUES
  ('pinot-blanc', 'Pinot Blanc', 'white', 'white', 'France'),
  ('pinot-gris', 'Pinot Gris', 'white', 'white', 'France'),
  ('gewurztraminer', 'Gewürztraminer', 'white', 'white', 'Germany'),
  ('verdelho', 'Verdelho', 'white', 'white', 'Portugal'),
  ('roussanne', 'Roussanne', 'white', 'white', 'France'),
  ('marsanne', 'Marsanne', 'white', 'white', 'France'),
  ('petit-manseng', 'Petit Manseng', 'white', 'white', 'France'),
  ('tempranillo', 'Tempranillo', 'red', 'red', 'Spain'),
  ('nebbiolo', 'Nebbiolo', 'red', 'red', 'Italy'),
  ('barbera', 'Barbera', 'red', 'red', 'Italy'),
  ('sangiovese', 'Sangiovese', 'red', 'red', 'Italy'),
  ('tinta-roriz', 'Tinta Roriz', 'red', 'red', 'Portugal'),
  ('petit-verdot', 'Petit Verdot', 'red', 'red', 'France'),
  ('carignan', 'Carignan', 'red', 'red', 'Spain'),
  ('tannat', 'Tannat', 'red', 'red', 'France'),
  ('zinfandel', 'Zinfandel', 'red', 'red', 'Croatia/USA'),
  ('hanepoot', 'Hanepoot (Muscat d''Alexandrie)', 'white', 'white', 'Egypt/SA'),
  ('taminga', 'Taminga', 'white', 'white', 'Australia'),
  ('sultana', 'Sultana', 'white', 'white', 'Turkey/Middle East'),
  ('muscadel', 'Muscadel', 'white', 'white', 'Greece')
ON CONFLICT (slug) DO NOTHING;

-- ── Expand wine_regions (WO appellations already exist, add route mapping) ───
CREATE TABLE IF NOT EXISTS wine_regions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  level text,
  parent_id uuid REFERENCES wine_regions(id),
  description text,
  average_rainfall_mm numeric(6,1),
  average_temp_c numeric(4,1),
  dominant_soils text
);
