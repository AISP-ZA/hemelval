/**
 * @kelder/engine — controlled tasting vocabularies
 *
 * Sources: WSET Systematic Approach to Tasting (SAT) L3/L4,
 * Ann Noble Wine Aroma Wheel (UC Davis), Wine Folly, Jancis Robinson,
 * Platter's SA Wine Guide. See docs/SOURCES.md.
 *
 * Every enum value is a stable string ID; the human label is looked up
 * via the *_LABEL maps so we can localize or restyle without migrating data.
 */

// ── Appearance ──────────────────────────────────────────────────────────────

export const CLARITY = ['clear', 'hazy'] as const;
export type Clarity = (typeof CLARITY)[number];

export const INTENSITY = ['pale', 'medium-minus', 'medium', 'medium-plus', 'deep'] as const;
export type Intensity = (typeof INTENSITY)[number];

/** Red-wine color, young → old */
export const RED_COLOR = ['purple', 'ruby', 'garnet', 'tawny', 'brown'] as const;
/** White-wine color, young → old */
export const WHITE_COLOR = ['lemon-green', 'lemon', 'gold', 'amber', 'brown'] as const;
/** Rosé color */
export const ROSE_COLOR = ['purple-pink', 'pink', 'salmon', 'orange', 'onion-skin', 'copper'] as const;
export type WineColor =
  | (typeof RED_COLOR)[number]
  | (typeof WHITE_COLOR)[number]
  | (typeof ROSE_COLOR)[number];

export const LEGS = ['none', 'light', 'medium', 'pronounced'] as const;
export type Legs = (typeof LEGS)[number];

// ── Nose / Aroma — the Noble Wheel, 3-tier ──────────────────────────────────

export const AROMA_CATEGORIES = [
  'fruity',
  'floral',
  'herbaceous',
  'spicy',
  'oaky',
  'earthy',
  'caramel',
  'nutty',
  'microbiological',
  'oxidized',
  'chemical',
  'mineral',
] as const;
export type AromaCategory = (typeof AROMA_CATEGORIES)[number];

/**
 * Flat list of leaf descriptors grouped by category.
 * Each entry: { id, category, label }.
 * `id` is the stable token stored on a tasting note.
 */
export interface AromaDescriptor {
  id: string;
  category: AromaCategory;
  label: string;
}

