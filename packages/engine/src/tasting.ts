/**
 * @kelder/engine — TastingNote + palate/recommendation scoring
 *
 * A TastingNote is the structured payload a consumer produces when they
 * taste a wine. The palate engine turns a history of notes into a
 * "palate profile" and a "match score" for new wines.
 */

import type {
  AromaDescriptor, Acidity, Alcohol, Body, Clarity, Finish, FlavorIntensity,
  Intensity, Legs, NoseDevelopment, Quality, Readiness, Sweetness, TanninLevel,
  TanninNature, Texture, WineColor, WineType,
} from './vocab.js';
import { STAR_MIN, STAR_MAX, STAR_STEP, isValidStars } from './vocab.js';

// ── Wine fault types (when a nose/palate is "unclean" / faulty) ─────────────
export const FAULT_TYPES = [
  'tca_cork_taint',     // "corked" — wet cardboard, mouldy
  'oxidation',          // sherry-like, flat, browned
  'reduction_h2s',      // rotten egg, struck match, rubber
  'volatile_acidity',   // vinegar, nail-polish remover
  'brettanomyces',      // barnyard, band-aid, horsey
  'refermentation',     // unwanted fizz in still wine
  'other',
] as const;
export type FaultType = (typeof FAULT_TYPES)[number];

// ── Sulphite / additive sensitivity (consumer health concern) ───────────────
export const SULPHITE_LEVEL = ['standard', 'low', 'none_added', 'preservative_free'] as const;
export type SulphiteLevel = (typeof SULPHITE_LEVEL)[number];

export const SULPHITE_SENSITIVITY = ['none', 'mild', 'severe'] as const;
export type SulphiteSensitivity = (typeof SULPHITE_SENSITIVITY)[number];

// ── Value-for-money ─────────────────────────────────────────────────────────
export const VALUE_RATING = ['poor', 'fair', 'good', 'excellent'] as const;
export type ValueRating = (typeof VALUE_RATING)[number];

export interface AppearanceNote {
  clarity?: Clarity;
  intensity?: Intensity;
  color?: WineColor;
  rimVariation?: boolean;
  legs?: Legs;
}

export interface NoseNote {
  condition?: 'clean' | 'unclean';
  /** Present when condition === 'unclean' */
  faultType?: FaultType;
  intensity?: Intensity;
  development?: NoseDevelopment;
  /** Aroma descriptor IDs from AROMA_DESCRIPTORS */
  aromas?: string[];
}

export interface PalateNote {
  sweetness?: Sweetness;
  acidity?: Acidity;
  tanninLevel?: TanninLevel;
  tanninNature?: TanninNature[];
  alcohol?: Alcohol;
  abv?: number; // numeric ABV e.g. 14.0
  body?: Body;
  flavorIntensity?: FlavorIntensity;
  /** Flavor descriptor IDs */
  flavors?: string[];
  texture?: Texture[];
  finish?: Finish;
  /** Lingering-taste / aftertaste descriptors (free-form short phrases) */
  lingering?: string;
}

export interface PriceNote {
  /** Amount paid in local currency */
  pricePaid?: number;
  currency?: string; // 'ZAR' default
  /** Where bought (merchant, estate, restaurant) */
  purchaseVenue?: string;
  /** Subjective value-for-money assessment */
  valueForMoney?: ValueRating;
}

export interface Conclusions {
  quality?: Quality;
  readiness?: Readiness;
  drinkWindowStart?: number;
  drinkWindowEnd?: number;
  /** Connoisseur's 0–100 quality score (BLIC-derived; optional, complements stars) */
  qualityScore100?: number;
}

export interface TastingNote {
  id: string;
  wineVintageId: string;
  userId: string;
  tastedAt: string; // ISO
  /** 0.5–5 star rating (isValidStars enforced on write) */
  stars: number;
  appearance?: AppearanceNote;
  nose?: NoseNote;
  palate?: PalateNote;
  /** Price / where bought / value-for-money */
  price?: PriceNote;
  /** Structured food pairing tags (from suggestPairings or manual) */
  foodPairings?: string[];
  conclusions?: Conclusions;
  freeText?: string;
  /** Occasion context — free text (braai, dinner party, gift, etc.) */
  occasion?: string;
}

// ── User taste preferences (health + style filters) ─────────────────────────
export interface TastePreferences {
  /** Sulphite sensitivity — filters the catalogue for sensitive users */
  sulphiteSensitivity: SulphiteSensitivity;
  /** Dietary/lifestyle filters */
  veganOnly?: boolean;
  organicOnly?: boolean;
  lowSulphurOnly?: boolean;
  preservativeFreeOnly?: boolean;
  /** Preferred price band (ZAR) */
  maxPriceZar?: number;
  /** Varietals the user explicitly loves / avoids */
  lovedVarietals?: string[];
  avoidedVarietals?: string[];
}

// ── Palate profile ──────────────────────────────────────────────────────────

/**
 * Aggregated palate profile derived from a user's tasting history.
 * Used for recommendations ("Match for you").
 */
export interface PalateProfile {
  userId: string;
  noteCount: number;
  avgStars: number;
  /** Wine types ranked by frequency × avg rating */
  topTypes: { type: WineType; score: number }[];
  /** Top aroma/flavor descriptors (union of nose.aromas + palate.flavors) */
  topDescriptors: { id: string; count: number; avgStars: number }[];
  /** Preferred body, acidity, tannin, sweetness (modal of rated notes) */
  preferredBody?: Body;
  preferredAcidity?: Acidity;
  preferredTannin?: TanninLevel;
  preferredSweetness?: Sweetness;
  /** Top varietal slugs (passed in via wine metadata) */
  topVarietals: { slug: string; count: number; avgStars: number }[];
  updatedAt: string;
}

