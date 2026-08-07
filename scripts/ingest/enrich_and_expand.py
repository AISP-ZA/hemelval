#!/usr/bin/env python3
"""
Hemelval DB Ingestion & Backfill Script

This script does TWO things:
1. BACKFILL: Updates the existing 151 estates with missing data (region, wine_route,
   tasting_room, restaurant, founded_year, etc.) from the batch research data.
2. EXPAND: Inserts new producers from the batch research that don't already exist.

Data sources (from docs/SOURCES.md):
- Batch 1 research (Stellenbosch/Franschhoek/Paarl ~170 producers)
- Batch 2 research (Swartland/Hemel-en-Aarde/Elgin/etc ~170 producers)
- Batch 3 research (Robertson/Worcester/Klein Karoo/garagistes ~160 producers)

Usage:
  python3 scripts/ingest/enrich_and_expand.py [--dry-run]
"""

import json
import os
import sys
import re
import urllib.request
import urllib.parse

# ── Config ──────────────────────────────────────────────────────────────
ENV_FILE = "apps/mobile/.env.local"

def load_env():
    env = {}
    with open(ENV_FILE) as f:
        for line in f:
            if '=' in line and not line.strip().startswith('#'):
                k, v = line.strip().split('=', 1)
                env[k] = v
    return env

env = load_env()
SB_URL = env['EXPO_PUBLIC_SUPABASE_URL']
SB_KEY = env['EXPO_PUBLIC_SUPABASE_ANON_KEY']

# ── Helpers ─────────────────────────────────────────────────────────────

def slugify(name):
    """Convert estate name to URL-safe slug."""
    slug = name.lower().strip()
    # Replace common patterns
    slug = re.sub(r'&', 'and', slug)
    slug = re.sub(r"'", '', slug)  # Remove apostrophes
    slug = re.sub(r'[^a-z0-9]+', '-', slug)
    slug = slug.strip('-')
    return slug

def levenshtein(a, b):
    """Simple Levenshtein distance for fuzzy name matching."""
    if a == b: return 0
    if not a: return len(b)
    if not b: return len(a)
    prev = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        curr = [i]
        for j, cb in enumerate(b, 1):
            curr.append(min(
                prev[j] + 1,         # deletion
                curr[-1] + 1,        # insertion
                prev[j-1] + (ca != cb)  # substitution
            ))
        prev = curr
    return prev[-1]

def normalise_name(name):
    """Normalise estate name for fuzzy matching."""
    n = name.lower()
    n = re.sub(r'[^a-z0-9]', '', n)
    return n

def supabase_request(method, path, body=None):
    """Make an authenticated Supabase REST API request."""
    url = f"{SB_URL}/rest/v1/{path}"
    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(url, data=data, method=method, headers={
        "apikey": SB_KEY,
        "Authorization": f"Bearer {SB_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation" if method in ("POST", "PATCH") else "",
    })
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read()) if resp.status != 204 else []
    except urllib.error.HTTPError as e:
        err_body = e.read().decode()
        print(f"  ERROR [{e.code}]: {err_body[:200]}")
        return None
    except Exception as e:
        print(f"  ERROR: {e}")
        return None

# ── Batch research data ────────────────────────────────────────────────
# Consolidated from the 3 background research agents.
# Each entry has: name, slug, region, district, ward, wine_route, website,
#                 founded_year, famous_for, tasting_room, restaurant, about

BATCH_RESEARCH = []
# (Data is loaded from data/batch_research.json — populated by the consolidation script)

def load_batch_research():
    """Load consolidated batch research data from JSON file."""
    path = "data/batch_research.json"
    if os.path.exists(path):
        with open(path) as f:
            return json.load(f)
    return []

# ── Main pipeline ──────────────────────────────────────────────────────

