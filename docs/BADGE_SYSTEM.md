# Hemelval — Badge & Recognition System

> Defines the two-badge-rail architecture for wine quality awards and
> sustainability/values certifications. This is Hemelval's second
> category-defining differentiator (after "Experience Discovery") — no global
> wine app surfaces SA's sustainability certification data at all.
>
> Source: CEO awards & certifications research brief (2026-08-02).

## Architecture: two visually distinct badge rails

Conflating "won a gold medal" with "is sustainably farmed" muddies both signals.
Keep them structurally and visually separate.

### Rail A — Quality recognition (top of card)
A panel of experts says this wine is excellent.

**Tiered medal system** (normalised across competitions):
```
Trophy > Double Gold > Gold > Silver > Bronze
```
Each badge shows: competition logo/name + tier + year (on tap/hover).

**Critic score badges** (separate from medals — different signal type):
Platter's stars (★ out of 5) and numeric scores (Wine Spectator, Winemag, Tim Atkin)
sit in their own "critic score" badge slot.

### Rail B — Values/provenance recognition (separate section)
This producer farms and trades responsibly.

Uses a **different icon language** — leaf/protea/scale icons, NOT medal icons.
Visual prominence is reserved for what's genuinely differentiating (WWF, Fairtrade,
B Corp), not the near-universal IPW baseline.

---

## A. Quality awards & competitions

### Local (South Africa) — highest priority

| Organisation | What it signals | Badge type | Tier system |
|---|---|---|---|
| **Platter's by Diners Club** | SA's star-rating institution | Critic score | 5★ / 4.5★ / 4★ |
| **Veritas Wine Awards** | Longest-running SA competition | Medal | Double Gold / Gold / Silver / Bronze |
| **Michelangelo International** | Judged by invited international experts | Medal | Gold / Silver / Bronze |
| **Trophy Wine Show** (Old Mutual/Investec) | Top-tier trophy competition | Trophy + Medal | Trophy / Gold / Silver |
| **ABSA Perold Cape Blend** | SA-specific Cape Blend style | Medal | Gold / Silver |
| **FNB Sauvignon Blanc Top 10** | Varietal-specific national competition | List badge | "Top 10" |
| **Winemag.co.za** | Independent numeric scoring | Critic score | XX/100 |
| **Tim Atkin MW SA Report** | International MW's SA-focused report | Critic score | XX/100 |

### International — for export-facing/premium positioning

| Organisation | Badge type | Notes |
|---|---|---|
| **Decanter World Wine Awards (DWWA)** | Medal | Platinum / Gold / Silver / Bronze |
| **Mundus Vini** | Medal | Gold / Silver |
| **IWSC / IWC** | Medal | Gold / Silver / Bronze |
| **Wine Spectator** | Critic score | XX/100 |
| **James Suckling** | Critic score | XX/100 |
| **Robert Parker / Wine Advocate** | Critic score | XX/100 |

### Implementation
- `AwardBadge.tsx` component already built with medallion/stamp archetypes
- `award_bodies` table seeded (10 bodies in DB)
- Awards stored per-estate in `estates.awards` JSONB or junction table
- **Next:** normalise tier names across competitions into one visual language

---

## B. Sustainability, ethical & environmental certifications

This is Hemelval's **strongest differentiation opportunity**. South Africa's
sustainability certification system is unusually mature and unusually combined
into the official bottle seal — the combined Wine of Origin + IPW seal on the
bottle neck makes SA the **only wine-producing country in the world** that
audits sustainability as a prerequisite for national certification.

No global wine app (Vivino, CellarTracker, Delectable) surfaces this data.
This is a genuine local-only advantage.

### Certification hierarchy (from baseline to premium)

| Tier | Certification | What it certifies | Prevalence | Badge prominence |
|---|---|---|---|---|
| **Baseline** | **IPW** (Integrated Production of Wine) | Environmental sustainability — audited since 1998, covers 95%+ of growers | Near-universal | Low — its ABSENCE is more notable than its presence |
| **Environmental** | **WWF Conservation Champions** (formerly BWI) | Top environmental tier — requires 70%+ IPW score + biodiversity principles. 55 champion farms. Sugarbird & protea logo. | Elite (55 farms) | **High** — the premium eco-badge |
| **Ethical** | **WIETA** (Ethical Trade) | Fair labour, safe working conditions, worker empowerment. SA is the only wine country with an independent body for this. | ~1,000 members | Medium-high — social responsibility pillar |
| **Ethical** | **Fairtrade** | International fair-trade standard. SA is the world's largest Fairtrade wine producer (~⅔ of global supply). | Significant | **High** — globally recognisable |
| **Lifestyle** | **Organic / Biodynamic / Vegan** | International standards, increasingly on SA labels | Growing | Medium — dietary/lifestyle filter |
| **Emerging** | **B Corp** | Global holistic-business certification. Journey's End = SA's first B Corp winery (March 2025). | Very early | **High when present** — novelty signal |
| **Umbrella** | **SWSA** (Sustainable Wine SA) | Alliance coordinating all of the above. 94% of producers certified. | Industry-level | Explainer link, not per-wine badge |

### Implementation
- `certifications` table seeded (10 types in DB: WO, IPW, WIETA, OVP, Fairtrade, ROC, BWI, SAWLS, Demeter, Ecocert)
- `estates.certifications` text[] column stores cert codes per estate
- `estates.organic`, `estates.biodynamic`, `estates.sustainable` boolean flags
- `CERT_INFO` map in `mockData.ts` provides display names + descriptions
- **Next:** build a `CertBadge` component (separate icon language from AwardBadge)

### Data sourcing priority

| Source | Method | Trust level |
|---|---|---|
| IPW/WO seal | SAWIS seal-number lookup (same pipeline as barcode scan) | Audited/legal |
| WWF Conservation Champions | Manual seed (55 farms, small static list) or WWF-SA partnership | Verified |
| WIETA/Fairtrade/Organic | Per-estate from winery websites, cross-checked | Curated |
| Competition medals | Scrape wine.co.za + winery awards pages | Verified against Platter's |

---

## The second category-defining feature

> Let users filter/search by values, not just quality — e.g. "show me
> Trophy-winning Chenin Blancs that are also WWF Conservation Champions" or
> "Fairtrade-certified wines near me."

No competitor app supports values-based filtering at all. Combined with the
"Experience Discovery" gap (weather/location/taste-aware itinerary builder),
this gives Hemelval **two category-defining features** that no global wine app
can replicate — both rooted in South Africa's unusually structured certification
landscape.

### Trust/credibility framing
Since IPW + WO is legally audited and near-universal, **don't over-badge it**.
Frame it as the floor. Reserve visual prominence for what's genuinely
differentiating: WWF Conservation Champion, Fairtrade, B Corp, and
estate-specific sustainability stories. A wine with only the baseline IPW seal
should not visually compete with a WWF Conservation Champion.
