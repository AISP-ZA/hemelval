# Kelder

South-Africa-first wine app (iOS + Android). Scan, rate, build a palate, discover Western Cape estates.

## Commands

From `apps/mobile`:
- dev:    `npx expo start` (port 8081; press `w` for web preview)
- build:  `npx expo export --platform web`
- test:   `npm test`
- typecheck: `npx tsc --noEmit`

From `packages/engine`:
- test:   `npm test`
- typecheck: `npx tsc --noEmit`

## Rules

- Never commit `.env` / secrets. Secrets live in `~/Documents/AISP/.secrets/keys.env`.
- Verify on local preview (Expo web on 8081) before reporting done.
- DESIGN.md owns visuals — build code-first to spec (dark canvas, pill geometry, hairline borders, weight-400 display). Do not redesign against it.
- Updates to status go in `project.yaml`, not prose.
- Log every run to `runs.jsonl`.
- **All wine data is South-Africa-focused** (Western Cape estates, WO appellations, SA varietals, local festivals).
- Tasting vocabulary comes from `packages/engine` (WSET SAT + Noble Aroma Wheel controlled vocabularies) — never invent descriptors ad hoc.
- Supabase is the sole backend. Every user-data table MUST have RLS enabled. No `service_role` key in client code.
- App Store + Play Store binaries ship via EAS Build (iOS + Android from one codebase). No Vercel deploy until CEO approves.

## Stack

Expo SDK 53 + React Native + TypeScript (mobile) · Next.js (merchant admin) · Supabase (Postgres + Auth + Storage + RLS) · `@kelder/engine` (tasting vocab + scoring) · `@kelder/shared` (types).
