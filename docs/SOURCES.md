# Hemelval — Authoritative Source List

> **This is the canonical research list for the Hemelval wine platform.**
> Every dataset, rating, image, event, and farmer story must trace back to a
> source listed here. If a source is not in this document, it is not authoritative.
>
> **Hierarchy of authority:** Platter's / SAWIS (gold standard, licensed) →
> WoSA / Wikipedia / wine.co.za (structured, free) → estate websites (primary) →
> editorial (enrichment) → stock imagery (filler only).

**Last reconciled:** 2026-08-02
**Current DB state:** 420 estates · 217 wines · 41 events · 40 varietals · 20 routes

---

## 1. Core wine & producer databases (data + ratings backbone)

These are the sources that populate the `estates`, `wines`, and `tasting_notes`
tables. They are the backbone of the platform.

### Platter's by Diners Club Wine Guide ⭐ gold standard
- **URL:** https://www.wineonaplatter.com
- **What it has:** 900+ producers, merchants and brands; 8,000+ wines, brandies,
  husk spirits and sherry-style wines. Winery overviews, owner/winemaker/
  viticulturist details, tasting lounge hours, visitor attractions, geo-location.
- **Access:** Paid subscription / data licensing.
- **Status:** 🔴 Not yet licensed. **Priority action:** open a data-partnership
  conversation. This is the single dataset that would take us from 151 → 900+
  estates with verified, editorial-grade metadata.
- **Schema fields populated:** `estates.*` (all 60+ fields), `wines.*`, `award_bodies`,
  `certifications`, `winemaker`, `owner`, `opening_hours`, `latitude`, `longitude`.

### WRatings / Winemag.co.za
- **URL:** https://winemag.co.za/winemag-ratings/
- **What it has:** 12,500+ wine ratings, searchable by producer, wine name, variety,
  vintage, rating, publication date. Independent editorial voice.
- **Access:** Free (web), structured for scraping.
- **Status:** 🟡 Identified, not yet ingested.
- **Schema fields populated:** `wines.avg_stars`, `wines.rating_count`,
  `wines.critic_score`, `award_bodies` (Winemag rating).

### wine.co.za ⭐ primary free seed
- **URL:** https://wine.co.za/
- **What it has:** Wines, wineries, tasting rooms, people, news, events, maps,
  videos, wine routes, tours, restaurants, accommodation. Dedicated finder pages
  for wines (technical analysis, tasting notes, bottle shots, where to buy, awards,
  winemaker details) and wineries (contact details, tasting room times, directions,
  staff, news, events).
- **Access:** Free (web). Best structured target for scraping/injection.
- **Status:** 🟡 Identified, not yet ingested at scale.
- **Schema fields populated:** `estates.*`, `wines.*`, `events.*`, `restaurants.*`,
  `accommodation.*`, `winemaker`, `owner`, `opening_hours`, `logo_url`,
  `cover_image_url`, `wine_route`.

### TopWineSA
- **URL:** https://topwinesa.com/top-sa-wine-ratings/
- **What it has:** Every SA wine judged very good to world-class by top tasting
  panels, 93+ scores, gold/platinum medallists, trophy laureates, industry stats.
- **Access:** Free (web).
- **Status:** 🟡 Identified, not yet ingested.
- **Schema fields populated:** `wines.avg_stars`, `award_bodies`, `vintage_reports`.

### SA Wine Industry Directory (Wineland Media)
- **URL:** https://www.wineland.co.za/product/south-african-wine-industry-directory-2020/
- **What it has:** Detailed listing of producers, cellars, wineries, winemakers,
  viticulturists, brands, contacts for organisations/writers/suppliers, registered
  grapevine nurseries and rootstock/scion clones.
- **Access:** Behind a flipbook paywall. Useful for cross-referencing completeness.
- **Status:** 🔴 Not yet accessed.

### Wineries.co.za
- **URL:** https://www.wineries.co.za/
- **What it has:** Detailed directory of SA wine farms and wineries, each with
  brand narrative text — decent for scraping farm "story" blurbs.
- **Access:** Free (web).
- **Status:** 🟡 Identified, not yet ingested.
- **Schema fields populated:** `estates.about`, `estates.history`, `estates.description`.

