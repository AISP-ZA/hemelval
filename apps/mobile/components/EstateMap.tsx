/**
 * EstateMap — Grand-Cru-styled location tile for EstateDetailScreen.
 *
 * Two render paths:
 *  1. REAL GEO (lat/lng ≠ 0): a dark-styled static map tile from a
 *     key-free OSM-based static-map endpoint, with a gold pin overlay.
 *  2. NO GEO (lat/lng = 0): a premium stylised "topographic" fallback —
 *     concentric gold contour rings evoking a vineyard-terroir map, not a
 *     generic grey grid. This is what most estates show until geo ingestion
 *     (P1) lands coordinates for all 420 estates.
 *
 * Design constraints (DESIGN.md / Grand Cru):
 *  - Dark canvas, hairline gold border, NO drop shadows.
 *  - Gold is the only accent on the tile (pin, contour, label).
 *  - Pill geometry on the "open in maps" affordance.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, Linking, Platform } from 'react-native';
import { Image } from 'expo-image';
import { Svg, Defs, RadialGradient, Stop, Circle } from 'react-native-svg';
import { color, font, space, radius } from '../theme/tokens.js';

interface EstateMapProps {
  lat: number;
  lng: number;
  region?: string;
  wineRoute?: string;
}

/** Heuristic: real coordinates vs the "not yet geocoded" zero-default. */
function hasRealGeo(lat: number, lng: number): boolean {
  return lat !== 0 && lng !== 0 && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
}

export function EstateMap({ lat, lng, region }: EstateMapProps) {
  const real = hasRealGeo(lat, lng);
  // Dark "dark-matter" style tile, no API key required. 600×160 fits the tile.
  const staticUrl = real
    ? `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lng}&zoom=13&size=600x160&maptype=darkmatter`
    : null;

  const openMaps = () => {
    if (!real) return;
    const url = Platform.select({
      ios: `maps://app?daddr=${lat},${lng}`,
      android: `google.navigation:q=${lat},${lng}`,
      default: `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=14/${lat}/${lng}`,
    });
    if (url) Linking.openURL(url);
  };

  return (
    <View style={styles.wrap}>
      <Pressable onPress={openMaps} disabled={!real} style={styles.tile}>
        {real && staticUrl ? (
          <>
            <Image
              source={{ uri: staticUrl }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              transition={300}
              cachePolicy="memory-disk"
            />
            {/* Canvas-tinted scrim so the tile reads as part of the dark theme */}
            <View style={styles.scrim} />
            {/* Gold pin at the estate's exact location */}
            <View style={styles.pinWrap}>
              <View style={styles.pin} />
              <View style={styles.pinPulse} />
            </View>
          </>
        ) : (
          <ContourFallback region={region} />
        )}
      </Pressable>

      <View style={styles.labelRow}>
        <Text style={styles.label}>
          {region ? `${region.toUpperCase()} · WESTERN CAPE` : 'COORDINATES PENDING'}
        </Text>
        {real && (
          <Pressable hitSlop={8} onPress={openMaps}>
            <Text style={[styles.label, styles.labelAction]}>OPEN IN MAPS →</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

/** Premium stylised topographic fallback — gold contour rings on dark canvas. */
function ContourFallback({ region }: { region?: string }) {
  return (
    <View style={StyleSheet.absoluteFill}>
      <Svg width="100%" height="100%" viewBox="0 0 600 160" preserveAspectRatio="xMidYMid slice">
        <Defs>
          <RadialGradient id="contourGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={color.gold} stopOpacity="0.10" />
            <Stop offset="100%" stopColor={color.gold} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <rect width="600" height="160" fill="url(#contourGlow)" />
        {/* Concentric contours — evoke vineyard terraces / terroir map */}
        {[
          { r: 18, o: 0.55 },
          { r: 34, o: 0.32 },
          { r: 52, o: 0.20 },
          { r: 74, o: 0.13 },
          { r: 100, o: 0.08 },
        ].map((c, i) => (
          <Circle
            key={i}
            cx="300"
            cy="80"
            r={c.r}
            fill="none"
            stroke={color.gold}
            strokeOpacity={c.o}
            strokeWidth="1"
          />
        ))}
        {/* Centre marker — solid gold dot */}
        <Circle cx="300" cy="80" r="4" fill={color.gold} />
      </Svg>
      <View style={styles.fallbackCaption}>
        <Text style={[styles.label, styles.labelMuted]}>
          {region ? `${region.toUpperCase()} · ` : ''}MAP PINNING SOON
        </Text>
      </View>
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  wrap: { marginTop: space.lg },
  tile: {
    height: 160,
    backgroundColor: color.canvasSoft,
    borderWidth: 1,
    borderColor: color.hairline,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8,3,10,0.35)',
  },
  pinWrap: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: [{ translateX: -9 }, { translateY: -9 }],
    alignItems: 'center',
    justifyContent: 'center',
  },
  pin: {
    width: 18,
    height: 18,
    borderRadius: 9999,
    backgroundColor: color.gold,
    borderWidth: 2.5,
    borderColor: color.canvas,
  },
  pinPulse: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 9999,
    borderColor: color.gold,
    borderWidth: 1,
    opacity: 0.4,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: space.sm,
  },
  label: {
    ...font.captionMonoSm,
    color: color.bodyMid,
  },
  labelMuted: {
    color: color.bodyMid,
  },
  labelAction: {
    color: color.gold,
  },
  fallbackCaption: {
    position: 'absolute',
    bottom: space.sm,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});
