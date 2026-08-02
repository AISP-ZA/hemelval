# Hemelval REST API — v1

> Canonical API contract for the Hemelval wine platform.
> Implementation lives at `supabase/functions/api/index.ts` (Supabase Edge Function, Hono on Deno).

## Base URL

```
Production:  https://vlbqrvynpmuzktpxhkjt.supabase.co/functions/v1/api
Local:       http://localhost:54321/functions/v1/api
```

All paths below are relative to the base. Examples show only the path.

## Conventions

| Rule | Detail |
|---|---|
| **Collections are plural** | `GET /v1/estates` (list), `GET /v1/estates/:id` (single) |
| **`:id` accepts UUID *or* slug** | `/v1/estates/boekenhoutskloof` resolves by slug; UUID resolves directly |
| **Auth** | Catalog reads (`/estates`, `/wines`, `/events`, `/routes`) are **public**. User-scoped reads/writes require `Authorization: Bearer <JWT>`. |
| **Pagination** | `?page=1&page_size=20` — max `page_size` is 100. Response includes a `pagination` object. |
| **Sorting** | `?sort=rating` (default) \| `name` \| `established` \| `distance` (geo only) |
| **Errors** | RFC 7807-style: `{ error: { code, message } }` with correct HTTP status. |
| **Content type** | `application/json` for all request and response bodies. |
| **CORS** | Allowed origins: `hemelval.vercel.app`, `hemelval.co.za`, `localhost:*`. |

## Response envelope

```jsonc
// List endpoints
{
  "data": [ /* …records… */ ],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total": 151,
    "total_pages": 8
  }
}

// Single-record endpoints — bare object, no envelope
{ "id": "…", "estate_name": "Boekenhoutskloof", "slug": "boekenhoutskloof", … }

// Errors
{ "error": { "code": "NOT_FOUND", "message": "Estate not found" } }
```

---

## Estates

### `GET /v1/estates`

List estates. Public. Supports filtering, sorting, pagination.

| Query param | Type | Default | Notes |
|---|---|---|---|
| `page` | int | 1 | 1-based |
| `page_size` | int | 20 | max 100 |
| `region` | string | — | e.g. `Stellenbosch`, `Swartland`, `Hemel-en-Aarde` |
| `district` | string | — | WO district |
| `ward` | string | — | WO ward |
| `wine_route` | string | — | e.g. `Stellenbosch`, `Franschhoek` |
| `province` | string | `Western Cape` | |
| `q` | string | — | Full-text search on name, region, about, famous_for |
| `sort` | enum | `rating` | `rating` \| `name` \| `established` \| `newest` |
| `fields` | csv | — | Sparse fieldset: `?fields=slug,estate_name,rating` |

```
GET /v1/estates?region=Stellenbosch&sort=rating&page_size=10
GET /v1/estates?q=chenin&sort=name
GET /v1/estates?fields=slug,estate_name,cover_image_url&page_size=50
```

```jsonc
{
  "data": [
    {
      "id": "9c1f…",
      "slug": "boekenhoutskloof",
      "estate_name": "Boekenhoutskloof",
      "region": "Franschhoek",
      "ward": "Franschhoek",
      "wine_route": "Franschhoek",
      "year_established": 1996,
      "famous_for": "Syrah, Chocolate Block",
      "rating": 4.8,
      "tasting_room": true,
      "restaurant": false,
      "pet_friendly": false,
      "family_friendly": true,
      "live_music": false,
      "organic": false,
      "biodynamic": false,
      "sustainable": true,
      "cover_image_url": "https://…",
      "logo_url": "https://…",
      "about": "Marc Kent's estate…",
      "latitude": -33.9091,
      "longitude": 19.1234,
      "currently_producing": true
    }
    // …
  ],
  "pagination": { "page": 1, "page_size": 10, "total": 24, "total_pages": 3 }
}
```

### `GET /v1/estates/:id`

