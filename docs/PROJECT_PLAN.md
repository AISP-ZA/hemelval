# Kelder — Project Plan & Roadmap

> Current status: **MVP scaffold complete and verified rendering.** This plan tracks the path from here to App Store + Play Store submission.

## What's done (verified 2026-08-01)

| Deliverable | Evidence |
|---|---|
| Research (4 domains) | Vivino features+model · SA wine industry · tasting taxonomy · SA festivals — all in conversation research logs |
| Monorepo scaffold | `apps/mobile`, `apps/admin`, `packages/{engine,shared,supabase}`, `supabase/`, `docs/` |
| AISP project files | `project.yaml`, `AGENTS.md`, `README.md`, `.gitignore` |
| **Tasting engine** (`@kelder/engine`) | Vocab (Noble Wheel + WSET) · pairing · scoring · palate/match · SA varietals — **13/13 tests pass** |
| **AISP design system port** | `theme/tokens.ts` + `components/` (Eyebrow, Headline, Card, Button, Chip, Stars, MatchBadge) — DESIGN.md compliant |
| **Supabase schema** | 15 tables + RLS policies (`0001_init.sql`) |
| **SA wine seed data** | WO appellations (4-tier) · 19 varietals · 7 certifications · 7 award bodies · ~50 estates · 15 festivals · 10 vintage reports |
| **Mobile app (5 screens)** | Discover (+ wine detail) · Scan · Cellar · Events · Profile — **typechecks clean** |
| **Mock data layer** | App runs end-to-end without live Supabase |
| **Verification** | `expo export --platform web` succeeds (1.04MB bundle); HTTP 200; **renders full content in browser**; no runtime errors |

## Roadmap (phases)

### Phase 0 — MVP polish (current → next)
- [ ] Wire tasting-note flow UI (star picker + structured aroma/palate selectors using engine vocab)
- [ ] Estate detail screen (history, certifications, awards, wines, wine-route, map)
- [ ] Onboarding flow (3-screen: scan-first-prompt → palate-quiz → Pro upsell)
- [ ] Real imagery (bottle/label photos + estate cover images in mock data)
- [ ] Empty states for Cellar (new user) and Palate (cold start)
- [ ] App icon + splash screen (Kelder monogram)

### Phase 1 — Backend & auth
- [ ] Provision Supabase project `kelder-prod`
- [ ] Run `0001_init.sql` migration
- [ ] Load `0001_seed.sql`
- [ ] Swap mock data layer → live Supabase client (flip in `lib/`)
- [ ] Supabase Auth: email/password + Apple/Google sign-in
- [ ] Background job: rebuild `palate_profile` on tasting-note insert (DB function + trigger)
- [ ] Label/barcode scan → Supabase lookup (barcode index is in schema)

### Phase 2 — Merchant admin (B2B SaaS)
- [ ] Next.js merchant portal at `apps/admin`
- [ ] Estate claim flow (verify ownership → verified badge)
- [ ] Catalog CMS (CRUD wines + vintages + varietals)
- [ ] Event submission (festival + participating estates)
- [ ] Anonymized regional palate analytics dashboard
- [ ] Stripe/PayFast subscription (R499/999/1499 tiers via `@aisp/payments`)

### Phase 3 — App Store submission
- [ ] EAS Build config (`eas.json`): production profiles for iOS + Android
- [ ] Apple App Store: app record, screenshots, privacy nutrition labels, alcohol-content review answers
- [ ] Google Play: internal → closed → open testing → production
- [ ] Press kit + App Store copy (SA-wine-focused)
- [ ] Domain: `kelder.co.za` (ZACR registrar, Cloudflare DNS) + landing page

### Phase 4 — Marketplace (deferred)
- [ ] Payments integration (PayFast/Paystack via `@aisp/payments`)
- [ ] Liquor-licensing compliance per province
- [ ] Fulfilment partner integration (SA wine retailers / direct-from-estate)
- [ ] Commission tracking + payouts

### Phase 5 — AI & growth
- [ ] AI sommelier chat (GLM/Gemini, palate-aware)
- [ ] On-device label recognition (TFLite model trained on SA labels)
- [ ] Social features (follow tasters, share ratings)
- [ ] Wine-club subscription box (curated to palate, like Vivino's)

## Open CEO decisions (block Phase 1+)

1. **Supabase project** — provision `kelder-prod` (needs CEO Supabase access). The schema + seed SQL are ready to run.
2. **EAS / Expo org** — create the EAS project for `za.co.kelder.app` (App Store bundle ID is set in `app.json`).
3. **Domain** — register `kelder.co.za` (ZACR via HostAfrica/Domains.co.za; DNS via Cloudflare per STANDARDS §17).
4. **Payments** — confirm PayFast as the SA-primary processor for both Pro subscriptions and Estate SaaS (via `@aisp/payments`).
5. **Apple/Google developer accounts** — needed before Phase 3.

## How to resume

Any agent: open `~/Documents/AISP/projects/kelder/project.yaml`, read `next_action`, do it, update `project.yaml` + append `runs.jsonl`. The resume contract is in STANDARDS.md §16.

```bash
# Run the app locally
cd ~/Documents/AISP/projects/kelder/apps/mobile
npx expo start          # press w for web, i for iOS sim, a for Android

# Run the engine tests
cd ~/Documents/AISP/projects/kelder/packages/engine
npm test                # 13/13 pass
```
