/**
 * Decanta theme tokens — "Extended Grand Cru" identity.
 *
 * Near-black canvas with a whisper of magenta. Antique gold (#c4973c) is the
 * brand identity colour. The Extended palette adds:
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
 * Brand accents: antique gold #c4973c (identity) + cardinal #6b1228 (CTA fill).
 */

export const color = {
  // Surfaces — Grand Cru: near-black with a whisper of magenta
  canvas: '#08030a',      // near-pure black — the void, a private cellar
  canvasSoft: '#0f0610',  // inputs, inset surfaces — barely lighter
  canvasCard: 'rgba(196,151,60,0.04)',  // glass card — plum-gold tint, just enough to lift
  canvasCardRaised: '#14091a',  // raised card — visible warm-plum surface (for stat cards, journal entries)
  canvasCardActive: '#1a0c22',  // active/pressed card — brightest warm surface
  canvasMid: '#2a1428',   // deep plum for dividers/mid-fills

  // Gradient surfaces — subtle two-tone lifts replacing flat black on heroes.
  // Applied via LinearGradient at the top of hero sections so the canvas
  // doesn't read as monotone across long scrolls.
  heroGradientTop: '#0d0612',      // barely lifted from canvas — warm plum
  heroGradientMid: '#0a040e',      // transition
  heroGradientBottom: '#08030a',   // back to canvas

  // Card elevation — gold hairline border carries elevation on the glass surface.
  // A white-overtone border would read warm-grey here; gold reads as chosen.
  cardBorder: 'rgba(196,151,60,0.22)',
  cardBorderStrong: 'rgba(196,151,60,0.38)',

  // Image overlays — canvas-coloured gradients layered over photography
  // for text legibility.
  overlayWeak: 'rgba(8,3,10,0.45)',
  overlayMid: 'rgba(8,3,10,0.72)',
  overlayStrong: 'rgba(8,3,10,0.88)',

  // Text — warm parchment on near-black
  ink: '#ede0cc',         // primary text — warm parchment
  inkHover: '#f5ecd8',
  body: '#c4b49a',        // secondary text
  bodyMid: '#7a6858',     // muted captions
  mute: '#7a6858',

  // Lines — deep plum hairline (not grey — chosen)
  hairline: '#2a1428',

  // Fills — cardinal burgundy CTA + gold label on top
  primary: '#6b1228',     // cardinal burgundy — the CTA fill
  onPrimary: '#c4973c',   // antique gold text on cardinal button

  // Decanta brand accents
  gold: '#c4973c',        // antique gold — the identity colour
  wine: '#6b1228',        // cardinal co-primary
  wineBright: '#8a1a30',  // brighter wine for badges
  goldSoft: '#9a7828',

  // Semantic — desaturated so they never compete with the gold identity
  systems: '#c4973c',              // gold: used for "good" states (Pro badge, high match)
  load: '#686878',                 // neutral grey-blue
  warn: '#7a6858',                 // same as mute — info only, not alarming
  crit: '#7a3030',                 // dark desaturated red — readable as danger, not festive
  critFill: 'rgba(122,48,48,0.10)',
  telemetry: '#787878',

  // Aliases
  sunset: '#c4973c',               // gold
  twilight: 'rgba(196,151,60,0.65)', // gold at 65% — for subtext on dark surfaces
  dusk: '#6b1228',                 // cardinal

  // ── EXTENDED: Wine-type spectrum ──────────────────────────────────────────
  // Full colour identity per wine type. Applied on type badges, match meters,
  // star ratings, card accent borders. Each type now reads as distinct at a glance.
  redWine: '#7a1528',       // garnet — saturated but not bright
  whiteWine: '#d4af37',     // champagne gold — brighter than brand gold
  roseWine: '#c47a7a',      // blush pink — dry Provence-style
  sparklingWine: '#e0b546', // bright gold — celebratory, MCC
  fortifiedWine: '#8a4a1a', // tawny — port-style, warm amber-brown
  dessertWine: '#c4973c',   // antique gold (same as brand) — honeyed

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
  surfaceCalmTop: '#1a1216',       // warm plum-neutral
  surfaceCalmBottom: '#120c0f',

  // ── EXTENDED: Seasonal chapter colours ────────────────────────────────────
  // One colour per Events chapter. Applied on chapter hero overlays, the
  // "in season now" badge, and chapter labels. Drives the seasonal arc.
  chapterHarvest: '#b8862f',  // amber — sun, ripe grapes, autumn fields
  chapterWinter: '#2d3561',   // deep indigo — cold nights, fireside
  chapterSpring: '#5a7a4e',   // sage green — new growth, flowers
  chapterFestive: '#9a2030',  // cranberry — celebration, MCC, Christmas

  // ── EXTENDED: Story category tints ────────────────────────────────────────
  // Subtle background wash on story cards by category.
  storyWinemaker: 'rgba(122,21,40,0.12)',    // garnet wash
  storyHeritage: 'rgba(196,134,47,0.12)',    // amber wash
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
