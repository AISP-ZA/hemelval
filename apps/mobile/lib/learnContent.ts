/**
 * Decanta Learn — bundled lesson content + Supabase-backed fetch.
 *
 * The lessons are seeded in supabase/migrations/0005_auto_profile_and_learn.sql.
 * This file mirrors that content as a fallback so Learn works in demo mode
 * (no DB) and before the migration is applied. When Supabase is live and the
 * migration is applied, fetchLessons() reads from the `lessons` table instead.
 *
 * Lesson content is a list of typed blocks, rendered by LessonScreen:
 *   heading | paragraph | callout | tip | aroma
 */

export type LessonBlock =
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'callout'; label: string; text: string }
  | { type: 'tip'; text: string }
  | { type: 'aroma'; label: string; items: string[] };

export interface Lesson {
  id: string;
  title: string;
  subtitle: string;
  track: 'foundation' | 'varietal' | 'technique';
  position: number;
  durationMin: number;
  coverUrl: string;
  content: LessonBlock[];
  varietalSlug?: string;
}

// ── Foundation track: the 6-step tasting journey ────────────────────────────

export const FOUNDATION_LESSONS: Lesson[] = [
  {
    id: 'foundation-01',
    title: 'How to Taste Like a Pro',
    subtitle: 'The WSET 4-step method: see, swirl, sniff, sip.',
    track: 'foundation',
    position: 1,
    durationMin: 8,
    coverUrl: 'https://images.unsplash.com/photo-1585803085621-7eea6581caec?w=800&q=80',
    content: [
      { type: 'heading', text: 'Why taste systematically?' },
      { type: 'paragraph', text: 'Anyone can drink wine. Tasting is different — it\'s a structured way to pay attention, so you can remember what you liked and describe it to a sommelier or a friend. The WSET Level 1 method has four steps. Master them and every bottle becomes a lesson.' },
      { type: 'callout', label: 'THE 4 STEPS', text: '1. SEE — clarity, intensity, colour\n2. SWIRL — open the aromas\n3. SNIFF — identify what you smell\n4. SIP — assess palate structure' },
      { type: 'heading', text: 'Step 1 — See' },
      { type: 'paragraph', text: 'Tilt the glass against a white surface. Look for three things: clarity (clear or hazy?), intensity (pale or opaque?), and colour. A young Syrah is deep purple with a pink rim; an aged one fades to brick at the edge. Colour tells you age and grape family.' },
      { type: 'tip', text: 'Hold the glass by the stem, not the bowl. Your hand warms the wine and leaves smudges that distort the colour.' },
      { type: 'heading', text: 'Step 2 — Swirl' },
      { type: 'paragraph', text: 'Swirling coats the glass and releases volatile aroma compounds. Practice with water first. The "legs" that run down the glass indicate alcohol and sweetness — thick slow legs often mean higher alcohol or residual sugar, but they don\'t tell you about quality.' },
      { type: 'heading', text: 'Step 3 — Sniff' },
      { type: 'paragraph', text: 'This is where most of the flavour actually lives — your tongue only detects sweet, sour, bitter, salty, umami. Everything else is aroma. Put your nose fully in the glass and take a steady inhale. In the next lesson you\'ll learn the Noble Aroma Wheel to name what you smell.' },
      { type: 'heading', text: 'Step 4 — Sip' },
      { type: 'paragraph', text: 'Take a small sip and let it spread across your tongue. Assess the structure: body (light to full), acidity (how much your mouth waters), tannin (that drying feeling — reds only), alcohol (warmth in the throat), and finish (how long the flavour lingers).' },
      { type: 'callout', label: 'REMEMBER', text: 'Structure is objective. Whether you like it is personal. Both matter — note both.' },
    ],
  },
  {
    id: 'foundation-02',
    title: 'The Noble Aroma Wheel',
    subtitle: 'Name what you smell — 11 noble aromas every taster should know.',
    track: 'foundation',
    position: 2,
    durationMin: 10,
    coverUrl: 'https://images.unsplash.com/photo-1474722883778-792e7990302f?w=800&q=80',
    content: [
      { type: 'heading', text: 'The vocabulary problem' },
      { type: 'paragraph', text: '"It smells like… wine" is where most people stop. The Noble Aroma Wheel fixes this by giving you a controlled vocabulary — a shared language so your "black cherry" is my "black cherry". Decanta uses the WSET SAT vocabulary with the Noble Aroma Wheel layered on top.' },
      { type: 'heading', text: 'The 11 noble aromas' },
      { type: 'aroma', label: 'Floral', items: ['rose', 'violet', 'blossom', 'honeysuckle'] },
      { type: 'aroma', label: 'Citrus', items: ['lemon', 'grapefruit', 'orange-zest', 'lime'] },
      { type: 'aroma', label: 'Tree Fruit', items: ['apple', 'pear', 'peach', 'apricot'] },
      { type: 'aroma', label: 'Tropical', items: ['pineapple', 'mango', 'passionfruit', 'lychee'] },
      { type: 'aroma', label: 'Red Berry', items: ['strawberry', 'raspberry', 'cherry-red', 'red-currant'] },
      { type: 'aroma', label: 'Black Fruit', items: ['blackberry', 'black-cherry', 'black-currant', 'plum'] },
      { type: 'aroma', label: 'Stone/Jammy', items: ['prune', 'fig', 'fruitcake', 'jam'] },
      { type: 'aroma', label: 'Spice', items: ['black-pepper', 'cinnamon', 'clove', 'ginger', 'liquorice'] },
      { type: 'aroma', label: 'Earth', items: ['forest-floor', 'mushroom', 'earth', 'leather', 'tobacco'] },
      { type: 'aroma', label: 'Oak', items: ['vanilla', 'toast', 'smoke', 'coconut', 'cedar'] },
      { type: 'aroma', label: 'Sweet/Bottle Age', items: ['honey', 'caramel', 'butterscotch', 'wax', 'nuts'] },
      { type: 'tip', text: 'You don\'t need all 11. Pick the one or two that jump out. Over time your nose learns to separate them.' },
      { type: 'paragraph', text: 'When you log a tasting in Decanta, these are the exact descriptors you can choose from — the app builds your palate profile from what you repeatedly enjoy.' },
    ],
  },
  {
    id: 'foundation-03',
    title: 'Reading a South African Label',
    subtitle: 'WO appellations, vintage, and what "single vineyard" really means.',
    track: 'foundation',
    position: 3,
    durationMin: 7,
    coverUrl: 'https://images.unsplash.com/photo-1554230561-31bdc707b537?w=800&q=80',
    content: [
      { type: 'heading', text: 'The Wine of Origin (WO) system' },
      { type: 'paragraph', text: 'South Africa has a controlled appellation system — the Wine of Origin scheme, administered by the Wine and Spirit Board since 1973. When a bottle says "WO Stellenbosch", 100% of the grapes came from that region. This is stricter than many Old World systems.' },
      { type: 'callout', label: 'THE 4 TIERS', text: 'Region (e.g. Western Cape)\nDistrict (e.g. Stellenbosch)\nWard (e.g. Simonsberg-Stellenbosch)\nSingle Vineyard (named block)' },
      { type: 'heading', text: 'Vintage matters in the Cape' },
      { type: 'paragraph', text: 'Unlike much of Europe, the Western Cape has vintage variation driven by wind, drought, and heatwaves. A 2018 (cool, slow ripening) and a 2017 (hot, early harvest) Cabernet from the same estate can taste quite different. Decanta shows vintage on every wine for this reason.' },
      { type: 'heading', text: 'Terms that sell — and what they mean' },
      { type: 'paragraph', text: '• Old Vines (member of the Old Vine Project, 35+ years) — concentrated, lower yields\n• Single Vineyard — all grapes from one named block; maximum terroir expression\n• Estate Wine — grown, made, and bottled on the same farm\n• Reserve — no legal definition in SA; means what the winemaker decides it means' },
      { type: 'tip', text: '"Reserve" is a marketing word in SA, not a quality guarantee. "Old Vine", "Single Vineyard", and "Estate" have legal teeth.' },
    ],
  },
  {
    id: 'foundation-04',
    title: 'Red vs White vs MCC — Body, Tannin, Acid',
    subtitle: 'The structural building blocks that define every wine.',
    track: 'foundation',
    position: 4,
    durationMin: 8,
    coverUrl: 'https://images.unsplash.com/photo-1567072629554-20e689de2400?w=800&q=80',
    content: [
      { type: 'heading', text: 'The three axes of structure' },
      { type: 'paragraph', text: 'Once you can see, smell, and sip, the next skill is assessing structure — the architecture of a wine. Three axes do most of the work: body, tannin, and acidity. Balance between them is what separates great wine from ordinary.' },
      { type: 'callout', label: 'BODY', text: 'Light: Pinot Noir, Sauvignon Blanc\nMedium: Cinsaut, Chenin Blanc\nFull: Cabernet Sauvignon, wooded Chardonnay' },
      { type: 'paragraph', text: 'Think of body like milk: skim (light) through full-cream (full). It\'s the weight and viscosity of the wine in your mouth, driven mainly by alcohol and extract.' },
      { type: 'callout', label: 'TANNIN', text: 'Only in reds (and some orange/aged whites).\nThat drying feeling — like over-steeped tea.\nHigh: Cabernet, Nebbiolo, Tannat\nLow: Pinot Noir, Merlot, Cinsaut' },
      { type: 'paragraph', text: 'Tannin comes from grape skins, seeds, and oak. It\'s a preservative — high-tannin wines age longer. Tannin feels different from acidity: tannin dries, acidity makes you salivate.' },
      { type: 'callout', label: 'ACIDITY', text: 'Whites and cool-climate reds shine here.\nCrunchy Granny Smith = high acid.\nFlabby canned peach = low acid.\nSA Sauvignon Blanc and Elgin Pinot are naturally high-acid.' },
      { type: 'tip', text: 'A wine that feels "too sour" is high acid. "Too bitter/drying" is high tannin. "Too heavy" is full body. Naming the problem tells you what you like.' },
    ],
  },
  {
    id: 'foundation-05',
    title: 'Food Pairing First Principles',
    subtitle: 'Why Chenin loves bobotie and Syrah belongs on the braai.',
    track: 'foundation',
    position: 5,
    durationMin: 8,
    coverUrl: 'https://images.unsplash.com/photo-1554230561-31bdc707b537?w=800&q=80',
    content: [
      { type: 'heading', text: 'Match weight to weight' },
      { type: 'paragraph', text: 'The foundational rule: light food with light wine, rich food with full wine. A delicate line-caught kingklip will be obliterated by a wooded Cabernet. Pair it with a crisp Sauvignon Blanc instead.' },
      { type: 'callout', label: 'THE SA CLASSIC PAIRS', text: '• Braai lamb → Syrah / Pinotage\n• Bobotie → Chenin Blanc\n• Sushi → MCC / Cap Classique\n• Malva pudding → Vin de Constance\n• Oysters → Sauvignon Blanc / MCC\n• Biltong → Pinotage' },
      { type: 'heading', text: 'Three advanced moves' },
      { type: 'paragraph', text: '1. CONTRAST — salty food with sweet wine (biltong with a late-harvest Riesling). The salt makes the wine taste fruitier.\n2. BRIDGE — match a flavour in the wine to a flavour in the dish (peppery Syrah with black-pepper-crusted steak).\n3. CUT — use acidity to cleanse richness (Sauvignon Blanc cuts through creamy Cape Malay curry).' },
      { type: 'paragraph', text: 'Decanta\'s pairing engine encodes these principles — when you search "braai lamb", it returns Syrah and Pinotage first because the varietal\'s aromatic profile bridges to the smoke and pepper of the braai.' },
      { type: 'tip', text: 'In doubt? Reach for MCC (Cap Classique). Bubbles and acidity make it the most food-friendly wine in the world — it pairs with almost everything on a SA table.' },
    ],
  },
  {
    id: 'foundation-06',
    title: 'Your Palate, Decoded',
    subtitle: 'How Decanta turns your tasting notes into a personal match score.',
    track: 'foundation',
    position: 6,
    durationMin: 6,
    coverUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80',
    content: [
      { type: 'heading', text: 'You\'re already building a palate profile' },
      { type: 'paragraph', text: 'Every tasting note you log — the aromas you pick, the body you prefer, the stars you give — feeds Decanta\'s engine. After five notes, your match scores stop being a cold-start guess and start reflecting what you actually enjoy.' },
      { type: 'callout', label: 'HOW THE ENGINE WORKS', text: 'It weighs four signals:\n• Varietals you rate highly (35%)\n• Wine types you favour (25%)\n• Aroma descriptors you reach for (25%)\n• Body & sweetness preferences (15%)' },
      { type: 'paragraph', text: 'The result is a 0–100 "Match for you" badge on every wine. A wine at 70%+ is a strong bet; below 40% the engine thinks you\'ll find it unusual. Neither is a verdict — exploration is the point.' },
      { type: 'heading', text: 'Refine over time' },
      { type: 'paragraph', text: 'Your palate changes. The wine you loved at 22 might bore you at 40. Decanta\'s engine weights recent notes more heavily than old ones, so as your taste evolves, so do your matches. Keep logging tastings — even the ones you didn\'t love. A 2-star note teaches the engine as much as a 5-star one.' },
      { type: 'tip', text: 'Tap any match badge to see why. The engine is transparent — it shows you which of your past notes drove the score.' },
    ],
  },
];

