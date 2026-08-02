/**
 * TastingNoteScreen — the structured tasting-note recorder.
 *
 * Drives every selector from @kelder/engine controlled vocabularies so the
 * data captured is always valid, comparable, and feeds the palate engine.
 *
 * Flow: star rating → nose aromas (Noble Wheel) → palate (sweetness/acid/
 * tannin/body/finish) → free-text note → save → palate re-derives live.
 */

import React, { useMemo, useState } from 'react';
import {
  View, ScrollView, StyleSheet, Pressable, Text, TextInput,
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

export function TastingNoteScreen({
  wine,
  onClose,
}: {
  wine: MockWine;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { addNote, profile } = usePalate();

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

  const noseAromasList = useMemo(() => aromasByCategory(noseCategory), [noseCategory]);
  const flavorAromasList = useMemo(() => aromasByCategory(flavorCategory), [flavorCategory]);

  const beforeCount = profile.noteCount;

  function toggle<T extends string>(list: T[], id: T, setter: (v: T[]) => void) {
    setter(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  }

  function handleSave() {
    if (stars === 0) {
      setError('Tap a star to rate the wine first.');
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
    setSaved(true);
  }

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

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: color.canvas }}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 80 }}
    >
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Pressable onPress={onClose} hitSlop={8}>
            <Text style={[font.captionMono, { color: color.bodyMid }]}>← CANCEL</Text>
          </Pressable>
          <Eyebrow>LOG A TASTING</Eyebrow>
        </View>
        <Headline size="md" style={{ marginTop: space.sm }}>{wine.name}</Headline>
        <BodyText muted size="sm">{wine.estateName} · {wine.region}{wine.year > 0 ? ` · ${wine.year}` : ''}</BodyText>
      </View>

      <View style={styles.section}>
        {/* ── STAR RATING ── */}
        <Eyebrow>YOUR RATING // 01</Eyebrow>
        <Headline size="sm" style={{ marginTop: space.sm, color: color.body }}>How much did you enjoy it?</Headline>
        <View style={{ marginTop: space.lg }}>
          <StarPicker value={stars} onChange={(v) => { setStars(v); setError(null); }} />
        </View>
        {error && <BodyText size="sm" style={{ color: color.crit, marginTop: space.sm }}>⚠ {error}</BodyText>}
      </View>

      <Divider style={styles.divider} />

      {/* ── NOSE / AROMA ── */}
      <View style={styles.section}>
        <Eyebrow>THE NOSE // 02</Eyebrow>
        <Headline size="sm" style={{ marginTop: space.sm, color: color.body }}>What do you smell?</Headline>
        <BodyText size="sm" muted style={{ marginTop: space.xs }}>
          Tap the aromas you detect. Drawn from the Noble Wine Aroma Wheel.
        </BodyText>

        {/* Category selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catRow} contentContainerStyle={{ gap: space.sm }}>
          {AROMA_CATEGORIES.map((cat) => (
            <Pressable key={cat} hitSlop={8} onPress={() => setNoseCategory(cat)}>
              <Chip tone={cat === noseCategory ? 'accent' : 'neutral'}>{CATEGORY_LABELS[cat]}</Chip>
            </Pressable>
          ))}
        </ScrollView>

        {/* Descriptors in selected category */}
        <View style={styles.descGrid}>
          {noseAromasList.map((d) => {
            const active = noseAromas.includes(d.id);
            return (
              <Pressable key={d.id} hitSlop={8} onPress={() => toggle(noseAromas, d.id, setNoseAromas)}>
                <Chip tone={active ? 'systems' : 'neutral'} style={styles.descChip}>{d.label}</Chip>
              </Pressable>
            );
          })}
        </View>

        {noseAromas.length > 0 && (
          <BodyText size="sm" muted style={{ marginTop: space.md }}>
            {noseAromas.length} selected: {noseAromas.slice(0, 5).map(aromaLabel).join(', ')}{noseAromas.length > 5 ? '…' : ''}
          </BodyText>
        )}
      </View>

      <Divider style={styles.divider} />

      {/* ── PALATE ── */}
      <View style={styles.section}>
        <Eyebrow>THE PALATE // 03</Eyebrow>
        <Headline size="sm" style={{ marginTop: space.sm, color: color.body }}>How does it taste?</Headline>

        <ScaleRow label="Sweetness" values={[...SWEETNESS]} current={sweetness} onPick={(v) => setSweetness(v as Sweetness)} />
        <ScaleRow label="Acidity" values={[...ACIDITY]} current={acidity} onPick={(v) => setAcidity(v as Acidity)} />
        <ScaleRow label="Tannin" values={[...TANNIN_LEVEL]} current={tannin} onPick={(v) => setTannin(v as TanninLevel)} />
        <ScaleRow label="Body" values={[...BODY]} current={body} onPick={(v) => setBody(v as Body)} />
        <ScaleRow label="Finish" values={[...FINISH]} current={finish} onPick={(v) => setFinish(v as Finish)} />

        {/* Texture multi-select */}
        <BodyText size="sm" muted style={{ marginTop: space.lg, marginBottom: space.sm }}>TEXTURE (optional)</BodyText>
        <View style={styles.descGrid}>
          {TEXTURE.map((t) => {
            const active = textures.includes(t);
            return (
              <Pressable key={t} hitSlop={8} onPress={() => toggle(textures, t, setTextures)}>
                <Chip tone={active ? 'systems' : 'neutral'} style={styles.descChip}>{t}</Chip>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Divider style={styles.divider} />

      {/* ── FLAVORS (palate aromas) ── */}
      <View style={styles.section}>
        <Eyebrow>FLAVOURS // 04</Eyebrow>
        <Headline size="sm" style={{ marginTop: space.sm, color: color.body }}>What do you taste?</Headline>
        <BodyText size="sm" muted style={{ marginTop: space.xs, marginBottom: space.md }}>
          Same wheel as the nose — what you detect on the palate.
        </BodyText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catRow} contentContainerStyle={{ gap: space.sm }}>
          {AROMA_CATEGORIES.map((cat) => (
            <Pressable key={cat} hitSlop={8} onPress={() => setFlavorCategory(cat)}>
              <Chip tone={cat === flavorCategory ? 'accent' : 'neutral'}>{CATEGORY_LABELS[cat]}</Chip>
            </Pressable>
          ))}
        </ScrollView>
        <View style={styles.descGrid}>
          {flavorAromasList.map((d) => {
            const active = flavors.includes(d.id);
            return (
              <Pressable key={d.id} hitSlop={8} onPress={() => toggle(flavors, d.id, setFlavors)}>
                <Chip tone={active ? 'sunset' : 'neutral'} style={styles.descChip}>{d.label}</Chip>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Divider style={styles.divider} />

      {/* ── FREE TEXT ── */}
      <View style={styles.section}>
        <Eyebrow>YOUR NOTES // 05</Eyebrow>
        <Headline size="sm" style={{ marginTop: space.sm, color: color.body }}>Anything else?</Headline>
        <BodyText size="sm" muted style={{ marginTop: space.xs }}>
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
      </View>

      <View style={styles.footer}>
        <Button variant="primary" onPress={handleSave}>★ LOG THIS TASTING</Button>
      </View>
    </ScrollView>
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
              <Chip tone={active ? 'accent' : 'neutral'} style={styles.scaleChip}>
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
  header: { padding: space.xl, paddingBottom: space.md },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  section: { padding: space.xl, paddingTop: space.lg },
  divider: { marginHorizontal: space.xl },
  catRow: { marginTop: space.md, marginHorizontal: -space.xs },
  descGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs, marginTop: space.md },
  descChip: {},
  scaleRow: { marginTop: space.md },
  scaleLabel: { marginBottom: space.xs },
  scaleChips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs },
  scaleChip: {},
  textInputWrap: { marginTop: space.md, overflow: 'hidden' },
  textInput: {
    backgroundColor: color.canvasSoft,
    color: color.ink,
    padding: space.md,
    minHeight: 96,
    ...font.bodyMd,
  },
  footer: { padding: space.xl, paddingTop: space.lg },
});
