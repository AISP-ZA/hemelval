/**
 * SurfaceCard — the B+C combined warm-depth card primitive.
 *
 * "Tasting Room" warmth (B) + "Cape Modern" colour-coding (C):
 *   - Two-stop warm gradient background (top lighter, bottom darker)
 *   - Wine-type tint option (reds get garnet-tinted, whites get champagne-tinted)
 *   - Inset top highlight (1px rgba gold at ~6%)
 *   - Soft drop shadow for depth
 *   - Subtle gold border
 *
 * Use this everywhere a card appears. It replaces the flat canvasCard glass.
 */

import React from 'react';
import { View, Pressable, StyleSheet, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { color, wineTypeSurface, wineTypeColor, surfaceCalm } from '../theme/tokens.js';

interface SurfaceCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  /** Wine type for colour-coding (e.g. 'red', 'white', 'sparkling'). */
  wineType?: string;
  /**
   * Surface treatment.
   *  - 'type' (default): warm gradient tinted by the wine type — for screens
   *    where all cards share one type (e.g. a Cellar journal entry).
   *  - 'calm': uniform warm-neutral surface; the type colour lives only on an
   *    optional `typeDot`, never on the fill. Use on MIXED/grouped lists so the
   *    list never reads as a colour salad (anti-christmas-tree).
   */
  surface?: 'type' | 'calm';
  /** Custom gradient colours [top, bottom]. Overrides surface/wineType. */
  gradientColors?: [string, string];
  /** Show the accent strip on the left (wine-type coloured). */
  accent?: boolean;
  /** Accent colour override (defaults to wine type colour or gold). */
  accentColor?: string;
  /** In calm mode, show a small type-colour dot top-left instead of the accent strip. */
  typeDot?: boolean;
}

export function SurfaceCard({
  children, style, onPress, wineType, surface = 'type', gradientColors, accent, accentColor, typeDot,
}: SurfaceCardProps) {
  const typeAccent = wineType ? wineTypeColor(wineType) : color.gold;
  const colors = gradientColors
    ?? (surface === 'calm' ? surfaceCalm()
      : wineType ? wineTypeSurface(wineType)
      : ['#241218', '#15090c']);
  const accentC = accentColor ?? typeAccent;

  const inner = (
    <>
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.3, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      {/* Top sheen — the "glow from within", Cape Modern lit-surface look */}
      <View style={styles.sheen} />
      <View style={styles.topHighlight} />
      {/* Type identity: accent strip (type surface) OR a small dot (calm surface) */}
      {surface === 'calm' && typeDot ? (
        <View style={[styles.typeDot, { backgroundColor: accentC }]} />
      ) : accent ? (
        <View style={[styles.accent, { backgroundColor: accentC }]} />
      ) : null}
      <View style={{ flex: 1, padding: style?.padding ?? 0, zIndex: 1 }}>
        {children}
      </View>
    </>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.card, style, pressed && styles.pressed]}
      >
        {inner}
      </Pressable>
    );
  }

  return (
    <View style={[styles.card, style]}>
      {inner}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(196,151,60,0.12)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 3,
  },
  topHighlight: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 1,
    backgroundColor: 'rgba(255,240,210,0.18)',
    zIndex: 2,
  },
  sheen: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 18,
    backgroundColor: 'rgba(255,245,225,0.05)',
    zIndex: 1,
  },
  accent: {
    position: 'absolute',
    left: 0, top: 10, bottom: 10,
    width: 3,
    borderRadius: 99,
    zIndex: 2,
  },
  typeDot: {
    position: 'absolute',
    top: 14, left: 14,
    width: 7, height: 7,
    borderRadius: 99,
    zIndex: 3,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.995 }],
  },
});
