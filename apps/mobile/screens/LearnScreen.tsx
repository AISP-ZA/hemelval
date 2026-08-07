/**
 * Learn — wine education hub.
 *
 * Two tracks:
 *   FOUNDATION — the 6-step tasting journey (sequential, progress-tracked)
 *   VARIETAL SCHOOL — signature SA grapes (standalone lessons)
 *
 * Progress is stored locally (AsyncStorage) for now; when Supabase auth + the
 * lesson_progress table (migration 0005) are live, it syncs. Demo mode works
 * with bundled content from lib/learnContent.ts.
 */

import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Pressable, Image, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Eyebrow, Headline, BodyText, Divider } from '../components/index.js';
import { color, font, space, radius } from '../theme/tokens.js';
import { GradientSurface } from '../components/GradientSurface.js';
import { SurfaceCard } from '../components/SurfaceCard.js';
import { FOUNDATION_LESSONS, VARIETAL_LESSONS, type Lesson } from '../lib/learnContent.js';
import { LessonScreen } from './LessonScreen.js';

const PROGRESS_KEY = 'decanta.lessonProgress.v1';

export function LearnScreen() {
  const insets = useSafeAreaInsets();
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [progress, setProgress] = useState<Record<string, 'started' | 'completed'>>({});

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(PROGRESS_KEY);
        if (raw) setProgress(JSON.parse(raw));
      } catch { /* empty progress is fine */ }
    })();
  }, []);

  const saveProgress = (id: string, status: 'started' | 'completed') => {
    setProgress((prev) => {
      const next = { ...prev, [id]: status };
      AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  };

  // Lesson detail view
  if (activeLesson) {
    return (
      <LessonScreen
        lesson={activeLesson}
        currentStatus={progress[activeLesson.id]}
        onBack={() => setActiveLesson(null)}
        onComplete={() => saveProgress(activeLesson.id, 'completed')}
        onStart={() => saveProgress(activeLesson.id, 'started')}
      />
    );
  }

  const completedCount = Object.values(progress).filter((s) => s === 'completed').length;
  const foundationTotal = FOUNDATION_LESSONS.length;
  const foundationCompleted = FOUNDATION_LESSONS.filter((l) => progress[l.id] === 'completed').length;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: color.canvas }}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: space.huge }}
    >
      <GradientSurface style={{ paddingBottom: space.md }}>
        <View style={{ padding: space.xl }}>
          <Eyebrow>DECANTA ACADEMY</Eyebrow>
          <Headline size="xl" style={{ marginTop: space.sm }}>Learn to taste.</Headline>
          <BodyText muted size="sm" style={{ marginTop: space.md, maxWidth: 320 }}>
            Six foundation lessons. Three signature grapes. The vocabulary and structure to taste like a pro — built on the WSET method and the Noble Aroma Wheel.
          </BodyText>
        </View>
      </GradientSurface>

      {/* Journey tracker */}
      <View style={{ paddingHorizontal: space.xl }}>
        <View style={styles.journeyCard}>
          <View style={styles.journeyHeader}>
            <Eyebrow>YOUR JOURNEY</Eyebrow>
            <Text style={styles.journeyCount}>{foundationCompleted} / {foundationTotal}</Text>
          </View>
          {/* Dotted progress line */}
          <View style={styles.journeyLine}>
            {FOUNDATION_LESSONS.map((l, i) => {
              const status = progress[l.id];
              const done = status === 'completed';
              const started = status === 'started';
              return (
                <React.Fragment key={l.id}>
                  <View style={[styles.journeyDot, done && styles.journeyDotDone, started && !done && styles.journeyDotActive]} />
                  {i < FOUNDATION_LESSONS.length - 1 && (
                    <View style={[styles.journeyConnector, done && styles.journeyConnectorDone]} />
                  )}
                </React.Fragment>
              );
            })}
          </View>
          <BodyText size="sm" muted style={{ marginTop: space.sm }}>
            {foundationCompleted === 0
              ? 'Start with "How to Taste Like a Pro" — 8 minutes.'
              : foundationCompleted === foundationTotal
                ? 'Journey complete. You\'re tasting like a pro.'
                : `${foundationCompleted} down, ${foundationTotal - foundationCompleted} to go. Keep going.`}
          </BodyText>
        </View>
      </View>

      {/* Foundation track */}
      <View style={{ paddingHorizontal: space.xl, marginTop: space.xl }}>
        <Eyebrow>FOUNDATION // 6 LESSONS</Eyebrow>
        {FOUNDATION_LESSONS.map((lesson, i) => {
          const status = progress[lesson.id];
          const isNext = i === FOUNDATION_LESSONS.findIndex((l) => !progress[l.id]);
          return (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              status={status}
              isNext={isNext}
              onPress={() => setActiveLesson(lesson)}
            />
          );
        })}
      </View>

      {/* Varietal school */}
      <View style={{ paddingHorizontal: space.xl, marginTop: space.xl }}>
        <Divider style={{ marginBottom: space.lg }} />
        <Eyebrow>VARIETAL SCHOOL // SIGNATURE SA GRAPES</Eyebrow>
        <View style={styles.varietalGrid}>
          {VARIETAL_LESSONS.map((lesson) => {
            const status = progress[lesson.id];
            return (
              <Pressable
                key={lesson.id}
                hitSlop={4}
                onPress={() => setActiveLesson(lesson)}
                style={styles.varietalCard}
              >
                <View style={styles.varietalCoverWrap}>
                  <Image source={{ uri: lesson.coverUrl }} style={styles.varietalCover} resizeMode="cover" />
                  <View style={styles.varietalCoverOverlay} />
                  {status === 'completed' && <View style={styles.varietalDone}><Text style={styles.varietalDoneText}>✓</Text></View>}
                  <View style={styles.varietalBody}>
                    <Text style={styles.varietalTitle}>{lesson.title.split('—')[0].trim()}</Text>
                  </View>
                </View>
                <BodyText size="sm" muted style={{ marginTop: space.xs }}>{lesson.durationMin} MIN</BodyText>
              </Pressable>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

// ── Lesson card (foundation track) ──────────────────────────────────────────

function LessonCard({
  lesson, status, isNext, onPress,
}: {
  lesson: Lesson;
  status: 'started' | 'completed' | undefined;
  isNext: boolean;
  onPress: () => void;
}) {
  const done = status === 'completed';
  return (
    <SurfaceCard
      onPress={onPress}
      accentColor={isNext ? color.gold : undefined}
      accent={isNext}
      style={{ marginVertical: space.xs, padding: 0, flexDirection: 'row' }}
    >
      <View style={styles.lessonCardCover}>
        <Image source={{ uri: lesson.coverUrl }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
        <View style={styles.lessonCoverOverlay} />
        <View style={styles.lessonNumBadge}>
          <Text style={styles.lessonNumText}>{String(lesson.position).padStart(2, '0')}</Text>
        </View>
        {done && (
          <View style={styles.lessonDoneBadge}>
            <Text style={styles.lessonDoneText}>✓ DONE</Text>
          </View>
        )}
      </View>
      <View style={styles.lessonCardBody}>
        <Text style={styles.lessonCardTitle}>{lesson.title}</Text>
        <BodyText size="sm" muted style={{ marginTop: space.xs }}>{lesson.subtitle}</BodyText>
        <View style={styles.lessonCardMeta}>
          <Text style={styles.lessonCardDuration}>{lesson.durationMin} MIN</Text>
          {isNext && !done && <Text style={styles.lessonCardNextLabel}>● START HERE</Text>}
          {status === 'started' && !done && <Text style={styles.lessonCardResume}>↻ RESUME</Text>}
        </View>
      </View>
    </SurfaceCard>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  journeyCard: {
    borderWidth: 1,
    borderColor: color.hairline,
    borderRadius: radius.sm,
    padding: space.lg,
    backgroundColor: 'rgba(212,148,44,0.04)',
  },
  journeyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  journeyCount: {
    fontFamily: 'CormorantGaramond',
    fontSize: 22,
    color: color.gold,
  },
  journeyLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: space.md,
  },
  journeyDot: {
    width: 12, height: 12, borderRadius: 9999,
    borderWidth: 1.5, borderColor: color.bodyMid,
    backgroundColor: color.canvas,
  },
  journeyDotActive: {
    borderColor: color.gold,
    backgroundColor: color.canvas,
  },
  journeyDotDone: {
    borderColor: color.gold,
    backgroundColor: color.gold,
  },
  journeyConnector: {
    flex: 1, height: 1.5,
    backgroundColor: color.hairline,
    marginHorizontal: 2,
  },
  journeyConnectorDone: {
    backgroundColor: color.gold,
  },

  // Foundation lesson card
  lessonCard: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: color.hairline,
    borderRadius: radius.sm,
    marginVertical: space.sm,
    overflow: 'hidden',
    backgroundColor: color.canvasCard,
  },
  lessonCardNext: {
    borderColor: 'rgba(212,148,44,0.45)',
  },
  lessonCardCover: {
    width: 88, position: 'relative',
  },
  lessonCoverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10,4,16,0.5)',
  },
  lessonNumBadge: {
    position: 'absolute', top: space.xs, left: space.xs,
    backgroundColor: 'rgba(10,4,16,0.85)',
    borderRadius: radius.pill,
    paddingHorizontal: space.xs,
    paddingVertical: 2,
  },
  lessonNumText: {
    ...font.captionMonoSm,
    color: color.gold,
    letterSpacing: 1,
  },
  lessonDoneBadge: {
    position: 'absolute', bottom: space.xs, right: space.xs,
    backgroundColor: color.gold,
    borderRadius: radius.pill,
    paddingHorizontal: space.xs,
    paddingVertical: 2,
  },
  lessonDoneText: {
    ...font.captionMonoSm,
    color: color.canvas,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  lessonCardBody: {
    flex: 1, padding: space.md,
  },
  lessonCardTitle: {
    fontFamily: 'CormorantGaramond',
    fontSize: 18,
    fontWeight: '400',
    color: color.ink,
    lineHeight: 22,
  },
  lessonCardMeta: {
    flexDirection: 'row', gap: space.md,
    marginTop: space.sm,
    alignItems: 'center',
  },
  lessonCardDuration: {
    ...font.captionMonoSm,
    color: color.bodyMid,
    letterSpacing: 1,
  },
  lessonCardNextLabel: {
    ...font.captionMonoSm,
    color: color.gold,
    letterSpacing: 1,
  },
  lessonCardResume: {
    ...font.captionMonoSm,
    color: color.body,
    letterSpacing: 1,
  },

  // Varietal school
  varietalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.md,
    marginTop: space.md,
  },
  varietalCard: {
    flexBasis: '47%',
    flexGrow: 1,
  },
  varietalCoverWrap: {
    height: 110,
    borderRadius: radius.sm,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: color.hairline,
  },
  varietalCover: {
    ...StyleSheet.absoluteFillObject,
  },
  varietalCoverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10,4,16,0.55)',
  },
  varietalDone: {
    position: 'absolute', top: space.xs, right: space.xs,
    width: 20, height: 20, borderRadius: 9999,
    backgroundColor: color.gold,
    justifyContent: 'center', alignItems: 'center',
  },
  varietalDoneText: {
    color: color.canvas, fontSize: 11, fontWeight: '700',
  },
  varietalBody: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: space.sm,
  },
  varietalTitle: {
    fontFamily: 'CormorantGaramond',
    fontSize: 18,
    color: color.ink,
    lineHeight: 20,
  },
});
