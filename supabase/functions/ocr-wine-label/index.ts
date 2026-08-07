/**
 * Supabase Edge Function: ocr-wine-label
 *
 * Gemini multimodal vision — sends a wine label photo to Google Gemini
 * with a structured-output prompt that extracts producer, wine name,
 * vintage, varietal, and region in a single API call.
 *
 * This replaces the previous Google Vision DOCUMENT_TEXT_DETECTION approach
 * (which only did raw OCR) with reasoning-grade extraction — Gemini can
 * understand label layout, logos, and wine-specific formatting.
 *
 * Pipeline: photo → Gemini structured extraction → DB fuzzy match → response
 *
 * Security: GOOGLE_API_KEY stored as Supabase secret (never in client code).
 * Cost: Gemini free tier = 15 req/min, 1500/day. Sufficient for MVP.
 *
 * Deploy:
 *   supabase functions deploy ocr-wine-label --no-verify-jwt
 *   supabase secrets set GOOGLE_API_KEY=your_key
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ALLOWED_ORIGINS = [
  "https://decanta-app.vercel.app",
  "https://decanta.vercel.app",
  "https://decanta.co.za",
  "http://localhost:8081", // Expo web preview (primary dev)
  "http://localhost:8086",
  "http://localhost:8083",
  "http://localhost:3000",
];

interface GeminiExtracted {
  producer?: string;
  wine_name?: string;
  vintage?: string;
  varietal?: string;
  region?: string;
}

Deno.serve(async (req: Request) => {
  // ── CORS ──────────────────────────────────────────────────────────────
  const origin = req.headers.get("origin") ?? "";
  const corsOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  const headers = {
    ...corsHeaders,
    "Access-Control-Allow-Origin": corsOrigin,
    "Content-Type": "application/json",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { image } = await req.json();
    if (!image) {
      return new Response(JSON.stringify({ error: "No image provided" }), {
        status: 400, headers,
      });
    }

    // ── Step 1: Gemini multimodal vision extraction ─────────────────────
    const apiKey = Deno.env.get("GOOGLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({
        error: "GOOGLE_API_KEY not configured. Set it as a Supabase secret.",
        extracted: null,
        match: null,
      }), { status: 503, headers });
    }

    // Strip data URI prefix if present
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");

    // Gemini structured-extraction prompt — wine label specific
    const prompt = `You are a wine label expert. Look at this wine label photo and extract the following information as JSON.
Only include fields you can clearly read from the label. Do not guess or fabricate values.

Return ONLY a JSON object with these keys (omit any you cannot read):
{
  "producer": "The winery/estate/producer name",
  "wine_name": "The specific wine name or cuvée name",
  "vintage": "The vintage year if visible",
  "varietal": "The grape variety or blend description",
  "region": "The wine region or appellation"
}

Photo:`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { inline_data: { mime_type: "image/jpeg", data: base64Data } },
            ],
          }],
          generationConfig: {
            temperature: 0.1, // Low temperature for factual extraction
            maxOutputTokens: 300,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error("[ocr-wine-label] Gemini API error:", geminiRes.status, errText.slice(0, 200));
      return new Response(JSON.stringify({
        error: `Gemini API returned ${geminiRes.status}`,
        extracted: null,
        match: null,
      }), { status: 502, headers });
    }

    const geminiData = await geminiRes.json();

    // Parse the structured JSON from Gemini's response
    let extracted: GeminiExtracted = {};
    try {
      const textContent = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
      extracted = JSON.parse(textContent);
    } catch {
      console.error("[ocr-wine-label] Failed to parse Gemini response as JSON");
    }

    // If Gemini couldn't extract anything meaningful, return early
    const hasData = extracted.producer || extracted.wine_name || extracted.varietal;
    if (!hasData) {
      return new Response(JSON.stringify({
        error: "Could not read the wine label. Try better lighting or a clearer photo.",
        extracted: null,
        match: null,
      }), { status: 200, headers });
    }

    // ── Step 2: Match extracted data against our wines DB ───────────────
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const candidates: any[] = [];
    const seen = new Set<string>();

    // Strategy: try multiple match approaches in priority order

    // 2a. Match by wine name (highest confidence)
    if (extracted.wine_name) {
      const cleanName = extracted.wine_name.trim();
      const { data } = await supabase
        .from("wines")
        .select("id, slug, name, type, avg_stars, rating_count, about, estates(name, slug)")
        .ilike("name", `%${cleanName}%`)
        .limit(5);
      if (data) for (const w of data) { if (!seen.has(w.id)) { seen.add(w.id); candidates.push(w); } }
    }

    // 2b. Match by producer/estate name
    if (extracted.producer) {
      const cleanProducer = extracted.producer.trim();
      const { data } = await supabase
        .from("wines")
        .select("id, slug, name, type, avg_stars, rating_count, about, estates(name, slug)")
        .ilike("estates.name", `%${cleanProducer}%`)
        .limit(5);
      if (data) for (const w of data) { if (!seen.has(w.id)) { seen.add(w.id); candidates.push(w); } }
    }

    // 2c. If we have a varietal but no name match, find wines of that varietal from the producer
    if (candidates.length === 0 && extracted.varietal && extracted.producer) {
      const { data } = await supabase
        .from("wines")
        .select("id, slug, name, type, avg_stars, rating_count, about, estates(name, slug)")
        .ilike("estates.name", `%${extracted.producer.trim()}%`)
        .limit(5);
      if (data) for (const w of data) { if (!seen.has(w.id)) { seen.add(w.id); candidates.push(w); } }
    }

    // 2d. Last resort: match any token from wine_name or producer
    if (candidates.length === 0) {
      const searchTerm = (extracted.wine_name || extracted.producer || "")
        .split(/\s+/)
        .filter((w: string) => w.length > 3)
        .slice(0, 3);
      for (const term of searchTerm) {
        const { data } = await supabase
          .from("wines")
          .select("id, slug, name, type, avg_stars, rating_count, about, estates(name, slug)")
          .ilike("name", `%${term}%`)
          .limit(3);
        if (data) for (const w of data) { if (!seen.has(w.id)) { seen.add(w.id); candidates.push(w); } }
        if (candidates.length >= 3) break;
      }
    }

    // ── Step 3: Return result ───────────────────────────────────────────
    const bestMatch = candidates[0] || null;

    return new Response(JSON.stringify({
      // What Gemini extracted (for debugging / "did we read this right?")
      extracted: {
        producer: extracted.producer ?? null,
        wine_name: extracted.wine_name ?? null,
        vintage: extracted.vintage ?? null,
        varietal: extracted.varietal ?? null,
        region: extracted.region ?? null,
      },
      // Best DB match
      match: bestMatch ? {
        id: bestMatch.id,
        slug: bestMatch.slug,
        name: bestMatch.name,
        type: bestMatch.type,
        avgStars: bestMatch.avg_stars ? Number(bestMatch.avg_stars) : 0,
        ratingCount: bestMatch.rating_count ?? 0,
        about: bestMatch.about ?? "",
        estateName: bestMatch.estates?.name ?? "",
        estateSlug: bestMatch.estates?.slug ?? "",
      } : null,
      // Alternative candidates for "did you mean?" UI
      alternatives: candidates.slice(1, 4).map((c) => ({
        slug: c.slug,
        name: c.name,
        estateName: c.estates?.name ?? "",
      })),
      candidateCount: candidates.length,
    }), { headers });

  } catch (error) {
    console.error("[ocr-wine-label] Unhandled error:", error);
    return new Response(JSON.stringify({
      error: "OCR processing failed",
      detail: error.message,
    }), { status: 500, headers });
  }
});
