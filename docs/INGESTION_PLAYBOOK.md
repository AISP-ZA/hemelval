# Decanta — Data Ingestion Playbook

> Companion to `docs/SOURCES.md`. This document defines **exactly how each
> authoritative source maps to database tables and fields**, and the concrete
> ingestion steps with code patterns.
>
> **Rule of law:** No data enters the database unless it traces to a source in
> `SOURCES.md` and follows the mapping in this playbook. Unverifiable fields are
> marked `is_verified = false` and `data_source = 'unverified'`.

---

## Schema → Source field map

Every column in the `estates` table, mapped to its authoritative source.

### Identity & contact (priority: estate website → wine.co.za → Platter's)

| Column | Primary source | Fallback | Notes |
|---|---|---|---|
| `estate_name` | Estate website | wine.co.za, Platter's | Official trading name |
| `legal_name` | SAWIS / CIPC registry | Platter's | Registered company name |
| `slug` | Derived: `estate_name` → kebab-case | — | Unique, URL-safe |
| `website` | Estate website | wine.co.za | Canonical URL |
| `email` | Estate website | WoSA route directory | Public contact email |
| `phone` | Estate website | wine.co.za | Tasting room line |
| `facebook`, `instagram`, `linkedin`, `youtube` | Estate website footer | — | Social handles |

### Location (priority: Wikipedia GPS → estate website → Google Maps)

| Column | Primary source | Fallback | Notes |
|---|---|---|---|
| `address` | Estate website | wine.co.za | Physical street address |
| `city` | Estate website | wine.co.za | |
| `province` | WoSA | — | Default: `Western Cape` |
| `postcode` | Estate website | — | |
| `latitude`, `longitude` | **Wikipedia** (GPS coords per winery) | Google Maps geocoding | **Best free source** |
| `google_maps_url` | Google Maps | — | Place ID URL |

### Wine classification (priority: WoSA → SAWIS)

| Column | Primary source | Fallback | Notes |
|---|---|---|---|
| `region` | WoSA | SAWIS | WO region (e.g., Coastal, Breede River Valley) |
| `district` | WoSA | SAWIS | WO district (e.g., Stellenbosch, Paarl) |
| `ward` | WoSA | SAWIS | WO ward (e.g., Simonsberg-Stellenbosch) |
| `wine_route` | WoSA route directory | wine.co.za | Route name |
| `wine_route_id` | FK to `wine_routes` table | — | Linked after route lookup |

### Production (priority: estate website → SAWIS)

| Column | Primary source | Fallback | Notes |
|---|---|---|---|
| `year_established` | Estate website history page | Platter's | Founding year |
| `currently_producing` | SAWIS registry | Estate website | Default: `true` |
| `estate_size_ha` | Estate website | SAWIS | Total farm size |
| `vineyard_size_ha` | Estate website | SAWIS | Planted vine area |

### Facilities (priority: estate website → wine.co.za → WoSA)

| Column | Primary source | Fallback | Notes |
|---|---|---|---|
| `restaurant` | Estate website | wine.co.za | Boolean |
| `accommodation` | Estate website | wine.co.za | Boolean |
| `wedding_venue` | Estate website | — | Boolean |
| `conference_facilities` | Estate website | — | Boolean |
| `family_friendly` | Estate website | — | Boolean |
| `pet_friendly` | Estate website | — | Boolean |
| `wheelchair_access` | Estate website | — | Boolean |
| `tasting_room` | Estate website | wine.co.za | Boolean |
| `cellar_tours` | Estate website | — | Boolean |
| `picnic` | Estate website | — | Boolean |
| `cycling`, `running`, `hiking` | Estate website | — | Boolean |
| `live_music` | Estate website | wine.co.za events | Boolean |
| `market` | Estate website | — | Boolean |
| `events_venue` | Estate website | — | Boolean |

### Certifications & sustainability

| Column | Primary source | Fallback | Notes |
|---|---|---|---|
| `organic` | IPW / estate website | — | Boolean |
| `biodynamic` | Demeter / estate website | — | Boolean |
| `sustainable` | IPW certification | — | Boolean |
| `certifications` (text[]) | IPW, WIETA, OVP, BWI registries | Estate website | Array of cert slugs |

### Visitor info

| Column | Primary source | Fallback | Notes |
|---|---|---|---|
| `opening_hours` | Estate website | wine.co.za | JSONB: `{ "mon": "10:00-16:00", ... }` |
| `booking_required` | Estate website | — | Boolean |
| `price_range` | Estate website | Wine-Searcher | Text: `budget` / `mid` / `premium` / `luxury` |

### Ratings

| Column | Primary source | Fallback | Notes |
|---|---|---|---|
| `rating` | Aggregated from tasting_notes | Platter's star rating | 0–5 scale |
| `tripadvisor` | TripAdvisor API | — | URL |
| `google_rating` | Google Places API | — | 0–5 scale |
| `google_reviews` | Google Places API | — | Review count |

