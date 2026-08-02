/**
 * EventDetailScreen — the deep-dive on a SA wine festival.
 *
 * Shows: cover photo, full description, date/venue, format, price, ticket link,
 * participating estates (where known), and what to expect. Reached by tapping
 * an event card on the Events tab.
 */

import React from 'react';
import { View, ScrollView, StyleSheet, Pressable, Linking, Text, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Eyebrow, Headline, BodyText, Card, Chip, Button, Divider } from '../components/index.js';
import { color, font, space, radius } from '../theme/tokens.js';
import { MOCK_ESTATES } from '../lib/mockData.js';
import { FESTIVAL_IMAGES } from '../lib/imagery.js';

export interface FestivalEvent {
  id: string;
  name: string;
  slug: string;
  description?: string;
  startsAt?: string;
  endsAt?: string;
  venueName?: string;
  ticketUrl?: string;
  ticketingPlatform?: string;
  priceMinZar?: number;
  priceMaxZar?: number;
  format?: string;
  recurringMonth?: number;
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const FORMAT_LABELS: Record<string, string> = {
  'grand-tasting': 'Grand walk-around tasting — many producers pouring under one roof.',
  'open-cellars': 'Open cellars — estates across a region welcome visitors over a weekend.',
  'trade-show': 'Trade-only exhibition — for buyers, media, and the wine industry.',
  'hop-between': 'Hop-between estates — a passport ticket with shuttle between farms.',
};

/** Participating estates (best-effort mapping by region/theme). */
const EVENT_PARTICIPANTS: Record<string, string[]> = {
  // Wine Town + Stellenbosch Wine Festival — the 60+ from the research
  ev1: ['Kanonkop', 'Meerlust', 'Rustenberg', 'Rust en Vrede', 'Warwick', 'Simonsig', 'Ken Forrester', 'Raats Family', 'Waterford Estate', 'Muratie', 'Delheim', 'Neethlingshof', 'Spier', 'Hartenberg', 'Overgaauw', 'Boschendal', 'Babylonstoren', 'Delaire Graff', 'Thelema', 'Tokara', 'Jordan'],
  ev6: ['Kanonkop', 'Meerlust', 'Rustenberg', 'Rust en Vrede', 'Warwick', 'Simonsig', 'Ken Forrester', 'Raats Family', 'Waterford Estate'],
  // Hemel-en-Aarde Pinot
  ev2: ['Hamilton Russell Vineyards', 'Bouchard Finlayson', 'Creation Wines', 'Newton Johnson', 'Crystallum', 'Ataraxia'],
  // Robertson Wacky Wine
  ev3: ['Graham Beck', 'De Wetshof', 'Springfield Estate', 'Van Loveren', 'Robertson Winery', 'Zandvliet'],
  // Swartland Revolution
  ev4: ['Sadie Family Wines', 'Mullineux', 'AA Badenhorst', 'Porseleinberg', 'Testalonga', 'Duncan Savage'],
  // Franschhoek Cap Classique
  ev5: ['Graham Beck', 'Boekenhoutskloof', 'Haute Cabrière', 'La Motte', 'Franschhoek Cellar'],
};

export function EventDetailScreen({
  event,
  onBack,
  onEstatePress,
}: {
  event: FestivalEvent;
  onBack: () => void;
  onEstatePress: (estateName: string) => void;
}) {
  const insets = useSafeAreaInsets();
  const photo = FESTIVAL_IMAGES[event.id];
  const participants = EVENT_PARTICIPANTS[event.id] ?? [];
  const participantEstates = participants
    .map((name) => MOCK_ESTATES.find((e) => e.name === name))
    .filter((e): e is NonNullable<typeof e> => Boolean(e));

  const monthLabel = event.recurringMonth ? MONTHS[event.recurringMonth - 1] : 'TBC';
  const dateLabel = event.startsAt && event.endsAt
    ? `${new Date(event.startsAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })} – ${new Date(event.endsAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}`
    : `${monthLabel} (annual)`;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: color.canvas }}
      contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom + 40 }}
    >
      {/* Cover photo */}
      <View style={styles.header}>
        <Pressable onPress={onBack} hitSlop={8} style={styles.backBtn}>
          <Text style={[font.captionMono, { color: color.bodyMid }]}>← BACK</Text>
        </Pressable>
        {photo && (
          <View style={styles.coverWrap}>
            <Image source={{ uri: photo.url }} style={styles.coverImg} resizeMode="cover" />
            <View style={styles.coverOverlay} />
            <View style={styles.coverContent}>
              <Text style={styles.coverMonth}>{monthLabel.toUpperCase()}</Text>
              <Text style={styles.coverName}>{event.name}</Text>
            </View>
          </View>
        )}
      </View>

      <View style={{ padding: space.xl }}>
        {/* Quick facts strip */}
        <View style={styles.factsRow}>
          <View style={styles.factCell}>
            <Eyebrow>WHEN</Eyebrow>
            <BodyText size="sm">{dateLabel}</BodyText>
          </View>
          <View style={styles.factCell}>
            <Eyebrow>WHERE</Eyebrow>
            <BodyText size="sm">{event.venueName ?? 'TBC'}</BodyText>
          </View>
        </View>

        {event.format && (
          <Card style={{ marginTop: space.lg }}>
            <Eyebrow>FORMAT</Eyebrow>
            <BodyText size="sm" style={{ marginTop: space.xs }}>
              {FORMAT_LABELS[event.format] ?? event.format}
            </BodyText>
          </Card>
        )}

        <Divider />

        {/* About */}
        <Eyebrow>ABOUT</Eyebrow>
        <BodyText style={{ marginTop: space.sm }}>{event.description}</BodyText>

        {/* Price + ticketing */}
        {(event.priceMinZar || event.ticketingPlatform) && (
          <>
            <Divider />
            <Eyebrow>TICKETS</Eyebrow>
            <View style={styles.ticketRow}>
              {event.priceMinZar ? (
                <View>
                  <BodyText size="sm" muted>From</BodyText>
                  <Text style={styles.priceText}>R{event.priceMinZar}{event.priceMaxZar && event.priceMaxZar !== event.priceMinZar ? ` – R${event.priceMaxZar}` : ''}</Text>
                </View>
              ) : (
                <BodyText size="sm" muted>Pricing TBC</BodyText>
              )}
              {event.ticketingPlatform && (
                <Chip tone="neutral">{event.ticketingPlatform.toUpperCase()}</Chip>
              )}
            </View>
            {event.ticketUrl ? (
              <Button variant="primary" style={{ marginTop: space.lg }} onPress={() => Linking.openURL(event.ticketUrl!)}>
                GET TICKETS ↗
              </Button>
            ) : (
              <BodyText size="sm" muted style={{ marginTop: space.md }}>
                Tickets typically open 2–3 months before the event via {event.ticketingPlatform ?? 'the organiser'}.
              </BodyText>
            )}
          </>
        )}

        {/* Participating estates */}
        {participantEstates.length > 0 && (
          <>
            <Divider />
            <Eyebrow>PARTICIPATING ESTATES // {participantEstates.length}+</Eyebrow>
            <BodyText size="sm" muted style={{ marginTop: space.xs }}>
              Tap any estate to explore its wines, history, and certifications.
            </BodyText>
            <View style={{ gap: space.sm, marginTop: space.md }}>
              {participantEstates.map((e) => (
                <Card key={e.id} onPress={() => onEstatePress(e.name)} style={styles.estateRow}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flex: 1 }}>
                      <BodyText>{e.name}</BodyText>
                      <BodyText size="sm" muted>{e.region}</BodyText>
                    </View>
                    {e.verified && <Chip tone="systems">✓</Chip>}
                  </View>
                </Card>
              ))}
            </View>
          </>
        )}

        {/* What to expect */}
        <Divider />
        <Eyebrow>WHAT TO EXPECT</Eyebrow>
        <View style={{ gap: space.sm, marginTop: space.md }}>
          <BodyText size="sm">🍷 Bring a designated driver — tastings are generous.</BodyText>
          <BodyText size="sm">👛 Many festivals are cashless (RFID wristband) — top up on arrival.</BodyText>
          <BodyText size="sm">🥂 A tasting glass is usually included in the ticket.</BodyText>
          <BodyText size="sm">🪪 Strictly 18+ — bring ID.</BodyText>
          <BodyText size="sm">📦 Most estates ship — order at the stall, deliver to your door.</BodyText>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: space.xl, paddingBottom: space.sm },
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: space.md,
    backgroundColor: 'rgba(8,3,10,0.72)',
    borderWidth: 1,
    borderColor: color.hairline,
    borderRadius: radius.pill,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
  coverWrap: { height: 280, borderRadius: radius.sm, overflow: 'hidden', position: 'relative' },
  coverImg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  coverOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: color.overlayMid },
  coverContent: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, padding: space.xl, justifyContent: 'flex-end' },
  coverMonth: { color: color.gold, fontSize: 12, fontFamily: 'GeistMono, monospace', letterSpacing: 1.5 },
  coverName: { color: color.ink, fontFamily: 'CormorantGaramond, Georgia, serif', fontSize: 30, fontWeight: '400', marginTop: space.xs, letterSpacing: -0.5 },
  factsRow: { flexDirection: 'row', gap: space.xl },
  factCell: { flex: 1, gap: space.xs },
  ticketRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: space.md },
  priceText: { color: color.gold, fontSize: 22, fontFamily: 'Georgia, serif', fontWeight: '600', marginTop: 2 },
  estateRow: {},
});
