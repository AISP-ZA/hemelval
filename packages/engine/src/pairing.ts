/**
 * @kelder/engine — food pairing + serving temperature logic
 *
 * Sources: Wine Folly "Food and Wine Pairing", WSET, Matching Food & Wine
 * (Fiona Beckett on SA Chenin). SA-specific pairings (braai, bobotie,
 * malva, milk tart) included.
 */

import type { WineType } from './vocab.js';

// ── Serving temperature (°C) ────────────────────────────────────────────────

export interface ServingTemp {
  minC: number;
  maxC: number;
  label: string;
}

export const SERVING_TEMP: Record<WineType, ServingTemp> = {
  sparkling: { minC: 3, maxC: 8, label: 'Ice-cold · 3–8°C' },
  white: { minC: 6, maxC: 12, label: 'Chilled · 6–12°C (lighter = colder)' },
  rose: { minC: 7, maxC: 12, label: 'Lightly chilled · 7–12°C' },
  orange: { minC: 10, maxC: 13, label: 'Lightly chilled · 10–13°C' },
  red: { minC: 14, maxC: 18, label: 'Cellar temp · 14–18°C (not room temp!)' },
  fortified: { minC: 14, maxC: 18, label: 'Cool room · 14–18°C' },
  dessert: { minC: 6, maxC: 10, label: 'Lightly chilled · 6–10°C' },
};

export function servingTempFor(type: WineType): ServingTemp {
  return SERVING_TEMP[type] ?? SERVING_TEMP.red;
}

// ── Food-pairing logic ──────────────────────────────────────────────────────

export type PairingTag =
  | 'steak' | 'lamb' | 'game' | 'pork' | 'chicken' | 'duck'
  | 'seafood' | 'oysters' | 'sushi' | 'fish-rich' | 'fish-light'
  | 'curry' | 'spicy' | 'cheese-hard' | 'cheese-blue' | 'cheese-fresh'
  | 'mushroom' | 'charcuterie' | 'pasta-tomato' | 'pasta-cream' | 'pizza'
  | 'braai' | 'bobotie' | 'malva' | 'milk-tart' | 'dessert-choc' | 'dessert-fruit';

export interface Pairing {
  tag: PairingTag;
  label: string;
}

export const PAIRINGS: Record<PairingTag, Pairing> = {
  steak: { tag: 'steak', label: 'Steak & grilled beef' },
  lamb: { tag: 'lamb', label: 'Lamb & venison' },
  game: { tag: 'game', label: 'Game meats' },
  pork: { tag: 'pork', label: 'Roast pork' },
  chicken: { tag: 'chicken', label: 'Roast chicken' },
  duck: { tag: 'duck', label: 'Duck' },
  seafood: { tag: 'seafood', label: 'Seafood & shellfish' },
  oysters: { tag: 'oysters', label: 'Oysters (fresh)' },
  sushi: { tag: 'sushi', label: 'Sushi & sashimi' },
  'fish-rich': { tag: 'fish-rich', label: 'Oily fish (salmon, tuna)' },
  'fish-light': { tag: 'fish-light', label: 'White fish & sole' },
  curry: { tag: 'curry', label: 'Curry' },
  spicy: { tag: 'spicy', label: 'Spicy dishes' },
  'cheese-hard': { tag: 'cheese-hard', label: 'Hard aged cheese' },
  'cheese-blue': { tag: 'cheese-blue', label: 'Blue cheese' },
  'cheese-fresh': { tag: 'cheese-fresh', label: 'Fresh & goat cheese' },
  mushroom: { tag: 'mushroom', label: 'Mushroom dishes' },
  charcuterie: { tag: 'charcuterie', label: 'Charcuterie' },
  'pasta-tomato': { tag: 'pasta-tomato', label: 'Tomato pasta' },
  'pasta-cream': { tag: 'pasta-cream', label: 'Creamy pasta' },
  pizza: { tag: 'pizza', label: 'Pizza' },
  braai: { tag: 'braai', label: 'Braai & boerewors' }, // SA
  bobotie: { tag: 'bobotie', label: 'Bobotie & Cape Malay' }, // SA
  malva: { tag: 'malva', label: 'Malva pudding' }, // SA dessert
  'milk-tart': { tag: 'milk-tart', label: 'Milk tart' }, // SA dessert
  'dessert-choc': { tag: 'dessert-choc', label: 'Chocolate dessert' },
  'dessert-fruit': { tag: 'dessert-fruit', label: 'Fruit dessert' },
};

