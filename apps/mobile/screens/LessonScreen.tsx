/**
 * LessonScreen — renders a single lesson's content blocks.
 *
 * Block types:
 *   heading   — serif sub-heading
 *   paragraph — body text
 *   callout   — gold-bordered info box (label + multi-line text)
 *   tip       — subtle italic tip with a ◆ marker
 *   aroma     — Noble Aroma Wheel category with descriptor chips
 *
 * Progress is saved as 'started' on open and 'completed' when the user reaches
 * the bottom CTA.
 */

import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable, Image, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Eyebrow, Headline, BodyText, Button, Chip, Divider } from '../components/index.js';
import { color, font, space, radius } from '../theme/tokens.js';
import type { Lesson, LessonBlock } from '../lib/learnContent.js';

export function LessonScreen({
  lesson, currentStatus, onBack, onComplete, onStart,
}: {
  lesson: Lesson;
  currentStatus: 'started' | 'completed' | undefined;
  onBack: () => void;
  onComplete: () => void;
  onStart: () => void;
}) {
  const insets = useSafeAreaInsets();
  const done = currentStatus === 'completed';

  // Mark as started on open (once)
  useEffect(() => {
    if (!currentStatus) onStart();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: color.canvas }}
      contentContainerStyle={{ paddingBottom: insets.bottom + space.huge }}
    >
      {/* Hero with cover + back */}
      <View style={styles.hero}>
        <Image source={{ uri: lesson.coverUrl }} style={styles.heroImg} resizeMode="cover" />
        <View style={styles.heroOverlay} />
        <Pressable
          onPress={onBack}
          hitSlop={12}
          style={[styles.backBtn, { top: Math.max(insets.top, space.md) + space.sm }]}
        >
          <Text style={styles.backText}>← BACK</Text>
        </Pressable>
        <View style={styles.heroBody}>
          <Text style={styles.heroMeta}>
            {lesson.track === 'foundation' ? `LESSON ${String(lesson.position).padStart(2, '0')}` : 'VARIETAL SCHOOL'}
            {'  ·  '}{lesson.durationMin} MIN
          </Text>
          <Text style={styles.heroTitle}>{lesson.title}</Text>
          <Text style={styles.heroSubtitle}>{lesson.subtitle}</Text>
        </View>
      </View>

      {/* Content blocks */}
      <View style={{ padding: space.xl }}>
        {lesson.content.map((block, i) => (
          <BlockRenderer key={i} block={block} />
        ))}

        <Divider style={{ marginTop: space.xl }} />

        {/* Completion CTA */}
        {done ? (
          <View style={styles.doneCard}>
            <Text style={styles.doneCheck}>✓</Text>
            <BodyText style={{ color: color.gold }}>Lesson complete</BodyText>
            <BodyText size="sm" muted>You can revisit anytime.</BodyText>
            <Button variant="outline" style={{ marginTop: space.md }} onPress={onBack}>← BACK TO LEARN</Button>
          </View>
        ) : (
          <>
            <Button variant="primary" style={{ marginTop: space.xl }} onPress={() => { onComplete(); }}>
              ✓ MARK AS COMPLETE
            </Button>
            <Button variant="outline" style={{ marginTop: space.md }} onPress={onBack}>SAVE & EXIT</Button>
          </>
        )}
      </View>
    </ScrollView>
  );
}

// ── Block renderer ──────────────────────────────────────────────────────────

function BlockRenderer({ block }: { block: LessonBlock }) {
  switch (block.type) {
    case 'heading':
      return <Headline size="sm" style={{ marginTop: space.xl, marginBottom: space.sm }}>{block.text}</Headline>;

    case 'paragraph':
      return <BodyText style={{ marginTop: space.sm, lineHeight: 24 }}>{renderParagraph(block.text)}</BodyText>;

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
            {block.items.map((item) => (
              <Chip key={item} tone="neutral">{item.replace(/-/g, ' ')}</Chip>
            ))}
          </View>
        </View>
      );

    default:
      return null;
  }
}

// Render paragraph text with \n as line breaks + bold-ish bullets.
function renderParagraph(text: string) {
  // React Native Text doesn't render \n as breaks in all cases via props,
  // but our BodyText passes children directly to <Text>, which does honour \n.
  return text;
}

// ── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  hero: {
    height: 260,
    position: 'relative',
  },
  heroImg: {
    ...StyleSheet.absoluteFillObject,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10,4,16,0.70)',
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
  heroMeta: {
    ...font.captionMonoSm,
    color: color.gold,
    letterSpacing: 1.5,
    marginBottom: space.xs,
  },
  heroTitle: {
    fontFamily: 'CormorantGaramond',
    fontWeight: '400',
    fontSize: 30,
    color: color.ink,
    lineHeight: 34,
  },
  heroSubtitle: {
    ...font.bodySm,
    color: color.body,
    marginTop: space.xs,
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
    fontSize: 14,
    lineHeight: 22,
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
    lineHeight: 20,
  },
  tipText: {
    flex: 1,
    fontFamily: 'Inter',
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 20,
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

  doneCard: {
    marginTop: space.xl,
    alignItems: 'center',
    padding: space.xl,
    borderWidth: 1,
    borderColor: 'rgba(212,148,44,0.30)',
    borderRadius: radius.sm,
    backgroundColor: 'rgba(212,148,44,0.04)',
  },
  doneCheck: {
    color: color.gold,
    fontSize: 28,
    marginBottom: space.sm,
  },
});
