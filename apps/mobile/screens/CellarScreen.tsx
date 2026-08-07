/**
 * Cellar — the user's owned bottles + tasting history, read from the live palate store.
 * Every note logged via the tasting flow appears here immediately.
 *
 * Extended Grand Cru: tinted stat cards, wine-type coloured journal entries with
 * structured visual hierarchy, gradient header.
 */

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable, Linking, Text, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Eyebrow, Headline, BodyText, Card, Chip, Button, Stars, Divider } from '../components/index.js';
import { color, font, space, radius, wineTypeColor } from '../theme/tokens.js';
import { GradientSurface } from '../components/GradientSurface.js';
import { SurfaceCard } from '../components/SurfaceCard.js';
import { TasteProfileChart, aggregateTasteValues } from '../components/TasteProfileChart.js';
import { HERO_VINEYARD, wineImage } from '../lib/imagery.js';
import { aromaLabel } from '@kelder/engine';
import { usePalate } from '../hooks/usePalate.js';
import { MOCK_WINES, MOCK_ESTATES, type MockEstate } from '../lib/mockData.js';
import { EstateDetailScreen } from './EstateDetailScreen.js';

export function CellarScreen() {
  const insets = useSafeAreaInsets();
  const { notes, profile, wineForNote, removeNote } = usePalate();
  const [estateView, setEstateView] = useState<MockEstate | null>(null);

  const avgRating = profile.noteCount > 0
    ? (notes.reduce((s, n) => s + n.stars, 0) / notes.length).toFixed(1)
    : '—';

  if (estateView) {
    return (
      <EstateDetailScreen
        estate={estateView}
        onBack={() => setEstateView(null)}
        onWinePress={() => { setEstateView(null); }}
      />
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: color.canvas }} contentContainerStyle={{ paddingBottom: space.huge }}>
      {/* Gradient header */}
      <GradientSurface style={{ paddingTop: insets.top + 16, paddingBottom: space.lg }}>
        <View style={{ paddingHorizontal: space.xl }}>
          <Eyebrow>YOUR CELLAR</Eyebrow>
          <Headline size="xl" style={{ marginTop: space.sm }}>{profile.noteCount} {profile.noteCount === 1 ? 'wine' : 'wines'} tasted.</Headline>
        </View>

        {/* Stats — real filled cards with warm-plum surface + gold accent */}
        <View style={[styles.statRow, { paddingHorizontal: space.xl }]}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{profile.noteCount}</Text>
            <Text style={styles.statLabel}>TASTED</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: color.gold }]}>{avgRating}★</Text>
            <Text style={styles.statLabel}>AVG RATING</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{profile.topVarietals.length}</Text>
            <Text style={styles.statLabel}>VARIETALS</Text>
          </View>
        </View>
      </GradientSurface>

      <View style={{ padding: space.xl }}>
        {/* Palate profile — animated radar visualization */}
        {profile.noteCount > 0 && (
          <>
            <TasteProfileChart
              values={aggregateTasteValues(notes)}
              label="YOUR PALATE // LIVE"
            />

            {/* Varietal + descriptor breakdown below the radar */}
            {profile.topVarietals.length > 0 && (
              <View style={styles.sectionCard}>
                <Eyebrow>VARIETALS YOU LOVE</Eyebrow>
                <View style={styles.chipRow}>
                  {profile.topVarietals.slice(0, 6).map((v) => {
                    const wine = MOCK_WINES.find((w) => w.varietals[0] === v.slug);
                    const tCol = wine ? wineTypeColor(wine.type) : color.gold;
                    return (
                      <View key={v.slug} style={[styles.varietalChip, { borderColor: tCol }]}>
                        <Text style={[styles.varietalChipText, { color: tCol }]}>{v.slug.replace('-', ' ')} · {v.avgStars.toFixed(1)}★</Text>
                      </View>
                    );
                  })}
                </View>
                {profile.topDescriptors.length > 0 && (
                  <View style={[styles.chipRow, { marginTop: space.sm }]}>
                    {profile.topDescriptors.slice(0, 8).map((d) => (
                      <Chip key={d.id} tone="neutral">{aromaLabel(d.id)}</Chip>
                    ))}
                  </View>
                )}
              </View>
            )}

            <View style={{ height: space.xl }} />

            <Eyebrow>TASTING JOURNAL</Eyebrow>
            {notes.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyHero}>
                  <EmptyHeroImage />
                  <View style={styles.emptyHeroOverlay} />
                  <View style={styles.emptyHeroBody}>
                    <Text style={styles.emptyWordmark}>EMPTY</Text>
                    <Text style={styles.emptyWordmarkSub}>YOUR FIRST TASTING AWAITS</Text>
                  </View>
                </View>
                <Headline size="md" style={{ marginTop: space.lg }}>Your journal is empty.</Headline>
                <BodyText muted size="sm" style={{ marginTop: space.xs, maxWidth: 280 }}>
                  Scan a bottle or browse the catalogue to log your first tasting. Every note sharpens your palate profile and match scores.
                </BodyText>
                <View style={{ flexDirection: 'row', gap: space.md, marginTop: space.lg }}>
                  <Button variant="primary" onPress={() => Linking.openURL('/Scan')}>SCAN A BOTTLE</Button>
                  <Button variant="outline" onPress={() => Linking.openURL('/Discover')}>BROWSE</Button>
                </View>
              </View>
            ) : (
              notes.map((t) => {
                const wine = wineForNote(t);
                const tCol = wine ? wineTypeColor(wine.type) : color.gold;
                const img = wine ? wineImage(wine.id, wine.type) : null;
                return (
                  <SurfaceCard
                    key={t.id}
                    surface="calm"
                    wineType={wine?.type}
                    typeDot
                    style={{ marginVertical: space.xs, padding: space.md }}
                  >
                    <View style={styles.journalHeader}>
                      {/* Bottle thumbnail — brings the cellar to life */}
                      {img && (
                        <View style={styles.journalThumbWrap}>
                          <Image source={{ uri: img.url }} style={styles.journalThumb} resizeMode="contain" />
                        </View>
                      )}
                      <View style={{ flex: 1 }}>
                        <Pressable hitSlop={8} onPress={() => {
                          const e = MOCK_ESTATES.find((es) => es.id === wine?.estateId);
                          if (e) setEstateView(e);
                        }}>
                          <Text style={styles.journalWineName} numberOfLines={1}>{wine?.name ?? 'Unknown wine'}{wine?.year ? ` '${String(wine.year).slice(2)}` : ''}</Text>
                        </Pressable>
                        {wine && (
                          <Pressable hitSlop={8} onPress={() => {
                            const e = MOCK_ESTATES.find((es) => es.id === wine.estateId);
                            if (e) setEstateView(e);
                          }}>
                            <Text style={styles.journalEstate}>{wine.estateName} · {new Date(t.tastedAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}</Text>
                          </Pressable>
                        )}
                      </View>
                      <Stars value={t.stars} size={14} />
                    </View>
                    {(t.nose?.aromas?.length || t.palate?.flavors?.length) ? (
                      <View style={styles.chipRowSmall}>
                        {[...new Set([...(t.nose?.aromas ?? []), ...(t.palate?.flavors ?? [])])].slice(0, 5).map((id, idx) => (
                          <Chip key={`d-${t.id}-${idx}`} tone="neutral">{aromaLabel(id)}</Chip>
                        ))}
                      </View>
                    ) : null}
                    <View style={styles.journalMetaRow}>
                      {wine?.type && (
                        <View style={[styles.typeBadge, { borderColor: tCol }]}>
                          <Text style={[styles.typeBadgeText, { color: tCol }]}>{wine.type.toUpperCase()}</Text>
                        </View>
                      )}
                      {t.palate?.body && (
                        <Text style={styles.journalMeta}>{t.palate.body.replace('-', ' ')} body</Text>
                      )}
                      {t.palate?.finish && (
                        <Text style={styles.journalMeta}>· {t.palate.finish.replace('-', ' ')} finish</Text>
                      )}
                    </View>
                    {t.freeText && <Text style={styles.journalNote}>{t.freeText}</Text>}
                  </SurfaceCard>
                );
              })
            )}
          </>
        )}

        <View style={{ height: space.huge }} />
      </View>
    </ScrollView>
  );
}

