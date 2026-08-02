/**
 * EstateDetailScreen — the deep-dive on a Western Cape wine farm.
 *
 * Surfaces every explicit requirement about estates:
 *  - history ("wine farms, it's history and other interesting data")
 *  - certifications ("stamps of approvals, institutions any wine farm is
 *    registered with" — WO, IPW, WIETA, BWI, OVP, ROC)
 *  - sustainability & compliance note
 *  - awards won (locally + internationally)
 *  - wine-route membership
 *  - map (lat/long) + tasting-room hours
 *  - the estate's wines in the catalog
 */

import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Pressable, Linking, Text, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Eyebrow, Headline, BodyText, Card, Chip, Button, Stars, MatchBadge, Divider,
} from '../components/index.js';
import { EstateWordmark } from '../components/EstateWordmark.js';
import { AwardBadge, type AwardDescriptor } from '../components/AwardBadge.js';
import { QRCode } from '../components/QRCode.js';
import { color, font, space, radius } from '../theme/tokens.js';
import { CERT_INFO, type MockEstate, type MockAward } from '../lib/mockData.js';
import { fetchWinesByEstate, type Wine } from '../lib/dataAccessor.js';
import { estateCover } from '../lib/imagery.js';
import { usePalate } from '../hooks/usePalate.js';

