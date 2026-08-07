/**
 * Stories — editorial wine narrative feed.
 *
 * The competitive moat. No other wine app publishes winemaker profiles,
 * farm heritage, transformation stories, or "This Day in Wine History."
 *
 * Layout:
 *   - Hero feature story (full-bleed cover + title overlay)
 *   - Category sections (winemaker / transformation / heritage / history)
 *   - Horizontal story cards within each category
 *
 * Opens StoryScreen (the reader) on tap.
 */

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable, Image, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Eyebrow, Headline, BodyText } from '../components/index.js';
import { color, font, space, radius, storyTint } from '../theme/tokens.js';
import { SurfaceCard } from '../components/SurfaceCard.js';
import type { StoryCategory } from '../theme/tokens.js';
import { ALL_STORIES, CATEGORY_LABELS, CATEGORY_ORDER, type Story } from '../lib/storyContent.js';
import { StoryScreen } from './StoryScreen.js';

/** Full-saturation colour for category eyebrows (brighter than the card tint). */
function catTint(cat: StoryCategory): string {
  switch (cat) {
    case 'winemaker': return color.redWine;
    case 'heritage': return '#c4862f'; // amber
    case 'transformation': return '#7a9a6e'; // sage
    case 'history': return '#4a5a8a'; // indigo
  }
}

export function StoriesScreen({ onBack }: { onBack?: () => void }) {
  const insets = useSafeAreaInsets();
  const [activeStory, setActiveStory] = useState<Story | null>(null);

  if (activeStory) {
    return (
      <StoryScreen
        story={activeStory}
        onBack={() => setActiveStory(null)}
      />
    );
  }

  // First story is the hero feature
  const [feature, ...rest] = ALL_STORIES;

  // Group remaining by category
  const byCategory: Record<string, Story[]> = {};
  for (const s of rest) {
    if (!byCategory[s.category]) byCategory[s.category] = [];
    byCategory[s.category].push(s);
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: color.canvas }}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: space.huge }}
    >
      {/* Back (when opened as sub-view) */}
      {onBack && (
        <Pressable hitSlop={12} onPress={onBack} style={{ paddingHorizontal: space.xl, paddingBottom: space.sm }}>
          <Text style={[font.captionMono, { color: color.body }]}>← BACK</Text>
        </Pressable>
      )}

      {/* Header */}
      <View style={{ padding: space.xl, paddingBottom: space.md }}>
        <Eyebrow>STORIES // WESTERN CAPE</Eyebrow>
        <Headline size="xl" style={{ marginTop: space.sm }}>The people behind the wine.</Headline>
        <BodyText muted size="sm" style={{ marginTop: space.md, maxWidth: 320 }}>
          Winemaker profiles, farm heritage, and the stories that make South African wine unlike anywhere else.
        </BodyText>
      </View>

      {/* Hero feature story */}
      <View style={{ paddingHorizontal: space.xl }}>
        <Pressable hitSlop={4} onPress={() => setActiveStory(feature)} style={styles.heroCard}>
          <Image source={{ uri: feature.coverUrl }} style={styles.heroCover} resizeMode="cover" />
          <View style={styles.heroOverlay} />
          <View style={styles.heroBody}>
            <Text style={styles.heroCategory}>{CATEGORY_LABELS[feature.category]}</Text>
            <Text style={styles.heroTitle}>{feature.title}</Text>
            <Text style={styles.heroDek}>{feature.dek}</Text>
            <Text style={styles.heroMeta}>{feature.author} · {feature.readMin} MIN READ</Text>
          </View>
        </Pressable>
      </View>

      {/* Category sections */}
      {CATEGORY_ORDER.map((cat) => {
        const stories = byCategory[cat];
        if (!stories || stories.length === 0) return null;
        return (
          <View key={cat} style={{ marginTop: space.xl }}>
            <View style={{ paddingHorizontal: space.xl, marginBottom: space.md }}>
              <Eyebrow style={{ color: catTint(cat) }}>{CATEGORY_LABELS[cat]}</Eyebrow>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: space.xl, gap: space.md }}
            >
              {stories.map((s) => (
                <SurfaceCard
                  key={s.id}
                  onPress={() => setActiveStory(s)}
                  gradientColors={
                    s.category === 'winemaker' ? ['#3d0e18', '#260810']      // garnet (Cape Modern)
                    : s.category === 'heritage' ? ['#3a2808', '#221804']     // amber
                    : s.category === 'transformation' ? ['#16260e', '#0d1608'] // sage
                    : ['#161a34', '#0c0e1c']                                  // indigo
                  }
                  accentColor={catTint(s.category as StoryCategory)}
                  accent
                  style={{ width: 240, padding: 0 }}
                >
                  <View style={styles.storyCoverWrap}>
                    <Image source={{ uri: s.coverUrl }} style={styles.storyCover} resizeMode="cover" />
                    <View style={styles.storyCoverScrim} />
                    <View style={styles.storyCoverBody}>
                      <Text style={styles.storyReadTime}>{s.readMin} MIN</Text>
                    </View>
                  </View>
                  <View style={styles.storyCardBody}>
                    <Text style={styles.storyCardTitle}>{s.title}</Text>
                    <BodyText size="sm" muted style={{ marginTop: space.xs }} numberOfLines={2}>{s.dek}</BodyText>
                  </View>
                </SurfaceCard>
              ))}
            </ScrollView>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // Hero feature
  heroCard: {
    borderRadius: radius.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(212,148,44,0.25)',
    position: 'relative',
    height: 320,
  },
  heroCover: {
    ...StyleSheet.absoluteFillObject,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10,4,16,0.68)',
  },
  heroBody: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    padding: space.xl,
  },
  heroCategory: {
    ...font.captionMonoSm,
    color: color.gold,
    letterSpacing: 2,
    marginBottom: space.xs,
  },
  heroTitle: {
    fontFamily: 'CormorantGaramond',
    fontWeight: '400',
    fontSize: 28,
    color: color.ink,
    lineHeight: 32,
  },
  heroDek: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: color.body,
    lineHeight: 20,
    marginTop: space.xs,
    maxWidth: 280,
  },
  heroMeta: {
    ...font.captionMonoSm,
    color: color.bodyMid,
    letterSpacing: 1,
    marginTop: space.sm,
  },

  // Story card (horizontal scroll)
  storyCard: {
    width: 240,
    borderWidth: 1,
    borderColor: color.hairline,
    borderRadius: radius.sm,
    overflow: 'hidden',
    backgroundColor: color.canvasCard,
  },
  storyCoverWrap: {
    height: 130, position: 'relative',
  },
  storyCover: {
    ...StyleSheet.absoluteFillObject,
  },
  storyCoverScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10,4,16,0.45)',
  },
  storyCoverBody: {
    position: 'absolute', top: space.sm, right: space.sm,
  },
  storyReadTime: {
    ...font.captionMonoSm,
    color: color.gold,
    letterSpacing: 1,
    backgroundColor: 'rgba(10,4,16,0.8)',
    paddingHorizontal: space.xs,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  storyCardBody: {
    padding: space.md,
  },
  storyCardTitle: {
    fontFamily: 'CormorantGaramond',
    fontWeight: '400',
    fontSize: 18,
    color: color.ink,
    lineHeight: 22,
  },
});
