/**
 * TastingNoteScreen — the structured tasting-note recorder.
 *
 * Peak 4 — THE SOMMELIER CEREMONY:
 * A guided 5-step wizard with progress bar, slide transitions, and haptic
 * feedback on each selection. Transforms logging a wine from "paperwork"
 * into an experience.
 *
 * Steps: 01 Rating → 02 Nose → 03 Palate → 04 Flavours → 05 Notes → save
 *
 * Data drives @kelder/engine controlled vocabularies so every note feeds
 * the palate engine (WSET SAT + Noble Aroma Wheel).
 */

import React, { useMemo, useState, useRef, useEffect } from 'react';
import {
  View, ScrollView, StyleSheet, Pressable, Text, TextInput,
  Animated, Easing, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Eyebrow, Headline, BodyText, Card, Button, Chip, Divider,
} from '../components/index.js';
import { StarPicker } from '../components/StarPicker.js';
import { color, font, space, radius } from '../theme/tokens.js';
import {
  AROMA_DESCRIPTORS, AROMA_CATEGORIES, aromasByCategory, aromaLabel,
  SWEETNESS, ACIDITY, TANNIN_LEVEL, BODY, FINISH, TEXTURE,
  type AromaCategory, type Sweetness, type Acidity, type TanninLevel,
  type Body, type Finish, type Texture,
} from '@kelder/engine';
import type { MockWine } from '../lib/mockData.js';
import { usePalate } from '../hooks/usePalate.js';
import { useAuth } from '../hooks/useAuth.js';

const CATEGORY_LABELS: Record<AromaCategory, string> = {
  fruity: 'Fruity',
  floral: 'Floral',
  herbaceous: 'Herbaceous',
  spicy: 'Spicy',
  oaky: 'Oaky / Woody',
  earthy: 'Earthy',
  caramel: 'Caramel',
  nutty: 'Nutty',
  microbiological: 'Yeast / Lees',
  oxidized: 'Oxidized',
  chemical: 'Chemical / Sulfur',
  mineral: 'Mineral',
};

const TOTAL_STEPS = 5;

