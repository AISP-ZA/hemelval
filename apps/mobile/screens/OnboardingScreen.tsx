/**
 * Onboarding — first-run flow that turns an empty app into a personalised one.
 *
 * Three steps:
 *   1. WELCOME — brand statement, "Begin your cellar"
 *   2. PALATE QUIZ — 3 quick questions (type / body / flavour) that seed
 *      synthetic tasting notes via the palate store, so matchScore has a real
 *      signal from the first Discover scroll instead of a flat 50%.
 *   3. PRO UPSELL — value pitch, "Maybe later" to finish.
 *
 * Skippable on every step (top-right SKIP). Never traps the user.
 * Gate flag: AsyncStorage 'decanta.onboarded.v1' (checked in App.tsx).
 */

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable, Text, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Eyebrow, Headline, BodyText, Button, Chip, Divider } from '../components/index.js';
import { color, font, space, radius } from '../theme/tokens.js';
import { HERO_VINEYARD, BOTTLE_DARK, POUR_RED } from '../lib/imagery.js';
import { usePalate } from '../hooks/usePalate.js';
import type { TastingNote } from '@kelder/engine';

// ── Quiz model ──────────────────────────────────────────────────────────────

type Step = 'welcome' | 'quiz' | 'pro';

interface Option<T extends string> {
  value: T;
  label: string;
  sub: string;
}

const TYPE_OPTS: Option<'red' | 'white' | 'both'>[] = [
  { value: 'red', label: 'Reds', sub: 'Structured, cellar-worthy' },
  { value: 'white', label: 'Whites', sub: 'Crisp, aromatic, fresh' },
  { value: 'both', label: 'Both', sub: 'Depends on the day' },
];

const BODY_OPTS: Option<'light' | 'medium' | 'full'>[] = [
  { value: 'light', label: 'Light', sub: 'Pinot Noir, Sauvignon Blanc' },
  { value: 'medium', label: 'Medium', sub: 'Cinsaut, Chenin Blanc' },
  { value: 'full', label: 'Full', sub: 'Cabernet, Chardonnay' },
];

const FLAVOUR_OPTS: Option<'fruit' | 'earth' | 'spice'>[] = [
  { value: 'fruit', label: 'Fruit-forward', sub: 'Berry, stone fruit, citrus' },
  { value: 'earth', label: 'Earthy & savoury', sub: 'Leather, forest floor, mushroom' },
  { value: 'spice', label: 'Spice & pepper', sub: 'Black pepper, clove, smoke' },
];

// Map a quiz answer set → synthetic seed TastingNotes.
// Each note references a real wine in MOCK_WINES so the varietal + type flow
// through buildPalateProfile correctly. Stars are high (4–5) to register as
// "liked" signal. These are gradually outweighed as the user logs real notes.
function quizToSeedNotes(answers: {
  type: 'red' | 'white' | 'both';
  body: 'light' | 'medium' | 'full';
  flavour: 'fruit' | 'earth' | 'spice';
}): TastingNote[] {
  const now = new Date().toISOString();
  const notes: TastingNote[] = [];

  // Type preference → a canonical SA wine of that type
  const redWineId = 'w1';   // Kanonkop Pinotage
  const whiteWineId = 'w2'; // Klein Constantia Vin de Constance
  if (answers.type === 'red' || answers.type === 'both') {
    notes.push({
      id: 'onboard-type-red',
      wineVintageId: redWineId,
      userId: 'guest',
      tastedAt: now,
      stars: 4.5,
      nose: { aromas: answers.flavour === 'earth' ? ['leather', 'tobacco'] : answers.flavour === 'spice' ? ['black-pepper', 'smoke'] : ['cherry-red', 'plum'] },
      palate: { body: answers.body === 'light' ? 'medium' : answers.body, flavors: [answers.flavour === 'earth' ? 'leather' : answers.flavour === 'spice' ? 'black-pepper' : 'cherry-red'], finish: 'long' },
      freeText: '',
    });
  }
  if (answers.type === 'white' || answers.type === 'both') {
    notes.push({
      id: 'onboard-type-white',
      wineVintageId: whiteWineId,
      userId: 'guest',
      tastedAt: now,
      stars: 4.5,
      nose: { aromas: answers.flavour === 'earth' ? ['honey', 'wax'] : answers.flavour === 'spice' ? ['ginger'] : ['apple', 'apricot'] },
      palate: { body: answers.body === 'full' ? 'medium-plus' : answers.body, flavors: [answers.flavour === 'earth' ? 'honey' : 'apricot'], finish: 'long' },
      freeText: '',
    });
  }
  return notes;
}

