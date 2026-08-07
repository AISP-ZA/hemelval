/**
 * WineTypeList — the bounded "browse all <type>" destination, opened from a
 * WineShelf's BROWSE ALL affordance.
 *
 * Full-screen vertical list of one wine type. Cards use the calm uniform surface
 * + a small type-colour dot — the colour names the screen (header) and the dot,
 * never the card fill. Bounded: shows `pageSize` (default 60) wines with a
 * "LOAD MORE" increment so a 143-wine red list never renders all at once.
 */

import React, { useState } from 'react';
import {
  View, Text, Pressable, ScrollView, Image, StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { color, font, radius, space, surfaceCalm } from '../theme/tokens.js';
import { Stars, MatchBadge } from './index.js';
import { SurfaceCard } from './SurfaceCard.js';
import { wineImage, hasRealPhoto } from '../lib/imagery.js';
import { WineBottle } from './WineBottle.js';
import type { Wine } from '../lib/dataAccessor.js';

interface WineTypeListProps {
  type: string;             // 'red' | 'white' | ...
  title: string;            // "REDS"
  accentColor: string;      // type identity colour
  wines: Wine[];
  onBack: () => void;
  onWinePress: (wine: Wine) => void;
  onEstatePress: (estateId: string) => void;
  /** Per-wine palate match score (0-100). */
  matchFor: (wine: Wine) => number;
}

const PAGE = 60;
const PAGE_INCREMENT = 40;

export function WineTypeList({
  type, title, accentColor, wines, onBack, onWinePress, onEstatePress, matchFor,
}: WineTypeListProps) {
  const insets = useSafeAreaInsets();
  const [limit, setLimit] = useState(PAGE);
  const shown = wines.slice(0, limit);
  const hasMore = wines.length > limit;

  return (
    <View style={{ flex: 1, backgroundColor: color.canvas }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + space.huge }}
      >
        {/* Header — coloured band + title + count + back */}
        <LinearGradient
          colors={[accentColor, surfaceCalm()[1]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={[styles.header, { paddingTop: insets.top + space.md }]}
        >
          <View style={styles.headerOverlay} />
          <Pressable hitSlop={12} onPress={onBack} style={styles.backBtn}>
            <Text style={[font.captionMono, { color: color.ink }]}>← BACK</Text>
          </Pressable>
          <View style={{ position: 'relative', zIndex: 1 }}>
            <Text style={[styles.title, { color: color.ink }]}>{title}</Text>
            <Text style={[font.captionMonoSm, { color: color.body, marginTop: space.xs }]}>
              {wines.length} {wines.length === 1 ? 'WINE' : 'WINES'} // {type.toUpperCase()}
            </Text>
          </View>
        </LinearGradient>

        {/* Wine cards — calm surface + type dot, never a per-card fill */}
        <View style={styles.list}>
          {shown.map((w) => {
            const realPhoto = hasRealPhoto(w.id);
            const img = realPhoto ? wineImage(w.id, w.type) : null;
            return (
              <SurfaceCard
                key={w.id}
                onPress={() => onWinePress(w)}
                surface="calm"
                wineType={w.type}
                typeDot
                style={{ marginVertical: space.xs, padding: space.md }}
              >
                <View style={{ flexDirection: 'row', gap: space.md }}>
                  <View style={styles.thumbWrap}>
                    {realPhoto && img ? (
                      <Image source={{ uri: img.url }} style={styles.thumb} resizeMode="contain" />
                    ) : (
                      <WineBottle
                        wineName={w.name}
                        estateName={w.estateName}
                        type={w.type}
                        year={w.year}
                        width={48}
                        height={64}
                      />
                    )}
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={[font.bodyMd, { color: color.ink, fontWeight: '500' }]} numberOfLines={1}>
                      {w.name}{w.year > 0 ? ` '${String(w.year).slice(2)}` : ''}
                    </Text>
                    <Pressable hitSlop={8} onPress={(e) => {
                      e.stopPropagation?.();
                      onEstatePress(w.estateId);
                    }}>
                      <Text style={[font.captionMonoSm, { color: color.gold, marginTop: 2 }]} numberOfLines={1}>
                        {w.estateName.toUpperCase()}
                      </Text>
                    </Pressable>
                    <Text style={[font.captionMonoSm, { color: color.bodyMid, marginTop: 1 }]} numberOfLines={1}>
                      {w.region}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, marginTop: space.sm }}>
                      <Stars value={w.avgStars} size={11} />
                      <MatchBadge score={matchFor(w)} wineType={w.type} />
                    </View>
                  </View>
                </View>
              </SurfaceCard>
            );
          })}

          {hasMore && (
            <Pressable
              hitSlop={8}
              onPress={() => setLimit((l) => l + PAGE_INCREMENT)}
              style={styles.loadMore}
            >
              <Text style={[font.captionMonoSm, { color: color.gold, letterSpacing: 1.4 }]}>
                LOAD MORE ↓ ({wines.length - limit} MORE)
              </Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    position: 'relative',
    paddingHorizontal: space.xl,
    paddingBottom: space.xl,
    overflow: 'hidden',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10,4,16,0.42)',
  },
  backBtn: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(10,4,16,0.72)',
    borderWidth: 1,
    borderColor: color.hairline,
    borderRadius: radius.pill,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    marginBottom: space.lg,
    position: 'relative',
    zIndex: 1,
  },
  title: {
    fontFamily: 'CormorantGaramond',
    fontSize: 34,
    fontWeight: '400',
    letterSpacing: -0.8,
    lineHeight: 38,
  },
  list: {
    paddingHorizontal: space.xl,
    paddingTop: space.lg,
  },
  thumbWrap: {
    width: 64,
    height: 80,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: color.hairline,
    backgroundColor: color.canvasSoft,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumb: {
    width: 56,
    height: 72,
  },
  loadMore: {
    alignSelf: 'center',
    marginTop: space.lg,
    marginBottom: space.md,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    borderWidth: 1,
    borderColor: color.hairline,
    borderRadius: radius.pill,
  },
});