// Lazy-load haptics — expo-haptics may not be installed on web
let hapticBuzz: (() => void) | null = null;
async function ensureHaptics() {
  if (hapticBuzz !== null) return;
  if (Platform.OS === 'web') { hapticBuzz = () => {}; return; }
  try {
    const Haptics = await import('expo-haptics');
    hapticBuzz = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch { hapticBuzz = () => {}; }
}
ensureHaptics();
function buzz() { hapticBuzz?.(); }

export function TastingNoteScreen({
  wine,
  onClose,
}: {
  wine: MockWine;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { addNote, profile } = usePalate();
  const { isRegistered } = useAuth();
  const [showGuestPrompt, setShowGuestPrompt] = useState(false);
  const [step, setStep] = useState(1);
  const [stars, setStars] = useState(0);
  const [noseAromas, setNoseAromas] = useState<string[]>([]);
  const [sweetness, setSweetness] = useState<Sweetness | null>(null);
  const [acidity, setAcidity] = useState<Acidity | null>(null);
  const [tannin, setTannin] = useState<TanninLevel | null>(null);
  const [body, setBody] = useState<Body | null>(null);
  const [finish, setFinish] = useState<Finish | null>(null);
  const [textures, setTextures] = useState<Texture[]>([]);
  const [flavors, setFlavors] = useState<string[]>([]);
  const [freeText, setFreeText] = useState('');
  const [noseCategory, setNoseCategory] = useState<AromaCategory>('fruity');
  const [flavorCategory, setFlavorCategory] = useState<AromaCategory>('fruity');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Slide animation between steps
  const slideAnim = useRef(new Animated.Value(0)).current;
  const [slideDir, setSlideDir] = useState(1); // 1=forward, -1=back

  const noseAromasList = useMemo(() => aromasByCategory(noseCategory), [noseCategory]);
  const flavorAromasList = useMemo(() => aromasByCategory(flavorCategory), [flavorCategory]);

  const beforeCount = profile.noteCount;

  function goToStep(next: number) {
    setSlideDir(next > step ? 1 : -1);
    setStep(next);
    // Trigger slide-in animation
    slideAnim.setValue(slideDir * 30);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 350,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: true,
    }).start();
  }

  // Initialize slide animation on mount
  useEffect(() => {
    slideAnim.setValue(30);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 400,
      delay: 100,
      useNativeDriver: true,
    }).start();
  }, []);

  function toggle<T extends string>(list: T[], id: T, setter: (v: T[]) => void) {
    buzz();
    setter(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  }

  function handleSave() {
    if (stars === 0) {
      setError('Tap a star to rate the wine first.');
      setStep(1);
      return;
    }
    const result = addNote({
      wineVintageId: wine.id,
      stars,
      nose: { aromas: noseAromas },
      palate: {
        sweetness: sweetness ?? undefined,
        acidity: acidity ?? undefined,
        tanninLevel: tannin ?? undefined,
        body: body ?? undefined,
        finish: finish ?? undefined,
        texture: textures.length ? textures : undefined,
        flavors,
      },
      freeText: freeText.trim() || undefined,
    });
    if (!result.ok) {
      setError(result.error ?? 'Could not save tasting note.');
      return;
    }
    // Guest users: save locally, then show the "create your cellar" soft prompt
    if (!isRegistered) {
      setShowGuestPrompt(true);
    } else {
      setSaved(true);
    }
  }

  // ── Guest soft prompt: "Your tasting is saved. Create a cellar to sync." ──
  if (showGuestPrompt) {
    return (
      <View style={[styles.wrap, { paddingTop: insets.top + 24 }]}>
        <View style={styles.savedCard}>
          <Eyebrow>TASTING SAVED ✓</Eyebrow>
          <Headline size="lg" style={{ marginTop: space.md }}>Your palate is taking shape.</Headline>
          <BodyText muted style={{ marginTop: space.md }}>
            {wine.name} is saved on this device. Decanta has updated your palate profile — your match scores just got smarter.
          </BodyText>
          <Divider />
          <View style={{ backgroundColor: 'rgba(212,148,44,0.06)', borderRadius: radius.sm, padding: space.lg, marginTop: space.sm }}>
            <Headline size="sm" style={{ color: color.gold }}>Create your free cellar</Headline>
            <BodyText muted size="sm" style={{ marginTop: space.xs, lineHeight: 19 }}>
              Sync your tastings across devices, build a full palate profile, and get personalised recommendations.
            </BodyText>
          </View>
          <Button variant="primary" style={{ marginTop: space.lg }} onPress={onClose}>CREATE MY CELLAR →</Button>
          <Button variant="outline" style={{ marginTop: space.md }} onPress={() => { setShowGuestPrompt(false); setSaved(true); }}>SAVE ANYWAY</Button>
        </View>
      </View>
    );
  }

  // ── Saved success screen ──
  if (saved) {
    return (
      <View style={[styles.wrap, { paddingTop: insets.top + 24 }]}>
        <View style={styles.savedCard}>
          <Eyebrow>NOTE LOGGED // {beforeCount + 1} TASTED</Eyebrow>
          <Headline size="lg" style={{ marginTop: space.md }}>Your palate is sharpening.</Headline>
          <BodyText muted style={{ marginTop: space.md }}>
            {wine.name} is now part of your cellar. Decanta has re-learnt what you love —
            your recommendations just got smarter.
          </BodyText>
          <Divider />
          <Eyebrow>WHAT CHANGED</Eyebrow>
          <View style={{ gap: space.sm, marginTop: space.md }}>
            {noseAromas.length > 0 && (
              <BodyText size="sm">• Added {noseAromas.length} aroma{noseAromas.length > 1 ? 's' : ''} to your nose profile</BodyText>
            )}
            {body && <BodyText size="sm">• Body preference noted: {body.replace(/-/g, ' ')}</BodyText>}
            {finish && <BodyText size="sm">• Finish: {finish.replace('-', ' ')}</BodyText>}
            <BodyText size="sm">• {stars.toFixed(1)}★ rating recorded</BodyText>
          </View>
          <Button variant="primary" style={{ marginTop: space.xl }} onPress={onClose}>DONE</Button>
        </View>
      </View>
    );
  }

  const canProceed = step === 1 ? stars > 0 : true; // Only step 1 requires input to proceed

  return (
    <View style={{ flex: 1, backgroundColor: color.canvas }}>
      {/* ── Header: cancel + wine name + progress bar ── */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerTop}>
          <Pressable onPress={onClose} hitSlop={8}>
            <Text style={[font.captionMono, { color: color.bodyMid }]}>✕ CANCEL</Text>
          </Pressable>
          <Eyebrow>LOG A TASTING</Eyebrow>
          <Text style={[font.captionMonoSm, { color: color.bodyMid }]}>STEP {step}/{TOTAL_STEPS}</Text>
        </View>
        <Text style={styles.headerWineName} numberOfLines={1}>{wine.name}</Text>
        <BodyText muted size="sm">{wine.estateName} · {wine.region}{wine.year > 0 ? ` · ${wine.year}` : ''}</BodyText>

        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <Animated.View
            style={[styles.progressFill, {
              width: `${(step / TOTAL_STEPS) * 100}%`,
            }]}
          />
        </View>
      </View>

      {/* ── Step content (slides in) ── */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: space.xxl }}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View style={[styles.stepBody, {
          opacity: slideAnim.interpolate({ inputRange: [-30, 0, 30], outputRange: [0, 1, 0] }),
          transform: [{ translateX: slideAnim }],
        }]}>
          {step === 1 && (
            <>
              <Eyebrow>YOUR RATING // 01</Eyebrow>
              <Headline size="md" style={{ marginTop: space.sm, color: color.body }}>How much did you enjoy it?</Headline>
              <View style={{ marginTop: space.xl, alignItems: 'center' }}>
                <StarPicker value={stars} onChange={(v) => { buzz(); setStars(v); setError(null); }} />
              </View>
              {error && <BodyText size="sm" style={{ color: color.crit, marginTop: space.lg, textAlign: 'center' }}>⚠ {error}</BodyText>}
            </>
          )}

          {step === 2 && (
            <>
              <Eyebrow>THE NOSE // 02</Eyebrow>
              <Headline size="md" style={{ marginTop: space.sm, color: color.body }}>What do you smell?</Headline>
              <BodyText size="sm" muted style={{ marginTop: space.xs }}>
                Tap the aromas you detect. Drawn from the Noble Wine Aroma Wheel.
              </BodyText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catRow} contentContainerStyle={{ gap: space.sm }}>
                {AROMA_CATEGORIES.map((cat) => (
                  <Pressable key={cat} hitSlop={8} onPress={() => { buzz(); setNoseCategory(cat); }}>
                    <Chip tone={cat === noseCategory ? 'accent' : 'neutral'}>{CATEGORY_LABELS[cat]}</Chip>
                  </Pressable>
                ))}
              </ScrollView>
              <View style={styles.descGrid}>
                {noseAromasList.map((d) => {
                  const active = noseAromas.includes(d.id);
                  return (
                    <Pressable key={d.id} hitSlop={8} onPress={() => toggle(noseAromas, d.id, setNoseAromas)}>
                      <Chip tone={active ? 'systems' : 'neutral'}>{d.label}</Chip>
                    </Pressable>
                  );
                })}
              </View>
              {noseAromas.length > 0 && (
                <BodyText size="sm" muted style={{ marginTop: space.md }}>
                  {noseAromas.length} selected: {noseAromas.slice(0, 5).map(aromaLabel).join(', ')}{noseAromas.length > 5 ? '…' : ''}
                </BodyText>
              )}
            </>
          )}

          {step === 3 && (
            <>
              <Eyebrow>THE PALATE // 03</Eyebrow>
              <Headline size="md" style={{ marginTop: space.sm, color: color.body }}>How does it taste?</Headline>
              <ScaleRow label="Sweetness" values={[...SWEETNESS]} current={sweetness} onPick={(v) => { buzz(); setSweetness(v as Sweetness); }} />
              <ScaleRow label="Acidity" values={[...ACIDITY]} current={acidity} onPick={(v) => { buzz(); setAcidity(v as Acidity); }} />
              <ScaleRow label="Tannin" values={[...TANNIN_LEVEL]} current={tannin} onPick={(v) => { buzz(); setTannin(v as TanninLevel); }} />
              <ScaleRow label="Body" values={[...BODY]} current={body} onPick={(v) => { buzz(); setBody(v as Body); }} />
              <ScaleRow label="Finish" values={[...FINISH]} current={finish} onPick={(v) => { buzz(); setFinish(v as Finish); }} />
              <BodyText size="sm" muted style={{ marginTop: space.lg, marginBottom: space.sm }}>TEXTURE (optional)</BodyText>
              <View style={styles.descGrid}>
                {TEXTURE.map((t) => {
                  const active = textures.includes(t);
                  return (
                    <Pressable key={t} hitSlop={8} onPress={() => toggle(textures, t, setTextures)}>
                      <Chip tone={active ? 'systems' : 'neutral'}>{t}</Chip>
                    </Pressable>
                  );
                })}
              </View>
            </>
          )}

          {step === 4 && (
            <>
              <Eyebrow>FLAVOURS // 04</Eyebrow>
              <Headline size="md" style={{ marginTop: space.sm, color: color.body }}>What do you taste?</Headline>
              <BodyText size="sm" muted style={{ marginTop: space.xs, marginBottom: space.md }}>
                Same wheel as the nose — what you detect on the palate.
              </BodyText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catRow} contentContainerStyle={{ gap: space.sm }}>
                {AROMA_CATEGORIES.map((cat) => (
                  <Pressable key={cat} hitSlop={8} onPress={() => { buzz(); setFlavorCategory(cat); }}>
                    <Chip tone={cat === flavorCategory ? 'accent' : 'neutral'}>{CATEGORY_LABELS[cat]}</Chip>
                  </Pressable>
                ))}
              </ScrollView>
              <View style={styles.descGrid}>
                {flavorAromasList.map((d) => {
                  const active = flavors.includes(d.id);
                  return (
                    <Pressable key={d.id} hitSlop={8} onPress={() => toggle(flavors, d.id, setFlavors)}>
                      <Chip tone={active ? 'sunset' : 'neutral'}>{d.label}</Chip>
                    </Pressable>
                  );
                })}
              </View>
            </>
          )}

          {step === 5 && (
            <>
              <Eyebrow>YOUR NOTES // 05</Eyebrow>
              <Headline size="md" style={{ marginTop: space.sm, color: color.body }}>Anything else?</Headline>
              <BodyText size="sm" muted style={{ marginTop: space.xs, marginBottom: space.md }}>
                Food pairing, occasion, who you shared it with… (optional)
              </BodyText>
              <Card style={styles.textInputWrap}>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Paired with braai lamb. Will buy again for Christmas."
                  placeholderTextColor={color.bodyMid}
                  value={freeText}
                  onChangeText={setFreeText}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </Card>
            </>
          )}
        </Animated.View>
      </ScrollView>

      {/* ── Wizard navigation ── */}
      <View style={[styles.navBar, { paddingBottom: insets.bottom + space.md }]}>
        {step > 1 ? (
          <Pressable hitSlop={12} onPress={() => goToStep(step - 1)} style={styles.navBack}>
            <Text style={[font.captionMono, { color: color.bodyMid }]}>← BACK</Text>
          </Pressable>
        ) : (
          <View style={{ width: 60 }} />
        )}
        {step < TOTAL_STEPS ? (
          <Pressable
            hitSlop={12}
            onPress={() => canProceed ? goToStep(step + 1) : setError('Tap a star to rate the wine first.')}
            style={[styles.navNext, !canProceed && styles.navNextDisabled]}
          >
            <Text style={[font.captionMono, { color: !canProceed ? color.bodyMid : color.canvas }]}>
              NEXT →
            </Text>
          </Pressable>
        ) : (
          <Button variant="primary" onPress={handleSave} style={styles.navSave}>
            ★ LOG THIS TASTING
          </Button>
        )}
      </View>
    </View>
  );
}

