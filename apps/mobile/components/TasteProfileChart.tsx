/**
 * TasteProfileChart — the signature 4-axis bipolar visualization.
 *
 * Each axis is a horizontal bar from 0–100 showing where the wine (or
 * the user's aggregate palate) sits between two poles:
 *
 *   Light ←──────→ Bold       (body)
 *   Dry   ←──────→ Sweet      (sweetness)
 *   Soft  ←──────→ Acidic     (acidity)
 *   Smooth←──────→ Tannic     (tannin)
 *
 * The wine's values are shown as a gold filled bar with a marker dot.
 * On the profile page, the user's aggregate is shown the same way.
 *
 * This is the single most-copied wine-app visualization (Vivino's
 * "taste profile"). Replicated and enhanced with SA-appropriate styling.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { color, font, space, radius } from '../theme/tokens.js';

export interface TasteValues {
  body?: number;       // 0=light, 100=bold
  sweetness?: number;  // 0=dry, 100=sweet
  acidity?: number;    // 0=soft, 100=acidic
  tannin?: number;     // 0=smooth, 100=tannic
}

interface AxisConfig {
  key: keyof TasteValues;
  leftLabel: string;
  rightLabel: string;
}

const AXES: AxisConfig[] = [
  { key: 'body',      leftLabel: 'Light',  rightLabel: 'Bold' },
  { key: 'sweetness', leftLabel: 'Dry',    rightLabel: 'Sweet' },
  { key: 'acidity',   leftLabel: 'Soft',   rightLabel: 'Acidic' },
  { key: 'tannin',    leftLabel: 'Smooth', rightLabel: 'Tannic' },
];

export function TasteProfileChart({
  values,
  label = 'TASTE PROFILE',
  compact = false,
}: {
  values: TasteValues;
  label?: string;
  compact?: boolean;
}) {
  return (
    <View style={styles.wrap}>
      <Text style={[font.captionMono, { color: color.bodyMid, marginBottom: space.md }]}>
        {label}
      </Text>
      {AXES.map((axis) => {
        const val = values[axis.key];
        if (val == null) return null;
        const pct = Math.max(0, Math.min(100, val));
        return (
          <View key={axis.key} style={styles.axisRow}>
            <Text style={[font.captionMonoSm, styles.axisLeftLabel, { color: pct < 50 ? color.gold : color.bodyMid }]}>
              {axis.leftLabel.toUpperCase()}
            </Text>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: `${pct}%` }]} />
              <View style={[styles.barMarker, { left: `${pct}%` }]} />
            </View>
            <Text style={[font.captionMonoSm, styles.axisRightLabel, { color: pct > 50 ? color.gold : color.bodyMid }]}>
              {axis.rightLabel.toUpperCase()}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

// ── Helper: derive taste values from wine type + varietal ──────────────────
const VARIETAL_TASTE: Record<string, TasteValues> = {
  'pinotage':         { body: 75, sweetness: 10, acidity: 50, tannin: 65 },
  'cabernet-sauvignon':{ body: 85, sweetness: 5,  acidity: 60, tannin: 85 },
  'shiraz':           { body: 80, sweetness: 10, acidity: 55, tannin: 70 },
  'pinot-noir':       { body: 45, sweetness: 5,  acidity: 65, tannin: 35 },
  'merlot':           { body: 65, sweetness: 10, acidity: 50, tannin: 50 },
  'malbec':           { body: 75, sweetness: 10, acidity: 50, tannin: 60 },
  'bordeaux-blend':   { body: 85, sweetness: 5,  acidity: 60, tannin: 80 },
  'grenache':         { body: 65, sweetness: 15, acidity: 45, tannin: 50 },
  'mourvedre':        { body: 80, sweetness: 5,  acidity: 50, tannin: 75 },
  'cinsaut':          { body: 40, sweetness: 10, acidity: 50, tannin: 30 },
  'touriga-nacional': { body: 85, sweetness: 30, acidity: 45, tannin: 75 },
  'tinta-barroca':    { body: 75, sweetness: 25, acidity: 40, tannin: 60 },
  'chenin-blanc':     { body: 55, sweetness: 15, acidity: 70, tannin: 5 },
  'sauvignon-blanc':  { body: 35, sweetness: 5,  acidity: 85, tannin: 0 },
  'chardonnay':       { body: 60, sweetness: 10, acidity: 55, tannin: 0 },
  'semillon':         { body: 55, sweetness: 10, acidity: 45, tannin: 0 },
  'riesling':         { body: 30, sweetness: 30, acidity: 90, tannin: 0 },
  'viognier':         { body: 60, sweetness: 20, acidity: 40, tannin: 5 },
  'colombard':        { body: 25, sweetness: 5,  acidity: 80, tannin: 0 },
  'mcc':              { body: 45, sweetness: 5,  acidity: 65, tannin: 5 },
};

const TYPE_TASTE: Record<string, TasteValues> = {
  'red':       { body: 75, sweetness: 8,  acidity: 55, tannin: 65 },
  'white':     { body: 45, sweetness: 10, acidity: 70, tannin: 0 },
  'rose':      { body: 40, sweetness: 15, acidity: 65, tannin: 15 },
  'sparkling': { body: 45, sweetness: 5,  acidity: 65, tannin: 5 },
  'fortified': { body: 85, sweetness: 60, acidity: 35, tannin: 55 },
  'dessert':   { body: 75, sweetness: 80, acidity: 40, tannin: 10 },
  'orange':    { body: 55, sweetness: 15, acidity: 60, tannin: 25 },
};

export function tasteProfileForVarietal(varietalSlug: string, type?: string): TasteValues {
  return VARIETAL_TASTE[varietalSlug] ?? (type ? TYPE_TASTE[type] : TYPE_TASTE.red);
}

/** Aggregate a user's palate profile into taste values (0–100 per axis). */
export function aggregateTasteValues(notes: Array<{ palate?: { body?: string; sweetness?: string; acidity?: string; tanninLevel?: string } }>): TasteValues {
  const scale: Record<string, number> = {
    'low': 20, 'medium-minus': 35, 'medium': 50, 'medium-plus': 65, 'high': 80, 'full': 85,
    'light': 20, 'bone-dry': 5, 'dry': 10, 'off-dry': 30, 'medium-dry': 40,
    'medium-sweet': 60, 'sweet': 75, 'luscious': 90, 'na': 0,
  };
  const sums = { body: 0, sweetness: 0, acidity: 0, tannin: 0 };
  const counts = { body: 0, sweetness: 0, acidity: 0, tannin: 0 };
  for (const n of notes) {
    const p = n.palate;
    if (!p) continue;
    if (p.body && scale[p.body] != null) { sums.body += scale[p.body]; counts.body++; }
    if (p.sweetness && scale[p.sweetness] != null) { sums.sweetness += scale[p.sweetness]; counts.sweetness++; }
    if (p.acidity && scale[p.acidity] != null) { sums.acidity += scale[p.acidity]; counts.acidity++; }
    if (p.tanninLevel && scale[p.tanninLevel] != null) { sums.tannin += scale[p.tanninLevel]; counts.tannin++; }
  }
  return {
    body: counts.body > 0 ? Math.round(sums.body / counts.body) : undefined,
    sweetness: counts.sweetness > 0 ? Math.round(sums.sweetness / counts.sweetness) : undefined,
    acidity: counts.acidity > 0 ? Math.round(sums.acidity / counts.acidity) : undefined,
    tannin: counts.tannin > 0 ? Math.round(sums.tannin / counts.tannin) : undefined,
  };
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: color.canvasCard,
    borderWidth: 1,
    borderColor: color.hairline,
    borderRadius: radius.sm,
    padding: space.lg,
  },
  axisRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    marginBottom: space.md,
  },
  axisLeftLabel: {
    width: 50,
    textAlign: 'right',
  },
  axisRightLabel: {
    width: 50,
    textAlign: 'left',
  },
  barTrack: {
    flex: 1,
    height: 8,
    backgroundColor: color.canvasSoft,
    borderRadius: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  barFill: {
    position: 'absolute',
    top: 0, left: 0, bottom: 0,
    backgroundColor: color.gold,
    borderRadius: 4,
    opacity: 0.6,
  },
  barMarker: {
    position: 'absolute',
    top: -2,
    width: 12,
    height: 12,
    borderRadius: 9999,
    backgroundColor: color.gold,
    borderWidth: 2,
    borderColor: color.canvas,
    transform: [{ translateX: -6 }],
  },
});
