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
              <Pressable hitSlop={8} onPress={() => setSelected(item)} style={styles.topCard}>
                <Image source={{ uri: img.url }} style={styles.topCardImage} resizeMode="cover" />
                <View style={styles.topCardOverlay} />
                <View style={styles.topCardRating}>
                  <Text style={styles.topCardScore}>{item.avgStars.toFixed(1)}</Text>
                  <Text style={styles.topCardCount}>{item.ratingCount.toLocaleString()} ratings</Text>
                </View>
                <View style={styles.topCardText}>
                  <Text style={styles.topCardName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.topCardEstate} numberOfLines={1}>{item.estateName}</Text>
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
                <View style={{ flex: 1 }}>
                  <BodyText>{w.name} {w.year > 0 ? `'${String(w.year).slice(2)}` : ''}</BodyText>
                  <Pressable hitSlop={8} onPress={() => {
                    const e = mockEstateById(w.estateId);
                    if (e) setEstateView(e);
                  }}>
                    <BodyText size="sm" muted>
                      <Text style={{ textDecorationLine: 'underline', color: color.gold }}>{w.estateName}</Text> · {w.region}
                    </BodyText>
                  </Pressable>
                  <View style={styles.chipRowSmall}>
                    {w.varietals.slice(0, 2).map((v) => <Chip key={v} tone="neutral">{v.replace('-', ' ')}</Chip>)}
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end', gap: space.xs }}>
                  <Stars value={w.avgStars} count={w.ratingCount} size={12} />
                  <MatchBadge score={matchFor(w)} />
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
  const img = wineImage(wine.id);
  return (
    <ScrollView style={{ flex: 1, backgroundColor: color.canvas }} contentContainerStyle={{ paddingBottom: space.huge }}>
      <View style={styles.detailHero}>
        <Button variant="outline" onPress={onBack} style={styles.backBtn}>← BACK</Button>
        <Image source={{ uri: img.url }} style={styles.detailBottle} resizeMode="cover" />
      </View>
      <View style={{ padding: space.xl }}>
        <Eyebrow>{wine.region.toUpperCase()}</Eyebrow>
        <Text style={styles.detailName}>{wine.name}</Text>
        <Pressable onPress={onEstatePress} hitSlop={8} style={styles.estateLink}>
          <EstateWordmark estateId={wine.estateId} name={wine.estateName} size="sm" style={{ marginTop: space.xs }} />
        </Pressable>
        <BodyText size="sm" muted style={{ marginTop: space.xs }}>{wine.year > 0 ? `${wine.year} · ` : ''}{wine.varietals.join(' · ')}</BodyText>
        <View style={styles.chipRowSmall}>
          {wine.varietals.map((v) => <Chip key={v} tone="neutral">{v.replace('-', ' ')}</Chip>)}
        </View>
        <View style={{ marginTop: space.md }}>
          <MatchBadge score={matchScore} />
        </View>
        <Divider />
        <Stars value={wine.avgStars} count={wine.ratingCount} size={20} />
        <Divider />
        <Eyebrow>ABOUT</Eyebrow>
        <BodyText style={{ marginTop: space.sm }}>{wine.about}</BodyText>
        <Divider />
        <View style={{ flexDirection: 'row', gap: space.xl }}>
          <View><Eyebrow>ABV</Eyebrow><BodyText>{wine.abv}%</BodyText></View>
          {wine.year > 0 && <View><Eyebrow>VINTAGE</Eyebrow><BodyText>{wine.year}</BodyText></View>}
          {wine.priceZar && <View><Eyebrow>EST. PRICE</Eyebrow><BodyText>R{wine.priceZar}</BodyText></View>}
        </View>
        <Divider />
        <Eyebrow>SERVE AT</Eyebrow>
        <BodyText style={{ marginTop: space.xs }}>{wine.serving}</BodyText>
        <Divider />
        <Eyebrow>PAIRS WITH</Eyebrow>
        <View style={styles.chipRowSmall}>
          {wine.pairings.map((p) => <Chip key={p} tone="accent">{p.replace(/-/g, ' ')}</Chip>)}
        </View>
        <Divider />
        <TasteProfileChart
          values={tasteProfileForVarietal(wine.varietals[0], wine.type)}
          label="TASTE PROFILE // THIS WINE"
        />
        <Divider />
        <Button variant="primary" style={{ marginTop: space.md }} onPress={onRate}>★ RATE & LOG THIS WINE</Button>
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
  topCard: { width: 160 },
  topCardImage: { width: 160, height: 200, borderRadius: radius.sm, borderWidth: 1, borderColor: color.hairline },
  topCardOverlay: { position: 'absolute', top: 120, left: 0, right: 0, bottom: 0, backgroundColor: color.overlayStrong, borderBottomLeftRadius: radius.sm, borderBottomRightRadius: radius.sm },
  topCardRating: { position: 'absolute', top: 128, left: 0, right: 0, alignItems: 'center' },
  topCardScore: { color: color.gold, fontSize: 22, fontWeight: '600', fontFamily: 'Georgia, serif' },
  topCardCount: { color: color.bodyMid, fontSize: 9, fontFamily: 'GeistMono, monospace', letterSpacing: 0.5, marginTop: 2 },
  topCardText: { position: 'absolute', top: 168, left: space.sm, right: space.sm },
  topCardName: { color: color.ink, fontSize: 12, fontFamily: 'Inter, sans-serif', fontWeight: '500' },
  topCardEstate: { color: color.bodyMid, fontSize: 10, fontFamily: 'Inter, sans-serif', marginTop: 2 },
  listThumb: { width: 56, height: 72, borderRadius: radius.sm, borderWidth: 1, borderColor: color.hairline },
  listCard: { marginVertical: space.sm },
  detailHero: { padding: space.xl },
  backBtn: { alignSelf: 'flex-start', marginBottom: space.lg },
  detailBottle: { height: 320, borderRadius: radius.sm, borderWidth: 1, borderColor: color.hairline },
  detailName: { fontFamily: 'CormorantGaramond, Georgia, serif', fontSize: 30, fontWeight: '400', color: color.ink, letterSpacing: -0.5, lineHeight: 34, marginTop: space.xs },
  estateLink: { marginTop: space.xs },
});
