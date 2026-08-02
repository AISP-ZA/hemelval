# Kelder

> South-Africa-first wine app. Snap a bottle, log your tasting, build your palate, discover Western Cape wine farms.

Kelder is a mobile-first (iOS + Android) wine app built exclusively for South African wine — the estates, varietals, regions, awards, and wine-route culture of the Western Cape. It is the connection point between wine lovers (consumers) and wine farmers.

## What it does

- **Scan & log** — photograph a bottle, scan its barcode/QR, and record it as tasted.
- **Build your palate** — structured tasting notes (nose, palate, finish) using WSET/Noble-Wheel vocabularies. The app learns what you love.
- **Discover** — personalized recommendations based on your tasting history (the more you log, the smarter it gets).
- **Explore estates** — every Western Cape wine farm: history, terroir, varietals, certifications, awards, wine-route membership.
- **Cellar** — track bottles you own, drinking windows, ageability.
- **Events** — a calendar of SA wine festivals (Stellenbosch Wine Festival, Robertson Wacky Wine, Hemel-en-Aarde Pinot Celebration, and more).

## Monetization (two-sided)

| Side | Model |
|---|---|
| **Consumer** | Free (scan, rate, palate, cellar, basic recs) + **Pro** (R89/mo: unlimited scans, palate analytics, ageability tracking, ad-free, early AI features) |
| **Estate** | Verified B2B SaaS (R499–R1499/mo by size): editable profile, wine catalog, event listings, anonymized regional palate analytics |
| *Phase 2* | Marketplace: wine-sales commission (payments + liquor-licensing + fulfilment) |

## Tech

- **Mobile:** Expo SDK 53 + React Native + TypeScript → iOS + Android via EAS Build.
- **Backend:** Supabase (Postgres + Auth + Storage + Row-Level Security).
- **Admin:** Next.js merchant portal for wine farms.
- **Engine:** `@kelder/engine` — WSET SAT + Noble Aroma Wheel controlled vocabularies, scoring, food-pairing logic.
- **Data:** every Western Cape estate, WO appellation, SA varietal, local award body, and wine festival seeded.

## Run

```bash
cd apps/mobile
npm install
npx expo start        # press w for web preview, i for iOS sim, a for Android
```

Tests: `npm test` from `packages/engine` and `apps/mobile`.

## Structure

```
kelder/
├─ apps/mobile/        Expo RN app (the consumer product)
├─ apps/admin/         Next.js estate portal (B2B)
├─ packages/engine/    Tasting vocabularies + scoring (the "tasting engine")
├─ packages/shared/    Shared TS types
├─ packages/supabase/  Client + RLS helper
├─ supabase/           SQL migrations + seed data (Western Cape estates, festivals)
└─ docs/               SPEC, project plan, brand notes
```

## Status

Building. Research complete; design system ported; schema + seed data + mobile screens in progress.

---

*Brand: Kelder (Afrikaans: "cellar"). Built to AISP standards. DESIGN.md is the visual source of truth.*