export const AROMA_DESCRIPTORS: readonly AromaDescriptor[] = [
  // Fruity — citrus
  { id: 'grapefruit', category: 'fruity', label: 'Grapefruit' },
  { id: 'lemon', category: 'fruity', label: 'Lemon' },
  { id: 'lime', category: 'fruity', label: 'Lime' },
  { id: 'orange-peel', category: 'fruity', label: 'Orange Peel' },
  // Fruity — berry
  { id: 'blackberry', category: 'fruity', label: 'Blackberry' },
  { id: 'red-raspberry', category: 'fruity', label: 'Red Raspberry' },
  { id: 'black-raspberry', category: 'fruity', label: 'Black Raspberry' },
  { id: 'strawberry', category: 'fruity', label: 'Strawberry' },
  { id: 'cassis', category: 'fruity', label: 'Blackcurrant / Cassis' },
  { id: 'cranberry', category: 'fruity', label: 'Cranberry' },
  { id: 'raspberry', category: 'fruity', label: 'Raspberry' }, // Grenache, Pinot Noir
  { id: 'cherry-red', category: 'fruity', label: 'Red Cherry' },
  { id: 'cherry-black', category: 'fruity', label: 'Black Cherry' },
  { id: 'plum', category: 'fruity', label: 'Plum' }, // Malbec, Touriga, Shiraz
  // Fruity — tree / stone / tropical
  { id: 'apricot', category: 'fruity', label: 'Apricot' },
  { id: 'peach', category: 'fruity', label: 'Peach' },
  { id: 'apple', category: 'fruity', label: 'Apple' },
  { id: 'green-apple', category: 'fruity', label: 'Green Apple' }, // Chenin, Colombard, Riesling
  { id: 'pear', category: 'fruity', label: 'Pear' },
  { id: 'quince', category: 'fruity', label: 'Quince' },
  { id: 'pineapple', category: 'fruity', label: 'Pineapple' },
  { id: 'melon', category: 'fruity', label: 'Melon' },
  { id: 'passionfruit', category: 'fruity', label: 'Passion Fruit' },
  { id: 'guava', category: 'fruity', label: 'Guava' },
  { id: 'banana', category: 'fruity', label: 'Banana' },
  { id: 'mango', category: 'fruity', label: 'Mango' },
  // Fruity — dried / jam
  { id: 'strawberry-jam', category: 'fruity', label: 'Strawberry Jam' },
  { id: 'raisin', category: 'fruity', label: 'Raisin' },
  { id: 'prune', category: 'fruity', label: 'Prune' },
  { id: 'fig', category: 'fruity', label: 'Fig' },

  // Floral
  { id: 'violet', category: 'floral', label: 'Violet' },
  { id: 'rose', category: 'floral', label: 'Rose' },
  { id: 'orange-blossom', category: 'floral', label: 'Orange Blossom' },
  { id: 'elderflower', category: 'floral', label: 'Elderflower' },
  { id: 'lavender', category: 'floral', label: 'Lavender' },
  { id: 'jasmine', category: 'floral', label: 'Jasmine' },
  { id: 'blossom', category: 'floral', label: 'Blossom' },
  { id: 'fynbos', category: 'floral', label: 'Fynbos' }, // SA-specific floral

  // Herbaceous / vegetative
  { id: 'cut-grass', category: 'herbaceous', label: 'Cut Green Grass' },
  { id: 'bell-pepper', category: 'herbaceous', label: 'Bell Pepper' },
  { id: 'asparagus', category: 'herbaceous', label: 'Asparagus' },
  { id: 'eucalyptus', category: 'herbaceous', label: 'Eucalyptus' },
  { id: 'mint', category: 'herbaceous', label: 'Mint' },
  { id: 'tomato-leaf', category: 'herbaceous', label: 'Tomato Leaf' },
  { id: 'black-olive', category: 'herbaceous', label: 'Black Olive' },
  { id: 'green-tea', category: 'herbaceous', label: 'Green Tea' },
  { id: 'tobacco', category: 'herbaceous', label: 'Tobacco' },
  { id: 'hay', category: 'herbaceous', label: 'Hay / Straw' },
  { id: 'thyme', category: 'herbaceous', label: 'Thyme' },
  { id: 'rosemary', category: 'herbaceous', label: 'Rosemary' }, // SA herbes du Cap

  // Spicy
  { id: 'black-pepper', category: 'spicy', label: 'Black Pepper' },
  { id: 'white-pepper', category: 'spicy', label: 'White Pepper' },
  { id: 'licorice', category: 'spicy', label: 'Licorice / Anise' },
  { id: 'clove', category: 'spicy', label: 'Clove' },
  { id: 'cinnamon', category: 'spicy', label: 'Cinnamon' },
  { id: 'nutmeg', category: 'spicy', label: 'Nutmeg' },
  { id: 'ginger', category: 'spicy', label: 'Ginger' },
  { id: 'cardamom', category: 'spicy', label: 'Cardamom' },

  // Oaky / woody
  { id: 'vanilla', category: 'oaky', label: 'Vanilla' },
  { id: 'toast', category: 'oaky', label: 'Toast' },
  { id: 'cedar', category: 'oaky', label: 'Cedar' },
  { id: 'smoke', category: 'oaky', label: 'Smoke' },
  { id: 'coconut', category: 'oaky', label: 'Coconut' },
  { id: 'coffee', category: 'oaky', label: 'Coffee' },
  { id: 'chocolate-dark', category: 'oaky', label: 'Dark Chocolate' },
  { id: 'charred-wood', category: 'oaky', label: 'Charred Wood' },
  { id: 'dill', category: 'oaky', label: 'Dill' },

  // Earthy
  { id: 'mushroom', category: 'earthy', label: 'Mushroom' },
  { id: 'forest-floor', category: 'earthy', label: 'Forest Floor' },
  { id: 'leather', category: 'earthy', label: 'Leather' },
  { id: 'wet-leaves', category: 'earthy', label: 'Wet Leaves' },
  { id: 'truffle', category: 'earthy', label: 'Truffle' },
  { id: 'dust', category: 'earthy', label: 'Dusty' },
  { id: 'beetroot', category: 'earthy', label: 'Beetroot' },
  { id: 'game', category: 'earthy', label: 'Gamey' }, // Mourvèdre, Syrah — meaty/savoury

  // Caramel
  { id: 'honey', category: 'caramel', label: 'Honey' },
  { id: 'butterscotch', category: 'caramel', label: 'Butterscotch' },
  { id: 'butter', category: 'caramel', label: 'Butter' },
  { id: 'caramel', category: 'caramel', label: 'Caramel' },
  { id: 'toffee', category: 'caramel', label: 'Toffee' },
  { id: 'molasses', category: 'caramel', label: 'Molasses' },
  { id: 'wax', category: 'caramel', label: 'Beeswax' }, // Sémillon lanolin

  // Nutty
  { id: 'almond', category: 'nutty', label: 'Almond' },
  { id: 'hazelnut', category: 'nutty', label: 'Hazelnut' },
  { id: 'walnut', category: 'nutty', label: 'Walnut' },
  { id: 'marzipan', category: 'nutty', label: 'Marzipan' },

  // Microbiological (yeast / lactic / brett)
  { id: 'biscuit', category: 'microbiological', label: 'Biscuit' },
  { id: 'bread-dough', category: 'microbiological', label: 'Bread Dough' },
  { id: 'brioche', category: 'microbiological', label: 'Brioche' },
  { id: 'lees', category: 'microbiological', label: 'Lees / Yeasty' },
  { id: 'yogurt', category: 'microbiological', label: 'Yogurt' },
  { id: 'barnyard', category: 'microbiological', label: 'Barnyard' },

  // Oxidized
  { id: 'sherry', category: 'oxidized', label: 'Sherry-like' },
  { id: 'aldehyde', category: 'oxidized', label: 'Aldehyde' },

  // Chemical / sulfur / petroleum
  { id: 'sulfur', category: 'chemical', label: 'Sulfur / Matchstick' },
  { id: 'rotten-egg', category: 'chemical', label: 'Rotten Egg (H₂S)' },
  { id: 'acetic', category: 'chemical', label: 'Acetic / Vinegar' },
  { id: 'petrol', category: 'chemical', label: 'Petrol / Kerosene' }, // aged Riesling
  { id: 'tar', category: 'chemical', label: 'Tar' },

  // Mineral
  { id: 'wet-stone', category: 'mineral', label: 'Wet Stone' },
  { id: 'flint', category: 'mineral', label: 'Flint' },
  { id: 'chalk', category: 'mineral', label: 'Chalk' },
  { id: 'slate', category: 'mineral', label: 'Slate' },
  { id: 'saline', category: 'mineral', label: 'Saline' },
  { id: 'steel', category: 'mineral', label: 'Steel' },
] as const;

