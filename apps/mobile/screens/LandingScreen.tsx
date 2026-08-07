/**
 * LandingScreen — the web visitor's first impression.
 *
 * A premium marketing surface that showcases what Decanta offers before the
 * visitor enters the app. Only shown on web to first-time visitors. On native,
 * the app goes straight to onboarding (the app store listing is the landing page).
 *
 * Sections: hero → feature grid → stats → CTA → enter app.
 */

import React from 'react';
import { View, ScrollView, Text, Pressable, StyleSheet, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { color, font, space, radius } from '../theme/tokens.js';
import { HERO_VINEYARD } from '../lib/imagery.js';

export function LandingScreen({ onEnter }: { onEnter: () => void }) {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView style={styles.wrap} contentContainerStyle={{ paddingBottom: insets.bottom + 60 }}>
      {/* ── Hero ── */}
      <View style={styles.hero}>
        <Image source={{ uri: HERO_VINEYARD.url }} style={styles.heroImg} resizeMode="cover" />
        <LinearGradient
          colors={['rgba(10,4,16,0.3)', 'rgba(10,4,16,0.7)', color.canvas]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={[styles.heroContent, { paddingTop: insets.top + 60 }]}>
          <Text style={styles.wordmark}>DECANTA</Text>
          <Text style={styles.heroEyebrow}>SOUTH AFRICAN WINE · WESTERN CAPE</Text>
          <Text style={styles.heroHeadline}>
            Scan. Taste.{'\n'}Discover your palate.
          </Text>
          <Text style={styles.heroSub}>
            The go-to app for South African wine lovers. Photograph any bottle, log your tasting, and let Decanta learn what you love.
          </Text>
          <Pressable onPress={onEnter} style={styles.ctaPrimary}>
            <Text style={styles.ctaPrimaryText}>ENTER THE CELLAR →</Text>
          </Pressable>
        </View>
      </View>

      {/* ── Stats strip ── */}
      <View style={styles.statsRow}>
        <View style={styles.statCell}>
          <Text style={styles.statValue}>155</Text>
          <Text style={styles.statLabel}>WINES</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statCell}>
          <Text style={styles.statValue}>90</Text>
          <Text style={styles.statLabel}>ESTATES</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statCell}>
          <Text style={styles.statValue}>36</Text>
          <Text style={styles.statLabel}>EVENTS</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statCell}>
          <Text style={styles.statValue}>15+</Text>
          <Text style={styles.statLabel}>REGIONS</Text>
        </View>
      </View>

      {/* ── Features ── */}
      <View style={styles.section}>
        <Text style={styles.sectionHeading}>Built for the Cape wine lover.</Text>

        <View style={styles.featureRow}>
          <View style={styles.featureIcon}>
            <Text style={styles.featureIconText}>⊙</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.featureTitle}>Scan any bottle</Text>
            <Text style={styles.featureBody}>
              Photograph a label or scan its barcode. AI identifies the wine, producer, and vintage — instantly.
            </Text>
          </View>
        </View>

        <View style={styles.featureRow}>
          <View style={styles.featureIcon}>
            <Text style={styles.featureIconText}>★</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.featureTitle}>Log a proper tasting</Text>
            <Text style={styles.featureBody}>
              Guided by WSET-trained vocabulary — nose, palate, body, tannin. Not just a star rating. A real tasting note.
            </Text>
          </View>
        </View>

        <View style={styles.featureRow}>
          <View style={styles.featureIcon}>
            <Text style={styles.featureIconText}>◎</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.featureTitle}>Build your palate profile</Text>
            <Text style={styles.featureBody}>
              Every note sharpens Decanta's understanding of your taste. Get match scores on wines you haven't tried yet.
            </Text>
          </View>
        </View>

        <View style={styles.featureRow}>
          <View style={styles.featureIcon}>
            <Text style={styles.featureIconText}>⌖</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.featureTitle}>Find wineries near you</Text>
            <Text style={styles.featureBody}>
              From Stellenbosch to the Swartland, Constantia to Calitzdorp — discover Western Cape estates, their stories, and their tasting rooms.
            </Text>
          </View>
        </View>

        <View style={styles.featureRow}>
          <View style={styles.featureIcon}>
            <Text style={styles.featureIconText}>▤</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.featureTitle}>Stories from the Cape</Text>
            <Text style={styles.featureBody}>
              Winemaker profiles, heritage stories, and the people shaping the future of South African wine.
            </Text>
          </View>
        </View>
      </View>

      {/* ── Bottom CTA ── */}
      <View style={styles.bottomCta}>
        <Text style={styles.bottomHeadline}>Your cellar awaits.</Text>
        <Text style={styles.bottomSub}>
          Free to explore. No account needed to browse wines, estates, and stories.
        </Text>
        <Pressable onPress={onEnter} style={styles.ctaPrimaryLarge}>
          <Text style={styles.ctaPrimaryText}>ENTER THE CELLAR →</Text>
        </Pressable>
        <Text style={styles.bottomFootnote}>
          Works on your phone — add to home screen for the full experience.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: color.canvas },
  // ── Hero ──
  hero: {
    height: 520,
    position: 'relative',
    justifyContent: 'flex-end',
  },
  heroImg: {
    ...StyleSheet.absoluteFillObject,
  },
  heroContent: {
    padding: space.xl,
    paddingBottom: space.xxl,
  },
  wordmark: {
    fontFamily: 'CormorantGaramond',
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: 8,
    color: color.gold,
    marginBottom: space.md,
  },
  heroEyebrow: {
    fontFamily: 'GeistMono',
    fontSize: 10,
    fontWeight: '400',
    letterSpacing: 2,
    color: color.body,
    marginBottom: space.sm,
  },
  heroHeadline: {
    fontFamily: 'CormorantGaramond',
    fontSize: 44,
    fontWeight: '400',
    color: color.ink,
    lineHeight: 50,
    letterSpacing: -1.2,
    marginBottom: space.md,
  },
  heroSub: {
    fontFamily: 'Inter',
    fontSize: 16,
    color: color.body,
    lineHeight: 24,
    maxWidth: 340,
    marginBottom: space.xl,
  },
  ctaPrimary: {
    alignSelf: 'flex-start',
    backgroundColor: color.gold,
    borderRadius: radius.pill,
    paddingHorizontal: space.xl,
    paddingVertical: space.md,
  },
  ctaPrimaryLarge: {
    alignSelf: 'center',
    backgroundColor: color.gold,
    borderRadius: radius.pill,
    paddingHorizontal: space.xxl + space.md,
    paddingVertical: space.lg,
    marginTop: space.lg,
  },
  ctaPrimaryText: {
    fontFamily: 'GeistMono',
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: 1.5,
    color: color.canvas,
  },
  // ── Stats ──
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: space.xl,
    paddingHorizontal: space.lg,
    gap: space.lg,
  },
  statCell: { alignItems: 'center' },
  statValue: {
    fontFamily: 'CormorantGaramond',
    fontSize: 32,
    fontWeight: '400',
    color: color.gold,
    lineHeight: 36,
  },
  statLabel: {
    fontFamily: 'GeistMono',
    fontSize: 9,
    fontWeight: '400',
    letterSpacing: 1.2,
    color: color.bodyMid,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: color.hairline,
  },
  // ── Features ──
  section: {
    paddingHorizontal: space.xl,
    paddingVertical: space.xxl,
  },
  sectionHeading: {
    fontFamily: 'CormorantGaramond',
    fontSize: 30,
    fontWeight: '400',
    color: color.ink,
    letterSpacing: -0.5,
    lineHeight: 34,
    marginBottom: space.xl,
  },
  featureRow: {
    flexDirection: 'row',
    gap: space.md,
    marginBottom: space.xl,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: color.hairline,
    backgroundColor: color.canvasSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureIconText: {
    fontSize: 20,
    color: color.gold,
  },
  featureTitle: {
    fontFamily: 'CormorantGaramond',
    fontSize: 22,
    fontWeight: '400',
    color: color.ink,
    lineHeight: 26,
    marginBottom: space.xs,
  },
  featureBody: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: color.body,
    lineHeight: 21,
  },
  // ── Bottom CTA ──
  bottomCta: {
    paddingHorizontal: space.xl,
    paddingVertical: space.xxl + space.xl,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: color.hairline,
  },
  bottomHeadline: {
    fontFamily: 'CormorantGaramond',
    fontSize: 28,
    fontWeight: '400',
    color: color.ink,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  bottomSub: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: color.body,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: space.sm,
    maxWidth: 320,
  },
  bottomFootnote: {
    fontFamily: 'GeistMono',
    fontSize: 9,
    letterSpacing: 1,
    color: color.bodyMid,
    marginTop: space.xl,
  },
});