// ── Varietal school ─────────────────────────────────────────────────────────

export const VARIETAL_LESSONS: Lesson[] = [
  {
    id: 'varietal-pinotage',
    title: 'Pinotage — South Africa\'s Own',
    subtitle: 'Love it or hate it, no grape divides a room like this.',
    track: 'varietal',
    position: 1,
    durationMin: 7,
    varietalSlug: 'pinotage',
    coverUrl: 'https://images.unsplash.com/photo-1554230561-31bdc707b537?w=800&q=80',
    content: [
      { type: 'heading', text: 'Born in Stellenbosch, 1925' },
      { type: 'paragraph', text: 'Pinotage is a South African cross of Pinot Noir and Cinsaut (then called "Hermitage"). Professor Abraham Perold created it at Stellenbosch University. No other wine country grows it in commercial volume — it is unambiguously ours.' },
      { type: 'callout', label: 'TYPICAL AROMAS', text: 'Red & black berry, banana (divisive!), smoke, earth, sometimes coffee. The "Diemersfontein Coffee Pinotage" leans hard into roasted notes.' },
      { type: 'paragraph', text: 'Quality ranges enormously. Cheap Pinotage can taste of acetone or burnt rubber. But great Pinotage — Kanonkop, Simonsig, Diemersfontein Carpe Diem — is textured, smoky, and distinctly South African. Try a few before you decide.' },
      { type: 'tip', text: 'Pair Pinotage with biltong, bobotie, or anything off the braai. Its smoky edge loves fire.' },
    ],
  },
  {
    id: 'varietal-chenin-blanc',
    title: 'Chenin Blanc — The Cape\'s White Workhorse',
    subtitle: 'The most planted white grape in SA. Crisp, versatile, age-worthy.',
    track: 'varietal',
    position: 2,
    durationMin: 6,
    varietalSlug: 'chenin-blanc',
    coverUrl: 'https://images.unsplash.com/photo-1567072629554-20e689de2400?w=800&q=80',
    content: [
      { type: 'heading', text: 'Old vines, new world' },
      { type: 'paragraph', text: 'Chenin Blanc originates in the Loire Valley (Vouvray, Savennières), but South Africa has more of it than anywhere on earth — and some of the oldest Chenin vines in the world, planted in the 1950s and \'60s. Old-vine Chenin makes wines of extraordinary concentration and minerality.' },
      { type: 'callout', label: 'STYLES', text: 'Fresh & fruity (unwooded): apple, guava, melon\nSerious & wooded: baked apple, honey, beeswax\nNoble rot / late harvest: marmalade, ginger (Vin de Constance style)' },
      { type: 'paragraph', text: 'Chenin\'s high acidity makes it food-friendly. It\'s the default white for Cape Malay cuisine — bobotie specifically. It also ages: a good wooded Chenin evolves for 10+ years.' },
      { type: 'tip', text: 'Look for "Old Vines" on the label. Sadie Family Skurfberg and Ken Forrester The FMC are benchmarks.' },
    ],
  },
  {
    id: 'varietal-mcc',
    title: 'MCC — Méthode Cap Classique',
    subtitle: 'South Africa\'s answer to Champagne. Same method, Cape grapes.',
    track: 'varietal',
    position: 3,
    durationMin: 6,
    varietalSlug: 'mcc',
    coverUrl: 'https://images.unsplash.com/photo-1547595628-c61a29f496f0?w=800&q=80',
    content: [
      { type: 'heading', text: 'Method, not region' },
      { type: 'paragraph', text: 'Champagne can only come from Champagne. But the traditional method — second fermentation in the bottle — is used worldwide. South Africa calls its traditional-method sparkling "Méthode Cap Classique" (MCC). By law it must spend at least 12 months on the lees.' },
      { type: 'callout', label: 'WHAT TO EXPECT', text: 'Citrus, brioche, almond, fine bubbles.\nGraham Beck, Simonsig Kaapse Vonkel, and Villiera are benchmarks.' },
      { type: 'paragraph', text: 'MCC is usually a fraction of Champagne\'s price for comparable quality. The Western Cape\'s cool sites (Robertson, Elgin) give the grapes the acidity traditional method needs.' },
      { type: 'tip', text: 'MCC is the most food-friendly sparkling in the world. Try it with sushi, oysters, or Cape Malay — not just for celebrations.' },
    ],
  },
];

export const ALL_LESSONS: Lesson[] = [...FOUNDATION_LESSONS, ...VARIETAL_LESSONS];