// ── Scale row (single-select scale like Acidity: low → high) ────────────────
function ScaleRow<T extends string>({
  label, values, current, onPick,
}: {
  label: string;
  values: readonly T[];
  current: T | null;
  onPick: (v: T) => void;
}) {
  return (
    <View style={styles.scaleRow}>
      <BodyText size="sm" muted style={styles.scaleLabel}>{label.toUpperCase()}</BodyText>
      <View style={styles.scaleChips}>
        {values.map((v) => {
          const active = current === v;
          return (
            <Pressable key={v} hitSlop={8} onPress={() => onPick(v)}>
              <Chip tone={active ? 'accent' : 'neutral'}>
                {v.replace(/-/g, ' ')}
              </Chip>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: color.canvas, padding: space.xl },
  savedCard: {
    backgroundColor: color.canvasCard,
    borderWidth: 1,
    borderColor: color.hairline,
    borderRadius: radius.sm,
    padding: space.xl,
  },
  // ── Header + progress ──
  header: {
    paddingHorizontal: space.xl,
    paddingBottom: space.md,
    borderBottomWidth: 1,
    borderBottomColor: color.hairline,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: space.sm,
  },
  headerWineName: {
    fontFamily: 'CormorantGaramond',
    fontSize: 22,
    fontWeight: '400',
    color: color.ink,
    lineHeight: 26,
    letterSpacing: -0.3,
  },
  progressTrack: {
    height: 3,
    backgroundColor: color.canvasSoft,
    borderRadius: 2,
    marginTop: space.md,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: color.gold,
    borderRadius: 2,
  },
  // ── Step body ──
  stepBody: {
    padding: space.xl,
    paddingTop: space.xl,
  },
  catRow: { marginTop: space.md, marginHorizontal: -space.xs },
  descGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs, marginTop: space.md },
  scaleRow: { marginTop: space.md },
  scaleLabel: { marginBottom: space.xs },
  scaleChips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs },
  textInputWrap: { marginTop: space.md, overflow: 'hidden' },
  textInput: {
    backgroundColor: color.canvasSoft,
    color: color.ink,
    padding: space.md,
    minHeight: 96,
    ...font.bodyMd,
  },
  // ── Navigation bar ──
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: space.xl,
    paddingTop: space.md,
    borderTopWidth: 1,
    borderTopColor: color.hairline,
    backgroundColor: color.canvas,
  },
  navBack: {
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
  navNext: {
    backgroundColor: color.gold,
    paddingHorizontal: space.xl,
    paddingVertical: space.md,
    borderRadius: radius.pill,
  },
  navNextDisabled: {
    backgroundColor: color.canvasSoft,
  },
  navSave: {
    flex: 1,
    marginLeft: space.md,
  },
});
