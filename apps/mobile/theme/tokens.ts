/**
 * Hemelval theme tokens — "Candlelit Cellar" identity.
 *
 * Warm tobacco-brown canvas (#241b18), gold (#d4a86a) + wine-red (#8a2030)
 * brand accents, Cormorant Garamond serif display / Inter body / GeistMono
 * captions. Hairline borders carry elevation — no drop shadows. Pill geometry
 * on every interactive element. Display weight 400.
 *
 * Brand accents: gold #d4a86a (primary) + wine-red #8a2030 (co-primary).
 */

export const color = {
  // Surfaces — Candlelit Cellar: warm tobacco-brown, visible on phone screens
  canvas: '#241b18',      // warm tobacco-brown — clearly visible, candle-lit mood
  canvasSoft: '#2e2320',  // inputs, inset surfaces
  canvasCard: '#302420',  // cards — lighter than canvas for depth
  canvasMid: '#46342c',   // mid-tone dividers/fills

  // Card elevation — a barely-visible white overtone border that creates the
  // "glass" effect on dark backgrounds. Without this, cards on a dark canvas
  // blend invisibly into the background.
  cardBorder: 'rgba(255,255,255,0.06)',
  cardBorderStrong: 'rgba(255,255,255,0.10)',

  // Image overlays — canvas-coloured gradients layered over photography
  // for text legibility. Replaces the 7 hardcoded rgba(36,27,24,α) values.
  overlayWeak: 'rgba(36,27,24,0.45)',
  overlayMid: 'rgba(36,27,24,0.72)',
  overlayStrong: 'rgba(36,27,24,0.88)',

  // Text — warm parchment
  ink: '#f0e8da',         // primary text
  inkHover: '#f7f0e4',
  body: '#d4c8b8',        // secondary text
  bodyMid: '#9a8a78',     // muted captions
  mute: '#9a8a78',

  // Lines — warm hairline
  hairline: '#46342c',

  // Fills
  primary: '#d4a86a',     // gold — the CTA fill
  onPrimary: '#241b18',   // dark text on gold

  // Hemelval brand accents
  gold: '#d4a86a',        // primary accent — warmer gold
  wine: '#8a2030',        // deep wine-red co-primary
  wineBright: '#a52838',  // brighter wine for badges
  goldSoft: '#b89058',

  // Semantic
  systems: '#7fa86a',
  load: '#6a8aa8',
  warn: '#c98a3a',
  crit: '#b04040',
  critFill: 'rgba(176,64,64,0.12)',
  telemetry: '#a8b8c8',

  // Legacy aliases
  sunset: '#d4a86a',
  twilight: '#e0c898',
  dusk: '#8a2030',

  // Wine-type chips
  redWine: '#8a2030',
  whiteWine: '#c4a468',
  roseWine: '#c07060',
  sparkling: '#d4b45e',
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