// ── Screen ──────────────────────────────────────────────────────────────────

export function OnboardingScreen({ onComplete }: { onComplete: () => void }) {
  const insets = useSafeAreaInsets();
  const { setOnboardingSeed } = usePalate();
  const [step, setStep] = useState<Step>('welcome');
  const [answers, setAnswers] = useState({
    type: null as 'red' | 'white' | 'both' | null,
    body: null as 'light' | 'medium' | 'full' | null,
    flavour: null as 'fruit' | 'earth' | 'spice' | null,
  });

  const finish = (seeded: boolean) => {
    if (seeded && answers.type && answers.body && answers.flavour) {
      setOnboardingSeed(quizToSeedNotes({
        type: answers.type,
        body: answers.body,
        flavour: answers.flavour,
      }));
    }
    onComplete();
  };

  return (
    <View style={styles.root}>
      {/* Skip button — always available, top-right */}
      <Pressable
        hitSlop={12}
        onPress={() => finish(false)}
        style={[styles.skipBtn, { top: Math.max(insets.top, space.md) + space.sm }]}
      >
        <Text style={styles.skipText}>SKIP</Text>
      </Pressable>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + space.huge, paddingBottom: insets.bottom + space.huge }]}
        alwaysBounceVertical={false}
      >
        {step === 'welcome' && <WelcomeStep onNext={() => setStep('quiz')} />}

        {step === 'quiz' && (
          <QuizStep
            answers={answers}
            setAnswers={setAnswers}
            onNext={() => setStep('pro')}
          />
        )}

        {step === 'pro' && <ProStep onFinish={() => finish(true)} />}
      </ScrollView>
    </View>
  );
}

// ── Step 1: Welcome ─────────────────────────────────────────────────────────

function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <View style={styles.stepWrap}>
      {/* Hero image */}
      <View style={styles.heroWrap}>
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <StepHeroImage source={HERO_VINEYARD} />
        <View style={styles.heroOverlay} />
        <View style={styles.heroBody}>
          <Text style={styles.wordmark}>DECANTA</Text>
          <Text style={styles.wordmarkSub}>YOUR CELLAR · YOUR PALATE</Text>
        </View>
      </View>

      <Eyebrow style={{ marginTop: space.xl }}>WESTERN CAPE WINE</Eyebrow>
      <Headline size="xl" style={{ marginTop: space.sm }}>
        Discover South African wine.
      </Headline>
      <BodyText style={{ marginTop: space.md, maxWidth: 300 }}>
        Scan a bottle, rate your tasting, build your palate. The Winelands' wines, estates, and varietals — explored.
      </BodyText>

      <View style={styles.featureRow}>
        <FeaturePill label="217 WINES" />
        <FeaturePill label="420 ESTATES" />
        <FeaturePill label="36 EVENTS" />
      </View>

      <Button variant="primary" style={{ marginTop: space.xxl }} onPress={onNext}>
        BEGIN YOUR CELLAR →
      </Button>
      <BodyText size="sm" muted style={{ marginTop: space.md, textAlign: 'center' }}>
        Takes 30 seconds. Personalises your matches.
      </BodyText>
    </View>
  );
}

// ── Step 2: Palate Quiz ─────────────────────────────────────────────────────

