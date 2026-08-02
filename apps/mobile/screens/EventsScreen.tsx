/**
 * Events — SA wine festival calendar. Events are tappable → EventDetailScreen.
 * Cards now carry cover photography from FESTIVAL_IMAGES.
 */

import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Linking, Pressable, Image, Text, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Eyebrow, Headline, BodyText, Card, Chip, Button, Divider } from '../components/index.js';
import { color, font, space, radius } from '../theme/tokens.js';
import { fetchEvents, type WineEvent } from '../lib/dataAccessor.js';
import { MOCK_EVENTS } from '../lib/mockData.js';
import { FESTIVAL_IMAGES } from '../lib/imagery.js';
import { EventDetailScreen, type FestivalEvent } from './EventDetailScreen.js';
import { MOCK_ESTATES } from '../lib/mockData.js';
import { EstateDetailScreen } from './EstateDetailScreen.js';
import type { MockEstate } from '../lib/mockData.js';

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

export function EventsScreen() {
  const insets = useSafeAreaInsets();
  const [selectedEvent, setSelectedEvent] = useState<FestivalEvent | null>(null);
  const [estateView, setEstateView] = useState<MockEstate | null>(null);
  const [events, setEvents] = useState<WineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch events from live Supabase (falls back to mock)
  useEffect(() => {
    (async () => {
      const data = await fetchEvents();
      setEvents(data);
      setLoading(false);
    })();
  }, []);

  const sorted = [...events].sort((a, b) => (a.recurringMonth ?? 0) - (b.recurringMonth ?? 0));

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

  return (
    <ScrollView style={{ flex: 1, backgroundColor: color.canvas }} contentContainerStyle={{ paddingTop: insets.top + 16 }}>
      <View style={{ padding: space.xl }}>
        <Eyebrow>WINE CALENDAR // WESTERN CAPE</Eyebrow>
        <Headline size="xl" style={{ marginTop: space.sm }}>Upcoming tastings & festivals.</Headline>
        <BodyText muted style={{ marginTop: space.md, maxWidth: 320 }}>
          A guide to SA wine events — from Wine Town Stellenbosch to the Hemel-en-Aarde Pinot Celebration. Tap any event for details, participants, and tickets.
        </BodyText>
      </View>

      <View style={{ paddingHorizontal: space.xl }}>
        {sorted.map((ev) => {
          const photo = FESTIVAL_IMAGES[ev.id];
          return (
            <Pressable key={ev.id} onPress={() => setSelectedEvent(ev)} style={styles.eventCard}>
              {photo && (
                <View style={styles.eventCoverWrap}>
                  <Image source={{ uri: photo.url }} style={styles.eventCover} resizeMode="cover" />
                  <View style={styles.eventCoverOverlay} />
                </View>
              )}
              <View style={styles.eventBody}>
                <View style={{ flexDirection: 'row', gap: space.md, alignItems: 'center' }}>
                  <View style={styles.dateBlock}>
                    <Headline size="md">{ev.recurringMonth ? MONTHS[ev.recurringMonth - 1].slice(0, 3) : '?'}</Headline>
                  </View>
                  <View style={{ flex: 1 }}>
                    <BodyText>{ev.name}</BodyText>
                    <BodyText size="sm" muted>{ev.venueName}</BodyText>
                  </View>
                  <Text style={[font.captionMonoSm, { color: color.gold }]}>TAP →</Text>
                </View>
                <View style={styles.chipRow}>
                  <Chip tone="neutral">{ev.format?.replace('-', ' ')}</Chip>
                  {ev.priceMinZar ? <Chip tone="sunset">R{ev.priceMinZar}–{ev.priceMaxZar}</Chip> : null}
                  {ev.ticketingPlatform && <Chip tone="neutral">{ev.ticketingPlatform}</Chip>}
                </View>
                <BodyText size="sm" muted style={{ marginTop: space.sm }} numberOfLines={2}>{ev.description}</BodyText>
              </View>
            </Pressable>
          );
        })}
        <View style={{ height: space.huge }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
  eventCoverOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(36,27,24,0.45)' },
  eventBody: { padding: space.md },
  dateBlock: {
    width: 52, height: 52, borderRadius: 9999, borderWidth: 1, borderColor: color.goldSoft,
    justifyContent: 'center', alignItems: 'center',
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs, marginTop: space.sm },
});
