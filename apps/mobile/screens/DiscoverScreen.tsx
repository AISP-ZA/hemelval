/**
 * Discover — the home screen. Hero, signature SA varietals, top wines, estates by region.
 */

import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, FlatList, Pressable, TextInput, Text, Image, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Eyebrow, Headline, BodyText, Card, Chip, Button, Stars, MatchBadge, Divider } from '../components/index.js';
import { EstateWordmark } from '../components/EstateWordmark.js';
import { TasteProfileChart, tasteProfileForVarietal } from '../components/TasteProfileChart.js';
import { LoadingList } from '../components/Skeleton.js';
import { color, font, radius, space } from '../theme/tokens.js';
import { MOCK_ESTATES, mockEstateById, type MockWine, type MockEstate } from '../lib/mockData.js';
import { fetchWines, lastDataSource, type Wine } from '../lib/dataAccessor.js';
import { VARIETALS, signatureVarietals, findWinesForFood } from '@kelder/engine';
import type { FoodMatch } from '@kelder/engine';
import { HERO_CELLAR, HERO_VINEYARD, wineImage, estateCover } from '../lib/imagery.js';
import { usePalate } from '../hooks/usePalate.js';
import { TastingNoteScreen } from './TastingNoteScreen.js';
import { EstateDetailScreen } from './EstateDetailScreen.js';