### Content & media

| Column | Primary source | Fallback | Notes |
|---|---|---|---|
| `description` | Estate website | Wineries.co.za narrative | Short summary |
| `history` | Estate website history page | This Day in Wine History | Full founding story |
| `winemaker` | Estate website | Platter's | Current head winemaker |
| `owner` | Estate website | SAWIS | Owner / owning family |
| `about` | Estate website | Wineries.co.za | Editorial description |
| `famous_for` | Estate website | wine.co.za | Comma-separated varietals/styles |
| `logo_url` | Estate website | Wikimedia Commons | |
| `cover_image_url` | Estate website | **Wikimedia Commons** (free) | |
| `is_verified` | Set `true` only after manual verification | — | Default: `false` |
| `data_source` | Track origin: `wine.co.za`, `wikipedia`, `platters`, `estate-website`, `manual` | — | |

---

## Wines table → Source field map

| Column | Primary source | Fallback |
|---|---|---|
| `name` | Estate website | wine.co.za |
| `slug` | Derived | — |
| `type` | Wine-Searcher | wine.co.za |
| `varietals` (text[]) | Estate website / SAWIS label | wine.co.za |
| `vintage` | Bottle label | SAWIS A-number lookup |
| `avg_stars` | Winemag.co.za ratings | TopWineSA |
| `rating_count` | Winemag.co.za | Platter's |
| `price_zar` | Wine-Searcher | Estate website shop |
| `about` | Estate website | wine.co.za tasting note |
| `pairings` (text[]) | @kelder/engine `suggestPairings()` | — |
| `serving_temp` | @kelder/engine varietal data | Wine Folly |
| `bottle_image_url` | Estate website shop | wine.co.za bottle shot |
| `wo_certification_number` | **SAWIS** A-number lookup | Bottle label |
| `estates(name)` | FK via `estate_id` | — |

---

## Ingestion phases

### Phase A — Free seed expansion (P0, no licensing needed)

**Goal:** 151 → ~550–650 estates. Run these in parallel.

#### A1. Wikipedia winery list (geocoding + estate identity)

```
Source: https://en.wikipedia.org/wiki/List_of_wineries_in_South_Africa
Method:  Scrape the wiki table → extract name + GPS coordinates + region
Yield:   ~200–300 new estates with lat/long
Fields:  estate_name, slug, latitude, longitude, region, province
```

Script pattern (Node.js, run locally):
```javascript
// Pseudocode — actual script in scripts/ingest/wikipedia.ts
const response = await fetch(wikipediaApiUrl);
const wineries = parseWikiTable(response); // extract name, coords
for (const w of wineries) {
  const slug = slugify(w.name);
  // Check if estate already exists by slug
  const existing = await supabase.from('estates').select('id').eq('slug', slug).maybeSingle();
  if (!existing.data) {
    await supabase.from('estates').insert({
      estate_name: w.name, slug, latitude: w.lat, longitude: w.lng,
      region: w.region, province: 'Western Cape',
      data_source: 'wikipedia', is_verified: false
    });
  }
}
```

#### A2. wine.co.za (structured winery + wine data)

```
Source: https://wine.co.za/
Method:  Scrape winery finder pages + wine finder pages
Yield:   Enrich existing estates + ~200 new estates; ~500+ wines
Fields:  estates.* (contact, hours, facilities, images), wines.* (name, type, price, image)
```

**Polite scraping rules:**
- Respect `robots.txt` (check `https://wine.co.za/robots.txt`)
- Rate limit: 1 request / 2 seconds (use `await sleep(2000)`)
- Cache responses to `/tmp/wine-co-za-cache/`
- User-Agent: `DecantaBot/1.0 (research; contact@decanta.co.za)`

#### A3. Wineries.co.za (narrative enrichment)

```
Source: https://www.wineries.co.za/
Method:  Scrape farm profile pages for "story" / "about" text
Yield:   history, about, description for ~300 estates
Fields:  estates.about, estates.history, estates.description
```

#### A4. Wikimedia Commons (legally-safe image bulk ingest)

```
Source: https://commons.wikimedia.org/wiki/Category:Wineries_in_South_Africa
Method:  Wikimedia API → list category files → download originals
Yield:   cover_image_url for ~50–100 estates
Fields:  estates.cover_image_url, estates.logo_url (where available)
Licence: CC-BY-SA / Public Domain (safe for commercial use)
```

