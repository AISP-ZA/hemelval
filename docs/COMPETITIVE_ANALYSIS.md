# Decanta — Competitive Analysis

> Strategic analysis of the wine app landscape. Defines where Decanta wins,
> where it must match competitors, and where it differentiates.
>
> Source: CEO competitive research brief (2026-08-02), integrated into
> `docs/SOURCES.md` §8.

## The landscape

No single app is best at everything. Each leads in a different dimension:

```
                    DISCOVERY ←──────────────────→ COLLECTING
                         │                              │
                    ┌────┴────┐                    ┌────┴────┐
                    │ Vivino  │                    │ Cellar  │
                    │ (scale) │                    │ Tracker │
                    └────┬────┘                    │ (trust) │
                         │                         └────┬────┘
                    ┌────┴────┐                    ┌────┴────┐
                    │ Delect. │                    │  Oeni   │
                    │ (scan)  │                    │(maturity)│
                    └─────────┘                    └─────────┘
                                                    ┌─────────┐
                                                    │InVintory│
                                                    │(luxury) │
                                                    └─────────┘

    PRICE/SEARCH               AI/EDUCATION          LOCAL/HERITAGE
    ┌──────────┐               ┌──────────┐          ┌──────────┐
    │ Wine-    │               │ Sommo    │          │ Decanta │
    │ Searcher │               │ (AI)     │          │ (SA-only)│
    └──────────┘               └──────────┘          └──────────┘
```

Decanta occupies a unique position: **local/heritage depth** that no global app
can replicate, combined with AI-assisted discovery and community ratings.

---

## App-by-app analysis

### 1. Vivino — the incumbent to beat ⭐⭐⭐⭐⭐

**Scale:** 70M+ users, 16M wines, 245K wineries, millions of reviews.
**Core loop:** Scan → Rate → Discover → Buy.
**Strengths:**
- Best-in-class label scanner (computer vision at scale)
- "Match for You" personalised recommendations based on palate profile
- Community rating aggregation (crowd-sourced quality signal)
- Built-in marketplace (buy wine directly)
- 2-sided business model: consumer premium + winery SaaS