/**
 * Suggest pairings for a wine given its type and (optionally) dominant varietal.
 * Returns PairingTags sorted by relevance.
 */
export function suggestPairings(
  type: WineType,
  options?: { varietalSlug?: string; sweetness?: string; isSparkling?: boolean },
): PairingTag[] {
  const out: PairingTag[] = [];
  const v = options?.varietalSlug ?? '';

  // Sparkling / MCC
  if (type === 'sparkling' || options?.isSparkling) {
    out.push('oysters', 'sushi', 'seafood', 'cheese-fresh');
    if (options?.sweetness && options.sweetness !== 'bone-dry' && options.sweetness !== 'dry') {
      out.push('dessert-fruit');
    }
    return out;
  }

  // Dessert / fortified
  if (type === 'dessert' || type === 'fortified') {
    out.push('dessert-fruit', 'cheese-blue', 'dessert-choc', 'malva');
    return out;
  }

  // Varietal-specific
  switch (v) {
    case 'pinotage':
      out.push('braai', 'steak', 'lamb', 'cheese-hard');
      break;
    case 'cabernet-sauvignon':
    case 'bordeaux-blend':
      out.push('steak', 'lamb', 'cheese-hard', 'mushroom');
      break;
    case 'shiraz':
    case 'syrah':
      out.push('braai', 'steak', 'game', 'bobotie');
      break;
    case 'pinot-noir':
      out.push('duck', 'mushroom', 'fish-rich', 'charcuterie');
      break;
    case 'grenache':
    case 'mourvedre':
      out.push('steak', 'bobotie', 'charcuterie');
      break;
    case 'chenin-blanc':
      out.push('pork', 'chicken', 'seafood', 'curry');
      break;
    case 'sauvignon-blanc':
      out.push('cheese-fresh', 'oysters', 'seafood', 'sushi');
      break;
    case 'chardonnay':
      if (options?.sweetness === 'bone-dry' || options?.sweetness === 'dry') {
        out.push('pasta-cream', 'chicken', 'fish-rich', 'mushroom');
      } else {
        out.push('oysters', 'fish-light');
      }
      break;
    case 'riesling':
      out.push('curry', 'spicy', 'sushi', 'pork');
      break;
    case 'semillon':
      out.push('fish-rich', 'chicken', 'cheese-fresh');
      break;
    case 'viognier':
      out.push('bobotie', 'curry', 'chicken');
      break;
    default:
      break;
  }

  // Type fallbacks when no varietal match
  if (out.length === 0) {
    if (type === 'red') out.push('steak', 'lamb', 'cheese-hard', 'braai');
    else if (type === 'white') out.push('seafood', 'chicken', 'cheese-fresh');
    else if (type === 'rose') out.push('charcuterie', 'chicken', 'seafood', 'pizza');
    else if (type === 'orange') out.push('curry', 'charcuterie', 'cheese-fresh');
  }

  if (type === 'rose') {
    if (!out.includes('pizza')) out.push('pizza');
    if (!out.includes('seafood')) out.push('seafood');
  }

  return out;
}

// ── Reverse: food → wine matching (the "What are you eating?" feature) ──────

/**
 * Natural-language food → wine-type recommendation.
 * Takes a free-text food query (e.g. "lamb chops", "sushi", "braai",
 * "bobotie", "chocolate cake") and returns the best-matching pairing tags
 * + a natural-language explanation of why these wines work.
 *
 * This is the function that powers the "What are you eating?" search bar —
 * the #1 anxiety point for wine consumers (per the WineDB research).
 */
export interface FoodMatch {
  tags: PairingTag[];
  wineTypes: WineType[];
  varietalSlugs: string[];
  explanation: string;
}