def fetch_existing_estates():
    """Fetch all existing estates from Supabase."""
    print("Fetching existing estates from Supabase...")
    estates = []
    offset = 0
    while True:
        path = f"estates?select=id,slug,estate_name,region,wine_route,latitude,longitude,tasting_room,restaurant,pet_friendly,family_friendly,founded_year,about,history,winemaker,website_url,data_source&order=estate_name&limit=100&offset={offset}"
        batch = supabase_request("GET", path)
        if not batch or len(batch) == 0:
            break
        estates.extend(batch)
        if len(batch) < 100:
            break
        offset += 100
    print(f"  Found {len(estates)} existing estates")
    return estates

def find_duplicate(research_entry, existing_estates):
    """Find if a research entry already exists in the DB (by slug or fuzzy name)."""
    slug = research_entry.get('slug') or slugify(research_entry['name'])

    # 1. Exact slug match
    for e in existing_estates:
        if e['slug'] == slug:
            return e, 'slug'

    # 2. Fuzzy name match
    target = normalise_name(research_entry['name'])
    for e in existing_estates:
        existing = normalise_name(e['estate_name'])
        if target == existing:
            return e, 'name-exact'
        # Also check if one contains the other (for abbreviated names)
        if len(target) > 5 and len(existing) > 5:
            if target in existing or existing in target:
                return e, 'name-substring'
        if levenshtein(target, existing) < 3:
            return e, 'fuzzy-name'

    return None, None

def build_update_payload(research, existing):
    """Build an update payload with only the fields that are missing in the existing record."""
    updates = {}

    # Region (currently 0% populated)
    if not existing.get('region') and research.get('region'):
        updates['region'] = research['region']

    # Wine route (currently 0% populated)
    if not existing.get('wine_route') and research.get('wine_route'):
        updates['wine_route'] = research['wine_route']

    # District
    if not existing.get('district') and research.get('district'):
        updates['district'] = research['district']

    # Ward
    if not existing.get('ward') and research.get('ward'):
        updates['ward'] = research['ward']

    # Founded year (currently 36% populated)
    if not existing.get('founded_year') and research.get('founded_year'):
        updates['founded_year'] = research['founded_year']

    # Tasting room
    if not existing.get('tasting_room') and research.get('tasting_room'):
        updates['tasting_room'] = True

    # Restaurant
    if not existing.get('restaurant') and research.get('restaurant'):
        updates['restaurant'] = True

    # Famous for (enrich if present in research)
    if not existing.get('famous_for') and research.get('famous_for'):
        updates['famous_for'] = research['famous_for']

    # Website (backfill if missing)
    if not existing.get('website_url') and research.get('website'):
        updates['website_url'] = research['website']

    # About (enrich if research has a better one)
    if research.get('about') and len(research.get('about', '')) > len(existing.get('about') or ''):
        updates['about'] = research['about']

    # Data source — track that we enriched
    updates['data_source'] = 'hemelval-research+batch'

    return updates if len(updates) > 1 else None  # >1 because data_source is always set

def build_insert_payload(research):
    """Build a new estate insert payload from research data."""
    slug = research.get('slug') or slugify(research['name'])
    return {
        'estate_name': research['name'],
        'slug': slug,
        'region': research.get('region'),
        'district': research.get('district'),
        'ward': research.get('ward'),
        'wine_route': research.get('wine_route'),
        'founded_year': research.get('founded_year'),
        'tasting_room': research.get('tasting_room', False),
        'restaurant': research.get('restaurant', False),
        'famous_for': research.get('famous_for'),
        'about': research.get('about', ''),
        'website_url': research.get('website'),
        'province': 'Western Cape' if not research.get('region') or 'Cape' in str(research.get('region', '')) or research.get('region') in [
            'Stellenbosch', 'Franschhoek', 'Paarl', 'Swartland', 'Hemel-en-Aarde',
            'Constantia', 'Durbanville', 'Elgin', 'Bot River', 'Darling',
            'Tulbagh', 'Robertson', 'Worcester', 'Klein Karoo',
        ] else research.get('region', ''),
        'is_verified': False,
        'currently_producing': True,
        'data_source': 'batch-research',
    }

