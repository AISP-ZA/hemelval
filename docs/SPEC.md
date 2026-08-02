# Kelder — Specification

> South-Africa-first wine app. The connection point between Western Cape wine farms and the people who love their wine.

## 1. Vision

Kelder is a mobile-first (iOS + Android) wine app built exclusively for South African wine. Where Vivino is global and generic, Kelder is deep on the Western Cape: every estate, every WO appellation, the SA signature grapes (Chenin Blanc, Pinotage, MCC), local award bodies (Platter's, Veritas, Tim Atkin), and SA wine-route culture.

The app lets a consumer **scan a bottle, log a structured tasting, build a palate profile, and receive personalized recommendations** — while giving wine farms a verified, editable presence and anonymized demand analytics. It is two-sided by design: the consumer side creates the network; the estate side is the revenue.

## 2. Goals (success criteria)

| # | Goal | Metric |
|---|---|---|
| G1 | Ship to App Store + Google Play | Two approved native binaries (EAS Build) |
| G2 | Build the SA wine database | ≥200 estates, all WO appellations, all SA varietals, ≥10 years of vintage reports |
| G3 | Personalized palate engine | "Match for you" score (0–100) that beats cold-start 50 after ≥5 rated wines |
| G4 | Bottle/label scan that works | Camera → recognition → wine detail → tasting log, on-device + cloud |
| G5 | Two-sided monetization | Consumer Pro (R89/mo) + Estate SaaS (R499–1499/mo) live |
| G6 | Wine-events calendar | All major SA festivals seeded, kept current |

## 3. Stakeholders & personas

| Persona | Need | Kelder delivers |
|---|---|---|
| **The explorer** (consumer, casual) | "Will I like this bottle?" | Match score, crowd + expert ratings, food pairing |
| **The collector** (consumer, serious) | "What's in my cellar, when to drink it" | Cellar tracker, ageability, drinking windows |
| **The wine farm** (estate) | "Reach engaged local drinkers; understand demand" | Verified profile, catalog CMS, regional palate analytics |
| **The wine route / festival** (event org) | "Sell tickets, list participants" | Event listings, ticket deep-links |

## 4. Functional scope (MVP → Phase 2)

### MVP (what is built)
- **Scan** — camera capture of label / barcode / QR; demo-mode match flow wired.
- **Discover** — browse/search wines; signature-varietal shortcuts; top-rated; per-region.
- **Wine detail** — full metadata: estate, varietals, ABV, vintage, serving temp, food pairings, awards.
- **Tasting log** — structured note (WSET/Noble-Wheel vocab) + 5-star rating + free text.
- **Cellar** — owned-bottle tracker + tasting journal.
- **Events** — SA wine-festival calendar (Wine Town, Wacky Wine, Hemel Pinot, etc.).
- **Profile** — palate summary + Pro upsell.
- **Palate engine** — `@kelder/engine`: controlled vocabularies, scoring, food pairing, match-score.

### Phase 2 (designed, not yet built)
- Live Supabase auth + RLS-backed persistence (schema is ready; mock data used in MVP demo).
- On-device label recognition (TFLite / Apple Vision) + cloud fallback.
- Marketplace: wine-purchase commission (payments + liquor-licensing + fulfilment).
- AI sommelier chat (GLM/Gemini-backed).
- Merchant admin (Next.js) — estate profile + catalog CMS + analytics.

### Out of scope (explicit)
- Non-SA wines (this is the differentiation; never add Bordeaux/Napa).
- Light mode (DESIGN.md: dark canvas only).
- A separate web consumer app (mobile is the product; web is merchant admin only).

## 5. Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  apps/mobile   Expo RN (iOS + Android)                      │
│   ├── theme/     AISP DESIGN.md tokens (dark, pill, hairline)│
│   ├── components/ primitives (Eyebrow, Card, Button, Chip)   │
│   ├── screens/   Discover, Scan, Cellar, Events, Profile     │
│   └── lib/       supabase client + mock data layer           │
├─────────────────────────────────────────────────────────────┤
│  apps/admin    Next.js (merchant portal — Phase 2)           │
├─────────────────────────────────────────────────────────────┤
│  packages/engine   @kelder/engine                            │
│   WSET/Noble-Wheel vocab · scoring · pairing · palate model  │
│  packages/shared   @kelder/shared (TS types)                 │
├─────────────────────────────────────────────────────────────┤
│  supabase/      Postgres schema + RLS + seed data            │
│   15 tables · public catalog + private user data             │
└─────────────────────────────────────────────────────────────┘
         ▲
         │ EAS Build → App Store + Google Play binaries
```

**Stack rationale (vs AISP standard):** The AISP standard stack is web-only (Next.js + Vercel). Kelder's primary requirement is a native iOS + Android App Store app, which mandates a deviation. Expo + React Native was chosen because: (1) one TS codebase → both platforms (principle #1 lowest cost), (2) native camera/QR/push (principle #3 quality), (3) industry consensus for cross-platform in 2026 (principle #5), (4) shares Supabase + `@kelder/engine` with the Next.js admin (principle #10 ecosystem). This is a documented, CEO-approved deviation per STANDARDS.md §13.

## 6. Data model (summary — full DDL in `supabase/migrations/0001_init.sql`)

| Entity | Purpose | Key fields |
|---|---|---|
| `wo_appellations` | WO hierarchy (unit→region→district→ward) | name, level, parent_id |
| `varietals` | SA grape knowledge | slug, type, is_signature, typical_aromas |
| `estates` | Wine farms | name, appellation, wine_route, is_verified, certifications |
| `certifications` | WO/IPW/WIETA/OVP/ROC/BWI/Fairtrade stamps | code, name |
| `wines` | Wine catalog | estate, type, blend_type, avg_stars, barcode |
| `wine_varietals` | Wine ↔ varietal (% for blends) | wine_id, varietal_id, percentage |
| `vintages` | Year-specific bottles | year, abv, drink_window, harvest_note |
| `awards` + `award_bodies` | Platter/Veritas/Atkin/DWWA/IWSC | result, year |
| `profiles` | Consumer profile | is_pro, palate_profile (cached) |
| `tasting_notes` | Structured review | stars, appearance/nose/palate/conclusions JSONB |
| `cellar_items` | Owned bottles | quantity, bin_location |
| `wishlist` | Saved wines | — |
| `events` + `event_estates` | Festivals + participants | starts_at, ticket_url, format |
| `vintage_reports` | Drought/rainfall year context | quality_note, weather_summary |

**Security:** every user-data table has RLS enabled. Catalog tables are public-read (browse SA wines anonymously); user tables (profiles, tasting_notes, cellar, wishlist) are owner-only (with tasting_notes also public-read for community ratings). The `service_role` key is server-only, never in client code.

## 7. The tasting engine (`@kelder/engine`)

The engine is the app's "thought engine" — a pure-TypeScript package with zero dependencies, fully unit-tested (13 tests, all passing). It encodes:

- **Controlled vocabularies** — 80+ aroma descriptors from the Ann Noble Wine Aroma Wheel (3-tier, including SA-specific `fynbos` floral); WSET SAT palate scales (sweetness, acidity, tannin level+nature, body, finish, texture); wine-type taxonomy; MCC dosage levels.
- **Scoring** — 5-star ↔ 100-point ↔ 20-point conversions; `isValidStars`, `averageStars`.
- **Food pairing** — `suggestPairings(type, varietal)` returns ranked pairing tags, including SA-specific (braai, bobotie, malva, milk tart).
- **Serving temperature** — per-type ranges (sparkling 3–8°C → fortified 14–18°C).
- **SA varietal knowledge** — 19 varietals with character notes, typical aromas, regions; alias resolution (Steen → Chenin Blanc).
- **Palate profile + recommendations** — `buildPalateProfile()` aggregates a user's notes into top types/descriptors/varietals + modal preferences; `matchScore()` returns a 0–100 "Match for you" score, cold-start-friendly (needs ≥5 notes to stabilize).

## 8. Business model (two-sided)

| Stream | Source | Pricing | Phase |
|---|---|---|---|
| **Consumer — Free** | Everyone | R0 (scan, rate, palate, cellar, basic recs) | MVP |
| **Consumer — Pro** | Engaged users | **R89/mo** (unlimited scans, palate analytics, ageability, ad-free, early AI) | MVP (upsell) |
| **Estate — Verified SaaS** | Wine farms | **R499/mo** (small, ≤20 wines) · **R999/mo** (mid) · **R1499/mo** (large, analytics API) | Phase 2 |
| Marketplace commission | Wine sales | 8–12% per sale | Phase 3 (deferred — needs payments + liquor licensing + fulfilment) |

**Why this over Vivino's model:** Vivino's weaknesses (from research) are exactly where Kelder wins — (1) Vivino is US/EU-centric with poor SA coverage; (2) Vivino ratings skew to international palates with no expert overlay; (3) Vivino's B2B estate tools are generic. Kelder is SA-deep, weights local critic scores, and gives estates anonymized regional palate demand they can't get anywhere else.

## 9. Design — AISP DESIGN.md compliance

The app is built code-first to the AISP brand spec. Non-negotiables enforced in `theme/tokens.ts` + `components/`:
- **Dark canvas only** (`#0a0a0a`). No light mode.
- **Pill geometry** (`radius.pill = 9999`) on every interactive element.
- **Hairline borders carry elevation.** NO drop shadows on cards.
- **Display weight 400**, negative tracking (`-2.4px` on display-xl).
- **GeistMono uppercase eyebrows** on every section.
- **Telemetry accents** (green = active, red = blocked) + Kelder brand accents (dusk `#7c3aed`, sunset `#ff7a17`) for wine hero moments.

## 10. Constraints & risks

| Risk | Mitigation |
|---|---|
| Label-recognition accuracy | Start with barcode/QR (deterministic); add cloud label-match; on-device TFLite later |
| Liquor-licensing for marketplace | Defer marketplace to Phase 3; MVP is catalog + ratings only (no sale) |
| POPIA compliance | Supabase RLS; anon auth for browsing; no PII in logs; payments never touch our servers |
| Data acquisition for estates | Seed from public wine-route bodies; estates self-onboard via admin (Phase 2) |
| App Store review (alcohol) | Kelder doesn't sell alcohol in MVP — it's a catalog/ratings app. Reviewer-friendly. |

## 11. Sources

Full citation list in `docs/SOURCES.md`. Key references: WOSA, SAWIS, Wine & Spirit Board, Platter's SA Wine Guide, Tim Atkin MW, Wine Anorak, Noble Wine Aroma Wheel (UC Davis), WSET SAT, Wine Folly, Decanter, Jancis Robinson, and the wine-route bodies (wineroute.co.za, winetram.co.za, constantiawineroute.com, robertsonwinevalley.com, etc.).
