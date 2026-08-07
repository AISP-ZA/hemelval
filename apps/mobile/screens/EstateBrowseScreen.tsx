/**
 * EstateBrowseScreen — "Wineries Near Me" + wine-route planner.
 *
 * Two views via segmented toggle:
 *   LIST — proximity-sorted estate cards with distance chips, region filter
 *   MAP  — static OSM darkmatter tile with gold pins, tap → estate detail
 *
 * Route builder: multi-select estates → proximity-ordered itinerary with
 * native maps deep-link to the first stop.
 *
 * Location from useLocation (foreground, WC fallback if denied).
 */

import React, { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Pressable, Linking, Text, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Eyebrow, Headline, BodyText, Button, Chip, Stars } from '../components/index.js';
import { SegmentedToggle } from '../components/SegmentedToggle.js';
import { color, font, space, radius } from '../theme/tokens.js';
import { MOCK_ESTATES, MOCK_WINES, type MockEstate } from '../lib/mockData.js';
import { sortByDistance, formatDistance, haversineKm } from '../lib/geo.js';
import { useLocation } from '../hooks/useLocation.js';
import { EstateDetailScreen } from './EstateDetailScreen.js';

type ViewMode = 'list' | 'map';

export function EstateBrowseScreen({ onBack }: { onBack: () => void }) {
  const insets = useSafeAreaInsets();
  const { location, permission, loading, request } = useLocation();
  const [view, setView] = useState<ViewMode>('list');
  const [regionFilter, setRegionFilter] = useState<string | null>(null);
  const [estateView, setEstateView] = useState<MockEstate | null>(null);
  const [routeMode, setRouteMode] = useState(false);
  const [routeSelection, setRouteSelection] = useState<Set<string>>(new Set());
  const [routeResult, setRouteResult] = useState<{ estate: MockEstate; distanceKm: number }[] | null>(null);

  // Proximity-sorted estates
  const sorted = useMemo(() => {
    if (!location) return [];
    return sortByDistance(MOCK_ESTATES, location.lat, location.lng);
  }, [location]);

  // Unique regions for filter
  const regions = useMemo(
    () => [...new Set(sorted.map((s) => s.estate.region))].slice(0, 12),
    [sorted],
  );

  // Filtered + limited
  const filtered = useMemo(() => {
    let list = sorted;
    if (regionFilter) list = list.filter((s) => s.estate.region === regionFilter);
    return list.slice(0, 50); // cap for scroll perf
  }, [sorted, regionFilter]);

  const nearbyCount = sorted.length;
  const maxDist = sorted.length > 0 ? sorted[sorted.length - 1].distanceKm : 0;

  // Estate detail view
  if (estateView) {
    return (
      <EstateDetailScreen
        estate={estateView}
        onBack={() => setEstateView(null)}
        onWinePress={() => setEstateView(null)}
      />
    );
  }

  // Route builder result view
  if (routeResult) {
    return (
      <RouteResultView
        stops={routeResult}
        userLat={location?.lat ?? -33.93}
        userLng={location?.lng ?? 18.86}
        onBack={() => { setRouteResult(null); setRouteSelection(new Set()); setRouteMode(false); }}
        onEstatePress={(e) => setEstateView(e)}
      />
    );
  }

  // No location yet — prompt
  if (!location) {
    return (
      <View style={[styles.root, { paddingTop: insets.top + space.xxl }]}>
        <BackBar onBack={onBack} label="WINERIES NEAR YOU" insets={insets} />
        <View style={{ padding: space.xl, alignItems: 'center', marginTop: space.huge }}>
          <Headline size="lg" style={{ textAlign: 'center' }}>Find wineries near you.</Headline>
          <BodyText muted style={{ textAlign: 'center', marginTop: space.md, maxWidth: 280 }}>
            Decanta uses your location to sort Western Cape estates by distance. We'll never track you in the background.
          </BodyText>
          <Button variant="primary" style={{ marginTop: space.xxl }} onPress={request} loading={loading}>
            ENABLE LOCATION
          </Button>
          <BodyText size="sm" muted style={{ marginTop: space.lg }}>
            {permission === 'denied' ? 'Permission denied — tap to try again.' : ''}
          </BodyText>
        </View>
      </View>
    );
  }

  // Build route from selection
  const buildRoute = () => {
    const selected = sorted.filter((s) => routeSelection.has(s.estate.id));
    if (selected.length < 2) return;
    // Greedy nearest-neighbour from user's location
    const remaining = [...selected];
    const route: { estate: MockEstate; distanceKm: number }[] = [];
    let curLat = location.lat;
    let curLng = location.lng;
    while (remaining.length > 0) {
      let nearest = 0;
      let nearestDist = Infinity;
      for (let i = 0; i < remaining.length; i++) {
        const d = haversineKm(curLat, curLng, remaining[i].estate.lat, remaining[i].estate.lng);
        if (d < nearestDist) { nearestDist = d; nearest = i; }
      }
      const [picked] = remaining.splice(nearest, 1);
      route.push(picked);
      curLat = picked.estate.lat;
      curLng = picked.estate.lng;
    }
    setRouteResult(route);
  };

  return (
    <View style={styles.root}>
      <BackBar onBack={onBack} label="WINERIES NEAR YOU" insets={insets} />

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + space.huge }}>
        <View style={{ padding: space.xl }}>
          {/* Summary */}
          <View style={styles.summaryRow}>
            <View style={{ flex: 1 }}>
              {location.isFallback ? (
                <Eyebrow>SHOWING NEAR STELLENBOSCH</Eyebrow>
              ) : (
                <Eyebrow>{nearbyCount} WINERIES · {formatDistance(maxDist)} MAX</Eyebrow>
              )}
              <BodyText size="sm" muted style={{ marginTop: space.xs }}>
                {location.isFallback
                  ? 'Location unavailable — showing the Western Cape. Enable location for distance sorting.'
                  : `Sorted by distance from your location.`}
              </BodyText>
            </View>
            {!location.isFallback && (
              <SegmentedToggle
                options={[{ value: 'list' as ViewMode, label: 'LIST' }, { value: 'map' as ViewMode, label: 'MAP' }]}
                value={view}
                onChange={setView}
              />
            )}
          </View>
        </View>

        {/* Region filter (list view only) */}
        {view === 'list' && regions.length > 0 && (
          <View style={{ paddingHorizontal: space.xl, marginBottom: space.sm }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.xs }}>
              <Pressable onPress={() => setRegionFilter(null)} hitSlop={4}>
                <Chip tone={regionFilter === null ? 'accent' : 'neutral'}>ALL</Chip>
              </Pressable>
              {regions.map((r) => (
                <Pressable key={r} onPress={() => setRegionFilter(regionFilter === r ? null : r)} hitSlop={4}>
                  <Chip tone={regionFilter === r ? 'accent' : 'neutral'}>{r}</Chip>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* List view */}
        {view === 'list' && (
          <View style={{ paddingHorizontal: space.xl }}>
            {/* Route builder toggle */}
            <View style={styles.routeBar}>
              {routeMode ? (
                <>
                  <Text style={styles.routeCount}>{routeSelection.size} selected</Text>
                  <Button variant="primary" disabled={routeSelection.size < 2} onPress={buildRoute} >
                    GENERATE ROUTE →
                  </Button>
                  <Pressable onPress={() => { setRouteMode(false); setRouteSelection(new Set()); }}>
                    <Text style={styles.routeCancel}>CANCEL</Text>
                  </Pressable>
                </>
              ) : (
                <Button variant="outline" onPress={() => setRouteMode(true)}>
                  ⊕ PLAN A WINE ROUTE
                </Button>
              )}
            </View>

            {filtered.map(({ estate, distanceKm }) => {
              const isSelected = routeSelection.has(estate.id);
              const wineCount = MOCK_WINES.filter((w) => w.estateId === estate.id).length;
              return (
                <Pressable
                  key={estate.id}
                  hitSlop={6}
                  onPress={() => {
                    if (routeMode) {
                      setRouteSelection((prev) => {
                        const next = new Set(prev);
                        if (next.has(estate.id)) next.delete(estate.id);
                        else next.add(estate.id);
                        return next;
                      });
                    } else {
                      setEstateView(estate);
                    }
                  }}
                  style={[styles.estateCard, routeMode && isSelected && styles.estateCardSelected]}
                >
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
                      {routeMode && (
                        <View style={[styles.checkBox, isSelected && styles.checkBoxChecked]}>
                          {isSelected && <Text style={styles.checkMark}>✓</Text>}
                        </View>
                      )}
                      <View style={{ flex: 1 }}>
                        <BodyText style={{ color: color.ink }}>{estate.name}</BodyText>
                        <BodyText size="sm" muted>{estate.region}</BodyText>
                      </View>
                    </View>
                    <View style={styles.estateMeta}>
                      <Chip tone="sunset">{formatDistance(distanceKm).toUpperCase()}</Chip>
                      {wineCount > 0 && <Chip tone="neutral">{wineCount} {wineCount === 1 ? 'WINE' : 'WINES'}</Chip>}
                      {estate.tastingRoom && <Chip tone="neutral">{estate.tastingRoom.split('·')[0].trim()}</Chip>}
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}

        {/* Map view */}
        {view === 'map' && !location.isFallback && (
          <View style={{ paddingHorizontal: space.xl }}>
            <MapView
              estates={filtered}
              userLat={location.lat}
              userLng={location.lng}
              onPinPress={(e) => setEstateView(e)}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ── Back bar ────────────────────────────────────────────────────────────────

function BackBar({ onBack, label, insets }: { onBack: () => void; label: string; insets: any }) {
  return (
    <View style={[styles.backBar, { marginTop: insets.top + space.sm }]}>
      <Pressable hitSlop={12} onPress={onBack}>
        <Text style={styles.backText}>← BACK</Text>
      </Pressable>
      <Text style={styles.backLabel}>{label}</Text>
      <View style={{ width: 60 }} />
    </View>
  );
}

// ── Map view (static tile + pins) ───────────────────────────────────────────

function MapView({
  estates, userLat, userLng, onPinPress,
}: {
  estates: { estate: MockEstate; distanceKm: number }[];
  userLat: number;
  userLng: number;
  onPinPress: (e: MockEstate) => void;
}) {
  // Bounding box for pin positioning
  const lats = estates.map((e) => e.estate.lat).concat(userLat);
  const lngs = estates.map((e) => e.estate.lng).concat(userLng);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
  const latRange = maxLat - minLat || 0.1;
  const lngRange = maxLng - minLng || 0.1;

  // Static tile centered on user, wide zoom
  const tileUrl = `https://staticmap.openstreetmap.de/staticmap.php?center=${((minLat + maxLat) / 2).toFixed(4)},${((minLng + maxLng) / 2).toFixed(4)}&zoom=11&size=640x440&maptype=darkmatter`;

  const positionFor = (lat: number, lng: number): { left: string; top: string } => {
    const left = ((lng - minLng) / lngRange) * 100;
    const top = (1 - (lat - minLat) / latRange) * 100;
    return { left: `${Math.max(4, Math.min(96, left))}%`, top: `${Math.max(6, Math.min(94, top))}%` };
  };

  return (
    <View>
      <View style={styles.mapWrap}>
        <Image source={{ uri: tileUrl }} style={styles.mapTile} resizeMode="cover" />
        <View style={styles.mapScrim} />

        {/* User location pin */}
        <View style={[styles.userPin, positionFor(userLat, userLng) as any]} />

        {/* Estate pins */}
        {estates.map(({ estate }) => (
          <Pressable
            key={estate.id}
            style={[styles.estatePin, positionFor(estate.lat, estate.lng) as any]}
            hitSlop={12}
            onPress={() => onPinPress(estate)}
          >
            <View style={styles.estatePinDot} />
          </Pressable>
        ))}
      </View>

      {/* Legend */}
      <View style={styles.mapLegend}>
        <View style={styles.legendRow}>
          <View style={styles.legendUser} />
          <BodyText size="sm" muted>You are here</BodyText>
        </View>
        <View style={styles.legendRow}>
          <View style={styles.legendEstate} />
          <BodyText size="sm" muted>Winery · tap for detail</BodyText>
        </View>
      </View>
    </View>
  );
}

// ── Route result view ───────────────────────────────────────────────────────

function RouteResultView({
  stops, userLat, userLng, onBack, onEstatePress,
}: {
  stops: { estate: MockEstate; distanceKm: number }[];
  userLat: number;
  userLng: number;
  onBack: () => void;
  onEstatePress: (e: MockEstate) => void;
}) {
  const insets = useSafeAreaInsets();
  // Distances between consecutive stops
  let cumDist = 0;
  const totalKm = stops.reduce((sum, s, i) => {
    if (i === 0) return haversineKm(userLat, userLng, s.estate.lat, s.estate.lng);
    return sum + haversineKm(stops[i - 1].estate.lat, stops[i - 1].estate.lng, s.estate.lat, s.estate.lng);
  }, 0);

  const openFirstInMaps = () => {
    if (stops.length === 0) return;
    const first = stops[0].estate;
    const url = `https://www.openstreetmap.org/directions?from=${userLat},${userLng}&to=${first.lat},${first.lng}`;
    Linking.openURL(url).catch(() => {});
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: color.canvas }} contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: space.huge }}>
      <View style={{ padding: space.xl }}>
        <Pressable hitSlop={12} onPress={onBack}>
          <Text style={[font.captionMono, { color: color.body }]}>← NEW ROUTE</Text>
        </Pressable>

        <Eyebrow style={{ marginTop: space.xl }}>YOUR WINE ROUTE</Eyebrow>
        <Headline size="lg" style={{ marginTop: space.sm }}>{stops.length} stops · {formatDistance(totalKm)} total</Headline>
        <BodyText muted size="sm" style={{ marginTop: space.sm, maxWidth: 300 }}>
          Proximity-optimised itinerary. Tap a stop for details, or open the first leg in your maps app.
        </BodyText>

        <Button variant="primary" style={{ marginTop: space.lg }} onPress={openFirstInMaps}>
          {`▶ START ROUTE → ${stops[0]?.estate.name.toUpperCase()}`}
        </Button>

        <View style={{ marginTop: space.xl }}>
          {stops.map(({ estate }, i) => {
            const legFromPrev = i === 0
              ? haversineKm(userLat, userLng, estate.lat, estate.lng)
              : haversineKm(stops[i - 1].estate.lat, stops[i - 1].estate.lng, estate.lat, estate.lng);
            return (
              <Pressable key={estate.id} hitSlop={6} onPress={() => onEstatePress(estate)} style={styles.routeStop}>
                <View style={styles.routeStopNum}>
                  <Text style={styles.routeStopNumText}>{i + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <BodyText style={{ color: color.gold }}>{estate.name}</BodyText>
                  <BodyText size="sm" muted>{estate.region} · {formatDistance(legFromPrev)} from {i === 0 ? 'you' : 'previous'}</BodyText>
                </View>
                <Text style={styles.routeStopArrow}>→</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.canvas },
  backBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: space.lg, paddingBottom: space.sm,
  },
  backText: { ...font.captionMono, color: color.ink },
  backLabel: { ...font.captionMonoSm, color: color.bodyMid, letterSpacing: 1.5 },

  summaryRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: space.md },

  // Route builder bar
  routeBar: {
    flexDirection: 'row', alignItems: 'center', gap: space.md,
    marginBottom: space.md, flexWrap: 'wrap',
  },
  routeCount: { ...font.captionMono, color: color.gold, letterSpacing: 1 },
  routeCancel: { ...font.captionMonoSm, color: color.bodyMid, letterSpacing: 1 },

  // Estate card
  estateCard: {
    flexDirection: 'row',
    borderWidth: 1, borderColor: color.hairline, borderRadius: radius.sm,
    padding: space.md, marginVertical: space.xs,
    backgroundColor: color.canvasCard,
    alignItems: 'center',
  },
  estateCardSelected: {
    borderColor: 'rgba(212,148,44,0.45)',
    backgroundColor: 'rgba(212,148,44,0.06)',
  },
  estateMeta: {
    flexDirection: 'row', flexWrap: 'wrap', gap: space.xs, marginTop: space.sm,
  },
  checkBox: {
    width: 22, height: 22, borderRadius: 9999,
    borderWidth: 1.5, borderColor: color.bodyMid,
    justifyContent: 'center', alignItems: 'center',
  },
  checkBoxChecked: {
    borderColor: color.gold, backgroundColor: color.gold,
  },
  checkMark: { color: color.canvas, fontSize: 12, fontWeight: '700' },

  // Map
  mapWrap: {
    height: 380, borderRadius: radius.sm, overflow: 'hidden', position: 'relative',
    borderWidth: 1, borderColor: color.hairline,
  },
  mapTile: { ...StyleSheet.absoluteFillObject },
  mapScrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(10,4,16,0.45)' },
  userPin: {
    position: 'absolute',
    width: 14, height: 14, borderRadius: 9999,
    backgroundColor: color.gold,
    borderWidth: 2, borderColor: color.canvas,
    transform: [{ translateX: -7 }, { translateY: -7 }],
    zIndex: 10,
  },
  estatePin: {
    position: 'absolute',
    width: 30, height: 30, // larger hit area
    justifyContent: 'center', alignItems: 'center',
    transform: [{ translateX: -15 }, { translateY: -15 }],
  },
  estatePinDot: {
    width: 10, height: 10, borderRadius: 9999,
    backgroundColor: color.wineBright,
    borderWidth: 1.5, borderColor: color.gold,
  },
  mapLegend: {
    flexDirection: 'row', gap: space.xl, marginTop: space.md,
    paddingHorizontal: space.sm,
  },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  legendUser: {
    width: 10, height: 10, borderRadius: 9999, backgroundColor: color.gold,
  },
  legendEstate: {
    width: 10, height: 10, borderRadius: 9999,
    backgroundColor: color.wineBright, borderWidth: 1, borderColor: color.gold,
  },

  // Route stops
  routeStop: {
    flexDirection: 'row', alignItems: 'center', gap: space.md,
    paddingVertical: space.md,
    borderBottomWidth: 1, borderBottomColor: color.hairline,
  },
  routeStopNum: {
    width: 32, height: 32, borderRadius: 9999,
    borderWidth: 1.5, borderColor: color.gold,
    justifyContent: 'center', alignItems: 'center',
  },
  routeStopNumText: {
    fontFamily: 'Cormorant Garamond', fontSize: 16, color: color.gold,
  },
  routeStopArrow: {
    color: color.bodyMid, fontSize: 18,
  },
});