def run(dry_run=False):
    print("=" * 70)
    print("HEMELVAL DB INGESTION & BACKFILL")
    print("=" * 70)
    if dry_run:
        print("  ** DRY RUN — no changes will be written **")
    print()

    # Load research data
    research_data = load_batch_research()
    print(f"Loaded {len(research_data)} research entries from data/batch_research.json")
    if not research_data:
        print("ERROR: No batch_research.json found. Run the consolidation script first.")
        sys.exit(1)
    print()

    # Fetch existing estates
    existing = fetch_existing_estates()
    existing_slugs = {e['slug'] for e in existing}
    print()

    # Phase 1: BACKFILL existing estates
    print("-" * 70)
    print("PHASE 1: BACKFILL existing estates with missing data")
    print("-" * 70)
    backfill_count = 0
    skipped = 0

    for r in research_data:
        match, method = find_duplicate(r, existing)
        if match:
            updates = build_update_payload(r, match)
            if updates:
                backfill_count += 1
                if dry_run:
                    print(f"  [UPDATE] {match['estate_name']} (matched by {method})")
                    for k, v in updates.items():
                        if k != 'data_source':
                            print(f"    {k}: {str(v)[:60]}")
                else:
                    result = supabase_request("PATCH", f"estates?slug=eq.{match['slug']}", updates)
                    if result is not None:
                        print(f"  [OK] Updated {match['slug']}: {len(updates)-1} fields")
                    else:
                        print(f"  [FAIL] {match['slug']}")
            else:
                skipped += 1
        else:
            skipped += 1

    print(f"\n  Backfill: {backfill_count} estates updated, {skipped} skipped (already complete or no match)")
    print()

    # Phase 2: EXPAND with new producers
    print("-" * 70)
    print("PHASE 2: INSERT new producers")
    print("-" * 70)
    new_count = 0
    dup_count = 0

    new_estates = []
    for r in research_data:
        match, method = find_duplicate(r, existing + new_estates)
        if match:
            dup_count += 1
        else:
            payload = build_insert_payload(r)
            new_estates.append(payload)
            new_count += 1

    print(f"  New producers to insert: {new_count}")
    print(f"  Duplicates skipped: {dup_count}")
    print()

    if new_estates and not dry_run:
        # Insert in batches of 50
        for i in range(0, len(new_estates), 50):
            batch = new_estates[i:i+50]
            result = supabase_request("POST", "estates", batch)
            if result is not None:
                print(f"  [OK] Inserted batch {i//50 + 1}: {len(batch)} estates")
            else:
                print(f"  [FAIL] Batch {i//50 + 1} failed — trying individually")
                for estate in batch:
                    result = supabase_request("POST", "estates", estate)
                    if result is None:
                        print(f"    [FAIL] {estate['slug']}")
    elif new_estates and dry_run:
        print("  Sample new estates (first 10):")
        for e in new_estates[:10]:
            print(f"    + {e['slug']:40s}  {e.get('region','?'):20s}  {e.get('founded_year','?')}")

    # Summary
    print()
    print("=" * 70)
    print("INGESTION SUMMARY")
    print("=" * 70)
    print(f"  Existing estates before:  {len(existing)}")
    print(f"  Research entries loaded:  {len(research_data)}")
    print(f"  Estates backfilled:       {backfill_count}")
    print(f"  New estates inserted:     {new_count if not dry_run else '(dry run)'}")
    print(f"  Duplicates skipped:       {dup_count}")
    print(f"  Expected total after:     {len(existing) + new_count}")
    if not dry_run:
        print()
        print("  Verify with:")
        print(f"    curl -s '{SB_URL}/rest/v1/estates?select=id' \\")
        print(f"      -H 'apikey: $KEY' -H 'Prefer: count=exact' -D - -o /dev/null")

if __name__ == "__main__":
    dry_run = "--dry-run" in sys.argv
    run(dry_run)
