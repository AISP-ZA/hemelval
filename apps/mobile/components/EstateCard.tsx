/**
 * EstateCard — the single reusable estate display component.
 *
 * Used everywhere estates appear: DiscoverScreen region browser, search results,
 * EventsScreen participating estates, wine route browsing.
 *
 * Design: full-bleed cover photo with gradient overlay, estate name in serif
 * display, region + famous-for in caption mono, verified badge. Glass-elevation
 * border. expo-image with blur-up placeholder.
 *
 * Variants:
 *  - 'cover' (default): photo-top card with overlay text — for browsing
 *  - 'compact': horizontal, small — for lists within other screens (e.g. event participants)
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { color, font, radius, space } from '../theme/tokens.js';
import { estateCover } from '../lib/imagery.js';
import type { MockEstate } from '../lib/mockData.js';

export interface EstateCardProps {
  estate: MockEstate;
  onPress?: (estate: MockEstate) => void;
  variant?: 'cover' | 'compact';
  style?: ViewStyle;
}

export function EstateCard({ estate, onPress, variant = 'cover', style }: EstateCardProps) {
  const photo = estateCover(estate.id);

  if (variant === 'compact') {
    return (
      <Pressable
        style={({ pressed }) => [styles.compactCard, pressed && { opacity: 0.85 }, style]}
        onPress={() => onPress?.(estate)}
      >
        <Image
          source={photo.url}
          style={styles.compactImage}
          contentFit="cover"
          transition={250}
          cachePolicy="memory-disk"
        />
        <View style={styles.compactInfo}>
          <Text style={[font.bodySm, { color: color.ink, fontWeight: '500' }]} numberOfLines={1}>
            {estate.name}
          </Text>
          <Text style={[font.captionMonoSm, { color: color.bodyMid }]} numberOfLines={1}>
            {estate.region}
          </Text>
        </View>
        {estate.verified && (
          <Text style={[font.captionMonoSm, { color: color.systems, fontSize: 9 }]}>✓</Text>
        )}
      </Pressable>
    );
  }

  // Default: cover variant
  return (
    <Pressable
      style={({ pressed }) => [styles.coverCard, pressed && { opacity: 0.92 }, style]}
      onPress={() => onPress?.(estate)}
    >
      <View style={styles.coverImageWrap}>
        <Image
          source={photo.url}
          style={styles.coverImage}
          contentFit="cover"
          transition={300}
          cachePolicy="memory-disk"
        />
        <View style={styles.coverGradient} />
        {estate.verified && (
          <View style={styles.verifiedBadge}>
            <Text style={[font.captionMonoSm, { color: color.systems, fontSize: 9 }]}>✓ VERIFIED</Text>
          </View>
        )}
      </View>
      <View style={styles.coverBody}>
        <Text style={[font.displaySm, { color: color.ink }]} numberOfLines={1}>
          {estate.name}
        </Text>
        <Text style={[font.captionMonoSm, { color: color.gold, marginTop: 2 }]} numberOfLines={1}>
          {estate.region}
        </Text>
        {estate.famousFor && (
          <Text
            style={[font.bodySm, { color: color.body, marginTop: 6 }]}
            numberOfLines={2}
          >
            {estate.famousFor}
          </Text>
        )}
        {estate.founded && (
          <Text style={[font.captionMonoSm, { color: color.bodyMid, marginTop: 6 }]}>
            EST. {estate.founded}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // ── Cover variant ─────────────────────────────────────────────────────
  coverCard: {
    backgroundColor: color.canvasCard,
    borderWidth: 1,
    borderColor: color.cardBorder,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  coverImageWrap: {
    width: '100%',
    height: 140,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: color.overlayMid,
  },
  verifiedBadge: {
    position: 'absolute',
    top: space.sm,
    right: space.sm,
    backgroundColor: 'rgba(36,27,24,0.8)',
    borderRadius: radius.pill,
    paddingHorizontal: space.sm,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: color.cardBorderStrong,
  },
  coverBody: {
    padding: space.lg,
  },

  // ── Compact variant ───────────────────────────────────────────────────
  compactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: color.canvasCard,
    borderWidth: 1,
    borderColor: color.cardBorder,
    borderRadius: radius.sm,
    padding: space.md,
    gap: space.md,
  },
  compactImage: {
    width: 44,
    height: 44,
    borderRadius: 4,
  },
  compactInfo: {
    flex: 1,
    gap: 1,
  },
});