// Keyword → pairing tag mapping (handles natural-language food input)
const FOOD_KEYWORDS: { keywords: string[]; tag: PairingTag }[] = [
  // Red meat
  { keywords: ['steak', 'beef', 'ribeye', 'sirloin', 'fillet', 'rump', 'burger', 'mince'], tag: 'steak' },
  { keywords: ['lamb', 'chop', 'mutton', 'karoo'], tag: 'lamb' },
  { keywords: ['venison', 'game', 'kudu', 'springbok', 'ostrich', 'warthog'], tag: 'game' },
  { keywords: ['braai', 'bbq', 'barbecue', 'boerewors', 'wors', 'grill', 'chops', 'skewer'], tag: 'braai' },
  // Pork & poultry
  { keywords: ['pork', 'bacon', 'ham', 'belly'], tag: 'pork' },
  { keywords: ['chicken', 'poultry', 'roast'], tag: 'chicken' },
  { keywords: ['duck', 'confit'], tag: 'duck' },
  // Seafood
  { keywords: ['fish', 'salmon', 'tuna', 'trout', 'hake', 'kingklip', 'yellowtail'], tag: 'fish-rich' },
  { keywords: ['sole', 'cod', 'white fish', 'line fish'], tag: 'fish-light' },
  { keywords: ['oyster', 'oysters'], tag: 'oysters' },
  { keywords: ['prawn', 'shrimp', 'crayfish', 'lobster', 'calamari', 'mussels', 'seafood', 'shellfish'], tag: 'seafood' },
  { keywords: ['sushi', 'sashimi', 'nigiri'], tag: 'sushi' },
  // Spicy / curry
  { keywords: ['curry', 'bobotie', 'cape malay', 'indian', 'thai', 'chilli', 'spicy', 'masala', 'durban'], tag: 'curry' },
  // Cheese
  { keywords: ['cheese', 'hard cheese', 'cheddar', 'gouda', 'parmigiano', 'manchego'], tag: 'cheese-hard' },
  { keywords: ['blue cheese', 'roquefort', 'gorgonzola', 'stilton', 'camembert', 'brie'], tag: 'cheese-blue' },
  { keywords: ['goat cheese', 'feta', 'ricotta', 'mozzarella', 'fresh cheese'], tag: 'cheese-fresh' },
  // Pasta / pizza
  { keywords: ['pasta', 'risotto', 'cream sauce', 'carbonara', 'lasagne', 'cream'], tag: 'pasta-cream' },
  { keywords: ['tomato pasta', 'bolognese', 'napoli', 'marinara'], tag: 'pasta-tomato' },
  { keywords: ['pizza', 'flatbread'], tag: 'pizza' },
  // SA special
  { keywords: ['biltong', 'droewors', 'dry wors'], tag: 'charcuterie' },
  // Mushroom / earthy
  { keywords: ['mushroom', 'porcini', 'truffle', 'risotto mushroom', 'wild mushroom'], tag: 'mushroom' },
  { keywords: ['charcuterie', 'cured meat', 'salami', 'prosciutto', 'ham board'], tag: 'charcuterie' },
  // Dessert
  { keywords: ['malva', 'pudding', 'cake', 'tart', 'sweet'], tag: 'malva' },
  { keywords: ['milk tart', 'melktert', 'custard'], tag: 'milk-tart' },
  { keywords: ['chocolate', 'brownie', 'mousse', 'dark chocolate', 'cocoa'], tag: 'dessert-choc' },
  { keywords: ['fruit tart', 'crumble', 'apple pie', 'berries', 'fruit salad', 'sorbet'], tag: 'dessert-fruit' },
];