### Food & Beverage Trade SA — SA Wineries directory
- **URL:** https://foodbevtrade.co.za/south-african-wineries/
- **What it has:** Trade-oriented directory showcasing estates from boutique
  vineyards to large producers; useful for exporter/B2B metadata.
- **Access:** Free (web).
- **Status:** 🟡 Identified, not yet ingested.
- **Schema fields populated:** `estates.subscription_tier`, export/B2B flags.

### Wikipedia — List of wineries in South Africa ⭐ geocoding seed
- **URL:** https://en.wikipedia.org/wiki/List_of_wineries_in_South_Africa
- **What it has:** Winery list with GPS coordinates per winery.
- **Access:** Free, structured. Best free geocoding seed list.
- **Status:** 🟡 Identified, not yet ingested.
- **Schema fields populated:** `estates.latitude`, `estates.longitude`,
  `estates.slug`, `estates.estate_name`, `estates.region`.

### Wine-Searcher — South Africa region page
- **URL:** https://www.wine-searcher.com/regions-south+africa
- **What it has:** Pricing benchmarks, critic-score cross-referencing, regional stats.
- **Access:** Free (limited), paid API for full data.
- **Status:** 🟡 Identified, not yet ingested.
- **Schema fields populated:** `wines.price_zar`, `wines.critic_score`.

---

## 2. Official industry bodies (authoritative regional/route/stat data)

These populate reference tables (`wine_routes`, `wine_regions`, `certifications`,
`vintage_reports`) and validate provenance.

### WoSA (Wines of South Africa) ⭐ official
- **URL:** https://www.wosa.co.za
- **Key subpages:**
  - **Wine Routes directory** — Franschhoek Wine Valley, Hemel-en-Aarde, Klein Karoo,
    Paarl, Robertson, Stellenbosch, Swartland, Tulbagh, West Coast, Worcester, with
    contact emails per route body.
  - **Maps & multimedia** — downloadable regional/varietal PDF maps, videos.
  - **Statistics section** — official production/export stats.
- **Access:** Free (web).
- **Status:** ✅ Partially ingested (20 wine routes seeded). Full route membership
  and contact data not yet linked to estates.
- **Schema fields populated:** `wine_routes.*`, `estates.wine_route_id`,
  `vintage_reports.*`, `certifications` (IPW, WIETA).

### SAWIS (SA Wine Industry Information & Systems) ⭐ WO registry
- **URL:** https://www.sawis.co.za
- **What it has:** Industry directory of role players by category/area; export/vine/
  price/sales search; **A-number label lookup** to identify responsible seller and
  origin/variety/vintage from a certification seal. This is the Wine of Origin
  registry — critical for provenance/authenticity data.
- **Access:** Mostly gated to registered members.
- **Status:** 🔴 Not yet licensed. **Priority action:** industry partnership request.
- **Schema fields populated:** `wines.wo_certification_number`, `wines.region`,
  `estates.certifications`, `vintage_reports.*`.

### Vinpro
- **URL:** https://vinpro.co.za
- **What it has:** Represents ~2,600 SA wine producers, cellars and industry
  stakeholders. Technical/economic data alongside SAWIS.
- **Access:** Member-based.
- **Status:** 🔴 Not yet accessed.

---

## 3. Festivals & events — seasonal arc calendar

SA's wine calendar follows a distinct seasonal arc, not a flat chronological list.
See `docs/EVENTS_CALENDAR.md` for the full month-by-month breakdown, data
pipeline architecture, and forecast layer design.

### Four seasonal chapters
1. **Harvest (Jan–Mar)** — Harvest Parade, grape stomping, SA's wine birthday (2 Feb). Most visually rich, best content marketing window.
2. **Winter Festivals (Apr–Aug)** — Wacky Wine Weekend (Robertson), Franschhoek Bastille, Greyton, Stellenbosch Wine Festival.
3. **Spring Bloom (Sep–Oct)** — Hermanus Wine & Food (70+ wineries), Swartland Revolution, Pinotage on Tap, CapeWine (biennial).
4. **Festive Sparkle (Nov–Dec)** — Cap Classique season, estate Christmas markets, Kirstenbosch concerts.

