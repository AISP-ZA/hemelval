/**
 * @kelder/engine — South African grape varietal knowledge base
 *
 * Covers SA signature grapes (Chenin Blanc, Pinotage), the major varieties,
 * and the rising Rhône/Mediterranean grapes central to the Swartland movement.
 * Aliases map local names to canonical entries (e.g. Steen → Chenin Blanc).
 */

import type { WineType } from './vocab.js';

export interface Varietal {
  slug: string;
  name: string;
  type: WineType;
  /** Local SA aliases */
  aliases?: string[];
  /** Is this a signature SA grape? */
  signature?: boolean;
  /** Short character note */
  character: string;
  /** Typical aroma descriptor IDs (from AROMA_DESCRIPTORS) */
  typicalAromas?: string[];
  /** Typical regions/wards in SA */
  regions?: string[];
  /** Serving-temp override type (defaults to by type) */
}

export const VARIETALS: readonly Varietal[] = [
  // ── Signature SA ────────────────────────────────────────────────────────
  {
    slug: 'chenin-blanc',
    name: 'Chenin Blanc',
    type: 'white',
    aliases: ['Steen'],
    signature: true,
    character: 'SA\'s most planted grape. High acid, versatile: fresh & fruity to old-vine serious. Apple, quince, honey.',
    typicalAromas: ['apple', 'quince', 'honey', 'lemon', 'apricot'],
    regions: ['Stellenbosch', 'Swartland', 'Paarl', 'Robertson', 'Breedekloof'],
  },
  {
    slug: 'pinotage',
    name: 'Pinotage',
    type: 'red',
    signature: true,
    character: 'SA\'s own crossing (Pinot Noir × Cinsaut, 1925). Red fruit, earth, sometimes banana/coffee notes. The Cape Blend backbone.',
    typicalAromas: ['cherry-red', 'cherry-black', 'leather', 'tobacco', 'chocolate-dark', 'banana'],
    regions: ['Stellenbosch', 'Paarl', 'Wellington'],
  },
  // ── Major red ───────────────────────────────────────────────────────────
  {
    slug: 'cabernet-sauvignon',
    name: 'Cabernet Sauvignon',
    type: 'red',
    signature: true,
    character: 'The world\'s most planted noble red. In SA, it reaches its finest expression on the granitic slopes of Simonsberg-Stellenbosch and the Helderberg — producing structured, age-worthy wines with firm, ripe tannin. The benchmark SA red; pairs the region\'s intensity with a classic Bordeaux backbone.',
    typicalAromas: ['cassis', 'cedar', 'blackberry', 'eucalyptus', 'mint', 'tobacco', 'vanilla'],
    regions: ['Stellenbosch', 'Paarl', 'Constantia', 'Franschhoek'],
  },
  {
    slug: 'shiraz',
    name: 'Shiraz / Syrah',
    type: 'red',
    aliases: ['Syrah'],
    signature: true,
    character: 'A grape of two faces in SA: powerful, peppery Swartland bush-vine Syrah (world-class, often whole-bunch fermented) and richer, darker-fruited Stellenbosch expressions. White pepper, smoked meat, and violet mark the best. The Swartland Syrah renaissance put SA on the global fine-wine map.',
    typicalAromas: ['blackberry', 'black-pepper', 'white-pepper', 'smoke', 'leather', 'violet', 'licorice'],
    regions: ['Swartland', 'Stellenbosch', 'Franschhoek', 'Paarl'],
  },
  {
    slug: 'pinot-noir',
    name: 'Pinot Noir',
    type: 'red',
    character: 'The heartbreak grape — thin-skinned, demanding, transparent to terroir. SA\'s finest come from the cool, maritime, clay-shale soils of Hemel-en-Aarde (Hamilton Russell pioneered it in 1975) and the high, cold Elgin plateau. Finessed, not powerful: red cherry, forest floor, dried rose. The most food-friendly red in the Cape.',
    typicalAromas: ['cherry-red', 'red-raspberry', 'forest-floor', 'mushroom', 'rose', 'thyme'],
    regions: ['Hemel-en-Aarde', 'Elgin', 'Walker Bay', 'Durbanville'],
  },
  {
    slug: 'merlot',
    name: 'Merlot',
    type: 'red',
    character: 'The approachable Bordeaux red — softer tannin and rounder fruit than Cabernet, which makes it both a beloved varietal and the blending partner that gives Stellenbosch Bordeaux-style blends their plush mid-palate. Plum and blackberry to the fore, often with a cocoa edge from oak. Drink young for fruit, or age the serious ones for dried-leaf complexity.',
    typicalAromas: ['cherry-black', 'blackberry', 'chocolate-dark', 'vanilla', 'hay', 'tobacco'],
    regions: ['Stellenbosch', 'Paarl', 'Durbanville', 'Franschhoek'],
  },
  {
    slug: 'malbec',
    name: 'Malbec',
    type: 'red',
    character: 'Originally a Bordeaux blending grape (and Cahors\'s signature), Malbec has found a small but devoted SA following. Deeply coloured, plush, and generous — dark fruit, violet florality, and a velvety tannin that makes it immediately appealing. SA examples tend toward the restrained, food-friendly side rather than the jammy. Often used to add colour and flesh to Bordeaux-style blends.',
    typicalAromas: ['cherry-black', 'blackberry', 'violet', 'licorice', 'chocolate-dark', 'tobacco'],
    regions: ['Stellenbosch', 'Paarl', 'Swartland'],
  },
  {
    slug: 'bordeaux-blend',
    name: 'Bordeaux Blend',
    type: 'red',
    character: 'The Cape\'s most serious red category — Cabernet Sauvignon-led or Merlot-led blends (with Cabernet Franc, Petit Verdot, Malbec). SA icons: Meerlust Rubicon, Kanonkop Paul Sauer, Vilafonté, Rust en Vrede. Structured, age-worthy, claret-like poise. The best reward a decade in the cellar.',
    typicalAromas: ['cassis', 'cedar', 'blackberry', 'mint', 'tobacco', 'vanilla'],
    regions: ['Stellenbosch', 'Paarl', 'Franschhoek'],
  },
  {
    slug: 'grenache',
    name: 'Grenache',
    type: 'red',
    aliases: ['Garnacha'],
    character: 'Red fruit, white pepper, spice. Central to the Swartland Rhône movement.',
    typicalAromas: ['strawberry', 'raspberry', 'white-pepper', 'thyme', 'licorice'],
    regions: ['Swartland'],
  },
  {
    slug: 'mourvedre',
    name: 'Mourvèdre',
    type: 'red',
    aliases: ['Monastrell'],
    character: 'Dark, meaty, structured. Swartland Rhône-blend component.',
    typicalAromas: ['blackberry', 'leather', 'black-pepper', 'game'],
    regions: ['Swartland', 'Stellenbosch'],
  },
  {
    slug: 'cinsaut',
    name: 'Cinsaut',
    type: 'red',
    aliases: ['Cinsault'],
    character: 'Light, perfumed red fruit. Historic (the parent of Pinotage). Often in Cape blends.',
    typicalAromas: ['strawberry', 'rose', 'white-pepper'],
    regions: ['Swartland', 'Wellington'],
  },
  // ── Major white ─────────────────────────────────────────────────────────
  {
    slug: 'sauvignon-blanc',
    name: 'Sauvignon Blanc',
    type: 'white',
    signature: true,
    character: 'SA Sauvignon Blanc spans two styles: the crisp, herbaceous, nettle-and-citrus cool-climate style (Constantia, Durbanville, Elgin) and the riper tropical-passionfruit expression (warmer sites). The extreme south — Elim and Cape Agulhas, Africa\'s southernmost vineyards — produces some of the most intensely flavoured Sauvignon in the country, windswept and concentrated. One of SA\'s great white grapes.',
    typicalAromas: ['cut-grass', 'passionfruit', 'guava', 'lemon', 'lime', 'asparagus', 'black-olive'],
    regions: ['Constantia', 'Durbanville', 'Elgin', 'Elim', 'Walker Bay'],
  },
  {
    slug: 'chardonnay',
    name: 'Chardonnay',
    type: 'white',
    signature: true,
    character: 'Citrus to rich-oaked. Hemel-en-Aarde & Robertson limestone give world-class expressions.',
    typicalAromas: ['lemon', 'peach', 'butter', 'vanilla', 'brioche', 'hazelnut'],
    regions: ['Hemel-en-Aarde', 'Robertson', 'Elgin', 'Walker Bay'],
  },
  {
    slug: 'semillon',
    name: 'Sémillon',
    type: 'white',
    aliases: ['Semillon'],
    character: 'Waxy, lanolin, fig. Constantia\'s historic grape; revived by Boekenhoutskloof single-vineyard.',
    typicalAromas: ['fig', 'lemon', 'hay', 'wax', 'honey'],
    regions: ['Constantia', 'Franschhoek', 'Stellenbosch'],
  },
  {
    slug: 'riesling',
    name: 'Riesling',
    type: 'white',
    character: 'Lime, petrol (with age), high acid. SA examples from Elgin & Hemel-en-Aarde.',
    typicalAromas: ['lime', 'lemon', 'green-apple', 'petrol', 'honey'],
    regions: ['Elgin', 'Hemel-en-Aarde', 'Constantia'],
  },
  {
    slug: 'viognier',
    name: 'Viognier',
    type: 'white',
    character: 'Apricot, blossom, low acid, oily texture. Swartland & Franschhoek.',
    typicalAromas: ['apricot', 'orange-blossom', 'peach', 'honey', 'ginger'],
    regions: ['Swartland', 'Franschhoek', 'Paarl'],
  },
  {
    slug: 'colombard',
    name: 'Colombard',
    type: 'white',
    aliases: ['Colombard'],
    character: 'High acid, value whites & brandy base. Mostly Breedekloof & Robertson.',
    typicalAromas: ['lemon', 'green-apple', 'cut-grass'],
    regions: ['Breedekloof', 'Robertson'],
  },
  // ── Sparkling ───────────────────────────────────────────────────────────
  {
    slug: 'mcc',
    name: 'MCC (Méthode Cap Classique)',
    type: 'sparkling',
    signature: true,
    character: 'SA traditional-method sparkling (bottle-fermented, lees-aged). Pinot Noir + Chardonnay. Graham Beck, Simonsig, Cap Classique pioneers.',
    typicalAromas: ['brioche', 'lemon', 'apple', 'almond', 'biscuit'],
    regions: ['Stellenbosch', 'Robertson', 'Franschhoek', 'Constantia'],
  },
  // ── Port-style (Klein Karoo / Calitzdorp) ───────────────────────────────
  {
    slug: 'touriga-nacional',
    name: 'Touriga Nacional',
    type: 'red',
    character: 'Port-style wines of Calitzdorp. Dark, floral, concentrated.',
    typicalAromas: ['blackberry', 'violet', 'plum', 'licorice'],
    regions: ['Calitzdorp', 'Klein Karoo'],
  },
  {
    slug: 'tinta-barroca',
    name: 'Tinta Barroca',
    type: 'red',
    character: 'Portuguese variety for Calitzdorp port-style wines.',
    typicalAromas: ['plum', 'cherry-black', 'chocolate-dark'],
    regions: ['Calitzdorp', 'Klein Karoo'],
  },
] as const;

export const VARIETAL_BY_SLUG = new Map(VARIETALS.map((v) => [v.slug, v]));

/** Resolve a local alias (e.g. "Steen") to a canonical varietal slug. */
export function resolveVarietal(nameOrAlias: string): Varietal | undefined {
  const lower = nameOrAlias.toLowerCase().trim();
  for (const v of VARIETALS) {
    if (v.slug === lower || v.name.toLowerCase() === lower) return v;
    if (v.aliases?.some((a) => a.toLowerCase() === lower)) return v;
  }
  return undefined;
}

export function signatureVarietals(): Varietal[] {
  return VARIETALS.filter((v) => v.signature);
}