/** Build a palate profile from a list of tasting notes + varietal metadata. */
export function buildPalateProfile(
  userId: string,
  notes: TastingNote[],
  varietalByVintage: Record<string, string>, // wineVintageId → varietalSlug
  typeByVintage: Record<string, WineType>, // wineVintageId → WineType
): PalateProfile {
  if (notes.length === 0) {
    return {
      userId, noteCount: 0, avgStars: 0, topTypes: [], topDescriptors: [],
      topVarietals: [], updatedAt: new Date().toISOString(),
    };
  }

  const avgStars = notes.reduce((s, n) => s + n.stars, 0) / notes.length;

  // Type scores: frequency × avg stars
  const typeMap = new Map<WineType, { count: number; sum: number }>();
  for (const n of notes) {
    const t = typeByVintage[n.wineVintageId];
    if (!t) continue;
    const e = typeMap.get(t) ?? { count: 0, sum: 0 };
    e.count++; e.sum += n.stars; typeMap.set(t, e);
  }
  const topTypes = [...typeMap.entries()]
    .map(([type, e]) => ({ type, score: (e.sum / e.count) * Math.log1p(e.count) }))
    .sort((a, b) => b.score - a.score);

  // Descriptor aggregation
  const descMap = new Map<string, { count: number; sum: number }>();
  for (const n of notes) {
    const ids = [...(n.nose?.aromas ?? []), ...(n.palate?.flavors ?? [])];
    for (const id of ids) {
      const e = descMap.get(id) ?? { count: 0, sum: 0 };
      e.count++; e.sum += n.stars; descMap.set(id, e);
    }
  }
  const topDescriptors = [...descMap.entries()]
    .map(([id, e]) => ({ id, count: e.count, avgStars: e.sum / e.count }))
    .sort((a, b) => b.count * b.avgStars - a.count * a.avgStars)
    .slice(0, 30);

  // Modal preferences
  const mode = <T extends string>(vals: T[]): T | undefined => {
    if (vals.length === 0) return undefined;
    const counts = new Map<T, number>();
    for (const v of vals) counts.set(v, (counts.get(v) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
  };
  const preferredBody = mode(notes.map((n) => n.palate?.body).filter(Boolean) as Body[]);
  const preferredAcidity = mode(notes.map((n) => n.palate?.acidity).filter(Boolean) as Acidity[]);
  const preferredTannin = mode(notes.map((n) => n.palate?.tanninLevel).filter(Boolean) as TanninLevel[]);
  const preferredSweetness = mode(notes.map((n) => n.palate?.sweetness).filter(Boolean) as Sweetness[]);

  // Varietals
  const varMap = new Map<string, { count: number; sum: number }>();
  for (const n of notes) {
    const v = varietalByVintage[n.wineVintageId];
    if (!v) continue;
    const e = varMap.get(v) ?? { count: 0, sum: 0 };
    e.count++; e.sum += n.stars; varMap.set(v, e);
  }
  const topVarietals = [...varMap.entries()]
    .map(([slug, e]) => ({ slug, count: e.count, avgStars: e.sum / e.count }))
    .sort((a, b) => b.count * b.avgStars - a.count * a.avgStars)
    .slice(0, 15);

  return {
    userId, noteCount: notes.length, avgStars,
    topTypes, topDescriptors, preferredBody, preferredAcidity,
    preferredTannin, preferredSweetness, topVarietals,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Compute a "Match for you" score (0–100) for a candidate wine against
 * a palate profile. Higher = more likely the user enjoys it.
 *
 * Heuristic blend (cold-start friendly — needs ≥5 notes to stabilize):
 *  - varietal overlap with liked varietals (weight 35)
 *  - type overlap with liked types (weight 25)
 *  - descriptor overlap (weight 25)
 *  - body/sweetness preference alignment (weight 15)
 */
export function matchScore(
  profile: PalateProfile,
  candidate: {
    varietalSlug?: string;
    type: WineType;
    descriptorIds?: string[];
    body?: Body;
    sweetness?: Sweetness;
  },
): number {
  if (profile.noteCount === 0) return 50; // neutral cold-start

  let score = 0;

  // Varietal (35)
  if (candidate.varietalSlug) {
    const hit = profile.topVarietals.find((v) => v.slug === candidate.varietalSlug);
    if (hit) score += 35 * Math.min(1, hit.avgStars / 5) * Math.min(1, Math.log1p(hit.count));
    else score += 8;
  } else {
    score += 10;
  }

  // Type (25)
  const typeHit = profile.topTypes.find((t) => t.type === candidate.type);
  if (typeHit) score += 25 * Math.min(1, typeHit.score / 5);
  else score += 6;

  // Descriptors (25) — Jaccard-ish against top descriptors
  const cand = candidate.descriptorIds ?? [];
  if (cand.length > 0 && profile.topDescriptors.length > 0) {
    const top = new Set(profile.topDescriptors.slice(0, 20).map((d) => d.id));
    const overlap = cand.filter((id) => top.has(id)).length;
    score += 25 * (overlap / Math.max(cand.length, 1));
  } else {
    score += 8;
  }

  // Body + sweetness alignment (15)
  if (profile.preferredBody && candidate.body === profile.preferredBody) score += 8;
  if (profile.preferredSweetness && candidate.sweetness === profile.preferredSweetness) score += 7;

  return Math.round(Math.max(0, Math.min(100, score)));
}

/** Validate a TastingNote's star rating + structure. Returns error string or null. */
export function validateTastingNote(note: Partial<TastingNote>): string | null {
  if (note.stars == null) return 'stars is required';
  if (!isValidStars(note.stars)) {
    return `stars must be ${STAR_MIN}–${STAR_MAX} in ${STAR_STEP} steps`;
  }
  return null;
}
