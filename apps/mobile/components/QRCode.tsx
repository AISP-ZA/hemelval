/**
 * Kelder QRCode — renders a REAL functional QR code (encodes actual data)
 * on both native (react-native-qrcode-svg) and web (qrcode.react).
 *
 * Uses Platform.select so the right library runs on each target:
 *  - Native: react-native-qrcode-svg (SVG, supports color + logo)
 *  - Web: qrcode.react's QRCodeSVG (reliable DOM SVG)
 *
 * Used for estate "scan to save" codes, wine "scan to rate" codes, and
 * event check-in codes — all encoding real URLs/IDs.
 */

import React from 'react';
import { Platform, View, type ViewStyle } from 'react-native';

export function QRCode({
  value,
  size = 120,
  color = '#241b18',
  backgroundColor = '#ece4d8',
  style,
}: {
  value: string;
  size?: number;
  color?: string;
  backgroundColor?: string;
  style?: ViewStyle;
}) {
  if (Platform.OS === 'web') {
    // Web: qrcode.react's QRCodeSVG
    const { QRCodeSVG } = require('qrcode.react');
    return (
      <View style={[{ padding: 8, backgroundColor, borderRadius: 4 }, style]}>
        <QRCodeSVG value={value} size={size} fgColor={color} bgColor={backgroundColor} level="M" />
      </View>
    );
  }
  // Native: react-native-qrcode-svg
  const QRCodeSvg = require('react-native-qrcode-svg').default;
  return (
    <View style={[{ padding: 8, backgroundColor, borderRadius: 4 }, style]}>
      <QRCodeSvg value={value} size={size} color={color} backgroundColor={backgroundColor} />
    </View>
  );
}
