/**
 * Tab bar icon component — pure SVG, no native dependencies.
 * Replaces @expo/vector-icons Ionicons (which breaks on web export).
 *
 * Each icon is a simple, clean outline/filled pair drawn with SVG paths.
 * 24×24 viewport, stroke-based, matching SF Symbols weight.
 */

import React from 'react';
import { Svg, Path } from 'react-native-svg';

interface IconProps {
  size?: number;
  color: string;
  focused: boolean;
}

const stroke = (color: string) => ({
  stroke: color,
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  fill: 'none' as const,
});

const fill = (color: string) => ({ fill: color });

export function DiscoverIcon({ size = 24, color, focused }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {focused ? (
        <Path {...fill(color)} d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 4l6.5 12.5h-13L12 6z" />
      ) : (
        <Path {...stroke(color)} d="M12 3l7 15.5H5L12 3zM12 3v2M9.5 18.5l-1.5 2M14.5 18.5l1.5 2" />
      )}
    </Svg>
  );
}

export function ScanIcon({ size = 24, color, focused }: IconProps) {
  const s = stroke(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path {...s} d="M4 8V5a1 1 0 011-1h3M16 4h3a1 1 0 011 1v3M20 16v3a1 1 0 01-1 1h-3M8 20H5a1 1 0 01-1-1v-3" />
      <Path {...s} d="M4 12h16" />
    </Svg>
  );
}

export function CellarIcon({ size = 24, color, focused }: IconProps) {
  const s = stroke(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {/* Wine glass outline */}
      <Path {...s} d="M7 3h10l-1 6a4 4 0 01-8 0L7 3z" />
      <Path {...s} d="M12 13v6M9 21h6" />
    </Svg>
  );
}

export function EventsIcon({ size = 24, color, focused }: IconProps) {
  const s = stroke(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path {...s} d="M4 6a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V6z" />
      <Path {...s} d="M4 10h16M8 3v4M16 3v4" />
      {focused && <Path {...fill(color)} d="M8 13h2v2H8zM14 13h2v2h-2z" />}
    </Svg>
  );
}

export function ProfileIcon({ size = 24, color, focused }: IconProps) {
  const s = stroke(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path {...s} d="M12 12a4 4 0 100-8 4 4 0 000 8z" />
      <Path {...s} d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
    </Svg>
  );
}

export function LearnIcon({ size = 24, color, focused }: IconProps) {
  const s = stroke(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {/* Open book — academy mark */}
      <Path {...s} d="M12 6c-1.5-1.2-4-2-7-2v13c3 0 5.5.8 7 2 1.5-1.2 4-2 7-2V4c-3 0-5.5.8-7 2z" />
      <Path {...s} d="M12 6v13" />
      {focused && <Path {...fill(color)} d="M9 9.5c-1.2-.3-2.5-.4-4-.4v.8c1.5 0 2.8.1 4 .4v-.8zM15 9.5c1.2-.3 2.5-.4 4-.4v.8c-1.5 0-2.8.1-4 .4v-.8z" />}
    </Svg>
  );
}
