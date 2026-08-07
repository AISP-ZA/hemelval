/**
 * Kelder primitive components — AISP DESIGN.md in React Native.
 *
 * Enforces non-negotiables:
 *  - Dark canvas. Cards use hairline borders, NO drop shadows.
 *  - Pill (radius 9999) on every interactive element.
 *  - Weight-400 display. GeistMono uppercase eyebrows.
 */

import React from 'react';
import {
  View, Text, Pressable, StyleSheet, type ViewStyle, type TextStyle,
  type PressableProps, ActivityIndicator,
} from 'react-native';
import { color, font, radius, space, wineTypeColor } from '../theme/tokens.js';

// ── Eyebrow (caption-mono, the AISP section label) ──────────────────────────

export function Eyebrow({ children, style }: { children: React.ReactNode; style?: TextStyle }) {
  return <Text style={[styles.eyebrow, style]}>{children}</Text>;
}

// ── Headline (display, weight 400, negative tracking) ───────────────────────

export function Headline({ children, size = 'md', style }: {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  style?: TextStyle;
}) {
  const f = size === 'xl' ? font.displayXl : size === 'lg' ? font.displayLg : size === 'sm' ? font.displaySm : font.displayMd;
  return <Text style={[f, { color: color.ink }, style]}>{children}</Text>;
}

// ── Body text ────────────────────────────────────────────────────────────────

export function BodyText({ children, size = 'md', muted, style, numberOfLines }: {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  muted?: boolean;
  style?: TextStyle;
  numberOfLines?: number;
}) {
  const f = size === 'lg' ? font.bodyLg : size === 'sm' ? font.bodySm : font.bodyMd;
  return <Text style={[f, { color: muted ? color.bodyMid : color.body }, style]} numberOfLines={numberOfLines}>{children}</Text>;
}

// ── Card (hairline border carries elevation; NO drop shadow) ────────────────

export function Card({ children, style, onPress }: {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
}) {
  if (onPress) {
    return (
      <Pressable style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }, style]} onPress={onPress}>
        {children}
      </Pressable>
    );
  }
  return <View style={[styles.card, style]}>{children}</View>;
}

// ── Pill button (the AISP signature — every interactive element) ─────────────

export function Button({
  children, onPress, variant = 'outline', style, disabled, loading, testID,
}: {
  children: React.ReactNode;
  onPress?: PressableProps['onPress'];
  variant?: 'outline' | 'primary' | 'accent';
  style?: ViewStyle;
  disabled?: boolean;
  loading?: boolean;
  testID?: string;
}) {
  const base: ViewStyle = {
    borderRadius: radius.pill,
    paddingVertical: space.md,
    paddingHorizontal: space.xl,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    minHeight: 48,
    opacity: disabled ? 0.4 : 1,
  };
  const variants: Record<string, ViewStyle> = {
    outline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: color.hairline },
    primary: { backgroundColor: color.primary },
    accent: { backgroundColor: color.dusk },
  };
  const textColor = variant === 'primary' ? color.onPrimary : variant === 'accent' ? color.ink : color.ink;
  return (
    <Pressable
      testID={testID}
      style={({ pressed }) => [base, variants[variant], pressed && { opacity: 0.85 }, style]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : typeof children === 'string' ? (
        <Text style={[font.bodyMd, { color: textColor, fontWeight: '500' }]}>{children}</Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

// ── Chip (pill tag — varietal, pairing, aroma) ───────────────────────────────

export function Chip({ children, tone = 'neutral', style }: {
  children: React.ReactNode;
  tone?: 'neutral' | 'accent' | 'systems' | 'wine' | 'sunset';
  style?: ViewStyle;
}) {
  const tones: Record<string, { bg: string; border: string; fg: string }> = {
    neutral: { bg: 'transparent', border: color.hairline, fg: color.bodyMid },
    accent:  { bg: 'transparent', border: color.gold, fg: color.gold },
    systems: { bg: 'transparent', border: color.gold, fg: color.gold },
    wine:    { bg: 'rgba(107,18,40,0.22)', border: color.wine, fg: color.ink },
    sunset:  { bg: 'transparent', border: color.gold, fg: color.gold },
  };
  const t = tones[tone];
  return (
    <View style={[styles.chip, { backgroundColor: t.bg, borderColor: t.border }, style]}>
      <Text style={[font.captionMonoSm, { color: t.fg }]}>{children}</Text>
    </View>
  );
}

// ── Star rating display ──────────────────────────────────────────────────────

export function Stars({ value, count, size = 14 }: { value: number; count?: number; size?: number }) {
  // value === 0 means "not yet rated" in the live DB — show honest label, not fake stars
  if (!value || value === 0) {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
        <Text style={{ color: color.bodyMid, fontSize: size, fontWeight: '400' }}>☆☆☆☆☆</Text>
        <Text style={[font.captionMonoSm, { color: color.bodyMid }]}>Not yet rated</Text>
      </View>
    );
  }
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  const stars = '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - (half ? 1 : 0));
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
      <Text style={{ color: color.sunset, fontSize: size, fontWeight: '600' }}>{stars}</Text>
      {count != null && count > 0 && <Text style={[font.captionMonoSm, { color: color.bodyMid }]}>{value.toFixed(1)} · {count}</Text>}
    </View>
  );
}

// ── Section divider ──────────────────────────────────────────────────────────

export function Divider({ style }: { style?: ViewStyle }) {
  return <View style={[{ height: 1, backgroundColor: color.hairline, marginVertical: space.lg }, style]} />;
}

// ── Match score badge ────────────────────────────────────────────────────────

export function MatchBadge({ score, wineType }: { score: number; wineType?: string }) {
  // Tiered colour: strong matches get the wine-type spectrum colour,
  // mid matches get gold, weak matches stay muted.
  const typeCol = wineType ? wineTypeColor(wineType) : color.gold;
  const tone = score >= 60 ? typeCol : score >= 40 ? color.gold : color.mute;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xs }}>
      <Text style={[font.captionMonoSm, { color: tone }]}>{score}% MATCH</Text>
      <View style={{ width: 40, height: 3, backgroundColor: color.canvasMid, borderRadius: 2 }}>
        <View style={{ width: `${score}%`, height: 3, backgroundColor: tone, borderRadius: 2 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    ...font.captionMono,
    color: color.bodyMid,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: color.canvasCard,
    borderWidth: 1,
    borderColor: color.cardBorder,
    borderRadius: radius.sm,
    padding: space.xl,
    // NO shadow — cardBorder (white overtone) + hairline carry elevation
  },
  chip: {
    borderRadius: radius.pill,
    paddingVertical: space.xs,
    paddingHorizontal: space.md,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
});