export function EstateDetailScreen({
  estate,
  onBack,
  onWinePress,
}: {
  estate: MockEstate;
  onBack: () => void;
  onWinePress: (wineId: string) => void;
}) {
  const insets = useSafeAreaInsets();
  const { matchFor } = usePalate();
  const [estateWines, setEstateWines] = useState<Wine[]>([]);
  const cover = estateCover(estate.id);

  // Fetch this estate's wines from live Supabase (falls back to mock)
  useEffect(() => {
    (async () => {
      const wines = await fetchWinesByEstate(estate.id);
      setEstateWines(wines);
    })();
  }, [estate.id]);

  // Helper: is an award "top tier" (gets the medallion/stamp treatment)?
  const isTopAward = (a: MockAward): boolean => {
    const r = a.result.toLowerCase();
    return r.includes('5★') || r.includes('5 ★') || r.includes('double gold') ||
      r.includes('platinum') || parseInt(r) >= 95;
  };

  // Group certifications by category for the compliance section
  const certGroups = (['origin', 'sustainability', 'ethics', 'heritage'] as const).map((cat) => ({
    category: cat,
    certs: estate.certifications.filter((code) => CERT_INFO[code]?.category === cat),
  })).filter((g) => g.certs.length > 0);

  const categoryLabel: Record<string, string> = {
    origin: 'ORIGIN & INTEGRITY',
    sustainability: 'SUSTAINABILITY & ENVIRONMENT',
    ethics: 'ETHICAL TRADE & SOCIAL',
    heritage: 'HERITAGE VINEYARDS',
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: color.canvas }}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 40 }}
    >
      {/* ── Header with cover photo ── */}
      <View style={styles.header}>
        <Pressable onPress={onBack} hitSlop={8} style={styles.backBtn}>
          <Text style={[font.captionMono, { color: color.bodyMid }]}>← BACK</Text>
        </Pressable>
        <View style={styles.coverWrap}>
          <Image source={{ uri: cover.url }} style={styles.coverImg} resizeMode="cover" />
          <View style={styles.coverOverlay} />
          <View style={styles.coverContent}>
            <EstateWordmark estateId={estate.id} name={estate.name} size="lg" />
            {estate.verified && (
              <View style={{ marginTop: space.md, flexDirection: 'row', gap: space.sm }}>
                <Chip tone="systems">✓ VERIFIED ESTATE</Chip>
              </View>
            )}
            <Text style={styles.coverRegion}>
              {estate.region.toUpperCase()}{estate.founded ? ` · EST. ${estate.founded}` : ''}
            </Text>
          </View>
        </View>
      </View>

      <View style={{ padding: space.xl }}>
        {/* Wine route + map strip */}
        <View style={styles.metaStrip}>
          {estate.wineRoute && (
            <Pressable hitSlop={8} onPress={() => estate.wineRouteUrl && Linking.openURL(estate.wineRouteUrl)}>
              <View style={styles.metaCell}>
                <Eyebrow>WINE ROUTE</Eyebrow>
                <BodyText size="sm" style={{ color: color.gold }}>{estate.wineRoute}</BodyText>
              </View>
            </Pressable>
          )}
          <View style={styles.metaCell}>
            <Eyebrow>LOCATION</Eyebrow>
            <BodyText size="sm">{estate.lat.toFixed(3)}, {estate.lng.toFixed(3)}</BodyText>
          </View>
        </View>

        {/* Map placeholder — a stylised "you are here" tile */}
        <View style={styles.mapTile}>
          <View style={styles.mapGrid} />
          <View style={[styles.mapPin, { left: '50%', top: '50%' }]} />
          <Text style={[font.captionMonoSm, { color: color.bodyMid, marginTop: space.sm }]}>
            {estate.region.toUpperCase()} · WESTERN CAPE
          </Text>
        </View>

        <Divider />

        {/* ── About / Famous for ── */}
        <Eyebrow>ABOUT</Eyebrow>
        <BodyText style={{ marginTop: space.sm }}>{estate.about}</BodyText>
        <View style={styles.chipRow}>
          <Chip tone="accent">FAMOUS FOR</Chip>
        </View>
        <BodyText muted size="sm" style={{ marginTop: space.sm }}>{estate.famousFor}</BodyText>

        {/* ── History ── */}
        {estate.history && (
          <>
            <Divider />
            <Eyebrow>HISTORY // EST. {estate.founded ?? '—'}</Eyebrow>
            <BodyText style={{ marginTop: space.sm }}>{estate.history}</BodyText>
          </>
        )}

        {/* ── Awards ── */}
        {estate.awards && estate.awards.length > 0 && (
          <>
            <Divider />
            <Eyebrow>AWARDS // LOCAL & INTERNATIONAL</Eyebrow>
            {/* Top-tier badges (medallions + stamps) in a gallery row */}
            <View style={styles.awardGallery}>
              {estate.awards.filter((a) => isTopAward(a)).map((a, i) => (
                <AwardBadge key={i} award={a as AwardDescriptor} />
              ))}
            </View>
            {/* Inline list of all awards with wine context */}
            <View style={{ gap: space.sm, marginTop: space.lg }}>
              {estate.awards.map((a, i) => (
                <View key={i} style={styles.awardRow}>
                  <View style={{ flex: 1 }}>
                    <BodyText size="sm">{a.body}</BodyText>
                    {a.wine && <BodyText size="sm" muted>{a.wine}</BodyText>}
                  </View>
                  <AwardBadge award={a as AwardDescriptor} size="sm" />
                </View>
              ))}
            </View>
          </>
        )}

        {/* ── Sustainability & compliance ── */}
        <Divider />
        <Eyebrow>SUSTAINABILITY & COMPLIANCE</Eyebrow>
        {certGroups.map((group) => (
          <View key={group.category} style={{ marginTop: space.md }}>
            <BodyText size="sm" muted>{categoryLabel[group.category]}</BodyText>
            <View style={styles.certGrid}>
              {group.certs.map((code) => {
                const info = CERT_INFO[code];
                if (!info) return null;
                return (
                  <View key={code} style={styles.certCard}>
                    <View style={styles.certHead}>
                      <Text style={[font.captionMonoSm, { color: color.twilight }]}>{code}</Text>
                    </View>
                    <BodyText size="sm">{info.name}</BodyText>
                    <BodyText size="sm" muted>{info.description}</BodyText>
                  </View>
                );
              })}
            </View>
          </View>
        ))}
        {estate.sustainabilityNote && (
          <Card style={{ marginTop: space.lg }}>
            <Eyebrow>ESTATE NOTE</Eyebrow>
            <BodyText size="sm" style={{ marginTop: space.xs }}>{estate.sustainabilityNote}</BodyText>
          </Card>
        )}

        {/* ── Tasting room ── */}
        {estate.tastingRoom && (
          <>
            <Divider />
            <Eyebrow>VISIT</Eyebrow>
            <BodyText style={{ marginTop: space.sm }}>{estate.tastingRoom}</BodyText>
          </>
        )}

        {/* ── Estate's wines ── */}
        {estateWines.length > 0 && (
          <>
            <Divider />
            <Eyebrow>WINES FROM {estate.name.toUpperCase()}</Eyebrow>
            <View style={{ gap: space.sm, marginTop: space.md }}>
              {estateWines.map((w) => (
                <Card key={w.id} onPress={() => onWinePress(w.id)} style={styles.wineRow}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1 }}>
                      <BodyText>{w.name}{w.year > 0 ? ` '${String(w.year).slice(2)}` : ''}</BodyText>
                      <BodyText size="sm" muted>{w.varietals.join(' · ')}</BodyText>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: space.xs }}>
                      <Stars value={w.avgStars} count={w.ratingCount} size={12} />
                      <MatchBadge score={matchFor(w)} />
                    </View>
                  </View>
                </Card>
              ))}
            </View>
          </>
        )}

        {/* ── Save / share QR code ── */}
        <Divider />
        <Eyebrow>SAVE THIS ESTATE</Eyebrow>
        <View style={styles.qrRow}>
          <QRCode value={`https://kelder.co.za/e/${estate.slug}`} size={96} />
          <View style={{ flex: 1, gap: space.xs }}>
            <BodyText size="sm">Scan to save {estate.name} to your Decanta cellar, or share with a friend.</BodyText>
            <BodyText size="sm" muted>Encodes a real link — works with any phone camera.</BodyText>
          </View>
        </View>

        {/* ── External links ── */}
        <View style={styles.linkRow}>
          {estate.website && (
            <Button variant="outline" onPress={() => Linking.openURL(estate.website!)}>WEBSITE ↗</Button>
          )}
          {estate.wineRouteUrl && (
            <Button variant="outline" onPress={() => Linking.openURL(estate.wineRouteUrl!)}>WINE ROUTE ↗</Button>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: space.xl, paddingBottom: space.sm },
  backBtn: { alignSelf: 'flex-start', marginBottom: space.md },
  coverWrap: { height: 260, borderRadius: radius.sm, overflow: 'hidden', position: 'relative' },
  coverImg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  coverOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'color.overlayMid' },
  coverContent: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, padding: space.xl, justifyContent: 'flex-end' },
  coverRegion: { color: color.body, fontSize: 11, fontFamily: 'GeistMono, monospace', letterSpacing: 1, marginTop: space.md },
  metaStrip: { flexDirection: 'row', gap: space.xl, marginTop: space.lg },
  metaCell: { flex: 1, gap: space.xs },
  mapTile: { marginTop: space.lg, height: 160, backgroundColor: color.canvasSoft, borderWidth: 1, borderColor: color.hairline, borderRadius: radius.sm, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  mapGrid: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.3 },
  mapPin: { position: 'absolute', width: 14, height: 14, borderRadius: 9999, backgroundColor: color.gold, transform: [{ translateX: -7 }, { translateY: -7 }], borderWidth: 2, borderColor: color.canvas },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs, marginTop: space.lg },
  awardGallery: { flexDirection: 'row', flexWrap: 'wrap', gap: space.lg, marginTop: space.md, paddingBottom: space.sm },
  awardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: space.md },
  certGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginTop: space.sm },
  certCard: { backgroundColor: color.canvasCard, borderWidth: 1, borderColor: color.hairline, borderRadius: radius.sm, padding: space.md, minWidth: 140, flexBasis: '47%', flexGrow: 1 },
  certHead: { marginBottom: space.xs },
  wineRow: {},
  qrRow: { flexDirection: 'row', gap: space.lg, marginTop: space.md, alignItems: 'center' },
  linkRow: { flexDirection: 'row', gap: space.md, marginTop: space.xl },
});