function QuizStep({
  answers,
  setAnswers,
  onNext,
}: {
  answers: { type: 'red' | 'white' | 'both' | null; body: 'light' | 'medium' | 'full' | null; flavour: 'fruit' | 'earth' | 'spice' | null };
  setAnswers: React.Dispatch<React.SetStateAction<{ type: 'red' | 'white' | 'both' | null; body: 'light' | 'medium' | 'full' | null; flavour: 'fruit' | 'earth' | 'spice' | null }>>;
  onNext: () => void;
}) {
  const allAnswered = answers.type && answers.body && answers.flavour;

  return (
    <View style={styles.stepWrap}>
      <Eyebrow>PALATE QUIZ // 30 SECONDS</Eyebrow>
      <Headline size="lg" style={{ marginTop: space.sm }}>What do you reach for?</Headline>
      <BodyText muted size="sm" style={{ marginTop: space.sm, maxWidth: 300 }}>
        We'll use this to tune your match scores. No wrong answers — refine it anytime by logging real tastings.
      </BodyText>

      <Divider style={{ marginTop: space.xl }} />

      {/* Q1: Type */}
      <QuizQuestion
        n={1}
        title="Red or white?"
        options={TYPE_OPTS}
        selected={answers.type}
        onSelect={(v) => setAnswers((p) => ({ ...p, type: v }))}
      />

      {/* Q2: Body */}
      <QuizQuestion
        n={2}
        title="Body & weight?"
        options={BODY_OPTS}
        selected={answers.body}
        onSelect={(v) => setAnswers((p) => ({ ...p, body: v }))}
      />

      {/* Q3: Flavour */}
      <QuizQuestion
        n={3}
        title="Flavour direction?"
        options={FLAVOUR_OPTS}
        selected={answers.flavour}
        onSelect={(v) => setAnswers((p) => ({ ...p, flavour: v }))}
      />

      <Button
        variant="primary"
        style={{ marginTop: space.xl }}
        disabled={!allAnswered}
        onPress={onNext}
      >
        {allAnswered ? 'SEE YOUR MATCHES →' : 'ANSWER ALL TO CONTINUE'}
      </Button>
    </View>
  );
}

