/**
 * Events — SA wine festival calendar, organised around four seasonal chapters.
 *
 * The SA wine year has a distinct arc, not a flat chronological list:
 *   HARVEST (Jan–Mar) · WINTER (Apr–Aug) · SPRING BLOOM (Sep–Oct) · FESTIVE (Nov–Dec)
 *
 * The current chapter is surfaced as "IN SEASON NOW" with a full hero; the
 * remaining chapters render as collapsed summaries that expand on tap. This
 * mirrors the seasonal structure specified in docs/EVENTS_CALENDAR.md and the
 * `chapter` column added in supabase/migrations/0004_events_ingestion.sql.
 *
 * Events are tappable → EventDetailScreen. Cards carry cover photography from
 * FESTIVAL_IMAGES. Participants are tappable → EstateDetailScreen.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Pressable, Image, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Eyebrow, Headline, BodyText, Chip } from '../components/index.js';
import { LoadingList } from '../components/Skeleton.js';
import { color, font, space, radius, chapterColor } from '../theme/tokens.js';
import { SurfaceCard } from '../components/SurfaceCard.js';
import { fetchEvents, type WineEvent } from '../lib/dataAccessor.js';
import { FESTIVAL_IMAGES, CHAPTER_HEROES, type EventChapter } from '../lib/imagery.js';
import { EventDetailScreen, type FestivalEvent } from './EventDetailScreen.js';
import { MOCK_ESTATES, type MockEstate } from '../lib/mockData.js';
import { EstateDetailScreen } from './EstateDetailScreen.js';

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

/** Canonical chapter mapping — matches decanta_event_chapter(month) in migration 0004. */
function chapterFor(month: number | undefined): EventChapter {
  if (month == null) return 'winter'; // evergreen → group with the long winter window
  if (month >= 1 && month <= 3) return 'harvest';
  if (month >= 4 && month <= 8) return 'winter';
  if (month >= 9 && month <= 10) return 'spring';
  return 'festive'; // 11, 12
}

/** Real "today" month (1–12). */
function currentMonth(): number {
  return new Date().getMonth() + 1;
}

const CHAPTER_ORDER: EventChapter[] = ['harvest', 'winter', 'spring', 'festive'];

const CHAPTER_LABEL: Record<EventChapter, string> = {
  harvest: 'HARVEST',
  winter: 'WINTER FESTIVALS',
  spring: 'SPRING BLOOM',
  festive: 'FESTIVE SPARKLE',
};

const CHAPTER_SUB: Record<EventChapter, string> = {
  harvest: 'Vineyards wake. Grapes come in.',
  winter: 'Fireside tastings. The Cape at its cosiest.',
  spring: 'West Coast flowers. Pinotage on tap.',
  festive: 'MCC, Cap Classique, estate markets.',
};

