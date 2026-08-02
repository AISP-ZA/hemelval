# Hemelval — Competitive Analysis

> Strategic analysis of the wine app landscape. Defines where Hemelval wins,
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
    │ Wine-    │               │ Sommo    │          │ Hemelval │
    │ Searcher │               │ (AI)     │          │ (SA-only)│
    └──────────┘               └──────────┘          └──────────┘
```

Hemelval occupies a unique position: **local/heritage depth** that no global app
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

**Weaknesses (Hemelval's opening):**
- Recommendations increasingly feel commerce-driven, not taste-driven
- Data quality has become inconsistent at scale — duplicate wines, wrong labels
- Boutique wineries are poorly represented — long tail is thin and inaccurate
- Over-emphasis on selling wine rather than discovery/experience
- No regional depth — a Stellenbosch estate gets the same treatment as a Napa bulk wine

**What Hemelval takes from Vivino:**
- Scan → Rate → Discover core loop
- Community rating aggregation
- Palate-profile-based recommendations
- Clean card-based wine list UI

**What Hemelval does differently:**
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

**What Hemelval learns from CellarTracker:**
- **Data trust is the moat.** The "is_verified" flag on every estate, the WO
  provenance tracking, and the source-citation discipline in SOURCES.md are
  our equivalent of CellarTracker's community-trust model.
- Cellar management is a Pro-tier feature (Phase 2), not a Day 1 feature.

---

### 3. Wine-Searcher — the search engine ⭐⭐⭐⭐☆

**Strengths:** Fast, global price comparison. Find any bottle, anywhere.
**Weaknesses:** Zero lifestyle layer. Pure utility.

**What Hemelval learns:**
- Search must be a first-class feature, not an afterthought.
- Price transparency (showing RRP, cellar-door price, retail price) builds trust.
- The REST API we built (`/v1/wines?type=&varietal=&min_rating=`) is the foundation.

---

### 4. Oeni — the premium collector app ⭐⭐⭐⭐☆

**Strengths:** Beautiful UI, maturity tracking, drinking windows, investment value.
**Audience:** Premium collectors who care about cellaring.

**What Hemelval learns:**
- Premium UI craft is the bar for the Pro tier (R89/mo).
- Maturity/drink-window tracking is a valuable Pro feature.
- Investment-value visualisation appeals to the high-end segment.

---

### 5. InVintory — the luxury benchmark ⭐⭐⭐⭐☆

**Strengths:** Most beautiful cellar app. 3D cellar visualisation, luxury feel.
**Audience:** Ultra-high-net-worth collectors.

**What Hemelval learns:**
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

**What Hemelval learns:**
- Scan speed is critical — Delectable's UX is sub-2-second from snap to match.
- Tasting journal simplicity matters — don't overcomplicate the note-taking flow.
- Our Tesseract.js OCR + Supabase fuzzy match is the current implementation;
  Google Vision (when deployed) will match Delectable's speed.

---

### 7. Sommo — the AI signal ⭐⭐⭐⭐☆

**Strengths:** AI-assisted education, food pairing, taste development.
**Category signal:** This is where wine apps are heading — AI as the sommelier.

**What Hemelval learns:**
- AI sommelier is a Phase 2 differentiator (planned).
- Our @kelder/engine (WSET SAT + Noble Wheel + food-pairing logic) is the
  foundation — it already does structured tasting analysis and food matching.
- Adding LLM-powered conversational recommendations ("I'm braaiing lamb, what
  Swartland red should I try?") is the natural next step.
- Paired with local heritage content (no global app has SA farmer stories),
  this creates an unbeatable moat.

---

## Hemelval's strategic position

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
                    │ Hemelval│ ← HERE: SA depth + AI + heritage
                    └─────────┘
                         │
    LOCAL DEPTH ─────────┼──────────────────
                         │
```

**Where Hemelval wins (no competitor can match):**
1. SA wine estate depth — 420 producers with full histories, verified data
2. Farmer/heritage storytelling — transformation narratives, wine route context
3. WO provenance — Wine of Origin certification tracking
4. SA-localised food pairing — braai, bobotie, malva, biltong pairings
5. Wine route integration — festival calendar, cellar-door visit info

**Where Hemelval must match (table stakes):**
1. Label scanning speed (Tesseract.js now, Google Vision planned)
2. Community ratings (Supabase tasting_notes + aggregation)
3. Search relevance (REST API built, needs autocomplete)
4. Palate profiling (@kelder/engine built, needs more data)

**Where Hemelval differentiates (future moat):**
1. AI sommelier — conversational recommendations with local context
2. Estate SaaS portal — wineries self-manage their profiles
3. Cellar-door booking integration — book tastings directly
4. Wine route trip planning — plan a day/weekend around estates
