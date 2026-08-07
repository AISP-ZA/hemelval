// Decanta — Dynamic SA Wine Event Ingestion
// Supabase Edge Function (Deno)
//
// Self-updating wine festival calendar. Runs on a schedule (weekly cron via
// `supabase schedule`) and imports events from public SA wine listing sources,
// normalises them to the events table, and leaves new/uncertain rows in
// verification_status='pending' so they stay hidden from users until an admin
// reviews them (EVENTS_CALENDAR.md: "Never publish an unconfirmed date").
//
// Deploy:
//   supabase functions deploy ingest-events --no-verify-jwt
//
// Schedule (run weekly, Monday 02:00 SAST = Sunday 22:00 UTC):
//   supabase schedule add ingest-events-cron \
//     --function ingest-events \
//     --cron "0 22 * * 0" \
//     --payload '{"secret":"..."}'
//
// Or via the dashboard: Project → Functions → ingest-events → Add Schedule.
//
// Manual run:
//   curl -X POST "$SUPABASE_URL/functions/v1/ingest-events" \
//     -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
//     -H "Content-Type: application/json" \
//     -d '{"secret":"..."}'
//
// Auth: a shared secret passed in the body or Authorization header prevents
// anonymous abuse. Set via `supabase secrets set INGEST_SECRET=...`.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

// ── Config ───────────────────────────────────────────────────────────────
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const INGEST_SECRET = Deno.env.get("INGEST_SECRET");

// Service-role client — bypasses RLS so we can write pending events + log.
const db = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// ── Source registry ──────────────────────────────────────────────────────
// Each source is an async generator yielding normalised event candidates.
// Add a new source = write one fetcher and register it here. The pipeline
// is resilient: a failing source logs a partial and the others still run.
interface RawEvent {
  name: string;
  venueName?: string;
  region?: string;
  startsAt?: string; // ISO 8601
  endsAt?: string;
  recurringMonth?: number; // 1–12, for forecast layer
  ticketUrl?: string;
  priceMinZar?: number;
  priceMaxZar?: number;
  description?: string;
  sourceName: string;
  sourceUrl: string;
  sourceEventId: string; // stable id from the source, for dedupe
}

type SourceResult = { ok: true; events: RawEvent[] } | { ok: false; error: string };

const SOURCES: { name: string; fetch: () => Promise<SourceResult> }[] = [
  { name: "wine.co.za", fetch: fetchWineCoZa },
  { name: "sa-venues.com", fetch: fetchSaVenues },
];

