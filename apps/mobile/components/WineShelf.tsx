/**
 * WineShelf — a horizontal "cellar shelf" for one wine type.
 *
 * The Cape-Modern / Cellar-Shelves Discover pattern:
 *   - A coloured HEADER carries the wine-type identity (garnet REDS, cream WHITES,
 *     gold SPARKLING, tawny FORTIFIED & DESSERT). The colour names the section.
 *   - The CARDS are a single calm uniform surface — no per-card tint. A small
 *     6px type dot is the only place the colour touches a card.
 *   - Each shelf is bounded: shows `previewCount` compact cards, then a
 *     "BROWSE ALL REDS →" button that opens the full single-type list.
 *
 * Anti-christmas-tree invariant: colour = section label, never card decoration.
 */

import React from 'react';
import { View, Text, Pressable, ScrollView, Image, StyleSheet } from 'react-native';
import { color, font, radius, space } from '../theme/tokens.js';
import { Stars, Eyebrow } from './index.js';
import { wineImage } from '../lib/imagery.js';
import type { Wine } from '../lib/dataAccessor.js';

interface WineShelfProps {
  title: string;            // "REDS"
  subtitle?: string;        // "Signature South African reds"
  accentColor: string;      // type identity colour
  wines: Wine[];
  totalCount: number;
  onWinePress: (wine: Wine) => void;
  onBrowseAll: () => void;
  /** How many cards to show in the horizontal preview. Default 6. */
  previewCount?: number;
}

export function WineShelf({
  title, subtitle, accentColor, wines, totalCount, onWinePress, onBrowseAll, previewCount = 6,
}: WineShelfProps) {
  const preview = wines.slice(0, previewCount);

  return (
    <View style={styles.shelf}>
      {/* Coloured header band — the type identity. 3px solid edge + a soft wash strip. */}
      <View style={styles.headerBand}>
        <View style={[styles.headerEdge, { backgroundColor: accentColor }]} />
        <View style={[styles.headerWash, { backgroundColor: accentColor }]} />
        <View style={styles.headerText}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: space.sm }}>
            <Text style={[styles.title, { color: accentColor }]}>{title}</Text>
            <Text style={[font.captionMonoSm, { color: color.bodyMid }]}>
              // {totalCount}
            </Text>
          </View>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
          ) : null}
        </View>
      </View>

      {/* Horizontal shelf of calm compact cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.shelfScroll}
      >
        {preview.map((w) => {
          const img = wineImage(w.id);
          return (
            <Pressable
              key={w.id}
              hitSlop={6}
              onPress={() => onWinePress(w)}
              style={({ pressed }) => [styles.card, pressed && { opacity: 0.88 }]}
            >
              {/* The single calm surface + one type dot */}
              <View style={styles.cardDotWrap}>
                <View style={[styles.cardDot, { backgroundColor: accentColor }]} />
              </View>
              <View style={styles.cardThumbWrap}>
                <Image source={{ uri: img.url }} style={styles.cardThumb} resizeMode="contain" />
              </View>
              <Text style={styles.cardName} numberOfLines={2}>
                {w.name}{w.year > 0 ? ` '${String(w.year).slice(2)}` : ''}
              </Text>
              <Text style={styles.cardEstate} numberOfLines={1}>{w.estateName.toUpperCase()}</Text>
              <Stars value={w.avgStars} size={9} />
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Browse-all affordance */}
      {totalCount > preview.length && (
        <Pressable hitSlop={8} onPress={onBrowseAll} style={styles.browseRow}>
          <Text style={[font.captionMonoSm, { color: color.gold, letterSpacing: 1.4 }]}>
            BROWSE ALL {title} →
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const CARD_W = 132;
const THUMB_W = 104;
const THUMB_H = 132;

const styles = StyleSheet.create({
  shelf: {
    marginVertical: space.sm,
  },
  // ── Header band ──
  headerBand: {
    position: 'relative',
    paddingHorizontal: space.xl,
    paddingTop: space.lg,
    paddingBottom: space.sm,
    overflow: 'hidden',
  },
  headerEdge: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 3,
  },
  headerWash: {
    position: 'absolute',
    top: 3, left: 0, right: 0, bottom: 0,
    opacity: 0.08,
  },
  headerText: {
    position: 'relative',
    zIndex: 1,
  },
  title: {
    fontFamily: 'GeistMono, monospace',
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: 12,
    color: color.bodyMid,
    marginTop: 2,
  },
  // ── Shelf scroll ──
  shelfScroll: {
    paddingHorizontal: space.xl,
    paddingTop: space.sm,
    paddingBottom: space.md,
    gap: space.md,
  },
  // ── Compact calm card ──
  card: {
    width: CARD_W,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: color.cardBorder,
    backgroundColor: color.surfaceCalmTop,
    padding: space.sm,
    alignItems: 'center',
  },
  cardDotWrap: {
    position: 'absolute',
    top: 8, left: 8,
  },
  cardDot: {
    width: 6, height: 6,
    borderRadius: 99,
  },
  cardThumbWrap: {
    width: THUMB_W,
    height: THUMB_H,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: color.hairline,
    backgroundColor: color.canvasSoft,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: space.xs,
  },
  cardThumb: {
    width: THUMB_W - 10,
    height: THUMB_H - 12,
  },
  cardName: {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: 11,
    fontWeight: '500',
    color: color.ink,
    lineHeight: 14,
    minHeight: 28,
    textAlign: 'center',
    marginTop: space.xxs,
  },
  cardEstate: {
    fontFamily: 'GeistMono, monospace',
    fontSize: 8,
    fontWeight: '400',
    letterSpacing: 0.6,
    color: color.gold,
    marginTop: 2,
    marginBottom: 2,
    textAlign: 'center',
  },
  // ── Browse-all ──
  browseRow: {
    paddingHorizontal: space.xl,
    paddingTop: space.xs,
  },
});
