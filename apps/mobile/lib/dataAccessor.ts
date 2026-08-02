/**
 * Hemelval data accessor — live Supabase queries with graceful mock fallback.
 *
 * Every read function tries Supabase first; if the network fails or the
 * table is empty, it falls back to the bundled mock data so the app
 * always renders something. This is the production-transition layer.
 *
 * As the live DB grows (more estates/wines seeded), the app
 * automatically shows live data — no code changes needed.
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
}

/**
 * Fetch wines from Supabase. Falls back to MOCK_WINES on any error.
 * Maps the live schema (wines + estates join) to the MockWine shape
 * the UI components expect.
 */
export async function fetchWines(): Promise<Wine[]> {
  if (!isSupabaseConfigured) return MOCK_WINES;
  try {
    const { data, error } = await supabase
      .from('wines')
      .select(`
        id, slug, name, type, blend_type,
        avg_stars, rating_count, barcode, image_url, about,
        estates!inner ( id, slug, name ),
        wo_appellations ( name )
      `)
      .limit(100);
    if (error || !data || data.length === 0) return MOCK_WINES;
    // Map live schema → MockWine shape
    return data.map((w: any) => ({
      id: w.id,
      slug: w.slug,
      name: w.name,
      estateId: w.estates?.id ?? '',
      estateName: w.estates?.name ?? '',
      type: w.type,
      varietals: [], // fetched separately via wine_varietals
      region: w.wo_appellations?.[0]?.name ?? '',
      avgStars: Number(w.avg_stars) || 4.0,
      ratingCount: w.rating_count || 0,
      priceZar: undefined,
      abv: undefined,
      year: 0,
      about: w.about ?? '',
      pairings: [],
      serving: '',
      barcode: w.barcode,
    }));
  } catch {
    return MOCK_WINES;
  }
}

/**
 * Fetch estates from Supabase. Falls back to MOCK_ESTATES.
 */
export async function fetchEstates(): Promise<Estate[]> {
  if (!isSupabaseConfigured) return MOCK_ESTATES;
  try {
    const { data, error } = await supabase
      .from('estates')
      .select(`
        id, slug, name, founded_year, about, famous_for,
        is_verified, website_url, wine_route,
        wo_appellations ( name )
      `)
      .order('name')
      .limit(100);
    if (error || !data || data.length === 0) return MOCK_ESTATES;
    return data.map((e: any) => ({
      id: e.id,
      slug: e.slug,
      name: e.name,
      region: e.wo_appellations?.name ?? '',
      wineRoute: e.wine_route ?? '',
      founded: e.founded_year ?? undefined,
      about: e.about ?? '',
      famousFor: e.famous_for ?? '',
      verified: e.is_verified ?? false,
      certifications: [],
      lat: 0, lng: 0,
      website: e.website_url ?? '',
    }));
  } catch {
    return MOCK_ESTATES;
  }
}

/**
 * Fetch wines for a specific estate from Supabase.
 * Falls back to filtering MOCK_WINES by estateId.
 */
export async function fetchWinesByEstate(estateId: string): Promise<Wine[]> {
  if (!isSupabaseConfigured) return MOCK_WINES.filter((w) => w.estateId === estateId);
  try {
    const { data, error } = await supabase
      .from('wines')
      .select(`
        id, slug, name, type, blend_type,
        avg_stars, rating_count, barcode, image_url, about,
        estates!inner ( id, slug, name ),
        wo_appellations ( name )
      `)
      .eq('estate_id', estateId)
      .order('avg_stars', { ascending: false })
      .limit(20);
    if (error || !data || data.length === 0) return MOCK_WINES.filter((w) => w.estateId === estateId);
    return data.map((w: any) => ({
      id: w.id,
      slug: w.slug,
      name: w.name,
      estateId: w.estates?.id ?? estateId,
      estateName: w.estates?.name ?? '',
      type: w.type,
      varietals: [],
      region: w.wo_appellations?.[0]?.name ?? '',
      avgStars: Number(w.avg_stars) || 4.0,
      ratingCount: w.rating_count || 0,
      priceZar: undefined,
      abv: undefined,
      year: 0,
      about: w.about ?? '',
      pairings: [],
      serving: '',
      barcode: w.barcode,
    }));
  } catch {
    return MOCK_WINES.filter((w) => w.estateId === estateId);
  }
}

/**
 * Fetch events from Supabase. Falls back to MOCK_EVENTS.
 */
export async function fetchEvents(): Promise<WineEvent[]> {
  if (!isSupabaseConfigured) return MOCK_EVENTS as WineEvent[];
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('recurring_month')
      .limit(100);
    if (error || !data || data.length === 0) return MOCK_EVENTS as WineEvent[];
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
    }));
  } catch {
    return MOCK_EVENTS as WineEvent[];
  }
}

/**
 * Fetch varietals from Supabase. Falls back to engine VARIETALS.
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

/**
 * Save a tasting note to Supabase (if authenticated) or local store.
 */
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
    if (!user) return false; // not logged in — use local store
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

/**
 * Fetch tasting notes for the current user from Supabase.
 * Returns null if not authenticated or on error (caller uses local store).
 */
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
