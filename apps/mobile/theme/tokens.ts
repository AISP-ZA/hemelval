/**
 * Decanta theme tokens — "Velvet Vineyard" identity.
 *
 * Deep aubergine-black canvas (#0a0410) with rich amber-gold (#d4942c).
 * The plum warmth of Grand Cru deepened, the gold pushed toward amber —
 * aged oak barrels in candlelight. Warmest, most luxurious palette.
 *
 *  - WINE-TYPE SPECTRUM: garnet reds, champagne whites, blush rosé, bright-gold
 *    MCC, tawny fortified. Applied on wine cards, type badges, match meters.
 *  - SEASONAL CHAPTERS: amber (harvest), deep indigo (winter), sage (spring),
 *    cranberry (festive). Applied on Events chapter headers.
 *  - STORY TINTS: per-category colour washes on Stories feed cards.
 *  - GRADIENT SURFACES: subtle two-tone lifts on hero sections instead of flat black.
 *
 * Cormorant Garamond serif display / Inter body / GeistMono captions.
 * Pill geometry on every interactive element. Display weight 400.
 *
 * Brand accents: amber gold #d4942c (identity) + cardinal #8a1830 (CTA fill).
 */

export const color = {
  // Surfaces — Velvet Vineyard: deep aubergine-black
  canvas: '#0a0410',      // aubergine-plum black — the void, a private cellar
  canvasSoft: '#120818',  // inputs, inset surfaces — barely lighter
  canvasCard: 'rgba(212,148,44,0.05)',  // glass card — amber-gold tint, just enough to lift
  canvasCardRaised: '#1c0e18',  // raised card — visible aubergine surface (for stat cards, journal entries)
  canvasCardActive: '#240e1c',  // active/pressed card — brightest warm surface
  canvasMid: '#2a1420',   // deep aubergine for dividers/mid-fills

  // Gradient surfaces — subtle two-tone lifts replacing flat black on heroes.
  // Applied via LinearGradient at the top of hero sections so the canvas
  // doesn't read as monotone across long scrolls.
  heroGradientTop: '#100618',      // barely lifted from canvas — warm aubergine
  heroGradientMid: '#0c0414',      // transition
  heroGradientBottom: '#0a0410',   // back to canvas

  // Card elevation — gold hairline border carries elevation on the glass surface.
  cardBorder: 'rgba(212,148,44,0.22)',
  cardBorderStrong: 'rgba(212,148,44,0.38)',

  // Image overlays — canvas-coloured gradients layered over photography
  // for text legibility.
  overlayWeak: 'rgba(10,4,16,0.45)',
  overlayMid: 'rgba(10,4,16,0.72)',
  overlayStrong: 'rgba(10,4,16,0.88)',

  // Text — warm sand parchment on aubergine-black
  ink: '#f2e4cc',         // primary text — warm ivory
  inkHover: '#faf0d8',
  body: '#b89878',        // secondary text — warm sand
  bodyMid: '#785848',     // muted captions
  mute: '#785848',

  // Lines — deep aubergine hairline (not grey — chosen)
  hairline: '#2a1420',

  // Fills — cardinal burgundy CTA + gold label on top
  primary: '#8a1830',     // cardinal burgundy — the CTA fill
  onPrimary: '#d4942c',   // amber gold text on cardinal button

  // Decanta brand accents
  gold: '#d4942c',        // rich amber-gold — the identity colour
  wine: '#8a1830',        // cardinal co-primary
  wineBright: '#a8283c',  // brighter wine for badges
  goldSoft: '#b07828',

  // Semantic — desaturated so they never compete with the gold identity
  systems: '#d4942c',              // amber gold: used for "good" states (Pro badge, high match)
  load: '#786868',                 // neutral warm-grey
  warn: '#785848',                 // same as mute — info only, not alarming
  crit: '#8a3030',                 // dark desaturated red — readable as danger, not festive
  critFill: 'rgba(138,48,48,0.10)',
  telemetry: '#786868',

  // Aliases
  sunset: '#d4942c',               // amber gold
  twilight: 'rgba(212,148,44,0.65)', // gold at 65% — for subtext on dark surfaces
  dusk: '#8a1830',                 // cardinal

  // ── EXTENDED: Wine-type spectrum ──────────────────────────────────────────
  // Full colour identity per wine type. Applied on type badges, match meters,
  // star ratings, card accent borders. Each type now reads as distinct at a glance.
  redWine: '#a8283c',       // brighter garnet — saturated, rich
  whiteWine: '#d8b048',     // champagne gold — brighter than brand gold
  roseWine: '#c87a8a',      // blush pink — dry Provence-style
  sparklingWine: '#e0b840', // bright amber gold — celebratory, MCC
  fortifiedWine: '#9a5222', // tawny — port-style, warm amber-brown
  dessertWine: '#d4942c',   // amber gold (same as brand) — honeyed

  // ── Cape Modern: bold colour-coded surface fills per wine type ─────────────
  // Two-stop linear gradients for card backgrounds. Applied via SurfaceCard.
  // CAPE MODERN direction: each tile reads clearly as its wine type at a glance —
  // garnet reds, cream whites, blush rosé, bright-gold MCC, tawny fortified —
  // while the black canvas + gold hairlines keep the premium candlelit-cellar feel.
  // Tops sit ~15-18% lightness (clearly hued); bottoms ~9-11% (depth/vignette).
  redSurfaceTop: '#3d0e18',       // deep crimson-garnet
  redSurfaceBottom: '#260810',
  whiteSurfaceTop: '#2a2618',     // champagne cream (neutral, not yellow)
  whiteSurfaceBottom: '#181510',
  roseSurfaceTop: '#3d1a24',      // blush pink (lean toward magenta to separate from red)
  roseSurfaceBottom: '#261016',
  sparklingSurfaceTop: '#3d3008', // bright old-gold (more saturated than white)
  sparklingSurfaceBottom: '#241c04',
  fortifiedSurfaceTop: '#341806', // tawny orange-brown
  fortifiedSurfaceBottom: '#1f0e04',
  dessertSurfaceTop: '#342810',   // antique honey-gold
  dessertSurfaceBottom: '#1f1808',

  // ── Calm uniform surface (the anti-christmas-tree card) ─────────────────────
  // ONE warm-neutral surface for ALL wine cards on mixed/grouped lists.
  // The wine-type colour lives on the SECTION HEADER + a 6px card dot, never on
  // the card fill. This is what keeps Discover from reading as a colour salad.
  // Used by SurfaceCard surface="calm" mode + WineShelf compact cards.
  surfaceCalmTop: '#1c0e18',       // aubergine-neutral
  surfaceCalmBottom: '#120810',

  // ── EXTENDED: Seasonal chapter colours ────────────────────────────────────
  // One colour per Events chapter. Applied on chapter hero overlays, the
  // "in season now" badge, and chapter labels. Drives the seasonal arc.
  chapterHarvest: '#c89230',  // amber — sun, ripe grapes, autumn fields
  chapterWinter: '#2d3561',   // deep indigo — cold nights, fireside
  chapterSpring: '#5a7a4e',   // sage green — new growth, flowers
  chapterFestive: '#a8283c',  // cranberry — celebration, MCC, Christmas

  // ── EXTENDED: Story category tints ────────────────────────────────────────
  // Subtle background wash on story cards by category.
  storyWinemaker: 'rgba(168,40,60,0.12)',    // garnet wash
  storyHeritage: 'rgba(200,134,47,0.12)',    // amber wash
  storyTransformation: 'rgba(90,122,78,0.12)', // sage wash
  storyHistory: 'rgba(45,53,97,0.15)',       // indigo wash
} as const;

