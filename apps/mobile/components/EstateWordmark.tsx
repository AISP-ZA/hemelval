/**
 * EstateWordmark — typographic identity per SA estate.
 *
 * Each estate has a distinct visual archetype (heritage crest / scholarly /
 * Old-World classical / modern cult / sparkling prestige / craft millstone /
 * cool modern). Rather than fake trademarked logos, we render a typographic
 * wordmark that evokes each estate's real identity, tuned by family:
 *   serif-heritage  → Kanonkop, Klein Constantia, Hamilton Russell, Vergelegen
 *   serif-scholarly → Sadie Family
 *   modern-cult     → Boekenhoutskloof
 *   formal-prestige → Graham Beck
 *   warm-personal   → Ken Forrester
 *   craft-emblem    → Mullineux
 *   cool-modern     → Iona
 *
 * The font family + letter-spacing + casing carries the brand voice.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { color, space } from '../theme/tokens.js';

type WordmarkFamily = 'serif-heritage' | 'serif-scholarly' | 'modern-cult' | 'formal-prestige' | 'warm-personal' | 'craft-emblem' | 'cool-modern';

const FAMILY_FONTS: Record<WordmarkFamily, { fontFamily: string; letterSpacing: number; textTransform: 'none' | 'uppercase' }> = {
  'serif-heritage': { fontFamily: 'Georgia, serif', letterSpacing: 2, textTransform: 'uppercase' },
  'serif-scholarly': { fontFamily: 'Georgia, serif', letterSpacing: 0.5, textTransform: 'none' },
  'modern-cult': { fontFamily: 'Inter, system-ui, sans-serif', letterSpacing: 4, textTransform: 'uppercase' },
  'formal-prestige': { fontFamily: 'Georgia, serif', letterSpacing: 6, textTransform: 'uppercase' },
  'warm-personal': { fontFamily: 'Georgia, serif', letterSpacing: -0.5, textTransform: 'none' },
  'craft-emblem': { fontFamily: 'Inter, system-ui, sans-serif', letterSpacing: 1, textTransform: 'uppercase' },
  'cool-modern': { fontFamily: 'Inter, system-ui, sans-serif', letterSpacing: 8, textTransform: 'uppercase' },
};

const ESTATE_FAMILY: Record<string, WordmarkFamily> = {
  e1: 'serif-heritage',     // Kanonkop
  e2: 'serif-heritage',     // Klein Constantia
  e3: 'serif-scholarly',    // Sadie Family
  e4: 'serif-heritage',     // Hamilton Russell
  e5: 'modern-cult',        // Boekenhoutskloof
  e6: 'formal-prestige',    // Graham Beck
  e7: 'warm-personal',      // Ken Forrester
  e8: 'craft-emblem',       // Mullineux
  e9: 'serif-heritage',     // Vergelegen
  e10: 'cool-modern',       // Iona
};

// Estate name overrides for wordmark styling (e.g. est. dates, abbreviations)
const ESTATE_DISPLAY: Record<string, string> = {
  e2: 'KLEIN  CONSTANTIA', // wide tracking heritage
  e6: 'G R A H A M   B E C K',
  e10: 'IONA',
  e8: 'MULLINEUX',
};

export function EstateWordmark({
  estateId,
  name,
  size = 'md',
  style,
}: {
  estateId: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  style?: any;
}) {
  const family = ESTATE_FAMILY[estateId] ?? 'serif-heritage';
  const fontConfig = FAMILY_FONTS[family];
  const display = ESTATE_DISPLAY[estateId] ?? (family === 'serif-heritage' || family === 'formal-prestige' ? name.toUpperCase() : name);

  const fontSize = size === 'lg' ? 26 : size === 'sm' ? 14 : 18;

  return (
    <View style={[styles.wrap, style]}>
      <Text
        style={{
          fontFamily: fontConfig.fontFamily,
          fontSize,
          fontWeight: '400',
          letterSpacing: fontConfig.letterSpacing,
          textTransform: fontConfig.textTransform,
          color: color.ink,
        }}
        numberOfLines={1}
      >
        {display}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingBottom: 2,
  },
});
