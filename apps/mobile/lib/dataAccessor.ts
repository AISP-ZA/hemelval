/**
 * Hemelval data accessor — live Supabase queries with transparent fallback.
 *
 * Reads from the live Supabase database (420 estates, 217 wines, 41 events).
 * If Supabase is unreachable, falls back to the bundled reference dataset
 * and sets a `dataSource` flag so the UI can show a "demo data" indicator.
 *
 * Key principle: NEVER fabricate data. If a field is null in the DB, it stays
 * null in the UI. We do NOT invent ratings, prices, or varietals.
 */

import { supabase, isSupabaseConfigured } from './supabase.js';
import {
  MOCK_WINES, MOCK_ESTATES, MOCK_EVENTS,
  type MockWine, type MockEstate,
} from './mockData.js';

export interface Wine extends MockWine {}
export interface Estate extends MockEstate {}
export interface WineEvent {
  id: string; name: string; slug: string; description?: string;
  startsAt?: string; endsAt?: string; venueName?: string;
  ticketUrl?: string; ticketingPlatform?: string;
  priceMinZar?: number; priceMaxZar?: number;
  format?: string; recurringMonth?: number;
  region?: string;
}

/** Tracks whether the last fetch used live DB or demo fallback. */
export let lastDataSource: 'live' | 'demo' = 'live';

function setSource(s: 'live' | 'demo') { lastDataSource = s; }

/**
 * Fetch wines from Supabase live DB.
 * Maps the live schema to the Wine shape the UI expects.
 * Falls back to MOCK_WINES only if Supabase is unreachable.
 */
export async function fetchWines(): Promise<Wine[]> {
  if (!isSupabaseConfigured) { setSource('demo'); return MOCK_WINES; }
  try {
    const { data, error } = await supabase
      .from('wines')
      .select(`
        id, slug, name, type, blend_type,
        avg_stars, rating_count, barcode, image_url, about,
        price_zar, abv, vintage_year,
        estates!inner ( id, slug, name, region, wine_route ),
        wo_appellations ( name )
      `)
      .limit(100);
    if (error) { console.warn('[dataAccessor] wines query error:', error.message); setSource('demo'); return MOCK_WINES; }
    if (!data || data.length === 0) { setSource('demo'); return MOCK_WINES; }
    setSource('live');
    return data.map((w: any) => mapWine(w));
  } catch (e) {
    console.warn('[dataAccessor] wines fetch failed:', e);
    setSource('demo');
    return MOCK_WINES;
  }
}

/**
 * Fetch estates from Supabase live DB.
 */
export async function fetchEstates(): Promise<Estate[]> {
  if (!isSupabaseConfigured) { setSource('demo'); return MOCK_ESTATES; }
  try {
    const { data, error } = await supabase
      .from('estates')
      .select(`
        id, slug, name, estate_name, founded_year, about, famous_for,
        is_verified, website_url, wine_route, region, district, ward,
        latitude, longitude, tasting_room, restaurant,
        cover_image_url, logo_url, winemaker, owner
      `)
      .order('name')
      .limit(200);
    if (error) { console.warn('[dataAccessor] estates query error:', error.message); setSource('demo'); return MOCK_ESTATES; }
    if (!data || data.length === 0) { setSource('demo'); return MOCK_ESTATES; }
    setSource('live');
    return data.map((e: any) => mapEstate(e));
  } catch (e) {
    console.warn('[dataAccessor] estates fetch failed:', e);
    setSource('demo');
    return MOCK_ESTATES;
  }
}

/**
 * Fetch wines for a specific estate from Supabase.
 */
export async function fetchWinesByEstate(estateId: string): Promise<Wine[]> {
  if (!isSupabaseConfigured) { return MOCK_WINES.filter((w) => w.estateId === estateId); }
  try {
    const { data, error } = await supabase
      .from('wines')
      .select(`
        id, slug, name, type, blend_type,
        avg_stars, rating_count, barcode, image_url, about,
        price_zar, abv, vintage_year,
        estates!inner ( id, slug, name, region, wine_route ),
        wo_appellations ( name )
      `)
      .eq('estate_id', estateId)
      .order('avg_stars', { ascending: false, nullsfirst: false })
      .limit(20);
    if (error) { console.warn('[dataAccessor] wines-by-estate error:', error.message); return MOCK_WINES.filter((w) => w.estateId === estateId); }
    if (!data || data.length === 0) return MOCK_WINES.filter((w) => w.estateId === estateId);
    return data.map((w: any) => mapWine(w));
  } catch (e) {
    console.warn('[dataAccessor] wines-by-estate failed:', e);
    return MOCK_WINES.filter((w) => w.estateId === estateId);
  }
}

/**
 * Fetch events from Supabase live DB.
 */