export const AROMA_BY_ID = new Map(AROMA_DESCRIPTORS.map((d) => [d.id, d]));

export function aromaLabel(id: string): string {
  return AROMA_BY_ID.get(id)?.label ?? id;
}

export function aromasByCategory(cat: AromaCategory): AromaDescriptor[] {
  return AROMA_DESCRIPTORS.filter((d) => d.category === cat);
}

// ── Palate ──────────────────────────────────────────────────────────────────

export const SWEETNESS = ['bone-dry', 'dry', 'off-dry', 'medium-dry', 'medium-sweet', 'sweet', 'luscious'] as const;
export type Sweetness = (typeof SWEETNESS)[number];

export const ACIDITY = ['low', 'medium-minus', 'medium', 'medium-plus', 'high'] as const;
export type Acidity = (typeof ACIDITY)[number];

export const TANNIN_LEVEL = ['low', 'medium-minus', 'medium', 'medium-plus', 'high', 'na'] as const;
export type TanninLevel = (typeof TANNIN_LEVEL)[number];

export const TANNIN_NATURE = [
  'ripe', 'soft', 'smooth', 'silky', 'velvety', 'supple', 'fine-grained',
  'unripe', 'green', 'stalky', 'coarse', 'chalky', 'grippy', 'astringent', 'dusty',
] as const;
export type TanninNature = (typeof TANNIN_NATURE)[number];

