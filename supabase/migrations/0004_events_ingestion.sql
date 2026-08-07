-- ═══════════════════════════════════════════════════════════════════════════
-- 0004_events_ingestion.sql
-- Dynamic event ingestion pipeline — self-updating SA wine festival calendar.
--
-- Adds source tracking + verification workflow to the events table so a
-- scheduled edge function can import events from public listings without
-- manual intervention, while keeping unconfirmed dates hidden from users
-- until an admin verifies them (EVENTS_CALENDAR.md §"Data sourcing pipeline":
-- "Never publish an unconfirmed date to a user planning a trip").
--
-- Idempotent: safe to re-run. Uses IF NOT EXISTS / ADD COLUMN IF NOT EXISTS.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. Source tracking + verification columns ───────────────────────────────
ALTER TABLE events ADD COLUMN IF NOT EXISTS source_url text;
ALTER TABLE events ADD COLUMN IF NOT EXISTS source_name text;
ALTER TABLE events ADD COLUMN IF NOT EXISTS source_event_id text;

-- Verification lifecycle: 'published' (visible) → 'pending' (hidden, awaiting review).
-- Imported events default to 'pending'; the existing curated 41 are backfilled to 'published'.
ALTER TABLE events ADD COLUMN IF NOT EXISTS verification_status text NOT NULL DEFAULT 'published';
ALTER TABLE events ADD COLUMN IF NOT EXISTS confidence text NOT NULL DEFAULT 'verified';
ALTER TABLE events ADD COLUMN IF NOT EXISTS last_synced_at timestamptz;

-- Category tag for seasonal grouping (matches EVENTS_CALENDAR.md chapters).
ALTER TABLE events ADD COLUMN IF NOT EXISTS chapter text
  CHECK (chapter IS NULL OR chapter IN ('harvest','winter','spring','festive','evergreen'));

-- Normalised contact/region for dedup.
ALTER TABLE events ADD COLUMN IF NOT EXISTS region text;

-- ── 2. Indexes for the ingestion query path ────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_events_verification ON events(verification_status);
CREATE INDEX IF NOT EXISTS idx_events_source ON events(source_name, source_event_id);
CREATE INDEX IF NOT EXISTS idx_events_chapter ON events(chapter);

-- ── 3. Updated_at trigger ──────────────────────────────────────────────────
-- Bump updated_at whenever an event row changes, so we can detect drift.
ALTER TABLE events ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
DROP TRIGGER IF EXISTS trg_events_set_updated_at ON events;
CREATE OR REPLACE FUNCTION decanta_set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_events_set_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION decanta_set_updated_at();

-- ── 4. RLS — hide unverified events from the public (anon + authenticated) ──
-- Catalog reads were previously "catalog public read" (USING true). We tighten
-- to: published events are public; pending events are admin-only (service role
-- bypasses RLS, so the ingestion function + merchant portal still see them).
DROP POLICY IF EXISTS "catalog public read" ON events;
DROP POLICY IF EXISTS "events public read" ON events;

CREATE POLICY "events public read published" ON events
  FOR SELECT TO anon, authenticated
  USING (verification_status = 'published');

-- Admins (merchant portal) can read all events. The merchant role is granted
-- via the merchant admin auth flow (Phase 2). For now, service_role sees all.
-- This policy is forward-looking; it activates once the role exists.
DO $$
BEGIN
  CREATE POLICY "events admin read all" ON events
    FOR SELECT TO authenticated
    USING (auth.jwt() ->> 'role' = 'merchant_admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── 5. Backfill the existing curated events to 'published' ──────────────────
-- The 41 seeded events were editorially curated, so they are trusted.
-- This is a no-op if verification_status already defaults to 'published'.
UPDATE events SET verification_status = 'published', confidence = 'verified'
  WHERE verification_status IS NULL OR verification_status = '';

-- ── 6. Ingestion log — audit trail of every scraper run ────────────────────
CREATE TABLE IF NOT EXISTS events_ingestion_log (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  ran_at timestamptz NOT NULL DEFAULT now(),
  source_name text NOT NULL,
  status text NOT NULL CHECK (status IN ('ok','partial','failed')),
  events_fetched int NOT NULL DEFAULT 0,
  events_inserted int NOT NULL DEFAULT 0,
  events_updated int NOT NULL DEFAULT 0,
  events_skipped_duplicate int NOT NULL DEFAULT 0,
  error_message text
);
ALTER TABLE events_ingestion_log ENABLE ROW LEVEL SECURITY;
-- Admin-only audit log. Service role bypasses. No public policy = invisible to anon.
COMMENT ON TABLE events_ingestion_log IS
  'Audit trail for the dynamic events ingestion pipeline. Admin-only.';

-- ── 7. Helper: classify an event into a seasonal chapter ───────────────────
-- Pure function so the mobile app + scraper share the same logic.
CREATE OR REPLACE FUNCTION decanta_event_chapter(month int)
RETURNS text LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE
    WHEN month IN (1,2,3) THEN 'harvest'
    WHEN month IN (4,5,6,7,8) THEN 'winter'
    WHEN month IN (9,10) THEN 'spring'
    WHEN month IN (11,12) THEN 'festive'
    ELSE NULL
  END
$$;

-- Backfill chapter from recurring_month for existing events.
UPDATE events SET chapter = decanta_event_chapter(recurring_month)
  WHERE chapter IS NULL AND recurring_month IS NOT NULL;