export function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [varietalFilter, setVarietalFilter] = useState<string | null>(null);
  const [foodQuery, setFoodQuery] = useState('');
  const [foodMatch, setFoodMatch] = useState<FoodMatch | null>(null);
  const [selected, setSelected] = useState<Wine | null>(null);
  const [tasting, setTasting] = useState<Wine | null>(null);
  const [estateView, setEstateView] = useState<MockEstate | null>(null);
  const { matchFor } = usePalate();
  const [wines, setWines] = useState<Wine[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState('mock');

  // Fetch wines from live Supabase (falls back to mock)
  useEffect(() => {
    (async () => {
      const data = await fetchWines();
      setWines(data);
      setLoading(false);
      setDataSource(lastDataSource);
    })();
  }, []);

  const filtered = wines.filter((w) => {
    const matchesQuery = query
      ? (w.name + ' ' + w.estateName + ' ' + w.region + ' ' + w.varietals.join(' '))
          .toLowerCase()
          .includes(query.toLowerCase())
      : true;
    const matchesVarietal = varietalFilter
      ? w.varietals.includes(varietalFilter)
      : true;
    const matchesFood = foodMatch
      ? w.varietals.some((v) => foodMatch.varietalSlugs.includes(v)) ||
        foodMatch.wineTypes.includes(w.type)
      : true;
    return matchesQuery && matchesVarietal && matchesFood;
  });

  // Estate detail (deepest navigation level — back returns to wine detail or list)
  if (estateView) {
    return (
      <EstateDetailScreen
        estate={estateView}
        onBack={() => setEstateView(null)}
        onWinePress={(wid) => {
          const w = wines.find((x) => x.id === wid);
          if (w) { setEstateView(null); setSelected(w); }
        }}
      />
    );
  }
  if (tasting) {
    return <TastingNoteScreen wine={tasting} onClose={() => { setTasting(null); setSelected(null); }} />;
  }
  if (selected) {
    return (
      <WineDetail
        wine={selected}
        matchScore={matchFor(selected)}
        onBack={() => setSelected(null)}
        onRate={() => setTasting(selected)}
        onEstatePress={() => {
          const e = mockEstateById(selected.estateId);
          if (e) setEstateView(e);
        }}
      />
    );
  }

  // Loading state — show skeletons while data fetches
  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: color.canvas, paddingTop: insets.top + 60 }}>
        <View style={{ paddingHorizontal: space.xl, paddingBottom: space.lg }}>
          <View style={{ height: 20, width: 120, borderRadius: 4, backgroundColor: color.canvasMid }} />
          <View style={{ height: 32, width: '80%', borderRadius: 4, backgroundColor: color.canvasMid, marginTop: space.sm }} />
        </View>
        <LoadingList count={6} />
      </View>
    );
  }

  const signature = ['chenin-blanc', 'pinotage', 'mcc'];
  const topRated = [...wines].filter(w => w.avgStars > 0).sort((a, b) => b.avgStars - a.avgStars).slice(0, 6);
  const regions = [...new Set(MOCK_ESTATES.map((e) => e.region))].slice(0, 8);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: color.canvas }} contentContainerStyle={{ paddingTop: insets.top }}>
      {/* Editorial hero — full-bleed photo with overlay */}
      <View style={styles.heroPhoto}>
        <Image source={{ uri: HERO_CELLAR.url }} style={styles.heroPhotoImg} resizeMode="cover" />
        <View style={styles.heroOverlay} />
        <View style={styles.heroContent}>
          <Eyebrow>YOUR CELLAR · YOUR PALATE</Eyebrow>
          <Text style={styles.heroHeadline}>Discover South African wine.</Text>
          <Text style={styles.heroSub}>Scan a bottle, rate your tasting, build your palate. The Western Cape's wines, estates, and varietals — explored.</Text>
          {dataSource === 'demo' && (
            <Text style={[font.captionMonoSm, { color: color.warn, marginTop: space.sm }]}>
              DEMO DATA — Showing curated reference wines. Live DB connecting…
            </Text>
          )}
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          placeholder="Search wines, estates, varietals…"
          placeholderTextColor={color.bodyMid}
          value={query}
          onChangeText={setQuery}
        />
      </View>

      {/* Signature SA grapes — the differentiator (grape education) */}
      <View style={styles.section}>
        <Eyebrow>SIGNATURE SA GRAPES</Eyebrow>
        <Text style={styles.sectionHeadline}>The grapes that define us.</Text>
        <BodyText muted size="sm" style={{ marginTop: space.xs }}>
          South Africa's signature varieties — tap to explore and filter wines.
        </BodyText>
        <View style={styles.chipRow}>
          {signatureVarietals().map((v) => (
            <Pressable key={v.slug} hitSlop={8} onPress={() => setVarietalFilter(varietalFilter === v.slug ? null : v.slug)}>
              <Chip tone={v.type === 'red' ? 'wine' : 'accent'}>{v.name}</Chip>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Top rated — discovery carousel */}
      {topRated.length > 0 && (
      <View style={styles.section}>
        <Eyebrow>TOP RATED // 01</Eyebrow>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={topRated}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ gap: space.md, paddingRight: space.xl }}
          renderItem={({ item }) => {
            const img = wineImage(item.id);
            return (
              <Pressable hitSlop={8} onPress={() => setSelected(item)} style={({ pressed }) => [styles.topCard, pressed && { opacity: 0.85 }]}>
                <Image source={{ uri: img.url }} style={styles.topCardImage} resizeMode="cover" />
                <View style={styles.topCardOverlay} />
                <View style={styles.topCardContent}>
                  <Text style={styles.topCardScore}>★ {item.avgStars.toFixed(1)}</Text>
                  <Text style={styles.topCardName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.topCardEstate} numberOfLines={1}>{item.estateName.toUpperCase()}</Text>
                </View>
              </Pressable>
            );
          }}
        />
      </View>
      )}

      {/* Wine list — the core browsing experience */}
      <View style={styles.section}>
        <Eyebrow>{query ? `RESULTS · ${filtered.length}` : 'ALL WINES'}</Eyebrow>
        {filtered.map((w) => {
          const img = wineImage(w.id);
          return (
            <Card key={w.id} onPress={() => setSelected(w)} style={styles.listCard}>
              <View style={{ flexDirection: 'row', gap: space.md }}>
                <Image source={{ uri: img.url }} style={styles.listThumb} resizeMode="cover" />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={[font.bodyMd, { color: color.ink, fontWeight: '500' }]} numberOfLines={1}>
                    {w.name}{w.year > 0 ? ` '${String(w.year).slice(2)}` : ''}
                  </Text>
                  <Pressable hitSlop={8} onPress={(e) => {
                    e.stopPropagation?.();
                    const est = mockEstateById(w.estateId);
                    if (est) setEstateView(est);
                  }}>
                    <Text style={[font.captionMonoSm, { color: color.gold, marginTop: 2 }]} numberOfLines={1}>
                      {w.estateName.toUpperCase()}
                    </Text>
                  </Pressable>
                  <Text style={[font.captionMonoSm, { color: color.bodyMid, marginTop: 1 }]} numberOfLines={1}>
                    {w.region}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, marginTop: space.sm }}>
                    <Stars value={w.avgStars} size={11} />
                    <MatchBadge score={matchFor(w)} />
                  </View>
                </View>
              </View>
            </Card>
          );
        })}
      </View>

      {/* Browse by varietal — deeper grape education */}
      <View style={styles.section}>
        <Eyebrow>BROWSE BY VARIETAL // {VARIETALS.length}</Eyebrow>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.sm, marginTop: space.md }}>
          {VARIETALS.map((v) => {
            const active = varietalFilter === v.slug;
            return (
              <Pressable key={v.slug} hitSlop={8} onPress={() => setVarietalFilter(active ? null : v.slug)}>
                <Chip tone={active ? (v.type === 'red' ? 'wine' : 'accent') : 'neutral'}>
                  {v.name.replace(' / Syrah', '').replace(' (Méthode Cap Classique)', '')}
                </Chip>
              </Pressable>
            );
          })}
        </ScrollView>
        {varietalFilter && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, marginTop: space.md }}>
            <BodyText size="sm" muted>Filtered by: </BodyText>
            <Chip tone={VARIETALS.find((v) => v.slug === varietalFilter)?.type === 'red' ? 'wine' : 'accent'}>
              {VARIETALS.find((v) => v.slug === varietalFilter)?.name}
            </Chip>
            <Pressable hitSlop={8} onPress={() => setVarietalFilter(null)}>
              <Text style={[font.captionMonoSm, { color: color.bodyMid, textDecorationLine: 'underline' }]}>CLEAR ✕</Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* Regions */}
      <View style={styles.section}>
        <Eyebrow>WESTERN CAPE REGIONS</Eyebrow>
        <View style={styles.chipRow}>
          {regions.map((r) => <Chip key={r} tone="neutral">{r}</Chip>)}
        </View>
      </View>

      {/* Food pairing — small section at the bottom */}
      <View style={styles.section}>
        <Eyebrow>WHAT IT PAIRS WITH</Eyebrow>
        <View style={styles.foodSearchRow}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="e.g. braai lamb, sushi, bobotie…"
            placeholderTextColor={color.bodyMid}
            value={foodQuery}
            onChangeText={setFoodQuery}
            onSubmitEditing={() => {
              if (foodQuery.trim()) {
                setFoodMatch(findWinesForFood(foodQuery));
              }
            }}
          />
          <Button variant="primary" onPress={() => { if (foodQuery.trim()) setFoodMatch(findWinesForFood(foodQuery)); }} style={{ marginLeft: space.sm }}>PAIR</Button>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.xs, marginTop: space.md }}>
          {['Braai', 'Steak', 'Sushi', 'Bobotie', 'Oysters', 'Lamb', 'Curry', 'Pizza', 'Malva pudding', 'Biltong'].map((food) => (
            <Pressable key={food} hitSlop={8} onPress={() => { setFoodQuery(food); setFoodMatch(findWinesForFood(food)); }}>
              <Chip tone={foodMatch?.tags.some((t) => t.includes(food.toLowerCase().split(' ')[0])) ? 'accent' : 'neutral'}>{food}</Chip>
            </Pressable>
          ))}
        </ScrollView>
        {foodMatch && (
          <Card style={{ marginTop: space.md, borderColor: color.gold }}>
            <Eyebrow>SOMMELIER SAYS</Eyebrow>
            <Text style={styles.sommelierText}>{foodMatch.explanation}</Text>
            {foodMatch.varietalSlugs.length > 0 && (
              <View style={styles.chipRowSmall}>
                {foodMatch.varietalSlugs.slice(0, 6).map((v) => (
                  <Chip key={v} tone={foodMatch.wineTypes[0] === 'red' ? 'wine' : 'accent'}>{v.replace(/-/g, ' ')}</Chip>
                ))}
              </View>
            )}
            <Pressable hitSlop={8} onPress={() => { setFoodMatch(null); setFoodQuery(''); }} style={{ marginTop: space.md }}>
              <Text style={[font.captionMonoSm, { color: color.bodyMid, textDecorationLine: 'underline' }]}>CLEAR PAIRING ✕</Text>
            </Pressable>
          </Card>
        )}
      </View>

      <View style={{ height: space.huge }} />
    </ScrollView>
  );
}