Script pattern:
```javascript
// scripts/ingest/wikimedia-images.ts
const API = "https://commons.wikimedia.org/w/api.php";
// 1. List all files in the category
const files = await listCategoryFiles("Wineries_in_South_Africa");
// 2. For each file, get metadata + image URL
for (const file of files) {
  const meta = await getFileMetadata(file.title);
  // 3. Match to estate by filename (e.g., "Groot_Constantia_manor_house.jpg" → groot-constantia)
  const estateSlug = matchFilenameToEstate(file.title);
  if (estateSlug) {
    await supabase.from('estates').update({ cover_image_url: meta.url })
      .eq('slug', estateSlug);
  }
}
// 4. Upload originals to Supabase Storage for CDN delivery
```

#### A5. Winemag.co.za ratings

```
Source: https://winemag.co.za/winemag-ratings/
Method:  Scrape ratings database (12,500+ entries)
Yield:   avg_stars, rating_count for existing wines; ~200 new wine records
Fields:  wines.avg_stars, wines.rating_count, wines.critic_score
```

### Phase B — Enrichment (P1, manual / editorial)

#### B1. Flagship story farms (6 farms, manual seed)

Source the `history` and `about` narratives from the §4 articles. These get
`is_verified = true` and full editorial treatment.

```sql
-- Example: Seven Sisters
INSERT INTO estates (estate_name, slug, region, /* ... */)
VALUES (
  'Seven Sisters',
  'seven-sisters',
  'Stellenbosch',
  'Vivian Kleynhans',      -- owner
  true,                    -- is_verified
  'manual-story',          -- data_source
  /* history: sourced from SHU Food Research article */
  'The seven Bruwer sisters, descendants of farmworkers ...'
);
```

#### B2. 2026 events calendar expansion

Scrape the §3 event sources. Deduplicate by event name + month. Target: +20 events
to reach 60+ total.

#### B3. Sustainability certification linkage

Cross-reference IPW / WIETA / OVP public registries against existing estates.
Update the `certifications` array and sustainability booleans.

### Phase C — Licensed data (P2, requires partnership)

#### C1. Platter's data partnership

```
Source:    https://www.wineonaplatter.com
Yield:     +700 estates (900+ total), 8,000+ wines
Access:    Paid subscription or data-licensing agreement
Trigger:   After MVP validation / first 1,000 users
Fields:    estates.* (all 60+ fields at editorial quality), wines.*, awards.*
```

#### C2. SAWIS membership

```
Source:    https://www.sawis.co.za
Yield:     WO provenance data, A-number certification verification
Access:    Industry membership
Trigger:   When scan/verify feature needs authentication layer
Fields:    wines.wo_certification_number, wines.region (official WO), estates.certifications
```

---

## Deduplication strategy

When ingesting from multiple sources, deduplicate by:

1. **Slug match** (primary): `estate_name` → `slugify()` → compare to existing slugs
2. **Fuzzy name match** (secondary): Levenshtein distance < 3 on normalised names
3. **Geo proximity** (tertiary): lat/long within 500m of existing estate

```javascript
// Dedup helper
function findDuplicate(estate, existingEstates) {
  // 1. Exact slug match
  const slugMatch = existingEstates.find(e => e.slug === estate.slug);
  if (slugMatch) return { match: slugMatch, method: 'slug' };

  // 2. Fuzzy name match
  const normalised = estate.estate_name.toLowerCase().replace(/[^a-z0-9]/g, '');
  const nameMatch = existingEstates.find(e => {
    const existing = e.estate_name.toLowerCase().replace(/[^a-z0-9]/g, '');
    return levenshtein(normalised, existing) < 3;
  });
  if (nameMatch) return { match: nameMatch, method: 'fuzzy-name' };

  // 3. Geo proximity
  if (estate.latitude && estate.longitude) {
    const geoMatch = existingEstates.find(e =>
      e.latitude && haversine(estate.latitude, estate.longitude, e.latitude, e.longitude) < 0.5
    );
    if (geoMatch) return { match: geoMatch, method: 'geo' };
  }

  return null;
}
```

---

## Quality rules

| Rule | Enforcement |
|---|---|
| No fabricated data | If a field cannot be sourced, leave it `NULL` — never guess |
| Mark unverifiable | `is_verified = false`, `data_source = 'unverified'` |
| No PII in logs | Tasting notes / user data never logged in ingestion scripts |
| POPIA compliance | No personal information collected from sources without consent |
| Image licensing | Only Wikimedia Commons (CC) or estate-permissioned images; never stock for named estates |
| Currency | All prices in ZAR; note the year of the price |

---

## Reconciliation checkpoints

After each ingestion phase, run a reconciliation:

```bash
# Check current state
curl https://vlbqrvynpmuzktpxhkjt.supabase.co/rest/v1/estates?select=id \
  -H "apikey: $ANON_KEY" | jq length

# Expected milestones:
# Phase A1 (Wikipedia):     ~350 estates
# Phase A2 (wine.co.za):    ~550 estates
# Phase C1 (Platter's):     ~900 estates
```

Update `docs/SOURCES.md` "Last reconciled" date and DB state after each phase.