export const space = {
  xxs: 2, xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48, huge: 64,
} as const;

/** pill = 9999 on everything interactive; sm = 8 on cards/inputs */
export const radius = {
  none: 0,
  sm: 8,
  pill: 9999,
} as const;

export const font = {
  // Display — SERIF (Cormorant Garamond) for the editorial, fine-wine-list feel.
  // Weight 400. Negative tracking. Font is loaded via expo-google-fonts in App.tsx.
  displayXl: { fontFamily: 'CormorantGaramond', fontSize: 44, fontWeight: '400' as const, letterSpacing: -1, lineHeight: 50 },
  displayLg: { fontFamily: 'CormorantGaramond', fontSize: 34, fontWeight: '400' as const, letterSpacing: -0.8, lineHeight: 38 },
  displayMd: { fontFamily: 'CormorantGaramond', fontSize: 26, fontWeight: '400' as const, letterSpacing: -0.5, lineHeight: 30 },
  displaySm: { fontFamily: 'CormorantGaramond', fontSize: 20, fontWeight: '400' as const, letterSpacing: -0.3, lineHeight: 25 },

  // Body — Inter (clean sans for readability)
  bodyLg: { fontFamily: 'Inter', fontSize: 18, fontWeight: '400' as const, lineHeight: 26 },
  bodyMd: { fontFamily: 'Inter', fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodySm: { fontFamily: 'Inter', fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },

  // Caption mono — GeistMono, UPPERCASE, tracked (labels / eyebrows / telemetry)
  captionMono: { fontFamily: 'GeistMono', fontSize: 12, fontWeight: '400' as const, letterSpacing: 1.4, lineHeight: 16 },
  captionMonoSm: { fontFamily: 'GeistMono', fontSize: 10, fontWeight: '400' as const, letterSpacing: 1.2, lineHeight: 14 },
} as const;

// Easing
export const easing = {
  standard: 'cubic-bezier(0.4, 0, 0.2, 1)' as const,
} as const;

export const duration = {
  fast: 150,
  normal: 300,
  slow: 600,
} as const;

// ── EXTENDED: Colour helpers ────────────────────────────────────────────────

export type WineType = 'red' | 'white' | 'rose' | 'sparkling' | 'fortified' | 'dessert';

/** Returns the spectrum colour for a wine type string. */
export function wineTypeColor(type: string): string {
  switch (type) {
    case 'red': return color.redWine;
    case 'white': return color.whiteWine;
    case 'rose': return color.roseWine;
    case 'sparkling': return color.sparklingWine;
    case 'fortified': return color.fortifiedWine;
    case 'dessert': return color.dessertWine;
    default: return color.gold;
  }
}

/** The single calm uniform surface for all wine cards on mixed/grouped lists. */
export function surfaceCalm(): [string, string] {
  return [color.surfaceCalmTop, color.surfaceCalmBottom];
}

/** Returns the [top, bottom] gradient colours for a wine-type warm surface. */
export function wineTypeSurface(type: string): [string, string] {
  switch (type) {
    case 'red': return [color.redSurfaceTop, color.redSurfaceBottom];
    case 'white': return [color.whiteSurfaceTop, color.whiteSurfaceBottom];
    case 'rose': return [color.roseSurfaceTop, color.roseSurfaceBottom];
    case 'sparkling': return [color.sparklingSurfaceTop, color.sparklingSurfaceBottom];
    case 'fortified': return [color.fortifiedSurfaceTop, color.fortifiedSurfaceBottom];
    case 'dessert': return [color.dessertSurfaceTop, color.dessertSurfaceBottom];
    default: return ['#241218', '#15090c']; // default warm neutral
  }
}

export type EventChapter = 'harvest' | 'winter' | 'spring' | 'festive';

/** Returns the seasonal colour for an events chapter. */
export function chapterColor(chapter: EventChapter): string {
  switch (chapter) {
    case 'harvest': return color.chapterHarvest;
    case 'winter': return color.chapterWinter;
    case 'spring': return color.chapterSpring;
    case 'festive': return color.chapterFestive;
  }
}

export type StoryCategory = 'winemaker' | 'heritage' | 'transformation' | 'history';

/** Returns the tint background for a story category. */
export function storyTint(category: StoryCategory): string {
  switch (category) {
    case 'winemaker': return color.storyWinemaker;
    case 'heritage': return color.storyHeritage;
    case 'transformation': return color.storyTransformation;
    case 'history': return color.storyHistory;
  }
}