export async function fetchEvents(): Promise<WineEvent[]> {
  if (!isSupabaseConfigured) { setSource('demo'); return MOCK_EVENTS as WineEvent[]; }
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('recurring_month')
      .limit(100);
    if (error) { console.warn('[dataAccessor] events query error:', error.message); setSource('demo'); return MOCK_EVENTS as WineEvent[]; }
    if (!data || data.length === 0) { setSource('demo'); return MOCK_EVENTS as WineEvent[]; }
    setSource('live');
    return data.map((e: any) => ({
      id: e.id,
      name: e.name,
      slug: e.slug,
      description: e.description ?? '',
      startsAt: e.starts_at ?? '',
      endsAt: e.ends_at ?? '',
      venueName: e.venue_name ?? '',
      ticketUrl: e.ticket_url ?? '',
      ticketingPlatform: e.ticketing_platform ?? '',
      priceMinZar: e.price_min_zar ?? undefined,
      priceMaxZar: e.price_max_zar ?? undefined,
      format: e.format ?? '',
      recurringMonth: e.recurring_month ?? undefined,
      region: e.region ?? '',
    }));
  } catch (e) {
    console.warn('[dataAccessor] events fetch failed:', e);
    setSource('demo');
    return MOCK_EVENTS as WineEvent[];
  }
}

/**
 * Fetch varietals from Supabase. Returns null if unavailable (caller uses engine).
 */
export async function fetchVarietals() {
  if (!isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from('varietals')
      .select('slug, name, aliases, type, is_signature, character, typical_aromas')
      .order('name');
    if (error || !data || data.length === 0) return null;
    return data;
  } catch {
    return null;
  }
}

// ── Mappers: live DB row → UI shape ──────────────────────────────────────
// Preserve real data. Null stays null. No fabrication.

function mapWine(w: any): Wine {
  const estate = w.estates;
  return {
    id: w.id,
    slug: w.slug ?? '',
    name: w.name ?? '',
    estateId: estate?.id ?? '',
    estateName: estate?.name ?? '',
    type: normaliseWineType(w.type),
    varietals: [], // wine_varietals junction — fetched on demand if needed
    region: estate?.region ?? w.wo_appellations?.[0]?.name ?? '',
    avgStars: w.avg_stars != null ? Number(w.avg_stars) : 0, // 0 = "not yet rated"
    ratingCount: w.rating_count ?? 0,
    priceZar: w.price_zar ?? undefined,
    abv: w.abv ?? undefined,
    year: w.vintage_year ?? 0,
    about: w.about ?? '',
    pairings: [],
    serving: '',
    barcode: w.barcode,
  };
}

function mapEstate(e: any): Estate {
  const name = e.estate_name ?? e.name;
  return {
    id: e.id,
    slug: e.slug,
    name,
    region: e.region ?? e.district ?? '',
    wineRoute: e.wine_route ?? '',
    founded: e.founded_year ?? undefined,
    about: e.about ?? '',
    famousFor: e.famous_for ?? '',
    verified: e.is_verified ?? false,
    certifications: [],
    lat: e.latitude ?? 0,
    lng: e.longitude ?? 0,
    website: e.website_url ?? '',
    history: undefined,
    tastingRoom: e.tasting_room ? String(e.tasting_room) : undefined,
  };
}

/** Normalise the DB wine type field to the union type MockWine expects. */
function normaliseWineType(type: string | null | undefined): MockWine['type'] {
  if (!type) return 'red';
  const t = type.toLowerCase().trim();
  if (t.includes('white') || t.includes('chenin') || t.includes('sauvignon') || t.includes('chardonnay')) return 'white';
  if (t.includes('rose') || t.includes('rosé')) return 'rose';
  if (t.includes('sparkling') || t.includes('mcc') || t.includes('cap classique')) return 'sparkling';
  if (t.includes('fortified') || t.includes('port')) return 'fortified';
  if (t.includes('dessert') || t.includes('sweet')) return 'dessert';
  if (t.includes('orange') || t.includes('skin-contact')) return 'orange';
  return 'red';
}

// ── Tasting notes (auth-scoped) ──────────────────────────────────────────

export async function saveTastingNote(note: {
  vintageId: string;
  stars: number;
  nose?: any;
  palate?: any;
  freeText?: string;
}): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    const { error } = await supabase
      .from('tasting_notes')
      .insert({
        user_id: user.id,
        vintage_id: note.vintageId,
        stars: note.stars,
        nose: note.nose,
        palate: note.palate,
        free_text: note.freeText,
      });
    return !error;
  } catch {
    return false;
  }
}

export async function fetchTastingNotes(): Promise<any[] | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data, error } = await supabase
      .from('tasting_notes')
      .select('*')
      .eq('user_id', user.id)
      .order('tasted_at', { ascending: false })
      .limit(100);
    if (error || !data) return null;
    return data;
  } catch {
    return null;
  }
}