### Event listing sources
| Source | URL | Priority | Status |
|---|---|---|---|
| **wine.co.za diary** | diary.wine.co.za | **P0** — best aggregator | 🟡 Not ingested |
| **sa-venues.com** | sa-venues.com/events/westerncape | P0 — reliable, categorised | 🟡 Not ingested |
| **Wine route bodies** | Per-route sites | P0 — primary-source dates | 🟡 Not ingested |
| **Webtickets** | webtickets.co.za | P1 — live ticketing cross-check | 🟡 Not ingested |
| Secret Cape Town — Wine Festivals | secretcapetown.co.za | P1 — enrichment | 🟡 Not ingested |
| Wine Travel Guides — SA festival index | winetravelguides.com | P1 — enrichment | 🟡 Not ingested |
| Stellenbosch Wine Routes site | wineroute.co.za | P1 — route-specific | 🟡 Not ingested |

### Key annual events (recurring, dates shift year-to-year)
- Stellenbosch Harvest Parade (late Jan) + Wine Birthday (2 Feb)
- Franschhoek Cap Classique & Champagne Festival (Feb/Mar or Dec — confirm annually)
- Wacky Wine Weekend (Robertson, early Jun) — 40+ estates
- Franschhoek Bastille Festival (mid-Jul) — 20+ wineries
- Stellenbosch Wine Festival (Aug) — Church Street celebration
- Hermanus Wine and Food Festival (late Sep) — 70+ wineries, 300+ wines
- Swartland Revolution (Oct) — natural wines, insider favourite
- Pinotage on Tap (Wellington, Oct)
- CapeWine (biennial trade expo, Oct) — 350+ producers
- WineX (Joburg, late Oct) — largest in Southern Hemisphere
- Rocking the Daisies (Cloof Estate, early Oct) — music + lifestyle

### Pipeline architecture (from EVENTS_CALENDAR.md)
```
Weekly scraper → normalised event schema → recurrence detection
→ confirmation queue → published events → forecast layer
```
Store `typical_month` per annual event to enable: "Harvest starts in ~10 weeks"
proactive seasonal forecasting.

**Status:** ✅ 41 events seeded. Target: 80+ via dynamic pipeline.

---

## 4. Farmer stories, heritage & transformation (the human layer)

These populate `estates.history`, `estates.about`, and the future "stories" feature.
This is what makes Hemelval feel human, not AI-generated.

### Story sources
| Source | URL | Focus |
|---|---|---|
| SHU Food Research — Wine Farmworker Heritage | https://blogs.shu.ac.uk/chefscluster/2022/06/28/researching-wine-farmworker-heritage-stories/ | Seven Sisters, Vivian Kleynhans — oral history template |
| Wine Enthusiast — SA inequity reversal | https://www.wineenthusiast.com/culture/wine/south-african-wine-inequity/ | Carmen Stevens, Paul Siguqa, The Wine Arc |
| Wine Enthusiast — Black winemakers reclaiming legacies | https://www.wineenthusiast.com/culture/wine/south-african-winemakers-legacy/ | Transformation Unit, SA Wine Industry |
| The Wine Merchant Mag — "400 years of catching up" | https://winemerchantmag.com/400-years-of-catching-up-to-do/ | Ntsiki Biyela, Wade Sander, WoSA "Black Excellence" |
| This Day in Wine History — SA before/after apartheid | https://thisdayinwinehistory.com/south-africa-wine-industry-before-and-after-apartheid/ | Historical narrative for "our heritage" section |

### Organisations to link for ongoing farmer profiles
- The Wine Arc (black-owned producer collective)
- SA Wine Industry Transformation Unit
- KWV Empowerment Programme
- Wine Industry Transformation Charter

### Flagship "story" farms to seed (priority)
- **Seven Sisters** (Vivian Kleynhans) — Stellenbosch
- **Klein Goederust** (Paul Siguqa) — Franschhoek
- **M'Hudi Wines** (Diale family) — Stellenbosch
- **Aslina Wines** (Ntsiki Biyela) — Stellenbosch
- **Brunia Wines** (Wade Sander) — Stanford
- **Carmen Stevens Wines** — Wellington