// Thin wrapper so Image import stays local
function EmptyHeroImage() {
  const { Image } = require('react-native');
  return (
    <Image
      source={{ uri: HERO_VINEYARD.url }}
      style={StyleSheet.absoluteFillObject}
      resizeMode="cover"
      accessible
      accessibilityLabel={HERO_VINEYARD.alt}
    />
  );
}

const styles = StyleSheet.create({
  // Stat cards — real filled warm-plum surfaces
  statRow: {
    flexDirection: 'row', gap: space.md, marginTop: space.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: color.canvasCardRaised,
    borderWidth: 1,
    borderColor: 'rgba(196,151,60,0.15)',
    borderRadius: radius.sm,
    padding: space.md,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: 'Cormorant Garamond',
    fontSize: 30,
    fontWeight: '400',
    color: color.ink,
    lineHeight: 34,
  },
  statLabel: {
    ...font.captionMonoSm,
    color: color.bodyMid,
    letterSpacing: 1.2,
    marginTop: space.xs,
  },

  // Section card — a visual container for the palate summary
  sectionCard: {
    backgroundColor: color.canvasCardRaised,
    borderWidth: 1,
    borderColor: 'rgba(196,151,60,0.12)',
    borderRadius: radius.sm,
    padding: space.lg,
    marginTop: space.md,
  },
  palateRow: {
    flexDirection: 'row', alignItems: 'baseline', gap: space.sm,
    marginTop: space.sm,
  },
  palateKey: {
    fontFamily: 'Inter', fontSize: 13, color: color.bodyMid,
  },
  palateVal: {
    fontFamily: 'Inter', fontSize: 13, color: color.ink, fontWeight: '500',
  },

  // Varietal chips — coloured by wine type
  varietalChip: {
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingVertical: space.xs,
    paddingHorizontal: space.md,
  },
  varietalChipText: {
    fontFamily: 'GeistMono', fontSize: 10, fontWeight: '400',
    letterSpacing: 1.2, lineHeight: 14,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs, marginTop: space.md },
  chipRowSmall: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs, marginTop: space.sm },

  // Journal entries — structured visual hierarchy
  journalEntry: {
    flexDirection: 'row',
    backgroundColor: color.canvasCardRaised,
    borderRadius: radius.sm,
    marginVertical: space.xs,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(196,151,60,0.10)',
  },
  journalAccent: {
    width: 3,
  },
  journalBody: {
    flex: 1,
    padding: space.md,
  },
  journalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: space.md,
  },
  journalThumbWrap: {
    width: 44,
    height: 56,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: color.hairline,
    backgroundColor: color.canvasSoft,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  journalThumb: {
    width: 36,
    height: 48,
  },
  journalWineName: {
    fontFamily: 'Cormorant Garamond', fontSize: 18, fontWeight: '400',
    color: color.gold, lineHeight: 22,
  },
  journalEstate: {
    fontFamily: 'Inter', fontSize: 12, color: color.bodyMid,
    marginTop: 2,
  },
  journalMetaRow: {
    flexDirection: 'row', alignItems: 'center', gap: space.sm,
    marginTop: space.sm, flexWrap: 'wrap',
  },
  typeBadge: {
    borderWidth: 1, borderRadius: radius.pill,
    paddingHorizontal: space.xs, paddingVertical: 1,
  },
  typeBadgeText: {
    fontFamily: 'GeistMono', fontSize: 9, fontWeight: '400', letterSpacing: 1,
  },
  journalMeta: {
    fontFamily: 'Inter', fontSize: 12, color: color.body,
  },
  journalNote: {
    fontFamily: 'Inter', fontSize: 13, color: color.body,
    lineHeight: 19, fontStyle: 'italic',
    marginTop: space.sm,
  },

  // Empty state
  emptyState: {
    marginTop: space.md,
    alignItems: 'flex-start',
  },
  emptyHero: {
    width: '100%',
    height: 180,
    borderRadius: radius.sm,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: color.hairline,
  },
  emptyHeroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8,3,10,0.65)',
  },
  emptyHeroBody: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    padding: space.lg,
  },
  emptyWordmark: {
    fontFamily: 'Cormorant Garamond',
    fontWeight: '400',
    fontSize: 28,
    letterSpacing: 5,
    color: color.gold,
    lineHeight: 32,
  },
  emptyWordmarkSub: {
    ...font.captionMonoSm,
    color: color.body,
    letterSpacing: 2.5,
    marginTop: 4,
  },
});
