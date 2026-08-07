/**
 * StoryScreen — editorial story reader.
 *
 * Shares the block renderer pattern with LessonScreen, but tuned for
 * long-form narrative: larger hero, no "complete" button, and a
 * "VISIT ESTATE →" link when the story has an estateId.
 *
 * Block types (same as lessons):
 *   heading | paragraph | callout | tip | aroma
 */

import React from 'react';
import { View, ScrollView, StyleSheet, Pressable, Image, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Eyebrow, BodyText, Button, Chip, Divider } from '../components/index.js';
import { color, font, space, radius } from '../theme/tokens.js';
import { CATEGORY_LABELS, type Story } from '../lib/storyContent.js';
import { MOCK_ESTATES, type MockEstate } from '../lib/mockData.js';
import { EstateDetailScreen } from './EstateDetailScreen.js';

export function StoryScreen({
  story, onBack, onEstatePress,
}: {
  story: Story;
  onBack: () => void;
  onEstatePress?: (estate: MockEstate) => void;
}) {
  const insets = useSafeAreaInsets();
  const [estateView, setEstateView] = React.useState<MockEstate | null>(null);

  // Estate detail (opened from "VISIT ESTATE")
  if (estateView) {
    return (
      <EstateDetailScreen
        estate={estateView}
        onBack={() => setEstateView(null)}
        onWinePress={() => setEstateView(null)}
      />
    );
  }

  const linkedEstate = story.estateId ? MOCK_ESTATES.find((e) => e.id === story.estateId) : undefined;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: color.canvas }}
      contentContainerStyle={{ paddingBottom: insets.bottom + space.huge }}
    >
      {/* Hero */}
      <View style={styles.hero}>
        <Image source={{ uri: story.coverUrl }} style={styles.heroImg} resizeMode="cover" />
        <View style={styles.heroOverlay} />
        <Pressable
          onPress={onBack}
          hitSlop={12}
          style={[styles.backBtn, { top: Math.max(insets.top, space.md) + space.sm }]}
        >
          <Text style={styles.backText}>← BACK</Text>
        </Pressable>
        <View style={styles.heroBody}>
          <Text style={styles.heroCategory}>{CATEGORY_LABELS[story.category]}</Text>
          <Text style={styles.heroTitle}>{story.title}</Text>
          <Text style={styles.heroMeta}>{story.author} · {story.readMin} MIN READ</Text>
        </View>
      </View>

      {/* Dek / standfirst */}
      <View style={{ padding: space.xl, paddingBottom: 0 }}>
        <Text style={styles.dek}>{story.dek}</Text>
        <Divider style={{ marginTop: space.lg }} />
      </View>

      {/* Content blocks */}
      <View style={{ padding: space.xl, paddingTop: space.lg }}>
        {story.content.map((block, i) => (
          <BlockRenderer key={i} block={block} />
        ))}

        {/* Estate link */}
        {linkedEstate && (
          <>
            <Divider style={{ marginTop: space.xl }} />
            <View style={styles.estateLinkCard}>
              <Eyebrow>VISIT THE ESTATE</Eyebrow>
              <HeadlineSm>{linkedEstate.name}</HeadlineSm>
              <BodyText size="sm" muted>{linkedEstate.region} · Founded {linkedEstate.founded ?? '—'}</BodyText>
              <Button
                variant="primary"
                style={{ marginTop: space.md }}
                onPress={() => {
                  if (onEstatePress) onEstatePress(linkedEstate);
                  else setEstateView(linkedEstate);
                }}
              >
                VIEW ESTATE →
              </Button>
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
}

// Small headline helper (avoids importing the full Headline just for estate link)
function HeadlineSm({ children }: { children: React.ReactNode }) {
  return <Text style={styles.estateLinkTitle}>{children}</Text>;
}

// ── Block renderer (shared pattern with LessonScreen) ───────────────────────

function BlockRenderer({ block }: { block: any }) {
  switch (block.type) {
    case 'heading':
      return (
        <Text style={styles.blockHeading}>{block.text}</Text>
      );

    case 'paragraph':
      return <Text style={styles.blockParagraph}>{block.text}</Text>;

    case 'callout':
      return (
        <View style={styles.callout}>
          <Text style={styles.calloutLabel}>{block.label}</Text>
          <Text style={styles.calloutText}>{block.text}</Text>
        </View>
      );

    case 'tip':
      return (
        <View style={styles.tip}>
          <Text style={styles.tipDot}>◆</Text>
          <Text style={styles.tipText}>{block.text}</Text>
        </View>
      );

    case 'aroma':
      return (
        <View style={styles.aromaBlock}>
          <Eyebrow>{block.label.toUpperCase()}</Eyebrow>
          <View style={styles.aromaChips}>
            {block.items.map((item: string) => (
              <Chip key={item} tone="neutral">{item.replace(/-/g, ' ')}</Chip>
            ))}
          </View>
        </View>
      );

    default:
      return null;
  }
}

// ── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  hero: {
    height: 300,
    position: 'relative',
  },
  heroImg: {
    ...StyleSheet.absoluteFillObject,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10,4,16,0.72)',
  },
  backBtn: {
    position: 'absolute',
    left: space.lg,
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: color.hairline,
    backgroundColor: 'rgba(10,4,16,0.7)',
    zIndex: 5,
  },
  backText: {
    ...font.captionMono,
    color: color.ink,
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
    fontFamily: 'Cormorant Garamond',
    fontWeight: '400',
    fontSize: 30,
    color: color.ink,
    lineHeight: 34,
  },
  heroMeta: {
    ...font.captionMonoSm,
    color: color.bodyMid,
    letterSpacing: 1,
    marginTop: space.xs,
  },
  dek: {
    fontFamily: 'Inter',
    fontSize: 17,
    fontWeight: '400',
    lineHeight: 26,
    color: color.body,
    fontStyle: 'italic',
  },

  // Blocks
  blockHeading: {
    fontFamily: 'Cormorant Garamond',
    fontWeight: '400',
    fontSize: 24,
    color: color.ink,
    lineHeight: 28,
    marginTop: space.xl,
    marginBottom: space.sm,
  },
  blockParagraph: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 26,
    color: color.body,
    marginTop: space.sm,
  },
  callout: {
    borderWidth: 1,
    borderColor: 'rgba(212,148,44,0.30)',
    borderRadius: radius.sm,
    padding: space.md,
    marginTop: space.md,
    backgroundColor: 'rgba(212,148,44,0.06)',
  },
  calloutLabel: {
    ...font.captionMonoSm,
    color: color.gold,
    letterSpacing: 1.5,
    marginBottom: space.xs,
  },
  calloutText: {
    fontFamily: 'Inter',
    fontSize: 15,
    lineHeight: 23,
    color: color.ink,
  },
  tip: {
    flexDirection: 'row',
    gap: space.md,
    marginTop: space.md,
    paddingVertical: space.sm,
    borderTopWidth: 1,
    borderTopColor: color.hairline,
    borderBottomWidth: 1,
    borderBottomColor: color.hairline,
  },
  tipDot: {
    color: color.gold,
    fontSize: 9,
    lineHeight: 22,
  },
  tipText: {
    flex: 1,
    fontFamily: 'Inter',
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 22,
    color: color.body,
  },
  aromaBlock: {
    marginTop: space.md,
  },
  aromaChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.xs,
    marginTop: space.sm,
  },

  // Estate link
  estateLinkCard: {
    marginTop: space.lg,
    padding: space.lg,
    borderWidth: 1,
    borderColor: 'rgba(212,148,44,0.25)',
    borderRadius: radius.sm,
    backgroundColor: 'rgba(212,148,44,0.04)',
  },
  estateLinkTitle: {
    fontFamily: 'Cormorant Garamond',
    fontWeight: '400',
    fontSize: 22,
    color: color.ink,
    marginTop: space.xs,
    lineHeight: 26,
  },
});