**Status:** 🔴 Not yet seeded. **Priority action:** create these 6 estate records
with full `history` and `about` narratives sourced from the articles above.

---

## 5. Images

These populate `estates.logo_url`, `estates.cover_image_url`, `wines.bottle_image_url`.

### Image sources (by legal safety)
| Source | URL | Licence | Status |
|---|---|---|---|
| **Wikimedia Commons — Wineries in SA** | https://commons.wikimedia.org/wiki/Category:Wineries_in_South_Africa | Free-licensed, high-res (some 4928×3264px) | 🟡 Not yet bulk-ingested |
| **Wikimedia Commons — Tourism in SA** | https://commons.wikimedia.org/wiki/Category:Tourism_in_South_Africa | Free-licensed | 🟡 Not yet ingested |
| Individual winery websites | via wine.co.za / wineries.co.za links | Per-estate permission required | 🟡 ~30 estates have verified images |
| Cape Town Tourism | capetown.travel | Licensed for reuse with attribution | 🔴 Check terms |
| Unsplash / Pexels | unsplash.com / pexels.com | Stock filler only — NOT estate-specific | ⚠️ Filler layer only |

**Status:** ✅ ~30 estates have verified bottle/cover imagery.
**Priority:** bulk-ingest Wikimedia Commons (legally safe) for remaining 120+ estates.

---

## 6. Statistics & vintage / terroir data (the "learn" layer)

These populate `vintage_reports`, `varietals`, and future terroir/education features.

| Source | What it provides | Status |
|---|---|---|
| **WoSA Statistics** | 86,544 ha under vine; Chenin Blanc 18.4%; Cab Sauv 10.1%; Shiraz 9.6%; Pinotage 7.6% | ✅ 10 vintage reports seeded |
| **SAWIS annual statistics booklet** | Production, plantings, exports, employment (PDF, free on request) | 🔴 Not yet requested |
| **FTI Consulting SAWIS reports** | Industry overview / macro health dashboard | 🔴 Not yet accessed |
| **Tim Atkin MW — SA Special Report** | Regional terroir assessment, vintage quality | 🟡 Not yet ingested |
| **James Suckling — SA Top 100** | Annual top-100 ranking | 🟡 Not yet ingested |
| **Jancis Robinson — SA Vintage Chart** | Vintage quality by region | 🟡 Not yet ingested |
| **Wine Anorak** | Chenin, MCC, Forrester deep profiles | 🟡 Not yet ingested |

---

## 7. Tasting taxonomy & engine (the @kelder/engine layer)

These are the sources for the tasting vocabulary, palate profiling, and food-pairing
logic encoded in `packages/engine/`.

| Source | What it provides |
|---|---|
| **WSET** Systematic Approach to Tasting (SAT) L3 & L4 (official PDFs) | Palate scales: sweetness, acidity, tannin, body, finish, texture |
| **Ann Noble Wine Aroma Wheel** (UC Davis, winearomawheel.com) | 80+ aroma descriptors in 3-tier hierarchy |
| **Wine Folly** | Sugar chart, serving temps, food pairing, sparkling methods |
| **Jancis Robinson** | 20-point scoring; SA Vintage Chart |
| **Decanter** | 100-point scale; Swartland coverage |
| **Platter's SA Wine Guide** | 5-star system (SA-local) |
| **GuildSomm** | Aging potential guidance |
| **Comité Champagne** | Dosage levels for MCC/Champagne |

**Status:** ✅ Fully encoded. 13 unit tests passing.

---

## 8. Competitive baseline

No single app leads in every dimension. Each of the apps below leads in one area
that Hemelval must either match or counter-position against.

### Rating matrix

