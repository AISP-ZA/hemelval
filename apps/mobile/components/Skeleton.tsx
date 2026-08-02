/**
 * Skeleton — loading placeholders for async data fetches.
 * Shows a shimmer-free, calm skeleton state while data loads from Supabase.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { color, space, radius } from '../theme/tokens.js';

export function WineCardSkeleton() {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.thumb} />
        <View style={{ flex: 1, gap: space.xs }}>
          <View style={[styles.line, { width: '70%' }]} />
          <View style={[styles.line, { width: '50%' }]} />
          <View style={[styles.line, { width: '30%', height: 8 }]} />
        </View>
      </View>
    </View>
  );
}

export function EventCardSkeleton() {
  return (
    <View style={styles.card}>
      <View style={styles.eventCover} />
      <View style={{ padding: space.md, gap: space.xs }}>
        <View style={[styles.line, { width: '60%' }]} />
        <View style={[styles.line, { width: '40%', height: 8 }]} />
      </View>
    </View>
  );
}

export function LoadingList({ count = 5, type = 'wine' }: { count?: number; type?: 'wine' | 'event' }) {
  const Skeleton = type === 'event' ? EventCardSkeleton : WineCardSkeleton;
  return (
    <View style={{ padding: space.xl }}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: color.canvasCard,
    borderWidth: 1,
    borderColor: color.hairline,
    borderRadius: radius.sm,
    padding: space.lg,
    marginVertical: space.sm,
  },
  row: { flexDirection: 'row', gap: space.md },
  thumb: {
    width: 56, height: 72,
    borderRadius: radius.sm,
    backgroundColor: color.canvasMid,
  },
  line: {
    height: 12,
    borderRadius: 4,
    backgroundColor: color.canvasMid,
  },
  eventCover: {
    height: 140,
    backgroundColor: color.canvasMid,
    borderTopLeftRadius: radius.sm,
    borderTopRightRadius: radius.sm,
  },
});