// Tag → recommended wine types + varietals
const TAG_WINE_MAP: Record<PairingTag, { types: WineType[]; varietals: string[] }> = {
  'steak': { types: ['red'], varietals: ['cabernet-sauvignon', 'bordeaux-blend', 'shiraz', 'malbec'] },
  'lamb': { types: ['red'], varietals: ['shiraz', 'cabernet-sauvignon', 'pinotage', 'bordeaux-blend'] },
  'game': { types: ['red'], varietals: ['shiraz', 'pinotage', 'grenache'] },
  'pork': { types: ['white', 'red'], varietals: ['chenin-blanc', 'pinot-noir', 'chardonnay'] },
  'chicken': { types: ['white', 'red'], varietals: ['chardonnay', 'chenin-blanc', 'pinot-noir'] },
  'duck': { types: ['red'], varietals: ['pinot-noir', 'shiraz', 'grenache'] },
  'seafood': { types: ['white', 'sparkling'], varietals: ['sauvignon-blanc', 'chenin-blanc', 'mcc'] },
  'oysters': { types: ['sparkling', 'white'], varietals: ['mcc', 'sauvignon-blanc', 'chardonnay'] },
  'sushi': { types: ['white', 'sparkling'], varietals: ['sauvignon-blanc', 'riesling', 'mcc'] },
  'fish-rich': { types: ['white', 'red'], varietals: ['chardonnay', 'pinot-noir', 'sauvignon-blanc'] },
  'fish-light': { types: ['white'], varietals: ['sauvignon-blanc', 'chenin-blanc', 'chardonnay'] },
  'curry': { types: ['white', 'red'], varietals: ['chenin-blanc', 'riesling', 'viognier', 'pinotage'] },
  'spicy': { types: ['white'], varietals: ['riesling', 'viognier', 'chenin-blanc'] },
  'cheese-hard': { types: ['red'], varietals: ['cabernet-sauvignon', 'bordeaux-blend', 'pinotage'] },
  'cheese-blue': { types: ['fortified', 'dessert'], varietals: ['touriga-nacional'] },
  'cheese-fresh': { types: ['white', 'sparkling'], varietals: ['sauvignon-blanc', 'mcc', 'chenin-blanc'] },
  'mushroom': { types: ['red', 'white'], varietals: ['pinot-noir', 'chardonnay', 'bordeaux-blend'] },
  'charcuterie': { types: ['red', 'sparkling'], varietals: ['pinot-noir', 'grenache', 'mcc'] },
  'pasta-tomato': { types: ['red'], varietals: ['shiraz', 'grenache', 'cabernet-sauvignon'] },
  'pasta-cream': { types: ['white'], varietals: ['chardonnay', 'chenin-blanc', 'viognier'] },
  'pizza': { types: ['red', 'rose'], varietals: ['shiraz', 'grenache', 'mourvedre'] },
  'braai': { types: ['red'], varietals: ['pinotage', 'shiraz', 'cabernet-sauvignon', 'bordeaux-blend'] },
  'bobotie': { types: ['white', 'red'], varietals: ['chenin-blanc', 'riesling', 'pinotage', 'viognier'] },
  'malva': { types: ['dessert', 'fortified'], varietals: ['touriga-nacional'] },
  'milk-tart': { types: ['sparkling', 'white'], varietals: ['mcc', 'chardonnay'] },
  'dessert-choc': { types: ['fortified', 'dessert'], varietals: ['touriga-nacional'] },
  'dessert-fruit': { types: ['dessert'], varietals: ['chenin-blanc'] },
};

export function findWinesForFood(foodQuery: string): FoodMatch {
  const q = foodQuery.toLowerCase().trim();

  // Match keywords to pairing tags
  const matchedTags = new Set<PairingTag>();
  for (const { keywords, tag } of FOOD_KEYWORDS) {
    if (keywords.some((kw) => q.includes(kw))) {
      matchedTags.add(tag);
    }
  }

  // Fallback: if no match, suggest versatile food-friendly wines
  if (matchedTags.size === 0) {
    return {
      tags: [],
      wineTypes: ['red', 'white'],
      varietalSlugs: ['pinot-noir', 'chenin-blanc', 'chardonnay'],
      explanation: `Not sure what pairs with "${foodQuery}"? These versatile food-friendly SA wines work with almost anything: a medium-bodied Pinot Noir for reds, or a Chenin Blanc for whites. When in doubt, bubbles (MCC) go with everything.`,
    };
  }

  // Aggregate wine types and varietals from matched tags
  const wineTypes = new Set<WineType>();
  const varietalSlugs = new Set<string>();
  for (const tag of matchedTags) {
    const wine = TAG_WINE_MAP[tag];
    if (wine) {
      wine.types.forEach((t) => wineTypes.add(t));
      wine.varietals.forEach((v) => varietalSlugs.add(v));
    }
  }

  // Generate explanation
  const tagLabels = [...matchedTags].map((t) => PAIRINGS[t].label.toLowerCase());
  const topVarietal = [...varietalSlugs][0]?.replace(/-/g, ' ') ?? 'a versatile wine';
  const explanation = `For ${tagLabels.join(', ')}, the classic SA match is ${topVarietal}. ` +
    `${[...matchedTags].slice(0, 3).map((t) => PAIRINGS[t].label).join(', ')} calls for ` +
    `${[...wineTypes].map((t) => t === 'sparkling' ? 'MCC (bubbles)' : t).join(' or ')} — ` +
    `the ${topVarietal} has the right weight and acidity to complement the food without overwhelming it.`;

  return {
    tags: [...matchedTags],
    wineTypes: [...wineTypes],
    varietalSlugs: [...varietalSlugs],
    explanation,
  };
}