function typeColor(type: string): string {
  if (type === 'red') return color.redWine;
  if (type === 'white') return color.whiteWine;
  if (type === 'rose') return color.roseWine;
  if (type === 'sparkling') return color.sparkling;
  return color.canvasMid;
}

// ── Wine detail (rendered when a wine is selected) ──────────────────────────
function WineDetail({ wine, matchScore, onBack, onRate, onEstatePress }: { wine: MockWine; matchScore: number; onBack: () => void; onRate: () => void; onEstatePress: () => void }) {
  const insets = useSafeAreaInsets();
  const img = wineImage(wine.id);
  const wineTypeColor = wine.type === 'red' || wine.type === 'fortified' ? color.wine : color.gold;
  return (
    <ScrollView style={{ flex: 1, backgroundColor: color.canvas }} contentContainerStyle={{ paddingBottom: insets.bottom + space.huge }}>
      {/* Full-bleed hero: bottle photo with dark overlay, back button overlaid */}
      <View style={styles.detailHero}>
        <Image source={{ uri: img.url }} style={styles.detailHeroImg} resizeMode="cover" />
        <View style={styles.detailHeroOverlay} />
        <Pressable
          onPress={onBack}
          hitSlop={12}
          style={[styles.detailBackBtn, { top: Math.max(insets.top, space.md) + space.md }]}
        >
          <Text style={[font.captionMono, { color: color.ink }]}>← BACK</Text>
        </Pressable>
        {/* Type badge */}
        <View style={[styles.detailTypeBadge, { borderColor: wineTypeColor }]}>
          <Text style={[font.captionMonoSm, { color: wineTypeColor }]}>
            {wine.type.toUpperCase()}
          </Text>
        </View>
        {/* Name overlay at bottom of hero */}
        <View style={styles.detailHeroBottom}>
          <Eyebrow style={{ color: color.body }}>{wine.region.toUpperCase()}</Eyebrow>
          <Text style={styles.detailHeroName}>{wine.name}</Text>
          {wine.year > 0 && (
            <Text style={[font.captionMonoSm, { color: color.body, marginTop: 4 }]}>VINTAGE {wine.year}</Text>
          )}
        </View>
      </View>

      <View style={{ padding: space.xl }}>
        {/* Estate link */}
        <Pressable onPress={onEstatePress} hitSlop={8}>
          <EstateWordmark estateId={wine.estateId} name={wine.estateName} size="sm" />
        </Pressable>

        {/* Varietal chips */}
        <View style={styles.chipRowSmall}>
          {wine.varietals.map((v) => <Chip key={v} tone="neutral">{v.replace(/-/g, ' ')}</Chip>)}
        </View>

        {/* Rating + match row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xl, marginTop: space.lg }}>
          <Stars value={wine.avgStars} count={wine.ratingCount} size={18} />
          <MatchBadge score={matchScore} />
        </View>

        <Divider />

        <Eyebrow>ABOUT</Eyebrow>
        <BodyText style={{ marginTop: space.sm }}>{wine.about}</BodyText>

        <Divider />

        {/* Quick-stats row */}
        <View style={styles.statRow}>
          {wine.abv != null && (
            <View style={styles.statCell}>
              <Eyebrow>ABV</Eyebrow>
              <Text style={styles.statValue}>{wine.abv}%</Text>
            </View>
          )}
          {wine.year > 0 && (
            <View style={styles.statCell}>
              <Eyebrow>VINTAGE</Eyebrow>
              <Text style={styles.statValue}>{wine.year}</Text>
            </View>
          )}
          {wine.priceZar != null && (
            <View style={styles.statCell}>
              <Eyebrow>EST. PRICE</Eyebrow>
              <Text style={styles.statValue}>R{wine.priceZar}</Text>
            </View>
          )}
        </View>

        {wine.serving ? (
          <>
            <Divider />
            <Eyebrow>SERVE AT</Eyebrow>
            <BodyText style={{ marginTop: space.xs }}>{wine.serving}</BodyText>
          </>
        ) : null}

        {wine.pairings.length > 0 && (
          <>
            <Divider />
            <Eyebrow>PAIRS WITH</Eyebrow>
            <View style={styles.chipRowSmall}>
              {wine.pairings.map((p) => <Chip key={p} tone="accent">{p.replace(/-/g, ' ')}</Chip>)}
            </View>
          </>
        )}

        <Divider />
        <TasteProfileChart
          values={tasteProfileForVarietal(wine.varietals[0], wine.type)}
          label="TASTE PROFILE // THIS WINE"
        />
        <Divider />

        <Button variant="primary" style={{ marginTop: space.md }} onPress={onRate}>★ RATE & LOG THIS WINE</Button>
        <Button variant="outline" style={{ marginTop: space.md }} onPress={onEstatePress}>VIEW ESTATE ↗</Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  hero: { paddingHorizontal: space.xl, paddingBottom: space.xl },
  heroPhoto: { height: 360, position: 'relative', justifyContent: 'flex-end' },
  heroPhotoImg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  heroOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: color.overlayStrong },
  heroContent: { padding: space.xl, paddingBottom: space.xxl },
  heroHeadline: { fontFamily: 'CormorantGaramond, Georgia, serif', fontSize: 40, fontWeight: '400', color: color.ink, letterSpacing: -1, lineHeight: 44, marginTop: space.sm },
  heroSub: { fontFamily: 'Inter, system-ui, sans-serif', fontSize: 15, color: color.body, lineHeight: 22, marginTop: space.md, maxWidth: 300 },
  searchRow: { paddingHorizontal: space.xl, paddingVertical: space.lg },
  input: {
    backgroundColor: color.canvasSoft,
    borderWidth: 1,
    borderColor: color.hairline,
    borderRadius: radius.sm,
    padding: space.md,
    color: color.ink,
    ...font.bodyMd,
  },
  section: { paddingHorizontal: space.xl, paddingVertical: space.lg },
  sectionHeadline: { fontFamily: 'CormorantGaramond, Georgia, serif', fontSize: 26, fontWeight: '400', color: color.ink, marginTop: space.xs, letterSpacing: -0.5 },
  foodSearchRow: { flexDirection: 'row', alignItems: 'center', marginTop: space.md },
  sommelierText: { fontFamily: 'CormorantGaramond, Georgia, serif', fontSize: 18, fontWeight: '400', color: color.ink, lineHeight: 26, marginTop: space.xs },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginTop: space.md },
  chipRowSmall: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs, marginTop: space.sm },

  // Top-rated carousel card
  topCard: { width: 160, borderRadius: radius.sm, overflow: 'hidden', borderWidth: 1, borderColor: color.cardBorder, backgroundColor: color.canvasCard },
  topCardImage: { width: 160, height: 200 },
  topCardOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: color.overlayMid },
  topCardContent: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: space.sm, gap: 2 },
  topCardScore: { color: color.gold, fontSize: 18, fontWeight: '600', fontFamily: 'CormorantGaramond, Georgia, serif' },
  topCardName: { color: color.ink, fontSize: 12, fontFamily: 'Inter, sans-serif', fontWeight: '500' },
  topCardEstate: { color: color.body, fontSize: 9, fontFamily: 'GeistMono, monospace', letterSpacing: 0.5 },

  listThumb: { width: 56, height: 72, borderRadius: radius.sm, borderWidth: 1, borderColor: color.hairline },
  listCard: { marginVertical: space.sm },

  // Wine detail — full-bleed hero
  detailHero: { height: 340, position: 'relative' },
  detailHeroImg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  detailHeroOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: color.overlayStrong },
  detailBackBtn: {
    position: 'absolute',
    left: space.xl,
    backgroundColor: 'rgba(8,3,10,0.72)',
    borderWidth: 1,
    borderColor: color.hairline,
    borderRadius: radius.pill,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
  detailTypeBadge: {
    position: 'absolute',
    right: space.xl,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: space.sm,
    paddingVertical: 3,
    bottom: space.lg + 60,
  },
  detailHeroBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: space.xl,
    paddingBottom: space.lg,
  },
  detailHeroName: { fontFamily: 'CormorantGaramond, Georgia, serif', fontSize: 32, fontWeight: '400', color: color.ink, letterSpacing: -0.5, lineHeight: 36, marginTop: space.xs },
  statRow: { flexDirection: 'row', gap: space.xxl, marginTop: space.sm },
  statCell: { gap: space.xs },
  statValue: { fontFamily: 'CormorantGaramond, Georgia, serif', fontSize: 22, color: color.ink, fontWeight: '400' },
});