export function EventsScreen() {
  const insets = useSafeAreaInsets();
  const [selectedEvent, setSelectedEvent] = useState<FestivalEvent | null>(null);
  const [estateView, setEstateView] = useState<MockEstate | null>(null);
  const [events, setEvents] = useState<WineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<EventChapter>>(new Set());

  // Fetch events from live Supabase (falls back to mock)
  useEffect(() => {
    (async () => {
      const data = await fetchEvents();
      setEvents(data);
      setLoading(false);
    })();
  }, []);

  // Group events by chapter, then sort within each chapter by month.
  const grouped = useMemo(() => {
    const map: Record<EventChapter, WineEvent[]> = { harvest: [], winter: [], spring: [], festive: [] };
    for (const ev of events) {
      map[chapterFor(ev.recurringMonth)].push(ev);
    }
    for (const ch of CHAPTER_ORDER) {
      map[ch].sort((a, b) => (a.recurringMonth ?? 13) - (b.recurringMonth ?? 13));
    }
    return map;
  }, [events]);

  const nowChapter = chapterFor(currentMonth());

  // Default-expand the current chapter on first data load (once).
  useEffect(() => {
    if (!loading && events.length > 0 && expanded.size === 0) {
      setExpanded(new Set([nowChapter]));
    }
  }, [loading, events.length, nowChapter]); // eslint-disable-line react-hooks/exhaustive-deps

  // Estate detail (opened from event participants)
  if (estateView) {
    return (
      <EstateDetailScreen
        estate={estateView}
        onBack={() => setEstateView(null)}
        onWinePress={() => setEstateView(null)}
      />
    );
  }

  // Event detail
  if (selectedEvent) {
    return (
      <EventDetailScreen
        event={selectedEvent}
        onBack={() => setSelectedEvent(null)}
        onEstatePress={(name) => {
          const e = MOCK_ESTATES.find((es) => es.name === name);
          if (e) setEstateView(e);
        }}
      />
    );
  }

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: color.canvas, paddingTop: insets.top + 60 }}>
        <LoadingList count={4} type="event" />
      </View>
    );
  }

  const toggle = (ch: EventChapter) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(ch)) next.delete(ch);
      else next.add(ch);
      return next;
    });
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: color.canvas }} contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: space.huge }}>
      <View style={{ padding: space.xl }}>
        <Eyebrow>WINE CALENDAR // WESTERN CAPE</Eyebrow>
        <Headline size="xl" style={{ marginTop: space.sm }}>Upcoming tastings & festivals.</Headline>
        <BodyText muted size="sm" style={{ marginTop: space.md, maxWidth: 320 }}>
          A guide to SA wine events, sorted by the season. Tap any event for details, participants, and tickets.
        </BodyText>
      </View>

      {CHAPTER_ORDER.map((ch) => {
        const hero = CHAPTER_HEROES[ch];
        const list = grouped[ch];
        const isNow = ch === nowChapter;
        const isOpen = expanded.has(ch);
        const count = list.length;

        // Show the chapter even when empty: the arc is part of the story.
        // But collapse entirely-empty far-future chapters to a single slim row.
        if (count === 0 && !isNow) {
          return (
            <View key={ch} style={styles.chapterEmptyRow}>
              <View style={{ flex: 1 }}>
                <Eyebrow>{CHAPTER_LABEL[ch]} · {hero.months}</Eyebrow>
                <BodyText size="sm" muted>No events scheduled. Check back soon.</BodyText>
              </View>
            </View>
          );
        }

        const chCol = chapterColor(ch);
        return (
          <View key={ch} style={[styles.chapter, isNow && styles.chapterNow, { borderColor: isNow ? chCol : color.hairline }]}>
            {/* Chapter hero banner */}
            <Pressable onPress={() => toggle(ch)} hitSlop={4}>
              <View style={styles.chapterHeroWrap}>
                <Image source={{ uri: hero.url }} style={styles.chapterHeroImg} resizeMode="cover" />
                {/* Seasonal colour-tinted overlay replaces flat dark scrim */}
                <View style={[styles.chapterHeroOverlay, { backgroundColor: 'rgba(10,4,16,0.72)' }]} />
                <View style={[styles.chapterTint, { backgroundColor: chCol, opacity: 0.18 }]} />
                {isNow && <View style={[styles.nowDot, { backgroundColor: chCol }]} />}
                <View style={styles.chapterHeroBody}>
                  <Text style={[styles.chapterMonths, { color: chCol }]}>{hero.months}</Text>
                  <Text style={styles.chapterLabel}>{CHAPTER_LABEL[ch]}</Text>
                  <Text style={styles.chapterTagline}>{hero.tagline}</Text>
                  <View style={styles.chapterMetaRow}>
                    {isNow ? (
                      <Text style={[styles.nowChip, { color: chCol }]}>● IN SEASON NOW</Text>
                    ) : null}
                    <Text style={styles.chapterCount}>{count} {count === 1 ? 'EVENT' : 'EVENTS'}</Text>
                    <Text style={styles.chevron}>{isOpen ? '▲' : '▼'}</Text>
                  </View>
                </View>
              </View>
            </Pressable>

            {/* Event list (only when expanded) */}
            {isOpen && (
              <View style={styles.chapterList}>
                {list.map((ev) => {
                  const photo = FESTIVAL_IMAGES[ev.id];
                  return (
                    <SurfaceCard
                      key={ev.id}
                      onPress={() => setSelectedEvent(ev)}
                      accent
                      accentColor={chCol}
                      style={{ marginVertical: space.xs, padding: 0 }}
                    >
                      {photo && (
                        <View style={styles.eventCoverWrap}>
                          <Image source={{ uri: photo.url }} style={styles.eventCover} resizeMode="cover" />
                          <View style={styles.eventCoverOverlay} />
                          <View style={styles.dateBlock}>
                            <Headline size="md">{ev.recurringMonth ? MONTHS[ev.recurringMonth - 1].slice(0, 3) : '?'}</Headline>
                          </View>
                        </View>
                      )}
                      <View style={styles.eventBody}>
                        <View style={{ flexDirection: 'row', gap: space.md, alignItems: 'center' }}>
                          <View style={{ flex: 1 }}>
                            <BodyText>{ev.name}</BodyText>
                            <BodyText size="sm" muted>{ev.venueName}</BodyText>
                          </View>
                          <Text style={[font.captionMonoSm, { color: color.gold }]}>TAP →</Text>
                        </View>
                        <View style={styles.chipRow}>
                          {ev.format && <Chip tone="neutral">{ev.format.replace(/-/g, ' ')}</Chip>}
                          {ev.priceMinZar ? (
                            <Chip tone="sunset">
                              R{ev.priceMinZar}{ev.priceMaxZar && ev.priceMaxZar !== ev.priceMinZar ? `–R${ev.priceMaxZar}` : ''}
                            </Chip>
                          ) : null}
                          {ev.ticketingPlatform && <Chip tone="neutral">{ev.ticketingPlatform}</Chip>}
                        </View>
                        <BodyText size="sm" muted style={{ marginTop: space.sm }} numberOfLines={2}>{ev.description}</BodyText>
                      </View>
                    </SurfaceCard>
                  );
                })}
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  chapter: {
    marginHorizontal: space.xl,
    marginVertical: space.sm,
    borderRadius: radius.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: color.hairline,
  },
  chapterNow: {
    borderColor: 'rgba(212,148,44,0.45)',
    // Subtle gold lift on the current-chapter card — the only place we brighten a border.
    shadowColor: 'rgba(212,148,44,0.10)',
    shadowOpacity: 1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
  chapterHeroWrap: {
    height: 170,
    position: 'relative',
  },
  chapterHeroImg: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
  },
  chapterHeroOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(10,4,16,0.72)',
  },
  chapterTint: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
  },
  nowDot: {
    position: 'absolute', top: space.md, right: space.md,
    width: 8, height: 8, borderRadius: 9999,
    backgroundColor: color.gold,
  },
  chapterHeroBody: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'flex-end',
    padding: space.lg,
  },
  chapterMonths: {
    ...font.captionMonoSm,
    color: color.gold,
    letterSpacing: 2,
    marginBottom: 2,
  },
  chapterLabel: {
    fontFamily: 'Cormorant Garamond, serif',
    fontWeight: '400',
    fontSize: 26,
    color: color.ink,
    lineHeight: 30,
  },
  chapterTagline: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
    color: color.body,
    marginTop: 4,
    maxWidth: 280,
  },
  chapterMetaRow: {
    flexDirection: 'row', alignItems: 'center', gap: space.md,
    marginTop: space.sm,
  },
  nowChip: {
    ...font.captionMonoSm,
    color: color.gold,
    letterSpacing: 1.5,
    fontSize: 10,
  },
  chapterCount: {
    ...font.captionMonoSm,
    color: color.bodyMid,
    letterSpacing: 1,
  },
  chevron: {
    color: color.bodyMid,
    fontSize: 9,
    marginLeft: 'auto',
  },
  chapterList: {
    backgroundColor: 'rgba(10,4,16,0.5)',
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
  chapterEmptyRow: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: space.xl, marginVertical: space.xs,
    padding: space.md,
    borderWidth: 1, borderColor: color.hairline, borderRadius: radius.sm,
  },

  // Event card (kept close to the previous design)
  eventCard: {
    backgroundColor: color.canvasCard,
    borderWidth: 1,
    borderColor: color.hairline,
    borderRadius: radius.sm,
    marginVertical: space.sm,
    overflow: 'hidden',
  },
  eventCoverWrap: { height: 140, position: 'relative' },
  eventCover: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  eventCoverOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: color.overlayMid },
  eventBody: { padding: space.md },
  dateBlock: {
    position: 'absolute', bottom: space.md, left: space.md,
    width: 48, height: 48, borderRadius: 9999, borderWidth: 1, borderColor: color.goldSoft,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(10,4,16,0.85)',
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs, marginTop: space.sm },
});
