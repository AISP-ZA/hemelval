/**
 * SegmentedToggle — two-option pill switch.
 * Used for [List] [Map] toggle on EstateBrowseScreen.
 *
 * Grand Cru styling: gold border on active segment, hairline border on inactive.
 */

import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { color, font, radius, space } from '../theme/tokens.js';

interface SegmentedToggleProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

export function SegmentedToggle<T extends string>({ options, value, onChange }: SegmentedToggleProps<T>) {
  return (
    <View style={styles.wrap}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            hitSlop={4}
            onPress={() => onChange(opt.value)}
            style={[styles.segment, active && styles.segmentActive]}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{opt.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: color.hairline,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  segment: {
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
  },
  segmentActive: {
    backgroundColor: 'rgba(196,151,60,0.12)',
    // Inner border look via subtle gold tint
  },
  label: {
    ...font.captionMono,
    color: color.bodyMid,
    letterSpacing: 1.5,
    fontSize: 11,
  },
  labelActive: {
    color: color.gold,
  },
});