Single estate by UUID or slug. Includes nested wines, certifications, and wine-route info.

```
GET /v1/estates/boekenhoutskloof
GET /v1/estates/9c1f3a2e-…
```

```jsonc
{
  "id": "9c1f…",
  "slug": "boekenhoutskloof",
  "estate_name": "Boekenhoutskloof",
  "legal_name": "Boekenhoutskloof Winery (Pty) Ltd",
  "region": "Franschhoek",
  "district": null,
  "ward": "Franschhoek",
  "wine_route": "Franschhoek",
  "year_established": 1996,
  "currently_producing": true,
  "vineyard_size_ha": 12.5,
  "winemaker": "Marc Kent",
  "owner": "…",
  "famous_for": "Syrah, Chocolate Block",
  "description": "…",
  "history": "…",
  "about": "…",
  "website": "https://boekenhoutskloof.co.za",
  "email": "…",
  "phone": "…",
  "address": "…",
  "city": "Franschhoek",
  "province": "Western Cape",
  "postcode": "7690",
  "latitude": -33.9091,
  "longitude": 19.1234,
  "google_maps_url": "https://…",
  "opening_hours": { "mon": "10:00-16:00", "sat": "10:00-14:00" },
  "booking_required": true,
  "price_range": "premium",
  "rating": 4.8,
  "google_rating": 4.7,
  "google_reviews": 1240,
  "tripadvisor": "https://…",
  // Facility flags
  "restaurant": false,
  "accommodation": false,
  "wedding_venue": true,
  "conference_facilities": false,
  "family_friendly": true,
  "pet_friendly": false,
  "wheelchair_access": true,
  "tasting_room": true,
  "cellar_tours": true,
  "picnic": false,
  "cycling": false,
  "hiking": false,
  "live_music": false,
  "market": false,
  "events_venue": true,
  // Sustainability
  "organic": false,
  "biodynamic": false,
  "sustainable": true,
  "certifications": ["IPW", "WIETA"],
  // Media
  "logo_url": "https://…",
  "cover_image_url": "https://…",
  "subscription_tier": "estate_pro",
  "is_verified": true,
  // Nested
  "wines": [
    { "id": "…", "slug": "chocolate-block-2021", "name": "The Chocolate Block 2021", "type": "Red Blend", "avg_stars": 4.7, "rating_count": 312 }
  ]
}
```

### `GET /v1/estates/search`

Full-text search. Alias of the `?q=` param on `GET /v1/estates`, exposed as a dedicated endpoint for clarity and future ranking tweaks.

| Param | Default |
|---|---|
| `q` (required) | — |
| `page`, `page_size` | `1`, `20` |

```
GET /v1/estates/search?q=chardonnay+robertson
```

### `GET /v1/estates/nearby`

Geo query — estates within a radius of a point, sorted nearest-first.

| Param | Type | Default | Notes |
|---|---|---|---|
| `lat` | float | **required** | latitude |
| `lng` | float | **required** | longitude |
| `radius` | int | `50` | kilometres, max 500 |
| `limit` | int | `20` | max 100 |
| `sort` | | `distance` | only valid sort for this endpoint |

Uses the haversine formula. Each result includes a `distance_km` field.

```
GET /v1/estates/nearby?lat=-33.9249&lng=18.4241&radius=60&limit=15
```

```jsonc
{
  "data": [
    { "slug": "groot-constantia", "estate_name": "Groot Constantia", "distance_km": 12.4, "rating": 4.6, … },
    { "slug": "klein-constantia", "estate_name": "Klein Constantia", "distance_km": 13.1, … }
  ],
  "origin": { "lat": -33.9249, "lng": 18.4241 },
  "radius_km": 60
}
```

### `GET /v1/estates/recommendations`

Personalised estate recommendations based on the authenticated user's palate profile. **Auth required.**

