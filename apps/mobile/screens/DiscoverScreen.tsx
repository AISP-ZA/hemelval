/**
 * Discover — the home screen. Hero, signature SA varietals, top wines, estates by region.
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, StyleSheet, FlatList, Pressable, TextInput, Text, Image, ActivityIndicator, Platform, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Eyebrow, Headline, BodyText, Card, Chip, Button, Stars, MatchBadge, Divider } from '../components/index.js';
import { EstateWordmark } from '../components/EstateWordmark.js';
import { GradientSurface, GradientScrim } from '../components/GradientSurface.js';
import { SurfaceCard } from '../components/SurfaceCard.js';
import { WineShelf } from '../components/WineShelf.js';
import { WineTypeList } from '../components/WineTypeList.js';
import { TasteProfileChart, tasteProfileForVarietal } from '../components/TasteProfileChart.js';
import { LoadingList } from '../components/Skeleton.js';
import { color, font, radius, space, wineTypeColor } from '../theme/tokens.js';
import { MOCK_ESTATES, mockEstateById, type MockWine, type MockEstate } from '../lib/mockData.js';
import { fetchWines, lastDataSource, type Wine } from '../lib/dataAccessor.js';
import { signatureVarietals, findWinesForFood, resolveVarietal, aromaLabel, suggestPairings, PAIRINGS } from '@kelder/engine';
import type { FoodMatch } from '@kelder/engine';
import { HERO_CELLAR, wineImage } from '../lib/imagery.js';
import { usePalate } from '../hooks/usePalate.js';
import { TastingNoteScreen } from './TastingNoteScreen.js';
import { EstateDetailScreen } from './EstateDetailScreen.js';
import { EstateBrowseScreen } from './EstateBrowseScreen.js';
import { StoriesScreen } from './StoriesScreen.js';
import { ProfileScreen } from './ProfileScreen.js';
import { useLocation } from '../hooks/useLocation.js';
import { sortByDistance, formatDistance } from '../lib/geo.js';

// Cellar-shelf metadata — one entry per wine type that has data. The accent
// colour comes from wineTypeColor(meta.type). Order = shelf order on Discover.
const SHELF_META: ReadonlyArray<{ type: string; title: string; subtitle: string }> = [
  { type: 'red', title: 'REDS', subtitle: 'Bold, structured, age-worthy' },
  { type: 'white', title: 'WHITES', subtitle: 'From steely Chenin to rich Chardonnay' },
  { type: 'sparkling', title: 'SPARKLING', subtitle: 'Méthode Cap Classique' },
  { type: 'fortified', title: 'FORTIFIED & DESSERT', subtitle: 'Port-style, late-harvest, Noble' },
  { type: 'dessert', title: 'DESSERT', subtitle: 'Late-harvest & Noble' },
];

export function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [varietalFilter, setVarietalFilter] = useState<string | null>(null);
  const [foodQuery, setFoodQuery] = useState('');
  const [foodMatch, setFoodMatch] = useState<FoodMatch | null>(null);
  const [selected, setSelected] = useState<Wine | null>(null);
  const [tasting, setTasting] = useState<Wine | null>(null);
  const [estateView, setEstateView] = useState<MockEstate | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showEstateBrowse, setShowEstateBrowse] = useState(false);
  const [showStories, setShowStories] = useState(false);
  const [typeBrowse, setTypeBrowse] = useState<string | null>(null);
  const { location, permission, request: requestLocation } = useLocation();
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
  if (showProfile) {
    return <ProfileScreen onBack={() => setShowProfile(false)} />;
  }
  if (showStories) {
    return <StoriesScreen onBack={() => setShowStories(false)} />;
  }
  if (showEstateBrowse) {
    return <EstateBrowseScreen onBack={() => setShowEstateBrowse(false)} />;
  }
  // Wine-type "browse all" — full bounded list of one type (opened from a shelf)
  if (typeBrowse) {
    const meta = SHELF_META.find((m) => m.type === typeBrowse);
    if (meta) {
      return (
        <WineTypeList
          type={meta.type}
          title={meta.title}
          accentColor={wineTypeColor(meta.type)}
          wines={wines.filter((w) => w.type === meta.type)}
          onBack={() => setTypeBrowse(null)}
          onWinePress={(w) => setSelected(w)}
          onEstatePress={(eid) => {
            const e = mockEstateById(eid);
            if (e) setEstateView(e);
          }}
          matchFor={matchFor}
        />
      );
    }
  }
  if (tasting) {
    return <TastingNoteScreen wine={tasting} onClose={() => { setTasting(null); setSelected(null); }} />;
  }
  if (selected) {
    return (
      <WineDetail
        wine={selected}
        wines={wines}
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

  // Top-rated carousel (calm — no type colour on these cards)
  const topRated = [...wines].filter(w => w.avgStars > 0).sort((a, b) => b.avgStars - a.avgStars).slice(0, 6);

  // Group wines by type for the cellar shelves. Only types that have data appear.
  // The wine-type colour lives on the SHELF HEADER + a small card dot — never on
  // the card fill. This is the anti-christmas-tree invariant.
  const shelves = SHELF_META
    .map((m) => ({ meta: m, wines: wines.filter((w) => w.type === m.type) }))
    .filter((s) => s.wines.length > 0);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: color.canvas }} contentContainerStyle={{ paddingTop: insets.top }}>
      {/* Editorial hero — full-bleed photo with overlay */}
      <View style={styles.heroPhoto}>
        <Image source={{ uri: HERO_CELLAR.url }} style={styles.heroPhotoImg} resizeMode="cover" />
        <GradientScrim />
        {/* Profile access — gear icon top-right (Profile moved out of tab bar to make room for Learn) */}
        <Pressable
          hitSlop={12}
          onPress={() => setShowProfile(true)}
          style={[styles.profileBtn, { top: Math.max(insets.top, space.md) + space.sm }]}
          accessibilityLabel="Profile"
        >
          <Text style={styles.profileBtnText}>⊙</Text>
        </Pressable>
        <View style={styles.heroContent}>
          <Eyebrow>YOUR CELLAR · YOUR PALATE</Eyebrow>
          <Text style={styles.heroHeadline}>Discover South African wine.</Text>
          <Text style={styles.heroSub}>Scan a bottle, rate your tasting, build your palate. The Western Cape's wines, estates, and varietals — explored.</Text>
          {dataSource === 'demo' && (
            <View style={styles.curatedBadge}>
              <Text style={styles.curatedBadgeDot}>●</Text>
              <Text style={styles.curatedBadgeText}>
                CURATED COLLECTION · {wines.length} WESTERN CAPE WINES
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <Text style={styles.searchIcon}>⌕</Text>
        <TextInput
          style={styles.input}
          placeholder="Search wines, estates, varietals…"
          placeholderTextColor={color.bodyMid}
          value={query}
          onChangeText={setQuery}
        />
        {query.length > 0 && (
          <Pressable hitSlop={12} onPress={() => setQuery('')} style={styles.searchClear}>
            <Text style={styles.searchClearIcon}>✕</Text>
          </Pressable>
        )}
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

      {/* Top rated — discovery carousel (moved up; calm cards, no type colour) */}
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
            const img = wineImage(item.id, item.type);
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

      {/* ── The cellar shelves OR a flat filtered-results list ─────────────────
          When the user types a query or picks a grape, results mix types and
          colour-coding is meaningless — so we show a calm flat list. Otherwise
          we show one horizontal shelf per wine type: colour names the shelf,
          cards stay calm. Replaces the old ALL WINES vertical dump. */}
      {query.trim().length > 0 || varietalFilter ? (
        <View style={styles.section}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Eyebrow>{query ? `RESULTS · ${filtered.length}` : 'FILTERED'}</Eyebrow>
            {varietalFilter && (
              <Pressable hitSlop={8} onPress={() => setVarietalFilter(null)}>
                <Text style={[font.captionMonoSm, { color: color.bodyMid, textDecorationLine: 'underline' }]}>
                  CLEAR ✕
                </Text>
              </Pressable>
            )}
          </View>
          {filtered.length === 0 ? (
            <BodyText muted style={{ marginTop: space.md }}>
              No wines match. Try a grape, estate, or region.
            </BodyText>
          ) : (
            filtered.map((w) => (
              <CalmWineRow
                key={w.id}
                wine={w}
                matchScore={matchFor(w)}
                onPress={() => setSelected(w)}
                onEstatePress={() => {
                  const est = mockEstateById(w.estateId);
                  if (est) setEstateView(est);
                }}
              />
            ))
          )}
        </View>
      ) : (
        shelves.map(({ meta, wines: typeWines }) => (
          <WineShelf
            key={meta.type}
            title={meta.title}
            subtitle={meta.subtitle}
            accentColor={wineTypeColor(meta.type)}
            wines={typeWines}
            totalCount={typeWines.length}
            onWinePress={(w) => setSelected(w)}
            onBrowseAll={() => setTypeBrowse(meta.type)}
          />
        ))
      )}

      {/* Stories — editorial entry point */}
      <View style={styles.section}>
        <Pressable hitSlop={4} onPress={() => setShowStories(true)} style={styles.storiesEntryCard}>
          <View style={styles.storiesEntryLeft}>
            <Eyebrow style={{ color: color.gold }}>STORIES // WESTERN CAPE</Eyebrow>
            <Text style={styles.storiesEntryTitle}>The people behind the wine.</Text>
            <Text style={styles.storiesEntrySub}>Winemaker profiles, heritage & transformation stories.</Text>
            <Text style={styles.storiesEntryCta}>READ STORIES →</Text>
          </View>
          <View style={styles.storiesEntryThumb}>
            <Image source={{ uri: 'https://images.unsplash.com/photo-1585803085621-7eea6581caec?w=200&q=80' }} style={styles.storiesEntryThumbImg} resizeMode="cover" />
            <View style={styles.storiesEntryThumbScrim} />
            <Text style={styles.storiesEntryThumbLabel}>6 STORIES</Text>
          </View>
        </Pressable>
      </View>

      {/* Wineries Near You — replaces the inert Regions section */}
      <View style={styles.section}>
        <Eyebrow>WINERIES NEAR YOU</Eyebrow>
        <NearYouCard
          location={location}
          permission={permission}
          onEnableLocation={requestLocation}
          onBrowseAll={() => setShowEstateBrowse(true)}
        />
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

// ── Calm wine row — the shared card for flat filtered lists (search + varietal) ─
// Uniform warm-neutral surface + a small type-colour dot. Never a per-card tint:
// on a mixed result set, colour coding only reads as noise (anti-christmas-tree).
function CalmWineRow({ wine, matchScore, onPress, onEstatePress }: {
  wine: Wine; matchScore: number; onPress: () => void; onEstatePress: () => void;
}) {
  const img = wineImage(wine.id, wine.type);
  return (
    <SurfaceCard
      onPress={onPress}
      surface="calm"
      wineType={wine.type}
      typeDot
      style={{ marginVertical: space.xs, padding: space.md }}
    >
      <View style={{ flexDirection: 'row', gap: space.md }}>
        <View style={styles.listThumbWrap}>
          <Image source={{ uri: img.url }} style={styles.listThumb} resizeMode="contain" />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={[font.bodyMd, { color: color.ink, fontWeight: '500' }]} numberOfLines={1}>
            {wine.name}{wine.year > 0 ? ` '${String(wine.year).slice(2)}` : ''}
          </Text>
          <Pressable hitSlop={8} onPress={(e) => { e.stopPropagation?.(); onEstatePress(); }}>
            <Text style={[font.captionMonoSm, { color: color.gold, marginTop: 2 }]} numberOfLines={1}>
              {wine.estateName.toUpperCase()}
            </Text>
          </Pressable>
          <Text style={[font.captionMonoSm, { color: color.bodyMid, marginTop: 1 }]} numberOfLines={1}>
            {wine.region}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, marginTop: space.sm }}>
            <Stars value={wine.avgStars} size={11} />
            <MatchBadge score={matchScore} wineType={wine.type} />
          </View>
        </View>
      </View>
    </SurfaceCard>
  );
}

