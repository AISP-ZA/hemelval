/**
 * WineCard — the single reusable wine display component.
 *
 * Used everywhere wines appear: DiscoverScreen list, CellarScreen journal,
 * EstateDetailScreen wine list, search results.
 *
 * Design: horizontal card with bottle photo (left, 72×96), name + meta (right),
 * star rating + match score bar. Glass-elevation border (white overtone on dark).
 * expo-image with blur-up placeholder. No drop shadows.
 *
 * Variants:
 *  - 'list' (default): horizontal, compact — for scrollable lists
 *  - 'feature': larger, photo-top — for top-rated carousel / featured
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { color, font, radius, space } from '../theme/tokens.js';
import { wineImage } from '../lib/imagery.js';
import type { MockWine } from '../lib/mockData.js';

export interface WineCardProps {
  wine: MockWine;
  onPress?: (wine: MockWine) => void;
  variant?: 'list' | 'feature';
  matchScore?: number;
  style?: ViewStyle;
}

const typeColors: Record<string, string> = {
  red: color.redWine,
  white: color.whiteWine,
  rose: color.roseWine,
  sparkling: color.sparkling,
  fortified: color.redWine,
  dessert: color.gold,
  orange: '#c08050',
};

function typeLabel(type: string): string {
  const labels: Record<string, string> = {
    red: 'RED', white: 'WHITE', rose: 'ROSÉ', sparkling: 'MCC',
    fortified: 'FORTIFIED', dessert: 'DESSERT', orange: 'ORANGE',
  };
  return labels[type] ?? type.toUpperCase();
}

export function WineCard({ wine, onPress, variant = 'list', matchScore, style }: WineCardProps) {
  const photo = wineImage(wine.id);
  const typeColor = typeColors[wine.type] ?? color.gold;

  if (variant === 'feature') {
    return (
      <Pressable
        style={({ pressed }) => [styles.featureCard, pressed && { opacity: 0.9 }, style]}
        onPress={() => onPress?.(wine)}
      >
        <View style={styles.featureImageWrap}>
          <Image
            source={photo.url}
            style={styles.featureImage}
            contentFit="cover"
            transition={300}
            cachePolicy="memory-disk"
          />
          <View style={styles.featureImageOverlay} />
          <View style={styles.featureBadge}>
            <Text style={[font.captionMonoSm, { color: typeColor }]}>{typeLabel(wine.type)}</Text>
          </View>
        </View>
        <View style={styles.featureBody}>
          <Text style={[font.displaySm, { color: color.ink }]} numberOfLines={1}>{wine.name}</Text>
          <Text style={[font.captionMonoSm, { color: color.bodyMid, marginTop: 2 }]} numberOfLines={1}>
            {wine.estateName} · {wine.region}
          </Text>
          <View style={styles.featureMeta}>
            <Text style={[font.bodySm, { color: color.gold, fontWeight: '600' }]}>
              ★ {wine.avgStars.toFixed(1)}
            </Text>
            <Text style={[font.captionMonoSm, { color: color.bodyMid }]}>
              {wine.ratingCount.toLocaleString()} ratings
            </Text>
            {wine.priceZar && (
              <Text style={[font.captionMonoSm, { color: color.body }]}>
                R{wine.priceZar}
              </Text>
            )}
          </View>
        </View>
      </Pressable>
    );
  }

  // Default: list variant
  return (
    <Pressable
      style={({ pressed }) => [styles.listCard, pressed && { opacity: 0.85 }, style]}
      onPress={() => onPress?.(wine)}
    >
      {/* Bottle thumbnail */}
      <View style={styles.thumbWrap}>
        <Image
          source={photo.url}
          style={styles.thumb}
          contentFit="cover"
          transition={250}
          cachePolicy="memory-disk"
        />
      </View>

      {/* Wine info */}
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={[font.bodyMd, { color: color.ink, fontWeight: '500' }]} numberOfLines={1}>
            {wine.name}
          </Text>
          {wine.year > 0 && (
            <Text style={[font.captionMonoSm, { color: color.bodyMid }]}>
              '{String(wine.year).slice(2)}
            </Text>
          )}
        </View>

        <Text style={[font.captionMonoSm, { color: color.bodyMid, marginTop: 2 }]} numberOfLines={1}>
          {wine.estateName} · {wine.region}
        </Text>

        <View style={styles.varietalRow}>
          {wine.varietals.slice(0, 3).map((v) => (
            <View key={v} style={[styles.varietalChip, { borderColor: typeColor }]}>
              <Text style={[font.captionMonoSm, { color: color.body, fontSize: 9 }]}>{v}</Text>
            </View>
          ))}
        </View>

        <View style={styles.bottomRow}>
          <Text style={[font.bodySm, { color: color.gold, fontWeight: '600' }]}>
            ★ {wine.avgStars.toFixed(1)}
          </Text>
          <Text style={[font.captionMonoSm, { color: color.bodyMid }]}>
            {(wine.ratingCount / 1000).toFixed(1)}k
          </Text>
          {matchScore != null && (
            <View style={styles.matchBar}>
              <View style={styles.matchBarTrack}>
                <View style={[styles.matchBarFill, { width: `${matchScore}%`, backgroundColor: typeColor }]} />
              </View>
              <Text style={[font.captionMonoSm, { color: color.bodyMid, fontSize: 9 }]}>{matchScore}%</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // ── List variant ──────────────────────────────────────────────────────
  listCard: {
    flexDirection: 'row',
    backgroundColor: color.canvasCard,
    borderWidth: 1,
    borderColor: color.cardBorder,
    borderRadius: radius.sm,
    padding: space.md,
    gap: space.md,
    alignItems: 'center',
  },
  thumbWrap: {
    width: 56,
    height: 72,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: color.canvasSoft,
  },
  thumb: {
    width: '100%',
    height: '100%',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: space.sm,
  },
  varietalRow: {
    flexDirection: 'row',
    gap: space.xs,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  varietalChip: {
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: space.xs,
    paddingVertical: 1,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    marginTop: 6,
  },
  matchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    marginLeft: 'auto',
  },
  matchBarTrack: {
    width: 36,
    height: 3,
    backgroundColor: color.canvasMid,
    borderRadius: 2,
    overflow: 'hidden',
  },
  matchBarFill: {
    height: 3,
    borderRadius: 2,
  },

  // ── Feature variant ───────────────────────────────────────────────────
  featureCard: {
    width: 200,
    backgroundColor: color.canvasCard,
    borderWidth: 1,
    borderColor: color.cardBorder,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  featureImageWrap: {
    width: '100%',
    height: 120,
    position: 'relative',
  },
  featureImage: {
    width: '100%',
    height: '100%',
  },
  featureImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: color.overlayWeak,
  },
  featureBadge: {
    position: 'absolute',
    top: space.sm,
    left: space.sm,
    backgroundColor: 'rgba(36,27,24,0.8)',
    borderRadius: radius.pill,
    paddingHorizontal: space.sm,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: color.cardBorderStrong,
  },
  featureBody: {
    padding: space.md,
    gap: 2,
  },
  featureMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    marginTop: 6,
  },
});