export const ALCOHOL = ['light', 'medium', 'high'] as const;
export type Alcohol = (typeof ALCOHOL)[number];

export const BODY = ['light', 'medium-minus', 'medium', 'medium-plus', 'full'] as const;
export type Body = (typeof BODY)[number];

export const FLAVOR_INTENSITY = ['light', 'medium-minus', 'medium', 'medium-plus', 'pronounced'] as const;
export type FlavorIntensity = (typeof FLAVOR_INTENSITY)[number];

export const FINISH = ['short', 'medium-minus', 'medium', 'medium-plus', 'long', 'very-long'] as const;
export type Finish = (typeof FINISH)[number];

export const TEXTURE = [
  'silky', 'velvety', 'creamy', 'smooth', 'grippy', 'astringent', 'oily', 'waxy', 'fizzy', 'coarse',
] as const;
export type Texture = (typeof TEXTURE)[number];

// ── Wine type / style taxonomy ──────────────────────────────────────────────

export const WINE_TYPE = ['red', 'white', 'rose', 'sparkling', 'fortified', 'dessert', 'orange'] as const;
export type WineType = (typeof WINE_TYPE)[number];

/** MCC dosage levels (sparkling sweetness) */
export const DOSAGE = [
  'brut-nature', 'extra-brut', 'brut', 'extra-dry', 'sec', 'demi-sec', 'doux',
] as const;
export type Dosage = (typeof DOSAGE)[number];

// ── Conclusions / quality ───────────────────────────────────────────────────

export const NOSE_DEVELOPMENT = ['youthful', 'developing', 'fully-developed', 'tired'] as const;
export type NoseDevelopment = (typeof NOSE_DEVELOPMENT)[number];

export const QUALITY = ['faulty', 'poor', 'acceptable', 'good', 'very-good', 'outstanding'] as const;
export type Quality = (typeof QUALITY)[number];

export const READINESS = ['too-young', 'developing', 'ready', 'too-old'] as const;
export type Readiness = (typeof READINESS)[number];

// ── 5-star consumer rating (Platter's / Vivino style) ───────────────────────

export const STAR_MIN = 0.5;
export const STAR_MAX = 5;
export const STAR_STEP = 0.5;

/** Validate a 0.5-incremented 0.5–5 star rating. */
export function isValidStars(stars: number): boolean {
  return (
    stars >= STAR_MIN &&
    stars <= STAR_MAX &&
    Math.abs((stars / STAR_STEP) % 1) < 1e-9
  );
}

/** Average an array of star ratings, rounded to nearest 0.5. */
export function averageStars(ratings: number[]): number {
  if (ratings.length === 0) return 0;
  const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
  return Math.round(avg / STAR_STEP) * STAR_STEP;
}

/** Convert a 100-point critic score to an approximate 5-star equivalent. */
export function points100ToStars(points: number): number {
  // 50 → 0.5, 100 → 5  (linear; rough but stable)
  const clamped = Math.max(50, Math.min(100, points));
  const star = STAR_MIN + ((clamped - 50) / 50) * (STAR_MAX - STAR_MIN);
  return Math.round(star / STAR_STEP) * STAR_STEP;
}

/** Convert stars to an approximate 100-point equivalent. */
export function starsToPoints100(stars: number): number {
  const clamped = Math.max(STAR_MIN, Math.min(STAR_MAX, stars));
  return Math.round(50 + ((clamped - STAR_MIN) / (STAR_MAX - STAR_MIN)) * 50);
}
