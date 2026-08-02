/**
 * Hemelval theme tokens — "Deep cellar" identity.
 *
 * A consumer wine app deserves a wine-literate palette: an even deeper
 * burgundy-black canvas that reads as wine-in-a-glass-under-low-light,
 * warm parchment text, gold + deep-wine brand accents, and a serif
 * display face for headlines (the sommelier's-notebook feel).
 *
 * Still dark (no light mode). Still hairline borders, no drop shadows.
 * Display weight 400. Pill geometry on every interactive element.
 *
 * Brand accents: gold #c9a96a (primary) + deep burgundy #6b1219 (co-primary).
 */

export const color = {
  // Surfaces — Candlelit Cellar: warm brown-burgundy, visible on phone screens
  canvas: '#241b18',      // warm tobacco-brown — clearly visible, candle-lit mood
  canvasSoft: '#2e2320',  // inputs, inset surfaces
  canvasCard: '#302420',  // cards — lighter than canvas for depth
  canvasMid: '#46342c',   // mid-tone dividers/fills

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
  // Display — SERIF (Cormorant Garamond → serif fallback) for the editorial,
  // fine-wine-list feel. Weight 400. Negative tracking kept.
  // Falls back to Georgia/serif on devices without Cormorant.
  displayXl: { fontFamily: 'CormorantGaramond, Georgia, serif', fontSize: 44, fontWeight: '400' as const, letterSpacing: -1, lineHeight: 50 },
  displayLg: { fontFamily: 'CormorantGaramond, Georgia, serif', fontSize: 34, fontWeight: '400' as const, letterSpacing: -0.8, lineHeight: 38 },
  displayMd: { fontFamily: 'CormorantGaramond, Georgia, serif', fontSize: 26, fontWeight: '400' as const, letterSpacing: -0.5, lineHeight: 30 },
  displaySm: { fontFamily: 'CormorantGaramond, Georgia, serif', fontSize: 20, fontWeight: '400' as const, letterSpacing: -0.3, lineHeight: 25 },

  // Body — Inter (clean sans for readability)
  bodyLg: { fontFamily: 'Inter, system-ui, sans-serif', fontSize: 18, fontWeight: '400' as const, lineHeight: 26 },
  bodyMd: { fontFamily: 'Inter, system-ui, sans-serif', fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodySm: { fontFamily: 'Inter, system-ui, sans-serif', fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },

  // Caption mono — GeistMono, UPPERCASE, tracked (labels / eyebrows / telemetry)
  captionMono: { fontFamily: 'GeistMono, ui-monospace, monospace', fontSize: 12, fontWeight: '400' as const, letterSpacing: 1.4, lineHeight: 16 },
  captionMonoSm: { fontFamily: 'GeistMono, ui-monospace, monospace', fontSize: 10, fontWeight: '400' as const, letterSpacing: 1.2, lineHeight: 14 },
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
