// Decanta REST API v1 — Supabase Edge Function
// Runtime: Deno (Supabase Edge Functions)
// Framework: Hono
//
// Deploy:
//   supabase functions deploy api --no-verify-jwt
//
// All catalog reads are public (RLS: USING (true) on estates/wines/events).
// User-scoped routes (/tastings, /palate, /estates/recommendations) verify the JWT.

import { Hono } from "https://esm.sh/hono@4.6.14";
import { cors } from "https://esm.sh/hono@4.6.14/cors";
import { bearerAuth } from "https://esm.sh/hono@4.6.14/bearer-auth";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

// ── Config ──────────────────────────────────────────────────────────────
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ALLOWED_ORIGINS = [
  "https://decanta.vercel.app",
  "https://decanta-app.vercel.app",
  "https://decanta.co.za",
  "https://decanta-app.vercel.app", // legacy URL until Vercel project renamed
  "http://localhost:3000",
  "http://localhost:3002",
  "http://localhost:3010",
  "http://localhost:8080",
  "http://localhost:8086",
];

const app = new Hono();

// ── Middleware ──────────────────────────────────────────────────────────
app.use(
  "*",
  cors({
    origin: (origin) => (ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]),
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "apikey"],
    exposeHeaders: ["X-Total-Count"],
    maxAge: 86400,
  }),
);

// ── Helpers ─────────────────────────────────────────────────────────────

/** Build a Supabase client. Pass user JWT to respect RLS; omit for service role. */
function db(userJwt?: string) {
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    global: { headers: userJwt ? { Authorization: `Bearer ${userJwt}` } : {} },
  });
}

