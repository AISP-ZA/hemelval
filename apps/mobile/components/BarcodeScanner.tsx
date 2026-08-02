/**
 * BarcodeScanner — live camera barcode/QR scanner using react-zxing (ZXing WASM).
 *
 * Streams the device camera to a <video> element and decodes barcodes (EAN-13,
 * UPC-A, QR, etc.) client-side via WebAssembly. Zero API cost, zero network
 * round-trip for the scan itself.
 *
 * Design: dark viewfinder with gold scan-line animation (per DESIGN.md
 * .aisp-scan-line pattern). Pill button to toggle torch. Manual entry fallback.
 *
 * Usage:
 *   <BarcodeScanner onDetected={(text, format) => lookupBarcode(text)} />
 */

import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator, TextInput, Platform } from 'react-native';
import { useZxing } from 'react-zxing';
import { color, font, radius, space } from '../theme/tokens.js';

export interface BarcodeScannerProps {
  /** Called when a barcode/QR is successfully decoded */
  onDetected: (result: { text: string; format: string }) => void;
  /** Called when the user enters a code manually */
  onManualEntry?: (text: string) => void;
  /** Show manual entry fallback below the camera */
  showManualEntry?: boolean;
  /** Label for the manual entry placeholder */
  manualPlaceholder?: string;
}

export function BarcodeScanner({
  onDetected,
  onManualEntry,
  showManualEntry = true,
  manualPlaceholder = 'Enter barcode manually…',
}: BarcodeScannerProps) {
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [manualText, setManualText] = useState('');
  const [torchOn, setTorchOn] = useState(false);

  const { ref, torch } = useZxing({
    constraints: { video: { facingMode: 'environment' } },
    timeBetweenDecodingAttempts: 300,
    trySkew: true, // Retry with rotation for skewed EAN-13 barcodes
    onDecodeResult: (result) => {
      if (result?.rawValue) {
        onDetected({ text: result.rawValue, format: result.format ?? 'unknown' });
      }
    },
    onDecodeError: () => { /* Ignore individual decode failures — normal during scanning */ },
    onError: (err) => {
      console.warn('[BarcodeScanner] camera error:', err);
      if (String(err).includes('Permission') || String(err).includes('NotAllowed')) {
        setPermissionDenied(true);
      }
    },
  });

  const toggleTorch = useCallback(async () => {
    if (torch.isAvailable) {
      if (torchOn) { await torch.off(); setTorchOn(false); }
      else { await torch.on(); setTorchOn(true); }
    }
  }, [torch, torchOn]);

  // ── Permission denied state ────────────────────────────────────────────
  if (permissionDenied) {
    return (
      <View style={styles.container}>
        <View style={styles.deniedBox}>
          <Text style={[font.bodyMd, { color: color.body, textAlign: 'center' }]}>
            Camera access denied
          </Text>
          <Text style={[font.captionMonoSm, { color: color.bodyMid, textAlign: 'center', marginTop: space.sm }]}>
            Allow camera access in your browser settings, or enter the barcode manually below.
          </Text>
        </View>
        {showManualEntry && <ManualEntry />}
      </View>
    );
  }

  // ── Camera viewfinder ─────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      {/* Web-only: the video element that react-zxing streams to */}
      {Platform.OS === 'web' ? (
        <View style={styles.viewfinder}>
          <video
            ref={ref as any}
            style={styles.video}
            muted
            playsInline
            autoPlay
          />
          {/* Scan-line overlay */}
          <View style={styles.scanOverlay}>
            <View style={styles.scanFrame}>
              <View style={styles.scanLine} />
            </View>
          </View>

          {/* Torch toggle */}
          {torch.isAvailable && (
            <Pressable
              style={[styles.torchButton, torchOn && { backgroundColor: color.gold }]}
              onPress={toggleTorch}
              hitSlop={8}
            >
              <Text style={[font.captionMonoSm, { color: torchOn ? color.onPrimary : color.body }]}>
                {torchOn ? 'ON' : 'TORCH'}
              </Text>
            </Pressable>
          )}
        </View>
      ) : (
        // Native fallback — camera requires native module setup
        <View style={styles.viewfinder}>
          <View style={styles.nativeFallback}>
            <Text style={[font.bodyMd, { color: color.body, textAlign: 'center' }]}>
              Camera scanning requires the native app
            </Text>
            <Text style={[font.captionMonoSm, { color: color.bodyMid, textAlign: 'center', marginTop: space.sm }]}>
              Enter the barcode manually below.
            </Text>
          </View>
        </View>
      )}

      {showManualEntry && <ManualEntry />}
    </View>
  );

  function ManualEntry() {
    return (
      <View style={styles.manualRow}>
        <TextInput
          style={styles.manualInput}
          placeholder={manualPlaceholder}
          placeholderTextColor={color.bodyMid}
          value={manualText}
          onChangeText={setManualText}
          keyboardType="numeric"
          onSubmitEditing={() => {
            if (manualText.trim()) onManualEntry?.(manualText.trim());
          }}
        />
        <Pressable
          style={styles.manualButton}
          onPress={() => {
            if (manualText.trim()) onManualEntry?.(manualText.trim());
          }}
        >
          <Text style={[font.captionMonoSm, { color: color.onPrimary }]}>LOOK UP</Text>
        </Pressable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    gap: space.lg,
  },
  viewfinder: {
    width: '100%',
    aspectRatio: 3 / 4,
    backgroundColor: '#000',
    borderRadius: radius.sm,
    overflow: 'hidden',
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as any,
  },
  scanOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: '70%',
    height: 120,
    borderWidth: 2,
    borderColor: color.gold,
    borderRadius: radius.sm,
    position: 'relative',
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    height: 2,
    backgroundColor: color.gold,
    shadowColor: color.gold,
    shadowOpacity: 0.8,
    shadowRadius: 4,
    // Note: this is a static line. A CSS animation would sweep it,
    // but React Native doesn't support CSS keyframes. On web export,
    // the <video> element's native camera feed provides visual feedback.
  },
  torchButton: {
    position: 'absolute',
    bottom: space.md,
    right: space.md,
    backgroundColor: 'rgba(36,27,24,0.8)',
    borderRadius: radius.pill,
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
    borderWidth: 1,
    borderColor: color.cardBorderStrong,
  },
  deniedBox: {
    padding: space.xl,
    alignItems: 'center',
    backgroundColor: color.canvasSoft,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: color.hairline,
  },
  nativeFallback: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    padding: space.xl,
  },
  manualRow: {
    flexDirection: 'row',
    gap: space.sm,
  },
  manualInput: {
    flex: 1,
    backgroundColor: color.canvasSoft,
    borderWidth: 1,
    borderColor: color.hairline,
    borderRadius: radius.pill,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    color: color.ink,
    fontSize: 16,
  },
  manualButton: {
    backgroundColor: color.gold,
    borderRadius: radius.pill,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