Scoring: matches the user's top varietals and preferred body/sweetness/tannin against each estate's wine portfolio. Returns top N.

| Param | Default |
|---|---|
| `limit` | `10` |

```
GET /v1/estates/recommendations?limit=10
Authorization: Bearer <JWT>
```

```jsonc
{
  "data": [
    { "slug": "…", "estate_name": "…", "match_score": 92, "reason": "Strong match for your Chenin Blanc preference (4 of their 6 wines are Chenin-led)." }
  ],
  "basis": { "top_varietals": ["Chenin Blanc", "Pinotage"], "notes_analysed": 47 }
}
```

### Facility-filter shortcuts

Convenience endpoints that apply a boolean filter to `GET /v1/estates`. All accept the same query params as the list endpoint (`region`, `sort`, `page`, etc.).

| Endpoint | Filter applied |
|---|---|
| `GET /v1/estates/restaurant` | `restaurant = true` |
| `GET /v1/estates/pet-friendly` | `pet_friendly = true` |
| `GET /v1/estates/family` | `family_friendly = true` |
| `GET /v1/estates/live-music` | `live_music = true` |

```
GET /v1/estates/restaurant?region=Stellenbosch&sort=rating
```

Same response shape as `GET /v1/estates`.

### `GET /v1/estates/:id/wines`

All wines belonging to an estate.

```
GET /v1/estates/boekenhoutskloof/wines
```

### `GET /v1/estates/:id/events`

Events hosted at or associated with an estate.

```
GET /v1/estates/boekenhoutskloof/events
```

---

## Wines

### `GET /v1/wines`

| Param | Default | Notes |
|---|---|---|
| `page`, `page_size` | `1`, `20` | |
| `estate_id` | — | filter by estate UUID or slug |
| `type` | — | `Red`, `White`, `Rosé`, `MCC`, `Dessert`, `Fortified` |
| `varietal` | — | e.g. `Chenin Blanc`, `Pinotage` |
| `region` | — | |
| `min_rating` | — | float, e.g. `4.0` |
| `q` | — | full-text |
| `sort` | `rating` | `rating` \| `name` \| `price` |

```
GET /v1/wines?type=Red&varietal=Syrah&min_rating=4.5&sort=rating
```

### `GET /v1/wines/:id`

Single wine by UUID or slug. Includes estate info.

```
GET /v1/wines/chocolate-block-2021
```

```jsonc
{
  "id": "…",
  "slug": "chocolate-block-2021",
  "name": "The Chocolate Block 2021",
  "estate_id": "9c1f…",
  "type": "Red Blend",
  "varietals": ["Syrah", "Grenache", "Cinsault", "Viognier"],
  "vintage": 2021,
  "region": "Franschhoek",
  "avg_stars": 4.7,
  "rating_count": 312,
  "price_zar": 420,
  "about": "…",
  "pairings": ["lamb", "braai", "oxtail"],
  "serving_temp": "16-18°C",
  "estates": { "slug": "boekenhoutskloof", "estate_name": "Boekenhoutskloof", "cover_image_url": "…" }
}
```

---

## Events

### `GET /v1/events`

| Param | Default | Notes |
|---|---|---|
| `page`, `page_size` | `1`, `20` | |
| `region` | — | |
| `from` | — | ISO date, e.g. `2026-08-01` |
| `to` | — | ISO date |
| `q` | — | |
| `sort` | `date` | `date` \| `name` |

### `GET /v1/events/:id`

Single event by UUID or slug, with participating estates.

---

## Wine Routes

### `GET /v1/routes`

List all wine routes (Stellenbosch, Franschhoek, Swartland, …).

```jsonc
{
  "data": [
    { "id": "…", "name": "Stellenbosch Wine Route", "slug": "stellenbosch", "region": "Coastal", "estate_count": 42 }
  ]
}
```

### `GET /v1/routes/:id`

Single route with member estates.

```
GET /v1/routes/stellenbosch
```

