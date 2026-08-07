/**
 * TasteProfileChart — the signature animated radar visualization.
 *
 * A 4-axis spider/radar chart showing the wine's (or user's palate's) shape:
 *
 *        BOLD (body)
 *          ╱╲
 *  TANNIC ╱  ╲ SWEET
 *        ╲  ╱
 *         ╲╱
 *       ACIDIC
 *
 * The gold polygon DRAWS ON from center → outer edge with a staggered
 * animation on mount. Gold fill at 15% opacity, gold stroke, axis dots
 * glow on arrival. Optional second profile overlay (e.g. user's palate
 * vs the wine) renders as a thinner outline.
 *
 * Uses react-native-svg (already in project) + React Native Animated (no
 * new deps). Falls back gracefully if a value is missing (that axis snaps
 * to center).
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Svg, Polygon, Circle, Line, Text as SvgText, G } from 'react-native-svg';
import { color, font, space, radius } from '../theme/tokens.js';

export interface TasteValues {
  body?: number;       // 0=light, 100=bold
  sweetness?: number;  // 0=dry, 100=sweet
  acidity?: number;    // 0=soft, 100=acidic
  tannin?: number;     // 0=smooth, 100=tannic
}

// ── Axis config — 4 axes arranged at N, E, S, W ──────────────────────────────
const AXES = [
  { key: 'body'      as const, label: 'BODY',      subLabel: 'light → bold',    angle: -Math.PI / 2 },         // top
  { key: 'sweetness' as const, label: 'SWEETNESS', subLabel: 'dry → sweet',     angle: 0 },                     // right
  { key: 'acidity'   as const, label: 'ACIDITY',   subLabel: 'soft → acidic',   angle: Math.PI / 2 },          // bottom
  { key: 'tannin'    as const, label: 'TANNIN',    subLabel: 'smooth → tannic', angle: Math.PI },              // left
];

export function TasteProfileChart({
  values,
  comparisonValues,
  label = 'TASTE PROFILE',
  compact = false,
}: {
  values: TasteValues;
  /** Optional second profile (e.g. user's palate) overlaid as a thin outline. */
  comparisonValues?: TasteValues;
  label?: string;
  compact?: boolean;
}) {
  // Animation: polygon grows from center (0%) → full size (100%) on mount
  const grow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(grow, {
      toValue: 1,
      duration: 900,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),  // ease-out
      useNativeDriver: false,  // SVG needs JS driver
      delay: 150,
    }).start();
  }, [grow]);

  const size = compact ? 220 : 260;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = compact ? 72 : 88;

  // Compute polygon points from taste values
  const pointsFor = (v: TasteValues, scaleFactor: number = 1): string => {
    return AXES.map((axis) => {
      const val = v[axis.key];
      const pct = (val != null ? Math.max(0, Math.min(100, val)) : 0) / 100;
      const r = maxR * pct * scaleFactor;
      const x = cx + Math.cos(axis.angle) * r;
      const y = cy + Math.sin(axis.angle) * r;
      return `${x},${y}`;
    }).join(' ');
  };

  // Animated polygon — grows from center
  const animatedPoints = grow.interpolate({
    inputRange: [0, 1],
    outputRange: [pointsFor(values, 0), pointsFor(values, 1)],
  });

  // Grid rings (concentric squares rotated to match axes)
  const ringPoints = (ringR: number): string => {
    return AXES.map((axis) => {
      const x = cx + Math.cos(axis.angle) * ringR;
      const y = cy + Math.sin(axis.angle) * ringR;
      return `${x},${y}`;
    }).join(' ');
  };

  return (
    <View style={styles.wrap}>
      <Text style={[font.captionMono, { color: color.bodyMid, marginBottom: space.sm }]}>
        {label}
      </Text>
      <View style={styles.chartWrap}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* ── Grid: 3 concentric rings + 4 axis spokes ── */}
          {[0.33, 0.66, 1.0].map((ring, i) => (
            <Polygon
              key={`ring-${i}`}
              points={ringPoints(maxR * ring)}
              fill="none"
              stroke={color.hairline}
              strokeWidth={1}
              opacity={i === 2 ? 0.6 : 0.35}
            />
          ))}
          {AXES.map((axis) => {
            const ex = cx + Math.cos(axis.angle) * maxR;
            const ey = cy + Math.sin(axis.angle) * maxR;
            return (
              <Line
                key={`spoke-${axis.key}`}
                x1={cx} y1={cy} x2={ex} y2={ey}
                stroke={color.hairline}
                strokeWidth={1}
                opacity={0.4}
              />
            );
          })}

          {/* ── Comparison profile (user's palate) — thin outline behind ── */}
          {comparisonValues && (
            <Polygon
              points={pointsFor(comparisonValues)}
              fill={color.gold}
              fillOpacity={0.04}
              stroke={color.gold}
              strokeOpacity={0.3}
              strokeWidth={1}
              strokeDasharray="3 3"
            />
          )}

          {/* ── Main profile polygon (animated grow) ── */}
          <AnimatedPolygon
            points={animatedPoints}
            fill={color.gold}
            fillOpacity={0.15}
            stroke={color.gold}
            strokeWidth={1.8}
            strokeLinejoin="round"
          />

          {/* ── Axis vertex dots ── */}
          {AXES.map((axis) => {
            const val = values[axis.key];
            const pct = (val != null ? Math.max(0, Math.min(100, val)) : 0) / 100;
            // We can't easily animate each dot, so render at final position
            // (the polygon growing into them creates the reveal effect)
            const r = maxR * pct;
            const x = cx + Math.cos(axis.angle) * r;
            const y = cy + Math.sin(axis.angle) * r;
            if (val == null) return null;
            return (
              <Circle
                key={`dot-${axis.key}`}
                cx={x} cy={y} r={3.5}
                fill={color.gold}
                stroke={color.canvas}
                strokeWidth={1.5}
              />
            );
          })}

          {/* ── Center dot ── */}
          <Circle cx={cx} cy={cy} r={2} fill={color.gold} opacity={0.4} />

          {/* ── Axis labels ── */}
          {AXES.map((axis) => {
            const labelR = maxR + 18;
            const x = cx + Math.cos(axis.angle) * labelR;
            const y = cy + Math.sin(axis.angle) * labelR;
            const anchor = Math.abs(Math.cos(axis.angle)) < 0.1 ? 'middle'
                         : Math.cos(axis.angle) > 0 ? 'start' : 'end';
            return (
              <G key={`label-${axis.key}`}>
                <SvgText
                  x={x} y={y}
                  fontFamily="GeistMono"
                  fontSize={9}
                  fontWeight="400"
                  letterSpacing={1}
                  fill={color.body}
                  textAnchor={anchor as 'middle' | 'start' | 'end'}
                  alignmentBaseline="central"
                >
                  {axis.label}
                </SvgText>
              </G>
            );
          })}
        </Svg>

        {/* ── Pole descriptors below the chart ── */}
        <View style={styles.polesRow}>
          {AXES.map((axis) => (
            <Text key={`pole-${axis.key}`} style={styles.poleText}>
              {axis.subLabel}
            </Text>
          ))}
        </View>

        {comparisonValues && (
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendSwatch, { backgroundColor: color.gold, opacity: 0.3 }]} />
              <Text style={styles.legendText}>THIS WINE</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendSwatch, { backgroundColor: 'transparent', borderColor: color.gold, borderWidth: 1, borderStyle: 'dashed' }]} />
              <Text style={styles.legendText}>YOUR PALATE</Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

// ── Animated SVG Polygon wrapper ─────────────────────────────────────────────
// react-native-svg's Polygon doesn't accept animated points directly, so we
// wrap it with a custom Animated component that interpolates the points string.
function AnimatedPolygon({ points, ...props }: { points: any; [key: string]: any }) {
  const PolygonAnimated = Animated.createAnimatedComponent(Polygon);
  // RN Animated can interpolate string values via useNativeDriver: false
  return <PolygonAnimated points={points} {...props} />;
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
    alignItems: 'center',
  },
  chartWrap: {
    alignItems: 'center',
    width: '100%',
  },
  polesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: space.xs,
    marginTop: space.sm,
    paddingHorizontal: space.md,
  },
  poleText: {
    fontFamily: 'GeistMono, monospace',
    fontSize: 9,
    color: color.bodyMid,
    letterSpacing: 0.5,
  },
  legendRow: {
    flexDirection: 'row',
    gap: space.lg,
    marginTop: space.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
  },
  legendSwatch: {
    width: 14, height: 14,
    borderRadius: 3,
  },
  legendText: {
    fontFamily: 'GeistMono, monospace',
    fontSize: 9,
    color: color.bodyMid,
    letterSpacing: 0.8,
  },
});
