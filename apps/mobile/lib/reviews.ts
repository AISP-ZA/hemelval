/**
 * Decanta tasting notes — researched wine reviews.
 *
 * These are Decanta's own tasting notes, researched from professional sources
 * (Wine-Searcher, CellarTracker, Jancis Robinson, Decanter, Tim Atkin, official
 * winery notes) and written in our editorial voice. They are NOT syndicated
 * critic scores — they are our tasting panel's synthesized descriptors.
 *
 * These power the TASTING NOTES section on WineDetail, replacing engine-derived
 * generic varietal descriptors with wine-specific notes for 30 top wines.
 */

export interface WineReview {
  id: string;
  wineName: string;
  estateName: string;
  reviewer: string;
  score: number;
  maxScore: number;
  date: string;
  nose: string[];
  palate: string[];
  finish: string;
  body: string;
  acidity: string;
  tannin: string;
  sweetness: string;
  summary: string;
  foodPairings: string[];
  drinkWindow: string;
  servingTemp: string;
}

// Auto-generated from data/staging/reviews.json
// In production this would come from Supabase; for now it's bundled.
export const WINE_REVIEWS: WineReview[] = require('../data/reviews.json');

/**
 * Find a review for a wine by name (fuzzy match on wine name + estate).
 */
export function findReview(wineName: string, estateName: string): WineReview | null {
  const normalized = (s: string) => s.toLowerCase().replace(/[''"]/g, '').replace(/\s+/g, ' ').trim();

  // Exact match first
  let match = WINE_REVIEWS.find((r) =>
    normalized(r.wineName) === normalized(wineName) &&
    normalized(r.estateName).includes(normalized(estateName))
  );
  if (match) return match;

  // Loose match: estate name contains
  match = WINE_REVIEWS.find((r) =>
    normalized(r.wineName).includes(normalized(wineName).split(' ')[0]) &&
    normalized(r.estateName).includes(normalized(estateName).split(' ')[0])
  );
  if (match) return match;

  // Loose match: wine name contains a keyword from the review name
  const wineKey = normalized(wineName).split(' ').find((w) => w.length > 4);
  if (wineKey) {
    match = WINE_REVIEWS.find((r) =>
      normalized(r.wineName).includes(wineKey) &&
      normalized(r.estateName).includes(normalized(estateName).split(' ')[0])
    );
    if (match) return match;
  }

  return null;
}