```jsonc
{
  "id": "…",
  "name": "Stellenbosch Wine Route",
  "slug": "stellenbosch",
  "description": "South Africa's oldest and largest wine route…",
  "estates": [ { "slug": "…", "estate_name": "…", "rating": 4.5 } ]
}
```

---

## Tasting Notes (auth required)

All `/v1/tastings` endpoints require a valid user JWT. Data is scoped to the authenticated user via RLS.

### `GET /v1/tastings`

List the current user's tasting notes.

### `POST /v1/tastings`

Create a tasting note.

```jsonc
// Request body
{
  "wine_id": "…",
  "stars": 4.5,
  "aromas_nose": ["citrus", "apple", "honey"],
  "aromas_flavor": ["citrus", "mineral"],
  "palate": { "sweetness": 2, "acidity": 4, "tannin": 1, "body": 3, "finish": 4 },
  "texture": "creamy",
  "notes": "Stunning complexity for the price."
}
```

### `GET /v1/tastings/:id`
### `PUT /v1/tastings/:id`
### `DELETE /v1/tastings/:id`

---

## Palate (auth required)

### `GET /v1/palate`

Derived palate profile for the current user, computed from their tasting notes.

```jsonc
{
  "top_varietals": [
    { "varietal": "Chenin Blanc", "count": 14, "avg_stars": 4.3 },
    { "varietal": "Pinotage", "count": 9, "avg_stars": 4.0 }
  ],
  "signature_aromas": ["citrus", "apple", "honey", "oak"],
  "preferred_body": 3.4,
  "preferred_sweetness": 2.1,
  "preferred_acidity": 3.8,
  "preferred_tannin": 2.5,
  "taste_fingerprint": { "light_bold": 64, "dry_sweet": 28, "soft_acidic": 72, "smooth_tannic": 45 },
  "notes_analysed": 47
}
```

---

## Scan

### `POST /v1/scan/label`

OCR lookup — accepts a base64 image, runs OCR, fuzzy-matches against the wines table.

```jsonc
// Request body
{ "image_base64": "data:image/jpeg;base64,/9j/4AAQ…" }
```

```jsonc
// Response
{
  "ocr_text": "BOEKENHOUTSKLOOF THE CHOCOLATE BLOCK 2021",
  "confidence": 0.91,
  "match": { "id": "…", "slug": "chocolate-block-2021", "name": "The Chocolate Block 2021", "estates": { "estate_name": "Boekenhoutskloof" } },
  "alternatives": [ { "slug": "…", "name": "…", "score": 0.62 } ]
}
```

### `POST /v1/scan/barcode`

```jsonc
{ "barcode": "6001234567890" }
```

### `POST /v1/scan/qr`

```jsonc
{ "qr": "https://hemelval.co.za/w/chocolate-block-2021" }
```

---

## Varietals

### `GET /v1/varietals`

```jsonc
{
  "data": [
    { "slug": "chenin-blanc", "name": "Chenin Blanc", "is_signature": true, "type": "White", "character": "High acidity, versatile…", "typical_aromas": ["apple", "honey", "quince"] }
  ]
}
```

---

## Status codes

| Code | Meaning |
|---|---|
| 200 | OK |
| 201 | Created |
| 204 | No content (delete) |
| 400 | Bad request — malformed params or body |
| 401 | Unauthorized — missing or invalid JWT |
| 403 | Forbidden — JWT valid but lacks scope |
| 404 | Not found |
| 422 | Unprocessable — validation failed |
| 429 | Rate limited |
| 502 | Upstream (Supabase) error |

## Rate limiting

Public catalog reads: **300 req/min** per IP.
Authenticated user endpoints: **120 req/min** per user.
OCR scan: **20 req/min** per IP (expensive).

## Versioning

URL-versioned (`/v1/`). Breaking changes ship as `/v2/`. The current version is **v1**.
