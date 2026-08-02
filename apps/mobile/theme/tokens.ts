/**
 * Decanta theme tokens — "Grand Cru" identity.
 *
 * Near-black canvas (#08030a) with a breath of magenta. Antique gold (#c4973c)
 * is the brand identity colour — used on the wordmark, ghost borders, and star
 * ratings. Cardinal burgundy (#6b1228) fills the primary CTA; gold labels sit
 * on top of it. Cards are near-invisible glass with a hairline gold rim.
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
  canvasMid: '#2a1428',   // deep plum for dividers/mid-fills

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

  // Wine-type — two colours only: cardinal for reds, gold for everything else
  redWine: '#6b1228',
  whiteWine: '#c4973c',
  roseWine: '#c4973c',
  sparkling: '#c4973c',
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
