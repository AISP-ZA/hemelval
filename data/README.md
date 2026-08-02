# Decanta Master Wine Knowledge Base (MWKB)

> The canonical dataset of every active South African wine producer.
> This data powers: AI recommendations, search, estate discovery, trip planning,
> marketplace, maps, events, passport achievements, and estate analytics.

## Files

| File | Description |
|---|---|
| `schema.sql` | Full Postgres DDL — deploy to Supabase or any Postgres instance |
| `wine_estates.csv` | All estates in flat CSV format (60+ columns) |
| `wine_estates.json` | Same data as structured JSON |
| `wine_estates.xlsx` | Excel format for non-technical review |
| `wine_estates.sql` | INSERT statements for direct DB seeding |
| `wine_routes.csv` | Normalised wine route reference table |
| `wine_regions.csv` | WO appellation hierarchy (unit → region → district → ward) |
| `varietals.csv` | All SA varietals with aliases and character profiles |
| `estate_varietals.csv` | Many-to-many: estate ↔ varietal (with primary/signature flags) |
| `estate_facilities.csv` | Many-to-many: estate ↔ facility type |
| `restaurants.csv` | Estate restaurants with cuisine and pricing |
| `accommodation.csv` | Estate accommodation with pricing |
| `events.csv` | SA wine festivals and events calendar |

## Data Sources

1. Official estate websites (priority)
2. Wine.co.za / Wined.co.za / Wineries.co.za
3. Platter's SA Wine Guide
4. SA Wine Routes associations
5. Cape Wine / WOSA
6. Google Maps / OpenStreetMap (geo data)
7. Wine awards databases

## Maintenance

This is a **continuously maintainable** database. Each estate record includes:
- `last_verified` — date the data was last checked against the source
- `data_source` — where the data came from
- `notes` — any caveats or issues

## Live Database

The live instance is hosted on Supabase:
- **Project**: `hemelval-prod` (`vlbqrvynpmuzktpxhkjt`)
- **URL**: `https://vlbqrvynpmuzktpxhkjt.supabase.co`
- **API**: REST (PostgREST) + GraphQL + Realtime

## Estate Schema (60+ fields)

```
Identity: id, estate_name, legal_name, slug
Contact: website, email, phone, facebook, instagram, linkedin, youtube
Location: address, city, province, postcode, lat, lng, google_maps_url
Classification: region, district, ward, wine_route
Production: year_established, currently_producing, estate_size_ha, vineyard_size_ha
Facilities: restaurant, accommodation, wedding_venue, conference, family_friendly,
            pet_friendly, wheelchair_access, tasting_room, cellar_tours, picnic,
            cycling, running, hiking, live_music, market, events_venue
Certifications: organic, biodynamic, sustainable, certifications[]
Visitor: opening_hours, booking_required, price_range
Ratings: rating, tripadvisor, google_rating, google_reviews
Content: description, history, winemaker, owner, about, famous_for
Meta: is_verified, subscription_tier, notes, last_verified, data_source
```

---

*Part of the Decanta / Hemelval platform. Built to AISP standards.*