**Weaknesses (Decanta's opening):**
- Recommendations increasingly feel commerce-driven, not taste-driven
- Data quality has become inconsistent at scale — duplicate wines, wrong labels
- Boutique wineries are poorly represented — long tail is thin and inaccurate
- Over-emphasis on selling wine rather than discovery/experience
- No regional depth — a Stellenbosch estate gets the same treatment as a Napa bulk wine

**What Decanta takes from Vivino:**
- Scan → Rate → Discover core loop
- Community rating aggregation
- Palate-profile-based recommendations
- Clean card-based wine list UI

**What Decanta does differently:**
- SA-first depth: 420 estates with full histories, awards, certifications
- Provenance over commerce: WO certification, verified estate profiles
- Story-first: farmer narratives, transformation stories, heritage content
- No marketplace pressure — discovery is the product, not the funnel

---

### 2. CellarTracker — the trust benchmark ⭐⭐⭐⭐⭐

**Audience:** Serious collectors, wine professionals.
**Strengths:**
- Exceptional data quality — collectors trust it more than Vivino
- Comprehensive inventory management (bottle tracking, drinking windows)
- Professional critic review integration
- Community-driven data corrections (wikidata model)

**Weaknesses:**
- Dated, functional UI — not beautiful
- No lifestyle/experience layer
- Global focus, no regional specialisation

**What Decanta learns from CellarTracker:**
- **Data trust is the moat.** The "is_verified" flag on every estate, the WO
  provenance tracking, and the source-citation discipline in SOURCES.md are
  our equivalent of CellarTracker's community-trust model.
- Cellar management is a Pro-tier feature (Phase 2), not a Day 1 feature.

---

### 3. Wine-Searcher — the search engine ⭐⭐⭐⭐☆

**Strengths:** Fast, global price comparison. Find any bottle, anywhere.
**Weaknesses:** Zero lifestyle layer. Pure utility.

**What Decanta learns:**
- Search must be a first-class feature, not an afterthought.
- Price transparency (showing RRP, cellar-door price, retail price) builds trust.
- The REST API we built (`/v1/wines?type=&varietal=&min_rating=`) is the foundation.

---

### 4. Oeni — the premium collector app ⭐⭐⭐⭐☆

**Strengths:** Beautiful UI, maturity tracking, drinking windows, investment value.
**Audience:** Premium collectors who care about cellaring.

**What Decanta learns:**
- Premium UI craft is the bar for the Pro tier (R89/mo).
- Maturity/drink-window tracking is a valuable Pro feature.
- Investment-value visualisation appeals to the high-end segment.

---

### 5. InVintory — the luxury benchmark ⭐⭐⭐⭐☆

**Strengths:** Most beautiful cellar app. 3D cellar visualisation, luxury feel.
**Audience:** Ultra-high-net-worth collectors.

**What Decanta learns:**
- UI craft directly impacts perceived value — InVintory charges premium because
  it *feels* premium. Our Candlelit Cellar theme (Cormorant Garamond, gold accents,
  warm tobacco canvas) is the right direction.
- 3D cellar viz is a Phase 3 differentiator if we target the luxury segment.
- Estate SaaS portal should match InVintory's polish — estates paying R1,499/mo
  expect luxury-grade tools.

---

### 6. Delectable — the scanning benchmark ⭐⭐⭐⭐☆

**Strengths:** Fast, simple scanning. Good tasting journal.
**Weaknesses:** Limited social innovation beyond basics.

**What Decanta learns:**
- Scan speed is critical — Delectable's UX is sub-2-second from snap to match.
- Tasting journal simplicity matters — don't overcomplicate the note-taking flow.
- Our Tesseract.js OCR + Supabase fuzzy match is the current implementation;
  Google Vision (when deployed) will match Delectable's speed.

---

### 7. Sommo — the AI signal ⭐⭐⭐⭐☆

**Strengths:** AI-assisted education, food pairing, taste development.
**Category signal:** This is where wine apps are heading — AI as the sommelier.

**What Decanta learns:**
- AI sommelier is a Phase 2 differentiator (planned).
- Our @kelder/engine (WSET SAT + Noble Wheel + food-pairing logic) is the
  foundation — it already does structured tasting analysis and food matching.
- Adding LLM-powered conversational recommendations ("I'm braaiing lamb, what
  Swartland red should I try?") is the natural next step.
- Paired with local heritage content (no global app has SA farmer stories),
  this creates an unbeatable moat.

---

## Decanta's strategic position

```
                    GLOBAL SCALE
                         │
            Vivino ──────┼──────────────────
                         │
                    ┌────┴────┐
                    │         │
    Wine-Searcher ──┤  GAP    ├── CellarTracker
                    │         │
                    └────┬────┘
                         │
                    ┌────┴────┐
                    │ Decanta│ ← HERE: SA depth + AI + heritage
                    └─────────┘
                         │
    LOCAL DEPTH ─────────┼──────────────────
                         │
```

**Where Decanta wins (no competitor can match):**
1. SA wine estate depth — 420 producers with full histories, verified data
2. Farmer/heritage storytelling — transformation narratives, wine route context
3. WO provenance — Wine of Origin certification tracking
4. SA-localised food pairing — braai, bobotie, malva, biltong pairings
5. Wine route integration — festival calendar, cellar-door visit info

**Where Decanta must match (table stakes):**
1. Label scanning speed (Tesseract.js now, Google Vision planned)
2. Community ratings (Supabase tasting_notes + aggregation)
3. Search relevance (REST API built, needs autocomplete)
4. Palate profiling (@kelder/engine built, needs more data)

**Where Decanta differentiates (future moat):**
1. AI sommelier — conversational recommendations with local context
2. Estate SaaS portal — wineries self-manage their profiles
3. Cellar-door booking integration — book tastings directly
4. Wine route trip planning — plan a day/weekend around estates

---

## Capability leaderboard

| Capability | Current leader | Decanta's play |
|---|---|---|
| Label Scanner | Vivino | Match (Tesseract.js → Google Vision) |
| Cellar Management | CellarTracker | Phase 2 Pro feature |
| Luxury Design | InVintory | Tier 1 design upgrade in progress |
| Price Comparison | Wine-Searcher | REST API built; retailer integration Phase 2 |
| Food Pairing | Sommo | @kelder/engine already does SA-localised pairings |
| Community | Vivino | Supabase tasting_notes + ratings aggregation |
| Serious Collector | CellarTracker | Drinking-window tracking = Phase 2 Pro |
| AI Features | Sommo | AI sommelier = Phase 2 differentiator |
| Wine Education | Sommo | WSET SAT + Noble Wheel engine built |
| **Experience Discovery** | **No clear leader** | **← Decanta's category-defining opportunity** |

That last row is the gap — and it's the biggest opening in the market.

---

## The biggest gap in the market

Every app above treats wine as a product to catalogue, scan, rate, or price.
None of them treat it as a **connected local experience** — where to go, what's
on, what to pair, who you're becoming as a taster, and how to plan a day around
it. If Decanta opened tomorrow with this experience, no existing app delivers it:

> 🍷 **Good evening, Brandon**
> It's 21°C tomorrow — perfect weather for Chardonnay.
>
> **12 minutes away**
> - Jordan Wine Estate — live jazz from 15:00
> - Waterford Estate — chocolate pairing
> - Hidden Valley — dog-friendly terrace
>
> **Based on your Taste DNA**
> You'll probably love: Rustenberg Chardonnay · Capensis Fijnbosch · Ataraxia Chardonnay
>
> **Suggested Saturday itinerary**
> 09:00 Coffee · 10:30 Jordan tasting · 13:00 Lunch at Cavalli · 15:30 Lourensford Market · 17:00 Live music

That combination — weather-aware, location-aware, taste-personalised,
itinerary-building — sits at the intersection of wine app, local discovery app,
and lifestyle-recommendation engine. **No competitor occupies that space.**

This is what "Experience Discovery" means as a category. It requires:
- **Location data** (estate lat/long — 0% populated today, P0 priority)
- **Real-time events** (festival calendar — 41 events seeded, needs live feed)
- **Palate profile** (@kelder/engine built, needs user data volume)
- **Weather API** (trivial to add — OpenWeatherMap free tier)
- **Itinerary builder** (new feature — route optimisation between estates)
- **Estate amenity data** (restaurant, live_music, pet_friendly flags — 77% populated)

### Implementation pathway

| Component | Status | Priority |
|---|---|---|
| Estate geo coords (lat/lng) | 🔴 0% populated | **P0** — enables nearby, itinerary, distance |
| Palate profile engine | ✅ Built (@kelder/engine) | Needs user tasting volume |
| Events calendar | ✅ 41 events seeded | Needs live feed (Webtickets etc.) |
| Facility flags (restaurant, live_music, pet_friendly) | 🟡 77% region, 54% tasting_room | Enrichment ongoing |
| Weather API | 🔴 Not built | P2 — simple OpenWeatherMap integration |
| Itinerary builder | 🔴 Not built | P2 — route optimisation + scheduling |
| "Good evening" home screen | 🔴 Not built | P2 — synthesis of all above |

---

## Cross-category synthesis

Rather than out-building any single wine app at their own game, study each and
lift the single best mechanic — then synthesise with patterns from outside the
wine category.

### In-category (what to borrow from wine apps)

| App | Borrow this mechanic |
|---|---|
| **Vivino** | Scanner, community scale, onboarding flow, "Taste Match" personalisation logic |
| **CellarTracker** | Cellar management and drinking-window tracking, done with real data rigour |
| **InVintory** | Premium visual design language and inventory/collection experience |
| **Wine-Searcher** | Search quality, price comparison, retailer integration |
| **Sommo** | AI-driven education and food pairing |

### Out-of-category (the models for lifestyle transformation)

The three out-of-category references matter as much as the in-category ones —
they're the models for turning a product-catalogue app into a habit-forming
lifestyle app.

| App | Borrow this mechanic | How it applies to Decanta |
|---|---|---|
| **Strava** | Social feed + achievement/progress mechanics | Tasting milestones ("100 wines tasted", "Swartland Explorer badge"), friend activity feed, weekly tasting streaks |
| **Airbnb** | Discovery and inspirational browsing patterns | "Explore Stellenbosch" browse-first experience with full-bleed photography, curated collections ("Hidden gems of the Swartland") |
| **Spotify** | Personalised recommendation engine | "Discover Weekly" equivalent for wine: a weekly curated list of 10 wines matched to your palate, plus estate/event/experience recommendations |

---

## Positioning statement

> **If the goal is for Decanta to define a new category — "experience discovery,"
> not "wine catalogue" — this synthesis is the brief. It's the one row on the
> capability leaderboard with no incumbent, which makes it the most defensible
> place to build.**

Decanta is not competing with Vivino (catalogue + commerce). Decanta is
creating the category of **SA wine experience discovery** — scanning and rating
are table stakes; the product is the connected local experience.