// ── Wine detail (rendered when a wine is selected) ──────────────────────────
// Immersive sensory experience: parallax hero, tasting notes, pairings, vintages.
function WineDetail({ wine, wines, matchScore, onBack, onRate, onEstatePress }: {
  wine: MockWine; wines: Wine[]; matchScore: number; onBack: () => void; onRate: () => void; onEstatePress: () => void;
}) {
  const insets = useSafeAreaInsets();
  const img = wineImage(wine.id, wine.type);
  const wineTypeColor = wine.type === 'red' || wine.type === 'fortified' ? color.redWine
    : wine.type === 'white' ? color.whiteWine
    : wine.type === 'rose' ? color.roseWine
    : wine.type === 'sparkling' ? color.sparklingWine
    : color.gold;

  // Parallax: hero image translates at 0.5× scroll rate
  const scrollY = useRef(new Animated.Value(0)).current;
  const heroTranslate = scrollY.interpolate({
    inputRange: [-340, 0, 340],
    outputRange: [170, 0, -170],
    extrapolate: 'clamp',
  });

  // Fade-in: content body fades + slides up on mount
  const contentFade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(contentFade, {
      toValue: 1,
      duration: 500,
      delay: 200,
      useNativeDriver: true,
    }).start();
  }, []);

  // ── Derive tasting notes from engine varietal data ─────────────────────
  const varietal = resolveVarietal(wine.varietals[0] ?? '');
  const noseAromas = varietal?.typicalAromas?.slice(0, 5).map((id) => aromaLabel(id)).filter(Boolean) ?? [];
  const tasteValues = tasteProfileForVarietal(wine.varietals[0] ?? '', wine.type);
  const palateDesc = [
    tasteValues.body != null && tasteValues.body > 60 ? 'full-bodied' : tasteValues.body != null && tasteValues.body < 40 ? 'light-bodied' : 'medium-bodied',
    tasteValues.tannin != null && tasteValues.tannin > 60 ? 'firm tannin' : tasteValues.tannin != null && tasteValues.tannin < 30 ? 'soft tannin' : null,
    tasteValues.acidity != null && tasteValues.acidity > 65 ? 'bright acidity' : tasteValues.acidity != null && tasteValues.acidity < 40 ? 'low acidity' : null,
    tasteValues.sweetness != null && tasteValues.sweetness > 40 ? 'off-dry' : 'dry',
  ].filter(Boolean).join(', ');
  const finishDesc = varietal?.character?.split('.').slice(-2).join('.').trim() || 'A lingering finish typical of this varietal.';

  // ── Pairings: derive if empty (live DB wines have []) ───────────────────
  const pairingTags = wine.pairings.length > 0
    ? wine.pairings
    : suggestPairings(wine.type as any, { varietalSlug: wine.varietals[0] }).slice(0, 4);
  const pairingEmoji: Record<string, string> = {
    steak: '🥩', lamb: '🍖', game: '🦌', pork: '🥓', chicken: '🍗', duck: '🦆',
    seafood: '🦐', oysters: '🦪', sushi: '🍣', 'fish-rich': '🐟', 'fish-light': '🐠',
    curry: '🍛', spicy: '🌶️', 'cheese-hard': '🧀', 'cheese-blue': '🫕', 'cheese-fresh': '🧀',
    pasta: '🍝', salad: '🥗', braai: '🔥', bobotie: '🍲', malva: '🍮', 'milk-tart': '🥧',
    'dessert-choc': '🍫', 'dessert-fruit': '🍑',
  };

  // ── Vintage comparison: other wines from same estate ────────────────────
  const otherVintages = wines
    .filter((w) => w.estateId === wine.estateId && w.id !== wine.id && w.year !== wine.year)
    .sort((a, b) => (b.year || 0) - (a.year || 0))
    .slice(0, 3);

  return (
    <Animated.ScrollView
      style={{ flex: 1, backgroundColor: color.canvas }}
      contentContainerStyle={{ paddingBottom: insets.bottom + space.huge }}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: true }
      )}
      scrollEventThrottle={16}
    >
      {/* Cinematic hero: parallax bottle photo + layered gradient scrim */}
      <View style={styles.detailHero}>
        <Animated.Image
          source={{ uri: img.url }}
          style={[styles.detailHeroImg, { transform: [{ translateY: heroTranslate }] }]}
          resizeMode="cover"
        />
        <GradientScrim />
        {/* Circular back button */}
        <Pressable
          onPress={onBack}
          hitSlop={12}
          style={[styles.detailBackBtn, { top: Math.max(insets.top, space.md) + space.md }]}
        >
          <Text style={styles.detailBackIcon}>‹</Text>
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

      {/* Content body — fades + slides up on entry */}
      <Animated.View style={{ padding: space.xl, opacity: contentFade, transform: [{ translateY: contentFade.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }] }}>
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
          <MatchBadge score={matchScore} wineType={wine.type} />
        </View>

        <Divider />

        {/* ── TASTING NOTES — derived from engine varietal data ── */}
        {(noseAromas.length > 0 || palateDesc) && (
          <>
            <Eyebrow>TASTING NOTES</Eyebrow>
            {noseAromas.length > 0 && (
              <View style={styles.tastingRow}>
                <Text style={styles.tastingLabel}>NOSE</Text>
                <Text style={styles.tastingText}>{noseAromas.join(', ')}</Text>
              </View>
            )}
            {palateDesc && (
              <View style={styles.tastingRow}>
                <Text style={styles.tastingLabel}>PALATE</Text>
                <Text style={styles.tastingText}>{palateDesc}</Text>
              </View>
            )}
            <View style={styles.tastingRow}>
              <Text style={styles.tastingLabel}>FINISH</Text>
              <Text style={styles.tastingText}>{finishDesc}</Text>
            </View>
          </>
        )}

        <Divider />

        {/* ── PAIRS WITH — icon rows ── */}
        {pairingTags.length > 0 && (
          <>
            <Eyebrow>PAIRS WITH</Eyebrow>
            <View style={{ marginTop: space.sm, gap: space.sm }}>
              {pairingTags.map((tag) => {
                const pairing = PAIRINGS[tag as keyof typeof PAIRINGS];
                const label = pairing?.label ?? tag.replace(/-/g, ' ');
                const emoji = pairingEmoji[tag] ?? '🍽️';
                return (
                  <View key={tag} style={styles.pairingRow}>
                    <View style={styles.pairingIcon}><Text style={{ fontSize: 16 }}>{emoji}</Text></View>
                    <Text style={styles.pairingText}>{label}</Text>
                  </View>
                );
              })}
            </View>
          </>
        )}

        <Divider />

        {/* ── Quick-stats row ── */}
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

        {/* ── ABOUT (full prose) ── */}
        <Divider />
        <Eyebrow>ABOUT</Eyebrow>
        <BodyText style={{ marginTop: space.sm }}>{wine.about}</BodyText>

        {/* ── VINTAGE COMPARISON ── */}
        {otherVintages.length > 0 && (
          <>
            <Divider />
            <Eyebrow>VINTAGE COMPARISON</Eyebrow>
            <View style={styles.vintageRow}>
              {wine.year > 0 && (
                <View style={[styles.vintageCard, styles.vintageCardActive]}>
                  <Text style={styles.vintageYear}>'{String(wine.year).slice(2)}</Text>
                  <Text style={styles.vintageStar}>★{wine.avgStars.toFixed(1)}</Text>
                  <Text style={styles.vintageTag}>THIS WINE</Text>
                </View>
              )}
              {otherVintages.map((v) => (
                <View key={v.id} style={styles.vintageCard}>
                  <Text style={styles.vintageYear}>{v.year > 0 ? `'${String(v.year).slice(2)}` : 'NV'}</Text>
                  <Text style={styles.vintageStar}>★{v.avgStars.toFixed(1)}</Text>
                  <Text style={styles.vintageTag}>{v.name.replace(wine.estateName, '').trim() || 'Vintage'}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        <Divider />

        {/* ── Taste profile radar ── */}
        <TasteProfileChart
          values={tasteProfileForVarietal(wine.varietals[0], wine.type)}
          label="TASTE PROFILE // THIS WINE"
        />
        <Divider />

        <Button variant="primary" style={{ marginTop: space.md }} onPress={onRate}>★ RATE & LOG THIS WINE</Button>
        <Button variant="outline" style={{ marginTop: space.md }} onPress={onEstatePress}>VIEW ESTATE ↗</Button>
      </Animated.View>
    </Animated.ScrollView>
  );
}

// ── Near You card (Discover preview) ────────────────────────────────────────

function NearYouCard({
  location, permission, onEnableLocation, onBrowseAll,
}: {
  location: { lat: number; lng: number; isFallback: boolean } | null;
  permission: string;
  onEnableLocation: () => void;
  onBrowseAll: () => void;
}) {
  if (!location) {
    return (
      <View style={styles.nearYouCard}>
        <BodyText muted style={{ marginBottom: space.md }}>
          Enable location to find Western Cape wineries near you.
        </BodyText>
        <Button variant="primary" onPress={onEnableLocation}>ENABLE LOCATION</Button>
      </View>
    );
  }

  const nearest = sortByDistance(MOCK_ESTATES, location.lat, location.lng).slice(0, 3);
  const nearbyCount = sortByDistance(MOCK_ESTATES, location.lat, location.lng).length;
  // Small static map thumbnail
  const tileUrl = `https://staticmap.openstreetmap.de/staticmap.php?center=${location.lat.toFixed(4)},${location.lng.toFixed(4)}&zoom=12&size=600x200&maptype=darkmatter`;

  return (
    <Pressable hitSlop={4} onPress={onBrowseAll} style={styles.nearYouCard}>
      <View style={styles.nearYouMapWrap}>
        <Image source={{ uri: tileUrl }} style={styles.nearYouMap} resizeMode="cover" />
        <View style={styles.nearYouMapScrim} />
        <View style={styles.nearYouUserPin} />
        {nearest.map(({ estate }) => {
          const dLat = estate.lat - location.lat;
          const dLng = estate.lng - location.lng;
          const left = Math.max(8, Math.min(92, 50 + dLng * 80));
          const top = Math.max(10, Math.min(90, 50 - dLat * 80));
          return (
            <View key={estate.id} style={[styles.nearYouEstatePin, { left: `${left}%`, top: `${top}%` }]} />
          );
        })}
      </View>
      <View style={{ padding: space.md }}>
        <Headline size="sm" style={{ color: color.gold }}>
          {nearbyCount} WINERIES NEARBY
        </Headline>
        {nearest.map(({ estate, distanceKm }) => (
          <View key={estate.id} style={styles.nearYouEstateRow}>
            <BodyText size="sm" style={{ flex: 1 }}>{estate.name}</BodyText>
            <Text style={styles.nearYouDist}>{formatDistance(distanceKm).toUpperCase()}</Text>
          </View>
        ))}
        <Text style={styles.nearYouBrowse}>BROWSE ALL WINERIES →</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hero: { paddingHorizontal: space.xl, paddingBottom: space.xl },
  heroPhoto: { height: 360, position: 'relative', justifyContent: 'flex-end' },
  heroPhotoImg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  heroOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: color.overlayStrong },
  profileBtn: {
    position: 'absolute', right: space.lg, zIndex: 10,
    width: 36, height: 36, borderRadius: 9999,
    borderWidth: 1, borderColor: 'rgba(212,148,44,0.3)',
    backgroundColor: 'rgba(10,4,16,0.6)',
    justifyContent: 'center', alignItems: 'center',
  },
  profileBtnText: {
    color: color.gold,
    fontSize: 18,
    lineHeight: 20,
  },
  heroContent: { padding: space.xl, paddingBottom: space.xxl },
  heroHeadline: { fontFamily: 'CormorantGaramond, Georgia, serif', fontSize: 40, fontWeight: '400', color: color.ink, letterSpacing: -1, lineHeight: 44, marginTop: space.sm },
  heroSub: { fontFamily: 'Inter, system-ui, sans-serif', fontSize: 15, color: color.body, lineHeight: 22, marginTop: space.md, maxWidth: 300 },
  curatedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    marginTop: space.md,
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
    backgroundColor: 'rgba(212,148,44,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(212,148,44,0.20)',
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  curatedBadgeDot: {
    color: color.gold,
    fontSize: 7,
  },
  curatedBadgeText: {
    fontFamily: 'GeistMono, monospace',
    fontSize: 9,
    fontWeight: '400',
    letterSpacing: 1.2,
    color: color.gold,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space.xl,
    paddingVertical: space.lg,
    gap: space.sm,
  },
  searchIcon: {
    position: 'absolute',
    left: space.xl + space.md,
    fontSize: 20,
    color: color.bodyMid,
    zIndex: 1,
  },
  searchClear: {
    width: 24,
    height: 24,
    borderRadius: 9999,
    backgroundColor: color.canvasMid,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchClearIcon: {
    fontSize: 10,
    color: color.bodyMid,
  },
  input: {
    flex: 1,
    backgroundColor: color.canvasSoft,
    borderWidth: 1,
    borderColor: color.hairline,
    borderRadius: radius.pill,
    padding: space.md,
    paddingLeft: space.xl + space.md,
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
  topCard: { width: 160, borderRadius: radius.sm, overflow: 'hidden', borderWidth: 1, borderColor: color.cardBorder, backgroundColor: color.canvasSoft },
  topCardImage: { width: 160, height: 200 },
  topCardOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: color.overlayMid },
  topCardContent: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: space.sm, gap: 2 },
  topCardScore: { color: color.gold, fontSize: 18, fontWeight: '600', fontFamily: 'CormorantGaramond, Georgia, serif' },
  topCardName: { color: color.ink, fontSize: 12, fontFamily: 'Inter, sans-serif', fontWeight: '500' },
  topCardEstate: { color: color.body, fontSize: 9, fontFamily: 'GeistMono, monospace', letterSpacing: 0.5 },

  listThumbWrap: {
    width: 64,
    height: 80,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: color.hairline,
    backgroundColor: color.canvasSoft,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listThumb: {
    width: 56,
    height: 72,
  },
  listCard: { marginVertical: space.sm },

  // Wine detail — full-bleed hero
  detailHero: { height: 340, position: 'relative', overflow: 'hidden' },
  detailHeroImg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: 340 },
  detailBackBtn: {
    position: 'absolute',
    left: space.xl,
    width: 38,
    height: 38,
    borderRadius: 9999,
    backgroundColor: 'rgba(10,4,16,0.72)',
    borderWidth: 1,
    borderColor: color.hairline,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailBackIcon: {
    fontSize: 28,
    fontWeight: '300',
    color: color.ink,
    lineHeight: 30,
    marginTop: -3,
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

  // Tasting notes — immersive detail
  tastingRow: {
    flexDirection: 'row',
    gap: space.md,
    marginTop: space.sm,
    alignItems: 'baseline',
  },
  tastingLabel: {
    fontFamily: 'GeistMono, monospace',
    fontSize: 9,
    fontWeight: '400',
    letterSpacing: 1.2,
    color: color.gold,
    minWidth: 48,
  },
  tastingText: {
    flex: 1,
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: 14,
    color: color.body,
    lineHeight: 20,
  },

  // Pairing icon rows
  pairingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  pairingIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(212,148,44,0.12)',
    backgroundColor: 'rgba(212,148,44,0.04)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pairingText: {
    flex: 1,
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: 13,
    color: color.body,
  },

  // Vintage comparison cards
  vintageRow: {
    flexDirection: 'row',
    gap: space.sm,
    marginTop: space.sm,
  },
  vintageCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(212,148,44,0.10)',
    borderRadius: 10,
    padding: space.md,
    alignItems: 'center',
    backgroundColor: 'rgba(212,148,44,0.02)',
  },
  vintageCardActive: {
    borderColor: 'rgba(212,148,44,0.25)',
    backgroundColor: 'rgba(212,148,44,0.06)',
  },
  vintageYear: {
    fontFamily: 'CormorantGaramond, Georgia, serif',
    fontSize: 22,
    fontWeight: '400',
    color: color.ink,
  },
  vintageStar: {
    fontFamily: 'GeistMono, monospace',
    fontSize: 10,
    color: color.gold,
    marginTop: 2,
  },
  vintageTag: {
    fontFamily: 'GeistMono, monospace',
    fontSize: 7,
    color: color.bodyMid,
    marginTop: 4,
    letterSpacing: 0.5,
    textAlign: 'center',
  },

  // Stories entry card
  storiesEntryCard: {
    flexDirection: 'row',
    borderWidth: 1, borderColor: 'rgba(212,148,44,0.25)',
    borderRadius: radius.sm, overflow: 'hidden',
    backgroundColor: 'rgba(212,148,44,0.04)',
  },
  storiesEntryLeft: { flex: 1, padding: space.lg },
  storiesEntryTitle: {
    fontFamily: 'Cormorant Garamond, Georgia, serif',
    fontSize: 22, fontWeight: '400', color: color.ink,
    lineHeight: 26, marginTop: space.xs,
  },
  storiesEntrySub: {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: 13, color: color.body, lineHeight: 18,
    marginTop: space.xs,
  },
  storiesEntryCta: {
    ...font.captionMonoSm,
    color: color.gold, letterSpacing: 1.5,
    marginTop: space.md,
  },
  storiesEntryThumb: {
    width: 100, position: 'relative',
  },
  storiesEntryThumbImg: {
    ...StyleSheet.absoluteFillObject,
  },
  storiesEntryThumbScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10,4,16,0.5)',
  },
  storiesEntryThumbLabel: {
    ...font.captionMonoSm,
    color: color.gold,
    position: 'absolute', bottom: space.sm, left: space.sm,
    letterSpacing: 1,
  },

  // Near You card
  nearYouCard: {
    borderWidth: 1, borderColor: color.hairline, borderRadius: radius.sm,
    overflow: 'hidden', backgroundColor: color.canvasCard,
  },
  nearYouMapWrap: { height: 140, position: 'relative' },
  nearYouMap: { ...StyleSheet.absoluteFillObject },
  nearYouMapScrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(10,4,16,0.50)' },
  nearYouUserPin: {
    position: 'absolute', left: '50%', top: '50%',
    width: 12, height: 12, borderRadius: 9999,
    backgroundColor: color.gold, borderWidth: 2, borderColor: color.canvas,
    transform: [{ translateX: -6 }, { translateY: -6 }],
    zIndex: 10,
  },
  nearYouEstatePin: {
    position: 'absolute',
    width: 8, height: 8, borderRadius: 9999,
    backgroundColor: color.wineBright, borderWidth: 1, borderColor: color.gold,
    transform: [{ translateX: -4 }, { translateY: -4 }],
  },
  nearYouEstateRow: {
    flexDirection: 'row', alignItems: 'center', marginTop: space.xs,
  },
  nearYouDist: {
    ...font.captionMonoSm, color: color.gold, letterSpacing: 1,
  },
  nearYouBrowse: {
    ...font.captionMonoSm, color: color.gold, letterSpacing: 1.5,
    marginTop: space.md, paddingTop: space.sm,
    borderTopWidth: 1, borderTopColor: color.hairline,
  },
});
