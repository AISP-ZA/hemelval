/**
 * Supabase Edge Function: ocr-wine-label
 *
 * Receives a base64 image from the app, calls Google Vision API
 * DOCUMENT_TEXT_DETECTION, then fuzzy-matches the extracted text
 * against the wines table to find the best match.
 *
 * Security: the Google Vision API key is stored as a Supabase secret
 * (never in client code). The function is called via the Supabase
 * Functions API with the anon key.
 *
 * Cost: Google Vision free tier = 1,000 calls/month. Sufficient for MVP.
 *
 * Deploy: supabase functions deploy ocr-wine-label
 * Set secret: supabase secrets set GOOGLE_VISION_API_KEY=your_key
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { image } = await req.json();
    if (!image) {
      return new Response(JSON.stringify({ error: "No image provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Step 1: Call Google Vision API ──────────────────────────────────
    const visionKey = Deno.env.get("GOOGLE_VISION_API_KEY");
    let ocrText = "";

    if (visionKey) {
      // Real OCR via Google Vision
      const visionRes = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${visionKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            requests: [{
              image: { content: image.replace(/^data:image\/\w+;base64,/, "") },
              features: [{ type: "DOCUMENT_TEXT_DETECTION", maxResults: 1 }],
            }],
          }),
        }
      );
      const visionData = await visionRes.json();
      ocrText = visionData?.responses?.[0]?.fullTextAnnotation?.text ?? "";
    } else {
      // No API key configured — return a helpful message
      return new Response(JSON.stringify({
        error: "Google Vision API key not configured. Set GOOGLE_VISION_API_KEY secret.",
        ocrText: "",
      }), {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!ocrText || ocrText.trim().length < 3) {
      return new Response(JSON.stringify({
        error: "Could not read text from this image. Try better lighting or a clearer photo.",
        ocrText: "",
        match: null,
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Step 2: Fuzzy-match against wines table ─────────────────────────
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Extract likely wine name tokens from OCR text
    const lowerText = ocrText.toLowerCase();
    const lines = ocrText.split("\n").filter((l: string) => l.trim().length > 2);

    // Search wines table using ILIKE for each significant line
    const candidates: any[] = [];
    for (const line of lines.slice(0, 8)) { // Check first 8 lines
      const clean = line.trim().toLowerCase();
      if (clean.length < 3) continue;

      const { data } = await supabase
        .from("wines")
        .select("id, slug, name, type, avg_stars, rating_count, about, estates(name)")
        .or(`name.ilike.%${clean}%`)
        .limit(3);

      if (data) {
        for (const wine of data) {
          if (!candidates.find((c) => c.id === wine.id)) {
            candidates.push(wine);
          }
        }
      }
    }

    // Also try matching estate names
    for (const line of lines.slice(0, 5)) {
      const clean = line.trim().toLowerCase();
      if (clean.length < 3) continue;

      const { data } = await supabase
        .from("wines")
        .select("id, slug, name, type, avg_stars, rating_count, about, estates(name)")
        .eq("estates.name", clean.charAt(0).toUpperCase() + clean.slice(1))
        .limit(3);

      if (data) {
        for (const wine of data) {
          if (!candidates.find((c) => c.id === wine.id)) {
            candidates.push(wine);
          }
        }
      }
    }

    // ── Step 3: Return best match (or candidates) ───────────────────────
    const bestMatch = candidates[0] || null;

    return new Response(JSON.stringify({
      ocrText: ocrText.slice(0, 500), // Truncate for response
      match: bestMatch ? {
        id: bestMatch.id,
        slug: bestMatch.slug,
        name: bestMatch.name,
        type: bestMatch.type,
        avgStars: Number(bestMatch.avg_stars),
        ratingCount: bestMatch.rating_count,
        about: bestMatch.about,
        estateName: bestMatch.estates?.name ?? "",
      } : null,
      candidateCount: candidates.length,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    return new Response(JSON.stringify({
      error: "OCR processing failed",
      detail: error.message,
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
