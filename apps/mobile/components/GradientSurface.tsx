/**
 * GradientSurface — subtle warm-lift gradient replacing flat black on hero sections.
 *
 * Uses expo-linear-gradient (already in the project). The Extended Grand Cru
 * palette introduces a barely-lifted warm plum at the top, fading to canvas.
 * This replaces the monotony of a flat #0a0410 across every screen header
 * without losing the dark-cellar mood.
 *
 * Usage:
 *   <GradientSurface style={{ height: 400 }}>
 *     {children}
 *   </GradientSurface>
 *
 * Or as an overlay (absolute fill) behind content:
 *   <GradientSurface overlay />
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { color } from '../theme/tokens.js';

interface GradientSurfaceProps {
  children?: React.ReactNode;
  style?: any;
  /** When true, renders as an absolute-fill overlay (position: absolute). */
  overlay?: boolean;
  /** Reverse the gradient direction (for bottom-up sections). */
  reverse?: boolean;
}

export function GradientSurface({ children, style, overlay, reverse }: GradientSurfaceProps) {
  const colors = reverse
    ? [color.canvas, color.heroGradientMid, color.heroGradientTop]
    : [color.heroGradientTop, color.heroGradientMid, color.canvas];

  return (
    <LinearGradient
      colors={colors as [string, string, string]}
      style={[overlay ? StyleSheet.absoluteFillObject : {}, style]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      {children}
    </LinearGradient>
  );
}

/**
 * GradientScrim — for use over photos. Darker at bottom for text legibility,
 * with a subtle warm tint. More cinematic than a flat rgba overlay.
 */
export function GradientScrim({ style }: { style?: any }) {
  return (
    <LinearGradient
      colors={['rgba(10,4,16,0.25)', 'rgba(10,4,16,0.65)', 'rgba(10,4,16,0.90)']}
      style={[StyleSheet.absoluteFillObject, style]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    />
  );
}
