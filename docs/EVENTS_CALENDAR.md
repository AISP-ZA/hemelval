# Decanta — Wine Festival & Event Calendar

> The canonical SA wine events calendar. Defines the seasonal arc,
> data sourcing pipeline, and UX structure for the Events screen.
>
> Source: CEO events research brief (2026-08-02). 41 events currently seeded;
> this document defines the path to a comprehensive, dynamically-updated calendar.

## The annual shape — four seasonal chapters

SA's wine calendar has a distinct arc, not a flat chronological list. Building
the calendar around this seasonal structure is itself a UX differentiator.

```
HARVEST          WINTER FESTIVALS     SPRING BLOOM         FESTIVE SPARKLE
(Jan–Mar)        (Apr–Aug)            (Sep–Oct)            (Nov–Dec)
    │                  │                    │                    │
    ▼                  ▼                    ▼                    ▼
Harvest Parade    Wacky Wine Weekend   Hermanus Wine & Food  Cap Classique &
Harvest Stomp     Franschhoek Bastille   Festival             Champagne Festival
Grape picking    Greyton Winter Wine   Blomme & Bubbles      Estate Christmas
Cellar tours     Stellenbosch Wine     Swartland Revolution   markets
Wine birthday    Town/Festival         Pinotage on Tap        Kirstenbosks Concerts
(2 Feb)           Cape Wine (biennial)  CapeWine (biennial)   Festive tastings
```

### Chapter 1 — Harvest (Jan–Mar) ⭐ Most visually rich, best content marketing
- **Stellenbosch Harvest Parade** (late Jan) — tractors, vineyard workers, marching bands
- **Wine Harvest Commemorative Event** (2 Feb, Groot Constantia) — SA is the only wine country that can pinpoint the exact start of its industry (Jan van Riebeeck's 1659 diary entry)
- **Delheim Start of Harvest Celebration** — visitors harvest their own grapes
- **Durbanville Hills Harvest Behind-the-Scenes** (early Feb–mid Mar) — cellar tours, blending, pairings
- **Ken Forrester Harvest Stomp**, **Spogwijn Oesfees**, **Tasting Under the Stars**
- **Franschhoek Cap Classique & Champagne Festival** (late Feb/early Mar — date moves, confirm annually)
- **Franschhoek Allée Bleue Harvest Festival** (early Mar) — grape stomping, live music
- **Darling Cellars Crush Day** (Mar, since 2007) — grape picking, stomping, tractor rides
- **Muratie Harvest Festival** (Stellenbosch, mid-Mar)

### Chapter 2 — Winter Festivals (Apr–Aug)
- **Wacky Wine Weekend** (Robertson, early Jun) — 40+ estates, SA's most popular wine weekend
- **Franschhoek Bastille Festival** (mid-Jul, 34th edition 2026) — 20+ Franschhoek wineries, French-inspired
- **Greyton Winter Wine Weekend** (Jul) — 30 winemakers, fireplace-lit venues
- **Stellenbosch Wine Town** (Jul/Aug) — week of events, tastings, culinary highlights
- **Stellenbosch Wine Festival** (Aug) — Church Street street celebration, International Wine Region of the Year
- May is traditionally the quietest month — fill with evergreen content (cellar tours, autumn vineyard photography)

### Chapter 3 — Spring Bloom & Open Days (Sep–Oct) ⭐ Biggest month
- **Blomme & Bubbles Festival** (Paternoster, early Sep) — West Coast flower bloom + wine
- **Hermanus Wine and Food Festival** (late Sep) — 70+ wineries, 300+ wines
- **CapeWine** (biennial trade expo, Oct) — Africa's largest, 350+ producers
- **Pinotage on Tap** (Wellington, Oct) — SA's signature grape celebrated
- **Swartland Revolution** (Oct) — insider-favourite, natural wines, vineyard-side discussions
- **Rocking the Daisies** (Cloof Wine Estate, early Oct) — music + lifestyle at a wine estate
- **Agulhas Wine Triangle Festival** — cool-climate wines, southernmost tip
- **WineX** (Johannesburg, late Oct) — largest wine festival in Southern Hemisphere

### Chapter 4 — Festive Sparkle (Nov–Dec)
- **Kirstenbosch Summer Sunset Concerts** (Nov–Mar) — lifestyle-adjacent
- **Franschhoek Cap Classique & Champagne Festival** (Dec in some years — confirm annually)
- Estate Christmas markets, festive tastings

---

## Recurring "always-on" categories (not dated events)

These belong in a separate "Things to do any weekend" layer, not the dated feed:

- **Cellar tours & tasting-room demonstrations** — standing offerings at most estates
- **Wine route open days** — each route body publishes its own member calendar
- **Farm markets** — Lourensford Market, Root44 Market — wine-adjacent lifestyle draws

---

## Data sourcing pipeline

### Tier 1 — Primary structured sources (scrape weekly)
| Source | URL | What it provides |
|---|---|---|
| **wine.co.za diary** | diary.wine.co.za | Dates, venues, ticket links — best existing aggregator |
| **sa-venues.com** | sa-venues.com/events/westerncape | Reliable, well-categorised |
| **Wine route bodies** | Per-route sites | Most authoritative primary-source dates |
| **Webtickets** | webtickets.co.za | Live ticketing/pricing cross-check |

### Tier 2 — Enrichment sources (descriptive copy, photography)
- Wine Travel Guides SA events index
- Individual estate news pages (Darling Cellars, Journey's End, etc.)

### Tier 3 — Manual curation
Many sources report tentative/TBC dates months ahead. Build a confirmation workflow:
auto-imported events land in "needs confirmation" state until a human or second
source confirms the date. **Never publish an unconfirmed date to a user planning a trip.**

### Pipeline architecture
```
Scheduled scraper (weekly cron)
    ↓
Normalised event schema: {name, region, venue, start_date, end_date,
    recurrence_type, category, ticket_url, source_url, confidence}
    ↓
Recurrence detection: store typical_month / typical_week per annual event
    → enables FORECAST: "Harvest season starts in ~10 weeks" (flagged "estimated")
    ↓
Confirmation queue → published events
```

### Forecast layer
Surface a "coming up this year" view from recurrence data. In November, proactively
show "Harvest season starts again in ~10 weeks — here's what typically happens each
February" using the historical pattern. This turns Decanta from reactive listings
into **proactive seasonal planning** — a natural extension of the Experience Discovery vision.

---

## Current state

- ✅ 41 events seeded in `events` table
- ✅ `EventsScreen.tsx` renders events from live Supabase via `fetchEvents()`
- ✅ `EventDetailScreen.tsx` shows cover photo, facts, tickets, participants
- 🟡 Seasonal chapter structure not yet implemented (flat chronological list)
- 🟡 Recurrence detection not built
- 🟡 Dynamic scraper pipeline not built
- 🔴 Forecast layer not built

### Implementation priorities
1. **Reorganise EventsScreen** into 4 seasonal chapters (not flat list)
2. **Add `typical_month` field** to events table for recurrence forecasting
3. **Build weekly cron scraper** against diary.wine.co.za
4. **Add confirmation workflow** for auto-imported dates
5. **Build forecast layer** — "coming up this season" proactive recommendations