| App | Leads in | Hemelval relevance | What we learn |
|---|---|---|---|
| **Vivino** | Everyday discovery, scanning, community scale | ⭐⭐⭐⭐⭐ | 70M users, 16M wines, best label scanner. But: recs feel commerce-driven, boutique wineries poorly covered, data quality inconsistent at scale. **SA boutique density is our opening.** |
| **CellarTracker** | Serious collectors, cellar management, data trust | ⭐⭐⭐⭐⭐ | Collectors trust it more than Vivino. Exceptional inventory + drinking windows + critic reviews. But: dated UI, no lifestyle layer. **Data-quality trust is the bar to hit.** |
| **Wine-Searcher** | Price comparison, global bottle finding | ⭐⭐⭐⭐☆ | Fast, excellent search engine. But: zero lifestyle/experience layer. **Search speed + price transparency as distinct feature.** |
| **Oeni** | Cellaring, maturity tracking, drinking windows | ⭐⭐⭐⭐☆ | Beautiful app, premium collector focus. Ideal for investment-value tracking. **Premium collector tier reference for Pro.** |
| **InVintory** | Luxury cellar management, 3D visualisation | ⭐⭐⭐⭐☆ | Most beautiful cellar app, luxury feel, 3D cellar viz. But: inventory-focused, not discovery. **UI craft benchmark for Estate SaaS.** |
| **Delectable** | Fast scanning, tasting journal | ⭐⭐⭐⭐☆ | Simple, fast, good tasting journal. Limited social innovation. **Scan-flow speed benchmark.** |
| **Sommo** | AI education, food pairing, taste development | ⭐⭐⭐⭐☆ | Newer AI-driven entrant. Signals category direction: AI-assisted education + pairing. **AI sommelier is where the category is heading.** |

### Strategic takeaways for Hemelval

1. **Vivino's weaknesses are our opening.** Its commerce-driven recommendations,
   poor boutique-winery coverage, and inconsistent data quality at scale are the
   exact gaps Hemelval fills — SA has the highest density of boutique/family
   estates that global apps under-serve.

2. **CellarTracker's data trust is the quality bar.** Collectors trust it more
   than Vivino. Hemelval must prioritise data accuracy and provenance (WO
   certification, verified estate profiles) over scale. The "is_verified" flag
   on every estate record is our equivalent.

3. **Wine-Searcher shows search must be a feature, not an afterthought.**
   Fast, relevant search with price comparison is a distinct capability worth
   building — not bolted onto discovery as Vivino does.

4. **Oeni / InVintory define premium UI expectations.** If Hemelval adds a
   "serious collector" Pro tier, these apps show the craft level needed:
   maturity tracking, drinking windows, investment-value visualisation.

5. **Sommo signals AI is the differentiator.** AI-assisted education, pairing,
   and taste development — paired with Hemelval's local storytelling/heritage
   angle that none of these global apps have — is the moat.

6. **"Experience Discovery" is the category with no incumbent.** Every wine app
   treats wine as a product to catalogue/scan/rate/price. None treats it as a
   connected local experience — weather-aware, location-aware,
   taste-personalised, itinerary-building. This is Hemelval's category-defining
   opportunity. See `docs/COMPETITIVE_ANALYSIS.md` for the full vision.

7. **Cross-category synthesis is the brief.** Don't just borrow from wine apps —
   borrow from Strava (social feed + achievements), Airbnb (inspirational
   browsing), and Spotify ("Discover Weekly" for wine). These are the models for
   turning a product catalogue into a habit-forming lifestyle app.

### Original competitive analysis sources

| Source | URL | What we learned |
|---|---|---|
| **Vivino** | App Store / Play / Wikipedia (en.wikipedia.org/wiki/Vivino) | Scan-to-match, "Match for You" palate scoring, 2-sided marketplace |
| FourWeekMBA / ProductMint / Vizologi | Business model analyses | Monetization: consumer premium + winery SaaS |
| Vivino "Match for You" + label-scanner explainers | Product docs | UX patterns for scan flow |

---

## 9. Sustainability & certification registries

These validate the `certifications` array and sustainability boolean flags on estates.
See `docs/BADGE_SYSTEM.md` for the full badge architecture (two-rail system:
quality medals vs values certifications, kept visually distinct).

SA is the **only wine-producing country** that audits sustainability as a
prerequisite for national certification — the combined WO + IPW seal on the
bottle neck. No global wine app surfaces this data. This is Hemelval's second
category-defining differentiator.

### Certification hierarchy (baseline → premium)