/** Extract user JWT from Authorization header (or apikey fallback). */
function userJwt(c: Context): string | null {
  const auth = c.req.header("Authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  const apikey = c.req.header("apikey");
  return apikey ?? null;
}

/** Parse pagination params with sane clamps. */
function pagination(c: Context) {
  const page = Math.max(1, Number(c.req.query("page") ?? 1));
  const page_size = Math.min(100, Math.max(1, Number(c.req.query("page_size") ?? 20)));
  return { page, page_size, offset: (page - 1) * page_size };
}

/** Standard pagination envelope for a list response. */
function paginate<T>(rows: T[], page: number, page_size: number, total: number) {
  return {
    data: rows,
    pagination: {
      page,
      page_size,
      total,
      total_pages: Math.ceil(total / page_size),
    },
  };
}

/** Haversine distance in km. */
function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Error response following RFC 7807 shape. */
function errorResponse(code: string, message: string, status: number) {
  return new Response(JSON.stringify({ error: { code, message } }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// Small type alias for Hono context (keeps the helpers framework-agnostic).
type Context = Parameters<Parameters<typeof app.get>[1]>[0];

// ── ESTATES — list ──────────────────────────────────────────────────────
app.get("/v1/estates", async (c) => {
  const { page, page_size, offset } = pagination(c);
  const region = c.req.query("region");
  const district = c.req.query("district");
  const ward = c.req.query("ward");
  const wine_route = c.req.query("wine_route");
  const province = c.req.query("province");
  const q = c.req.query("q");
  const sort = c.req.query("sort") ?? "rating";
  const fields = c.req.query("fields");

  let query = db().from("estates").select("*", { count: "exact" });

  if (region) query = query.eq("region", region);
  if (district) query = query.eq("district", district);
  if (ward) query = query.eq("ward", ward);
  if (wine_route) query = query.eq("wine_route", wine_route);
  if (province) query = query.eq("province", province);
  if (q) {
    query = query.or(
      `estate_name.ilike.%${q}%,region.ilike.%${q}%,about.ilike.%${q}%,famous_for.ilike.%${q}%`,
    );
  }

  // Sorting
  const sortMap: Record<string, { column: string; ascending: boolean }> = {
    rating: { column: "rating", ascending: false },
    name: { column: "estate_name", ascending: true },
    established: { column: "year_established", ascending: false },
    newest: { column: "created_at", ascending: false },
  };
  const s = sortMap[sort] ?? sortMap.rating;
  query = query.order(s.column, { ascending: s.ascending });

  query = query.range(offset, offset + page_size - 1);
  if (fields) query = query.select(fields);

  const { data, error, count } = await query;
  if (error) return errorResponse("QUERY_FAILED", error.message, 502);
  return c.json(paginate(data ?? [], page, page_size, count ?? 0));
});

// ── ESTATES — single ────────────────────────────────────────────────────
app.get("/v1/estates/:id", async (c) => {
  const id = c.req.param("id");
  const client = db();

  // UUID vs slug
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  const filter = isUuid ? { id } : { slug: id };

  const { data: estate, error } = await client
    .from("estates")
    .select("*")
    .match(filter)
    .maybeSingle();
  if (error) return errorResponse("QUERY_FAILED", error.message, 502);
  if (!estate) return errorResponse("NOT_FOUND", "Estate not found", 404);

  // Nest wines
  const { data: wines } = await client
    .from("wines")
    .select("id,slug,name,type,avg_stars,rating_count")
    .eq("estate_id", estate.id);

  return c.json({ ...estate, wines: wines ?? [] });
});

// ── ESTATES — search ────────────────────────────────────────────────────
app.get("/v1/estates/search", async (c) => {
  const q = c.req.query("q");
  if (!q) return errorResponse("MISSING_PARAM", "Query param 'q' is required", 400);

  const { page, page_size, offset } = pagination(c);
  const { data, error, count } = await db()
    .from("estates")
    .select("*", { count: "exact" })
    .or(
      `estate_name.ilike.%${q}%,region.ilike.%${q}%,about.ilike.%${q}%,famous_for.ilike.%${q}%`,
    )
    .order("rating", { ascending: false })
    .range(offset, offset + page_size - 1);

  if (error) return errorResponse("QUERY_FAILED", error.message, 502);
  return c.json(paginate(data ?? [], page, page_size, count ?? 0));
});

// ── ESTATES — nearby (geo) ──────────────────────────────────────────────
app.get("/v1/estates/nearby", async (c) => {
  const lat = Number(c.req.query("lat"));
  const lng = Number(c.req.query("lng"));
  const radius = Math.min(500, Number(c.req.query("radius") ?? 50));
  const limit = Math.min(100, Number(c.req.query("limit") ?? 20));

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return errorResponse("MISSING_PARAM", "Query params 'lat' and 'lng' are required", 400);
  }

  // Fetch all estates with coords (no native PostGIS function in basic Supabase;
  // haversine in JS. For very large datasets, switch to an ST_DWithin RPC.)
  const { data, error } = await db()
    .from("estates")
    .select("*")
    .not("latitude", "is", null)
    .not("longitude", "is", null);

  if (error) return errorResponse("QUERY_FAILED", error.message, 502);

  const withDistance = (data ?? [])
    .map((e: any) => ({
      ...e,
      distance_km: Math.round(haversine(lat, lng, e.latitude, e.longitude) * 10) / 10,
    }))
    .filter((e: any) => e.distance_km <= radius)
    .sort((a: any, b: any) => a.distance_km - b.distance_km)
    .slice(0, limit);

  return c.json({
    data: withDistance,
    origin: { lat, lng },
    radius_km: radius,
  });
});

// ── ESTATES — facility filter shortcuts ─────────────────────────────────
for (const { path, column } of [
  { path: "restaurant", column: "restaurant" },
  { path: "pet-friendly", column: "pet_friendly" },
  { path: "family", column: "family_friendly" },
  { path: "live-music", column: "live_music" },
]) {
  app.get(`/v1/estates/${path}`, async (c) => {
    const { page, page_size, offset } = pagination(c);
    const region = c.req.query("region");
    let query = db()
      .from("estates")
      .select("*", { count: "exact" })
      .eq(column, true);
    if (region) query = query.eq("region", region);
    query = query.order("rating", { ascending: false }).range(offset, offset + page_size - 1);
    const { data, error, count } = await query;
    if (error) return errorResponse("QUERY_FAILED", error.message, 502);
    return c.json(paginate(data ?? [], page, page_size, count ?? 0));
  });
}

// ── ESTATES — wines for an estate ───────────────────────────────────────
app.get("/v1/estates/:id/wines", async (c) => {
  const id = c.req.param("id");
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  // Resolve estate UUID from slug if needed
  let estateId = id;
  if (!isUuid) {
    const { data } = await db().from("estates").select("id").eq("slug", id).maybeSingle();
    if (!data) return errorResponse("NOT_FOUND", "Estate not found", 404);
    estateId = data.id;
  }

  const { data, error } = await db()
    .from("wines")
    .select("*")
    .eq("estate_id", estateId)
    .order("avg_stars", { ascending: false, nullsFirst: false });
  if (error) return errorResponse("QUERY_FAILED", error.message, 502);
  return c.json({ data: data ?? [] });
});

// ── ESTATES — events for an estate ──────────────────────────────────────
app.get("/v1/estates/:id/events", async (c) => {
  const id = c.req.param("id");
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  let estateId = id;
  if (!isUuid) {
    const { data } = await db().from("estates").select("id").eq("slug", id).maybeSingle();
    if (!data) return errorResponse("NOT_FOUND", "Estate not found", 404);
    estateId = data.id;
  }

  const { data, error } = await db()
    .from("events")
    .select("*")
    .or(`estate_id.eq.${estateId},estates.cs.{${estateId}}`);
  if (error) return errorResponse("QUERY_FAILED", error.message, 502);
  return c.json({ data: data ?? [] });
});

// ── ESTATES — recommendations (auth) ────────────────────────────────────
app.get("/v1/estates/recommendations", async (c) => {
  const jwt = userJwt(c);
  if (!jwt) return errorResponse("UNAUTHORIZED", "Authentication required", 401);
  const limit = Math.min(50, Number(c.req.query("limit") ?? 10));

  // Build user-scoped client (RLS limits to their rows)
  const client = db(jwt);

  // Load user's tasting notes with wine varietals
  const { data: notes, error } = await client
    .from("tasting_notes")
    .select("wine_id, stars, wines(varietals, type)")
    .not("wine_id", "is", null);
  if (error) return errorResponse("QUERY_FAILED", error.message, 502);

  if (!notes || notes.length === 0) {
    // Cold start: return top-rated estates
    const { data: fallback } = await client
      .from("estates")
      .select("id, slug, estate_name, rating, cover_image_url, region")
      .order("rating", { ascending: false })
      .limit(limit);
    return c.json({
      data: (fallback ?? []).map((e: any) => ({ ...e, match_score: 0, reason: "Top-rated (no palate data yet)" })),
      basis: { top_varietals: [], notes_analysed: 0 },
    });
  }

  // Aggregate varietal preferences
  const varietalScores: Record<string, { count: number; stars: number }> = {};
  for (const n of notes as any[]) {
    const vars: string[] = n.wines?.varietals ?? [];
    for (const v of vars) {
      if (!varietalScores[v]) varietalScores[v] = { count: 0, stars: 0 };
      varietalScores[v].count++;
      varietalScores[v].stars += n.stars ?? 3;
    }
  }
  const topVarietals = Object.entries(varietalScores)
    .map(([v, s]) => ({ varietal: v, count: s.count, avg: s.stars / s.count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map((s) => s.varietal);

  // Score estates by how many of their wines match top varietals
  const { data: estates } = await client
    .from("estates")
    .select("id, slug, estate_name, rating, cover_image_url, region, wines(varietals)")
    .not("rating", "is", null);

  const scored = (estates ?? [])
    .map((e: any) => {
      const estateWines = e.wines ?? [];
      let matches = 0;
      for (const w of estateWines) {
        for (const v of (w.varietals ?? [])) {
          if (topVarietals.includes(v)) matches++;
        }
      }
      const matchScore = estateWines.length > 0
        ? Math.min(100, Math.round((matches / estateWines.length) * 80 + (e.rating ?? 0) * 4))
        : Math.round((e.rating ?? 0) * 12);
      return {
        id: e.id,
        slug: e.slug,
        estate_name: e.estate_name,
        rating: e.rating,
        cover_image_url: e.cover_image_url,
        region: e.region,
        match_score: matchScore,
        reason: `${matches} of ${estateWines.length} wines match your top varietals (${topVarietals.slice(0, 2).join(", ")}).`,
      };
    })
    .sort((a, b) => b.match_score - a.match_score)
    .slice(0, limit);

  return c.json({
    data: scored,
    basis: { top_varietals: topVarietals, notes_analysed: notes.length },
  });
});

// ── WINES ───────────────────────────────────────────────────────────────
app.get("/v1/wines", async (c) => {
  const { page, page_size, offset } = pagination(c);
  const type = c.req.query("type");
  const varietal = c.req.query("varietal");
  const region = c.req.query("region");
  const estate = c.req.query("estate_id");
  const minRating = c.req.query("min_rating");
  const q = c.req.query("q");
  const sort = c.req.query("sort") ?? "rating";

  let query = db()
    .from("wines")
    .select("*, estates(slug, estate_name, cover_image_url)", { count: "exact" });

  if (type) query = query.eq("type", type);
  if (varietal) query = query.cs("varietals", [varietal]);
  if (region) query = query.eq("region", region);
  if (minRating) query = query.gte("avg_stars", Number(minRating));
  if (estate) {
    const isUuid = /^[0-9a-f]{8}-/i.test(estate);
    if (isUuid) query = query.eq("estate_id", estate);
    else query = query.eq("estates.slug", estate);
  }
  if (q) {
    query = query.or(`name.ilike.%${q}%,about.ilike.%${q}%`);
  }

  const sortMap: Record<string, { column: string; ascending: boolean }> = {
    rating: { column: "avg_stars", ascending: false },
    name: { column: "name", ascending: true },
    price: { column: "price_zar", ascending: true },
  };
  const s = sortMap[sort] ?? sortMap.rating;
  query = query.order(s.column, { ascending: s.ascending, nullsFirst: false });

  query = query.range(offset, offset + page_size - 1);
  const { data, error, count } = await query;
  if (error) return errorResponse("QUERY_FAILED", error.message, 502);
  return c.json(paginate(data ?? [], page, page_size, count ?? 0));
});

app.get("/v1/wines/:id", async (c) => {
  const id = c.req.param("id");
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  const filter = isUuid ? { id } : { slug: id };

  const { data, error } = await db()
    .from("wines")
    .select("*, estates(*)")
    .match(filter)
    .maybeSingle();
  if (error) return errorResponse("QUERY_FAILED", error.message, 502);
  if (!data) return errorResponse("NOT_FOUND", "Wine not found", 404);
  return c.json(data);
});

// ── EVENTS ──────────────────────────────────────────────────────────────
app.get("/v1/events", async (c) => {
  const { page, page_size, offset } = pagination(c);
  const region = c.req.query("region");
  const from = c.req.query("from");
  const to = c.req.query("to");
  const q = c.req.query("q");
  const sort = c.req.query("sort") ?? "date";

  let query = db().from("events").select("*", { count: "exact" });
  if (region) query = query.eq("region", region);
  if (from) query = query.gte("start_date", from);
  if (to) query = query.lte("end_date", to);
  if (q) query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`);

  query = query.order(
    sort === "name" ? "name" : "start_date",
    { ascending: sort !== "name" },
  );
  query = query.range(offset, offset + page_size - 1);

  const { data, error, count } = await query;
  if (error) return errorResponse("QUERY_FAILED", error.message, 502);
  return c.json(paginate(data ?? [], page, page_size, count ?? 0));
});

app.get("/v1/events/:id", async (c) => {
  const id = c.req.param("id");
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  const filter = isUuid ? { id } : { slug: id };

  const { data, error } = await db().from("events").select("*").match(filter).maybeSingle();
  if (error) return errorResponse("QUERY_FAILED", error.message, 502);
  if (!data) return errorResponse("NOT_FOUND", "Event not found", 404);
  return c.json(data);
});

// ── WINE ROUTES ─────────────────────────────────────────────────────────
app.get("/v1/routes", async (c) => {
  const { data, error } = await db()
    .from("wine_routes")
    .select("*")
    .order("name", { ascending: true });
  if (error) return errorResponse("QUERY_FAILED", error.message, 502);
  return c.json({ data: data ?? [] });
});

app.get("/v1/routes/:id", async (c) => {
  const id = c.req.param("id");
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  const filter = isUuid ? { id } : { slug: id };

  const { data: route, error } = await db()
    .from("wine_routes")
    .select("*")
    .match(filter)
    .maybeSingle();
  if (error) return errorResponse("QUERY_FAILED", error.message, 502);
  if (!route) return errorResponse("NOT_FOUND", "Wine route not found", 404);

  const { data: estates } = await db()
    .from("estates")
    .select("slug, estate_name, rating, region, cover_image_url")
    .eq("wine_route_id", route.id)
    .order("rating", { ascending: false, nullsFirst: false });

  return c.json({ ...route, estates: estates ?? [] });
});

// ── VARIETALS ───────────────────────────────────────────────────────────
app.get("/v1/varietals", async (c) => {
  const { data, error } = await db()
    .from("varietals")
    .select("*")
    .order("name", { ascending: true });
  if (error) return errorResponse("QUERY_FAILED", error.message, 502);
  return c.json({ data: data ?? [] });
});

// ── TASTING NOTES (auth required) ───────────────────────────────────────
app.get("/v1/tastings", async (c) => {
  const jwt = userJwt(c);
  if (!jwt) return errorResponse("UNAUTHORIZED", "Authentication required", 401);
  const { page, page_size, offset } = pagination(c);

  const { data, error, count } = await db(jwt)
    .from("tasting_notes")
    .select("*, wines(id, slug, name, estates(estate_name, slug))", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + page_size - 1);
  if (error) return errorResponse("QUERY_FAILED", error.message, 502);
  return c.json(paginate(data ?? [], page, page_size, count ?? 0));
});

app.post("/v1/tastings", async (c) => {
  const jwt = userJwt(c);
  if (!jwt) return errorResponse("UNAUTHORIZED", "Authentication required", 401);
  const body = await c.req.json();

  const { data, error } = await db(jwt)
    .from("tasting_notes")
    .insert({
      wine_id: body.wine_id,
      stars: body.stars,
      aromas_nose: body.aromas_nose,
      aromas_flavor: body.aromas_flavor,
      palate: body.palate,
      texture: body.texture,
      notes: body.notes,
    })
    .select()
    .single();
  if (error) return errorResponse("INSERT_FAILED", error.message, 422);
  return c.json(data, 201);
});

app.get("/v1/tastings/:id", async (c) => {
  const jwt = userJwt(c);
  if (!jwt) return errorResponse("UNAUTHORIZED", "Authentication required", 401);
  const { data, error } = await db(jwt)
    .from("tasting_notes")
    .select("*, wines(*)")
    .eq("id", c.req.param("id"))
    .maybeSingle();
  if (error) return errorResponse("QUERY_FAILED", error.message, 502);
  if (!data) return errorResponse("NOT_FOUND", "Tasting note not found", 404);
  return c.json(data);
});

app.put("/v1/tastings/:id", async (c) => {
  const jwt = userJwt(c);
  if (!jwt) return errorResponse("UNAUTHORIZED", "Authentication required", 401);
  const body = await c.req.json();
  const { data, error } = await db(jwt)
    .from("tasting_notes")
    .update({
      stars: body.stars,
      aromas_nose: body.aromas_nose,
      aromas_flavor: body.aromas_flavor,
      palate: body.palate,
      texture: body.texture,
      notes: body.notes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", c.req.param("id"))
    .select()
    .single();
  if (error) return errorResponse("UPDATE_FAILED", error.message, 422);
  return c.json(data);
});

app.delete("/v1/tastings/:id", async (c) => {
  const jwt = userJwt(c);
  if (!jwt) return errorResponse("UNAUTHORIZED", "Authentication required", 401);
  const { error } = await db(jwt).from("tasting_notes").delete().eq("id", c.req.param("id"));
  if (error) return errorResponse("DELETE_FAILED", error.message, 422);
  return c.body(null, 204);
});

// ── PALATE (auth required) ──────────────────────────────────────────────
app.get("/v1/palate", async (c) => {
  const jwt = userJwt(c);
  if (!jwt) return errorResponse("UNAUTHORIZED", "Authentication required", 401);

  const { data: notes, error } = await db(jwt)
    .from("tasting_notes")
    .select("stars, palate, aromas_nose, aromas_flavor, wines(varietals, type)")
    .not("wine_id", "is", null);
  if (error) return errorResponse("QUERY_FAILED", error.message, 502);

  if (!notes || notes.length === 0) {
    return c.json({
      top_varietals: [],
      signature_aromas: [],
      preferred_body: null,
      preferred_sweetness: null,
      preferred_acidity: null,
      preferred_tannin: null,
      taste_fingerprint: null,
      notes_analysed: 0,
    });
  }

  // Aggregate varietals
  const varietalAgg: Record<string, { count: number; stars: number }> = {};
  const aromaCount: Record<string, number> = {};
  let body = 0, sweet = 0, acid = 0, tannin = 0, bodyN = 0, sweetN = 0, acidN = 0, tanninN = 0;

  for (const n of notes as any[]) {
    // Varietals
    for (const v of (n.wines?.varietals ?? [])) {
      if (!varietalAgg[v]) varietalAgg[v] = { count: 0, stars: 0 };
      varietalAgg[v].count++;
      varietalAgg[v].stars += n.stars ?? 3;
    }
    // Aromas
    for (const a of [...(n.aromas_nose ?? []), ...(n.aromas_flavor ?? [])]) {
      aromaCount[a] = (aromaCount[a] ?? 0) + 1;
    }
    // Palate averages
    const p = n.palate ?? {};
    if (p.body != null) { body += p.body; bodyN++; }
    if (p.sweetness != null) { sweet += p.sweetness; sweetN++; }
    if (p.acidity != null) { acid += p.acidity; acidN++; }
    if (p.tannin != null) { tannin += p.tannin; tanninN++; }
  }

  const topVarietals = Object.entries(varietalAgg)
    .map(([v, s]) => ({ varietal: v, count: s.count, avg_stars: Math.round((s.stars / s.count) * 10) / 10 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const signatureAromas = Object.entries(aromaCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([a]) => a);

  const pBody = bodyN ? body / bodyN : null;
  const pSweet = sweetN ? sweet / sweetN : null;
  const pAcid = acidN ? acid / acidN : null;
  const pTannin = tanninN ? tannin / tanninN : null;

  // Fingerprint on 0-100 bipolar scales
  const fingerprint = (pBody != null && pSweet != null && pAcid != null && pTannin != null)
    ? {
        light_bold: Math.round((pBody / 5) * 100),
        dry_sweet: Math.round((pSweet / 5) * 100),
        soft_acidic: Math.round((pAcid / 5) * 100),
        smooth_tannic: Math.round((pTannin / 5) * 100),
      }
    : null;

  return c.json({
    top_varietals: topVarietals,
    signature_aromas: signatureAromas,
    preferred_body: pBody ? Math.round(pBody * 10) / 10 : null,
    preferred_sweetness: pSweet ? Math.round(pSweet * 10) / 10 : null,
    preferred_acidity: pAcid ? Math.round(pAcid * 10) / 10 : null,
    preferred_tannin: pTannin ? Math.round(pTannin * 10) / 10 : null,
    taste_fingerprint: fingerprint,
    notes_analysed: notes.length,
  });
});

// ── SCAN ────────────────────────────────────────────────────────────────
app.post("/v1/scan/barcode", async (c) => {
  const { barcode } = await c.req.json();
  if (!barcode) return errorResponse("MISSING_PARAM", "barcode is required", 400);

  // Query by barcode only (gtin column doesn't exist in schema)
  const { data, error } = await db()
    .from("wines")
    .select("id, slug, name, type, avg_stars, estates(slug, estate_name)")
    .eq("barcode", barcode)
    .maybeSingle();
  if (error) return errorResponse("QUERY_FAILED", error.message, 502);
  if (!data) return c.json({ match: null, barcode }, 404);
  return c.json({ match: data, barcode });
});

app.post("/v1/scan/qr", async (c) => {
  const { qr } = await c.req.json();
  if (!qr) return errorResponse("MISSING_PARAM", "qr is required", 400);

  // Extract slug from QR URL patterns — support both /w/:slug (wine) and /e/:slug (estate)
  const wineMatch = qr.match(/\/w\/([a-z0-9-]+)/i);
  const estateMatch = qr.match(/\/e\/([a-z0-9-]+)/i);
  const rawSlug = qr.match(/^([a-z0-9-]+)$/i)?.[1];
  const slug = wineMatch?.[1] || estateMatch?.[1] || rawSlug;
  if (!slug) return c.json({ match: null, qr }, 404);

  // Try wine lookup first
  const { data: wine, error: wineErr } = await db()
    .from("wines")
    .select("id, slug, name, type, avg_stars, estates(slug, estate_name)")
    .eq("slug", slug)
    .maybeSingle();
  if (wineErr) return errorResponse("QUERY_FAILED", wineErr.message, 502);
  if (wine) return c.json({ match: wine, qr, type: "wine" });

  // If estate QR, find the estate's top wine
  const { data: estateWine, error: estateErr } = await db()
    .from("wines")
    .select("id, slug, name, type, avg_stars, estates!inner(slug, estate_name)")
    .eq("estates.slug", slug)
    .order("avg_stars", { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();
  if (estateErr) return errorResponse("QUERY_FAILED", estateErr.message, 502);
  if (estateWine) return c.json({ match: estateWine, qr, type: "estate" });

  return c.json({ match: null, qr }, 404);
});

app.post("/v1/scan/label", async (c) => {
  const { image_base64 } = await c.req.json();
  if (!image_base64) return errorResponse("MISSING_PARAM", "image_base64 is required", 400);

  // OCR via Tesseract.js (loaded on-demand) — same client-side approach
  // as ScanScreen, but server-side for thin clients.
  // For production, swap to Google Vision via the existing ocr-wine-label function.
  try {
    const { default: Tesseract } = await import(
      "https://esm.sh/tesseract.js@5.1.1"
    );
    const base64Data = image_base64.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Uint8Array.from(atob(base64Data), (m) => m.charCodeAt(0)).buffer;
    const worker = await Tesseract.createWorker("eng");
    const { data: { text, confidence } } = await worker.recognize(buffer);
    await worker.terminate();

    const cleanText = text.replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();
    const tokens = cleanText.split(" ").filter((t: string) => t.length >= 3);

    // Fuzzy match against estates + wines by token
    let bestMatch: any = null;
    let alternatives: any[] = [];
    for (const token of tokens.slice(0, 6)) {
      const { data: estates } = await db()
        .from("estates")
        .select("id, slug, estate_name")
        .ilike("estate_name", `%${token}%`)
        .limit(3);
      if (estates && estates.length > 0) {
        if (!bestMatch) bestMatch = estates[0];
        alternatives.push(...estates);
        break;
      }
    }
    // Also try wines
    if (!bestMatch) {
      for (const token of tokens.slice(0, 6)) {
        const { data: wines } = await db()
          .from("wines")
          .select("id, slug, name, estates(slug, estate_name)")
          .ilike("name", `%${token}%`)
          .limit(3);
        if (wines && wines.length > 0) {
          bestMatch = wines[0];
          alternatives.push(...wines);
          break;
        }
      }
    }

    return c.json({
      ocr_text: cleanText,
      confidence: Math.round(confidence) / 100,
      match: bestMatch,
      alternatives: alternatives.slice(0, 5),
    });
  } catch (err) {
    return errorResponse("OCR_FAILED", String(err), 502);
  }
});

// ── Health ──────────────────────────────────────────────────────────────
app.get("/v1/health", (c) =>
  c.json({
    status: "ok",
    service: "decanta-api",
    version: "v1",
    timestamp: new Date().toISOString(),
  }));

app.get("/", (c) => c.redirect("/v1/health"));

// ── 404 fallback ────────────────────────────────────────────────────────
app.notFound((c) =>
  errorResponse("NOT_FOUND", `Route not found: ${c.req.method} ${c.req.path}`, 404));

app.onError((err, c) => {
  console.error("[decanta-api] unhandled:", err);
  return errorResponse("INTERNAL_ERROR", err.message, 500);
});

// ── Boot ────────────────────────────────────────────────────────────────
Deno.serve(app.fetch);
