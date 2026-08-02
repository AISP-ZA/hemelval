/**
 * StarPicker — interactive 0.5–5 star rating input.
 * Tap a star to set the rating (whole-star taps); a half-star toggle appears
 * on the selected star so users can express 4.5 etc. Conforms to
 * @kelder/engine STAR_MIN/STAR_MAX/STAR_STEP via isValidStars.
 */

import React, { useState } from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { color, font, space } from '../theme/tokens.js';
import { isValidStars, STAR_MAX } from '@kelder/engine';

export function StarPicker({
  value,
  onChange,
  size = 36,
}: {
  value: number;
  onChange: (stars: number) => void;
  size?: number;
}) {
  const [halfToggle, setHalfToggle] = useState<number | null>(null);

  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map((pos) => {
        const filled = value >= pos;
        const half = value >= pos - 0.5 && value < pos;
        return (
          <Pressable
            key={pos}
            onPress={() => {
              // Tap the current whole-star value → toggle half on repeated taps
              let next = pos;
              if (value === pos && halfToggle === pos) {
                next = pos - 0.5; // drop to half
                setHalfToggle(null);
              } else if (value === pos) {
                setHalfToggle(pos); // arm half-toggle for next tap
              } else {
                setHalfToggle(null);
              }
              if (isValidStars(next)) onChange(next);
            }}
            style={[styles.starBtn, { width: size + 8, height: size + 8 }]}
            accessibilityRole="button"
            accessibilityLabel={`${pos} star${pos > 1 ? 's' : ''}`}
            hitSlop={4}
          >
            <Text
              style={{
                fontSize: size,
                lineHeight: size + 2,
                color: filled || half ? color.sunset : color.canvasMid,
                textAlign: 'center',
              }}
            >
              {filled ? '★' : half ? '⯨' : '☆'}
            </Text>
          </Pressable>
        );
      })}
      <View style={styles.valueWrap}>
        <View style={styles.valueBarOuter}>
          <View style={[styles.valueBarInner, { width: `${(value / STAR_MAX) * 100}%` }]} />
        </View>
        <Text style={[font.captionMonoSm, { color: color.bodyMid }]}>
          {value.toFixed(1)} / 5.0
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: space.xs },
  starBtn: { justifyContent: 'center', alignItems: 'center' },
  valueWrap: { marginLeft: space.md, gap: space.xs, minWidth: 90 },
  valueBarOuter: { height: 3, backgroundColor: color.canvasMid, borderRadius: 2, overflow: 'hidden' },
  valueBarInner: { height: 3, backgroundColor: color.sunset, borderRadius: 2 },
});