// ── Source 1: wine.co.za diary ───────────────────────────────────────────
// diary.wine.co.za is the best existing SA wine events aggregator.
// The page lists events with date/venue/ticket links. HTML structure is
// fetched live and parsed defensively — selectors may need tuning after
// the first live run (see TODO below). The function NEVER crashes on a
// selector miss; it returns an empty result and logs a partial.
async function fetchWineCoZa(): Promise<SourceResult> {
  try {
    const res = await fetch("https://diary.wine.co.za/", {
      headers: { "User-Agent": "DecantaBot/1.0 (+https://decanta.co.za)" },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    const html = await res.text();
    const events = parseWineCoZaHtml(html);
    return { ok: true, events };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

// Defensive HTML parser for diary.wine.co.za.
// TODO(tune): verify selectors against live HTML on first deploy. The structure
// below is a best-effort guess based on common event-listing patterns; if the
// site uses a different layout, adjust the regex/anchors here. The pipeline
// stays safe either way: a bad parse → empty result → logged partial, no bad data.
function parseWineCoZaHtml(html: string): RawEvent[] {
  const out: RawEvent[] = [];
  // Heuristic: capture <a href> + nearby text blocks. This is deliberately
  // conservative — we only emit an event when we have a name AND at least one
  // of (date, venue, ticket link), so we never fabricate a half-baked row.
  const eventBlock =
    /<article[^>]*>([\s\S]*?)<\/article>|<div[^>]*class="[^"]*event[^"]*"[^>]*>([\s\S]*?)<\/div>/gi;
  const linkRe = /<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i;
  const text = (s: string) => s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

  let m: RegExpExecArray | null;
  while ((m = eventBlock.exec(html)) !== null) {
    const block = m[1] ?? m[2] ?? "";
    const link = block.match(linkRe);
    if (!link) continue;
    const href = link[1];
    const name = text(link[2]);
    if (name.length < 4 || name.length > 200) continue;

    // Try to extract a month hint from the block text.
    const blockText = text(block);
    const monthHint = monthFromText(blockText);

    out.push({
      name,
      startsAt: isoFromText(blockText) ?? undefined,
      recurringMonth: monthHint ?? undefined,
      ticketUrl: href.startsWith("http") ? href : `https://diary.wine.co.za${href}`,
      sourceName: "wine.co.za",
      sourceUrl: `https://diary.wine.co.za${href.startsWith("/") ? href : "/" + href}`,
      sourceEventId: href,
      description: blockText.slice(0, 500),
    });
  }
  return out;
}

// ── Source 2: sa-venues.com Western Cape events ──────────────────────────
async function fetchSaVenues(): Promise<SourceResult> {
  try {
    const res = await fetch(
      "https://www.sa-venues.com/events/westerncape/?category=wine",
      {
        headers: { "User-Agent": "DecantaBot/1.0 (+https://decanta.co.za)" },
        signal: AbortSignal.timeout(15000),
      },
    );
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    const html = await res.text();
    return { ok: true, events: parseSaVenuesHtml(html) };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

function parseSaVenuesHtml(html: string): RawEvent[] {
  const out: RawEvent[] = [];
  const text = (s: string) => s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  // sa-venues uses predictable event-card markup. Conservative extraction.
  const cardRe = /<div[^>]*class="[^"]*event-item[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/gi;
  const linkRe = /<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i;
  let m: RegExpExecArray | null;
  while ((m = cardRe.exec(html)) !== null) {
    const block = m[1] ?? "";
    const link = block.match(linkRe);
    if (!link) continue;
    const name = text(link[2]);
    if (name.length < 4) continue;
    const blockText = text(block);
    out.push({
      name,
      recurringMonth: monthFromText(blockText) ?? undefined,
      ticketUrl: link[1].startsWith("http") ? link[1] : `https://www.sa-venues.com${link[1]}`,
      sourceName: "sa-venues.com",
      sourceUrl: link[1].startsWith("http") ? link[1] : `https://www.sa-venues.com${link[1]}`,
      sourceEventId: link[1],
      description: blockText.slice(0, 500),
    });
  }
  return out;
}

// ── Text → date helpers (best-effort, never throws) ──────────────────────
const MONTHS: Record<string, number> = {
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
  jan: 1, feb: 2, mar: 3, apr: 4, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};

function monthFromText(s: string): number | undefined {
  const lower = s.toLowerCase();
  for (const [word, num] of Object.entries(MONTHS)) {
    if (lower.includes(word)) return num;
  }
  return undefined;
}

function isoFromText(s: string): string | undefined {
  // Match "12 February 2026", "12-14 Feb 2026", "12 Feb", etc.
  const m = s.match(/(\d{1,2})\s+([A-Za-z]+)(?:\s+(\d{4}))?/);
  if (!m) return undefined;
  const day = parseInt(m[1], 10);
  const month = MONTHS[m[2].toLowerCase()];
  const year = m[3] ? parseInt(m[3], 10) : new Date().getFullYear();
  if (!month || day < 1 || day > 31) return undefined;
  return new Date(Date.UTC(year, month - 1, day)).toISOString();
}

// ── Slug + chapter helpers (mirror SQL functions) ────────────────────────
function slugify(name: string): string {
  return name.toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function chapterFor(month: number | undefined): string | null {
  if (month == null) return null;
  if (month >= 1 && month <= 3) return "harvest";
  if (month >= 4 && month <= 8) return "winter";
  if (month >= 9 && month <= 10) return "spring";
  if (month >= 11 && month <= 12) return "festive";
  return null;
}

// ── Pipeline ─────────────────────────────────────────────────────────────
Deno.serve(async (req: Request) => {
  // Auth: shared secret unless running via Supabase schedule (which injects
  // the service role in the Authorization header automatically).
  if (INGEST_SECRET) {
    const body = await req.json().catch(() => ({}));
    const authHeader = req.headers.get("authorization") ?? "";
    const providedSecret = body?.secret ?? authHeader.replace(/^Bearer\s+/i, "");
    if (providedSecret !== INGEST_SECRET) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  const runSummary = {
    startedAt: new Date().toISOString(),
    sources: [] as any[],
    totalFetched: 0,
    totalInserted: 0,
    totalUpdated: 0,
    totalDuplicates: 0,
  };

  for (const source of SOURCES) {
    const result = await source.fetch();
    if (!result.ok) {
      runSummary.sources.push({ name: source.name, status: "failed", error: result.error });
      await logIngestion(source.name, "failed", 0, 0, 0, 0, result.error);
      continue;
    }

    const events = result.events;
    let inserted = 0, updated = 0, dupes = 0;

    for (const ev of events) {
      // Dedupe: source_name + source_event_id is the stable key.
      const { data: existing } = await db
        .from("events")
        .select("id, source_url, last_synced_at")
        .eq("source_name", ev.sourceName)
        .eq("source_event_id", ev.sourceEventId)
        .maybeSingle();

      if (existing) {
        dupes++;
        // Refresh last_synced_at + ticketUrl if changed (source updated their listing).
        if (existing.source_url !== ev.sourceUrl) {
          await db.from("events").update({
            source_url: ev.sourceUrl,
            ticket_url: ev.ticketUrl,
            last_synced_at: new Date().toISOString(),
          }).eq("id", existing.id);
          updated++;
        }
        continue;
      }

      const slug = slugify(ev.name);
      // Guarantee slug uniqueness against curated + previously-imported events.
      const uniqueSlug = await ensureUniqueSlug(slug);

      const { error } = await db.from("events").insert({
        name: ev.name,
        slug: uniqueSlug,
        description: ev.description,
        starts_at: ev.startsAt ?? null,
        ends_at: null,
        recurring_month: ev.recurringMonth ?? null,
        venue_name: ev.venueName ?? null,
        region: ev.region ?? null,
        ticket_url: ev.ticketUrl ?? null,
        price_min_zar: ev.priceMinZar ?? null,
        price_max_zar: ev.priceMaxZar ?? null,
        chapter: chapterFor(ev.recurringMonth),
        verification_status: "pending", // hidden from users until admin review
        confidence: "imported",
        source_name: ev.sourceName,
        source_url: ev.sourceUrl,
        source_event_id: ev.sourceEventId,
        last_synced_at: new Date().toISOString(),
      });

      if (!error) inserted++;
    }

    runSummary.sources.push({
      name: source.name,
      status: "ok",
      fetched: events.length,
      inserted,
      updated,
      duplicates: dupes,
    });
    runSummary.totalFetched += events.length;
    runSummary.totalInserted += inserted;
    runSummary.totalUpdated += updated;
    runSummary.totalDuplicates += dupes;

    await logIngestion(
      source.name,
      events.length === 0 && inserted === 0 ? "partial" : "ok",
      events.length, inserted, updated, dupes, null,
    );
  }

  return new Response(JSON.stringify(runSummary, null, 2), {
    headers: { "Content-Type": "application/json" },
  });
});

async function ensureUniqueSlug(base: string): Promise<string> {
  let slug = base;
  let n = 2;
  for (;;) {
    const { data } = await db.from("events").select("id").eq("slug", slug).maybeSingle();
    if (!data) return slug;
    slug = `${base}-${n++}`;
    if (n > 100) return `${base}-${crypto.randomUUID().slice(0, 8)}`;
  }
}

async function logIngestion(
  source: string,
  status: "ok" | "partial" | "failed",
  fetched: number,
  inserted: number,
  updated: number,
  dupes: number,
  error: string | null,
) {
  await db.from("events_ingestion_log").insert({
    source_name: source,
    status,
    events_fetched: fetched,
    events_inserted: inserted,
    events_updated: updated,
    events_skipped_duplicate: dupes,
    error_message: error,
  });
}
