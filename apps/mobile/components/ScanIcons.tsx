/**
 * ScanIcons — stroke-based SVG icons for the Scan screen's three capture paths.
 *
 * Matches the TabIcons style: 24×24 viewport, stroke-based, no fill, weight 1.8,
 * rounded caps. Pure SVG via react-native-svg (no @expo/vector-icons — that
 * breaks on web export). Consistent iconography so the scan hub reads as a
 * deliberate set, not emoji + box-drawing fallbacks.
 */

import React from 'react';
import { Svg, Path, Rect, Line } from 'react-native-svg';

interface IconProps {
  size?: number;
  color: string;
}

const stroke = (color: string, width = 1.8) => ({
  stroke: color,
  strokeWidth: width,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  fill: 'none' as const,
});

/** Camera — for "photograph the label" (AI label read). */
export function CameraIcon({ size = 24, color }: IconProps) {
  const s = stroke(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {/* Body */}
      <Path {...s} d="M3 8a2 2 0 012-2h2.5l1.2-1.8a1 1 0 01.8-.4h4.6a1 1 0 01.8.4L18.5 6H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
      {/* Lens */}
      <Path {...s} d="M12 16.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z" />
    </Svg>
  );
}

/** Barcode — vertical bars of varying widths inside a frame. */
export function BarcodeIcon({ size = 24, color }: IconProps) {
  const s = stroke(color);
  const bar = (x: number, w: number) => (
    <Line {...s} x1={x} y1={8} x2={x} y2={16} strokeWidth={w} />
  );
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {/* Scan corners (frame hint) */}
      <Path {...s} d="M4 7V5.5A1.5 1.5 0 015.5 4H7M17 4h1.5A1.5 1.5 0 0120 5.5V7M20 17v1.5a1.5 1.5 0 01-1.5 1.5H17M7 20H5.5A1.5 1.5 0 014 18.5V17" />
      {/* Bars */}
      {bar(8, 1.6)}
      {bar(10.5, 1)}
      {bar(12.5, 2)}
      {bar(15, 1)}
      {bar(16.5, 1.6)}
    </Svg>
  );
}

/** QR code — three finder squares + a few data dots. */
export function QrIcon({ size = 24, color }: IconProps) {
  const s = stroke(color);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {/* Top-left finder */}
      <Rect {...s} x={4} y={4} width={5} height={5} rx={0.6} />
      <Rect {...stroke(color, 1.2)} x={5.6} y={5.6} width={1.8} height={1.8} rx={0.2} />
      {/* Top-right finder */}
      <Rect {...s} x={15} y={4} width={5} height={5} rx={0.6} />
      <Rect {...stroke(color, 1.2)} x={16.6} y={5.6} width={1.8} height={1.8} rx={0.2} />
      {/* Bottom-left finder */}
      <Rect {...s} x={4} y={15} width={5} height={5} rx={0.6} />
      <Rect {...stroke(color, 1.2)} x={5.6} y={16.6} width={1.8} height={1.8} rx={0.2} />
      {/* Data modules */}
      <Rect {...stroke(color, 1.2)} x={11} y={4} width={2} height={2} />
      <Rect {...stroke(color, 1.2)} x={11} y={11} width={2} height={2} />
      <Rect {...stroke(color, 1.2)} x={15} y={11} width={2} height={2} />
      <Rect {...stroke(color, 1.2)} x={11} y={15} width={2} height={2} />
      <Rect {...stroke(color, 1.2)} x={15} y={15} width={2} height={2} />
      <Rect {...stroke(color, 1.2)} x={18} y={15} width={2} height={2} />
      <Rect {...stroke(color, 1.2)} x={18} y={18} width={2} height={2} />
      <Rect {...stroke(color, 1.2)} x={15} y={18} width={2} height={2} />
      <Rect {...stroke(color, 1.2)} x={11} y={18} width={2} height={2} />
    </Svg>
  );
}