| Tier | Certification | What it signals | Badge prominence |
|---|---|---|---|
| **Baseline** | **IPW** | Environmental sustainability (audited since 1998, 95%+ coverage) | Low — absence is more notable |
| **Environmental** | **WWF Conservation Champions** (formerly BWI) | Top eco-tier, 70%+ IPW + biodiversity. 55 farms. Sugarbird & protea logo. | **High** — premium eco-badge |
| **Ethical** | **WIETA** | Fair labour, safe conditions, worker empowerment. SA-only independent body. | Medium-high |
| **Ethical** | **Fairtrade** | International standard. SA = world's largest Fairtrade wine producer (⅔ global). | **High** — globally recognised |
| **Lifestyle** | **Organic / Biodynamic / Vegan** | International standards, growing on SA labels | Medium — lifestyle filter |
| **Emerging** | **B Corp** | Holistic business certification. Journey's End = SA's first (March 2025). | **High when present** |
| **Umbrella** | **SWSA** | Alliance coordinating all above. 94% of producers. | Explainer link, not per-wine |

### Quality awards & competitions (Rail A)

Local: Platter's (★), Veritas, Michelangelo, Trophy Wine Show, ABSA Perold,
FNB Sauvignon Blanc Top 10, Winemag.co.za, Tim Atkin MW.
International: Decanter (DWWA), Mundus Vini, IWSC, IWC, Wine Spectator,
James Suckling, Robert Parker.

Tiered medal system normalised: Trophy > Double Gold > Gold > Silver > Bronze.
Critic scores (Platter's stars, numeric /100) in a separate badge slot.

| Source | URL | What it provides |
|---|---|---|
| **IPW** (Integrated Production of Wine) | ipw.co.za | Environmental sustainability certification |
| **WIETA** (Wine & Agricultural Ethical Trade Initiative) | wieta.org.za | Ethical labour certification |
| **WWF Conservation Champions** (formerly BWI) | wwf.org.za | Top environmental tier — 55 champion farms |
| **Old Vine Project (OVP)** | oldvineproject.co.za | Certified Heritage Vineyards (35+ year old vines) |
| **Wine & Spirit Board / Wine Certification Authority** | wineauthority.org | WO certification, A-number verification |
| **Fairtrade South Africa** | fairtrade.net | Fairtrade certification (SA = largest global producer) |
| **SWSA** (Sustainable Wine South Africa) | swsa.co.za | Umbrella alliance (WO + IPW + WWF + WoSA) |
| **Champion Wine Guide App** | championwineguide.co.za | WWF Conservation Champion wine farms list |

**Status:** ✅ 10 certification types + 10 award bodies seeded in reference
tables. Not yet linked to individual estates at scale.

### The second category-defining feature

> Let users filter by values: "show me Trophy-winning Chenin Blancs that are
> also WWF Conservation Champions" or "Fairtrade wines near me."

No competitor app supports values-based filtering. Combined with Experience
Discovery, this gives Hemelval **two category-defining features** no global
wine app can replicate.

---

## Source priority matrix

| Priority | Source | Action | Est. estates gained |
|---|---|---|---|
| **P0** | Batch research (B1-B3) | ✅ DONE — 269 new producers inserted + 64 backfilled | +269 → 420 total |
| **P0** | Wikimedia Commons | Bulk image ingest (free, legal) | images for 300+ |
| **P1** | wine.co.za + Wikipedia | Enrich remaining 96 null-region estates | +geo/contact data |
| **P1** | Wineries.co.za + Winemag | Scrape narratives + ratings | enrichment |
| **P1** | Flagship story farms (§4) | Manual seed (6 farms) | +6 with deep narratives |
| **P1** | Event sources (§3) | Scrape 2026 calendar | +20 events |
| **P2** | Platter's | License / partnership | +480 (gold standard) |
| **P2** | SAWIS | Membership / partnership | WO provenance data |
| **P2** | Vinpro | Membership | producer contacts |

**Path to 600+ producers:** Batch research (done) got us from 151 → 420.
P1 sources (free) will close the gap to ~550–600.
Platter's partnership (P2) takes us to 900+.

---

*All data is publicly available unless marked as paid/licensed. Estate lat/long
coordinates are approximate (ward-level) until individually verified. The seed data
is a starting knowledge base; estates self-curate their verified profiles in Phase 2
via the vendor admin portal.*