function QuizQuestion<T extends string>({
  n, title, options, selected, onSelect,
}: {
  n: number;
  title: string;
  options: Option<T>[];
  selected: T | null;
  onSelect: (v: T) => void;
}) {
  return (
    <View style={{ marginTop: space.xl }}>
      <View style={styles.qHeader}>
        <Text style={styles.qNum}>{String(n).padStart(2, '0')}</Text>
        <Headline size="sm">{title}</Headline>
      </View>
      <View style={styles.qOpts}>
        {options.map((o) => {
          const active = selected === o.value;
          return (
            <Pressable key={o.value} hitSlop={4} onPress={() => onSelect(o.value)} style={[styles.qOpt, active && styles.qOptActive]}>
              <BodyText style={{ color: active ? color.gold : color.ink }}>{o.label}</BodyText>
              <BodyText size="sm" muted>{o.sub}</BodyText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// ── Step 3: Pro Upsell ──────────────────────────────────────────────────────

function ProStep({ onFinish }: { onFinish: () => void }) {
  return (
    <View style={styles.stepWrap}>
      {/* Hero image */}
      <View style={styles.heroWrap}>
        <StepHeroImage source={POUR_RED} />
        <View style={styles.heroOverlay} />
        <View style={styles.heroBody}>
          <Text style={[styles.wordmark, { fontSize: 18 }]}>DECANTA PRO</Text>
        </View>
      </View>

      <Eyebrow style={{ marginTop: space.xl }}>UNLOCK THE DEEP CELLAR</Eyebrow>
      <Headline size="lg" style={{ marginTop: space.sm }}>Go deeper on every bottle.</Headline>

      <View style={styles.proFeatures}>
        <ProFeature title="Unlimited scans" sub="No daily cap on label + barcode lookups" />
        <ProFeature title="Advanced palate analytics" sub="Drinking-window tracking, varietal deep-dives" />
        <ProFeature title="Cellar vault" sub="Unlimited bottle tracking + ageability alerts" />
        <ProFeature title="Early event access" sub="Ticket alerts before public on-sale" />
      </View>

      <View style={styles.priceCard}>
        <Text style={styles.price}>R89</Text>
        <Text style={styles.pricePer}>/ MONTH</Text>
        <Text style={styles.priceNote}>Cancel anytime · 14-day free trial</Text>
      </View>

      <Button variant="primary" style={{ marginTop: space.lg }} onPress={onFinish}>
        START FREE TRIAL
      </Button>
      <Button variant="outline" style={{ marginTop: space.md }} onPress={onFinish}>
        MAYBE LATER
      </Button>
    </View>
  );
}

// ── Small parts ─────────────────────────────────────────────────────────────

function FeaturePill({ label }: { label: string }) {
  return (
    <View style={styles.featurePill}>
      <Text style={styles.featurePillText}>{label}</Text>
    </View>
  );
}

function ProFeature({ title, sub }: { title: string; sub: string }) {
  return (
    <View style={styles.proFeature}>
      <Text style={styles.proFeatureDot}>◆</Text>
      <View style={{ flex: 1 }}>
        <BodyText>{title}</BodyText>
        <BodyText size="sm" muted>{sub}</BodyText>
      </View>
    </View>
  );
}

// React Native Image needs a proper source prop; thin wrapper to keep TS happy
// and centralise the resizeMode.
function StepHeroImage({ source }: { source: { url: string; alt: string } }) {
  const { Image } = require('react-native');
  return (
    <Image
      source={{ uri: source.url }}
      style={StyleSheet.absoluteFillObject}
      resizeMode="cover"
      accessible
      accessibilityLabel={source.alt}
    />
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: color.canvas,
  },
  scroll: {
    paddingHorizontal: space.xl,
  },
  skipBtn: {
    position: 'absolute',
    right: space.lg,
    zIndex: 10,
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: color.hairline,
    backgroundColor: 'rgba(8,3,10,0.7)',
  },
  skipText: {
    ...font.captionMonoSm,
    color: color.body,
    letterSpacing: 1.5,
  },

  stepWrap: {
    paddingBottom: space.huge,
  },

  // Hero
  heroWrap: {
    height: 240,
    borderRadius: radius.sm,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: color.hairline,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8,3,10,0.55)',
  },
  heroBody: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    padding: space.lg,
  },
  wordmark: {
    fontFamily: 'Cormorant Garamond',
    fontWeight: '400',
    fontSize: 32,
    letterSpacing: 6,
    color: color.gold,
    lineHeight: 36,
  },
  wordmarkSub: {
    ...font.captionMonoSm,
    color: color.body,
    letterSpacing: 3,
    marginTop: 4,
  },

  featureRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
    marginTop: space.lg,
  },
  featurePill: {
    borderWidth: 1,
    borderColor: color.hairline,
    borderRadius: radius.pill,
    paddingVertical: space.xs,
    paddingHorizontal: space.md,
  },
  featurePillText: {
    ...font.captionMonoSm,
    color: color.body,
    letterSpacing: 1,
  },

  // Quiz
  qHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: space.md,
  },
  qNum: {
    fontFamily: 'GeistMono',
    fontSize: 13,
    color: color.gold,
    letterSpacing: 1,
  },
  qOpts: {
    flexDirection: 'row',
    gap: space.sm,
    marginTop: space.md,
  },
  qOpt: {
    flex: 1,
    borderWidth: 1,
    borderColor: color.hairline,
    borderRadius: radius.sm,
    padding: space.md,
    gap: space.xs,
    backgroundColor: color.canvasCard,
  },
  qOptActive: {
    borderColor: color.gold,
    backgroundColor: 'rgba(196,151,60,0.08)',
  },

  // Pro
  proFeatures: {
    marginTop: space.lg,
    gap: space.md,
  },
  proFeature: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.md,
  },
  proFeatureDot: {
    color: color.gold,
    fontSize: 10,
    lineHeight: 20,
  },
  priceCard: {
    marginTop: space.xl,
    borderWidth: 1,
    borderColor: 'rgba(196,151,60,0.30)',
    borderRadius: radius.sm,
    padding: space.xl,
    alignItems: 'center',
    backgroundColor: 'rgba(196,151,60,0.04)',
  },
  price: {
    fontFamily: 'Cormorant Garamond',
    fontWeight: '400',
    fontSize: 48,
    color: color.gold,
    lineHeight: 52,
  },
  pricePer: {
    ...font.captionMono,
    color: color.body,
    letterSpacing: 2,
  },
  priceNote: {
    ...font.captionMonoSm,
    color: color.bodyMid,
    marginTop: space.xs,
  },
});
