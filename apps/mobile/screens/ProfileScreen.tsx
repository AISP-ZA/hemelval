/**
 * Profile — user identity, live palate summary, Pro upgrade, settings.
 * Palate reads from the live store (re-derives on every tasting note).
 */

import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Eyebrow, Headline, BodyText, Card, Button, Chip, Divider } from '../components/index.js';
import { color, space } from '../theme/tokens.js';
import { aromaLabel } from '@kelder/engine';
import { usePalate } from '../hooks/usePalate.js';

export function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { profile, notes } = usePalate();

  const coldStart = profile.noteCount < 5;
  const topType = profile.topTypes[0]?.type;
  const typeLabel = topType ? (topType === 'red' ? 'structured reds' : topType === 'white' ? 'crisp whites' : topType) : null;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: color.canvas }} contentContainerStyle={{ paddingTop: insets.top + 16 }}>
      <View style={{ padding: space.xl }}>
        <Eyebrow>PROFILE</Eyebrow>
        <Headline size="xl" style={{ marginTop: space.sm }}>Guest taster.</Headline>
        <BodyText muted style={{ marginTop: space.sm }}>
          {coldStart
            ? `Taste ${5 - profile.noteCount} more wine${5 - profile.noteCount === 1 ? '' : 's'} to unlock your full palate profile.`
            : 'Your palate profile is live — recommendations are now personalized.'}
        </BodyText>
        <BodyText size="sm" muted style={{ marginTop: space.lg }}>
          Account sync (so your cellar travels between devices) lands with the full launch. For now, your tastings are saved on this device.
        </BodyText>
      </View>

      <View style={{ paddingHorizontal: space.xl }}>
        {/* Palate summary — live from engine */}
        <Card>
          <Eyebrow>YOUR PALATE // {profile.noteCount} TASTED</Eyebrow>
          {profile.noteCount === 0 ? (
            <BodyText muted style={{ marginTop: space.sm }}>
              You haven't logged a tasting yet. Scan a bottle to begin.
            </BodyText>
          ) : (
            <>
              <BodyText style={{ marginTop: space.sm }}>
                {typeLabel
                  ? `Your palate skews toward ${typeLabel} and ${profile.topVarietals[0]?.slug.replace('-', ' ') ?? 'a range of varietals'}.`
                  : 'Your palate is still taking shape.'}
              </BodyText>
              <Divider />
              {profile.topVarietals.length > 0 && (
                <View style={styles.palateBlock}>
                  <Eyebrow>FAVOURITE VARIETALS</Eyebrow>
                  <View style={styles.chipRow}>
                    {profile.topVarietals.slice(0, 6).map((v) => (
                      <Chip key={v.slug} tone="accent">{v.slug.replace('-', ' ')} · {v.avgStars.toFixed(1)}★</Chip>
                    ))}
                  </View>
                </View>
              )}
              {profile.topDescriptors.length > 0 && (
                <View style={styles.palateBlock}>
                  <Eyebrow>YOUR SIGNATURE AROMAS</Eyebrow>
                  <View style={styles.chipRow}>
                    {profile.topDescriptors.slice(0, 10).map((d) => (
                      <Chip key={d.id} tone="neutral">{aromaLabel(d.id)}</Chip>
                    ))}
                  </View>
                </View>
              )}
              <View style={styles.palateBlock}>
                <Eyebrow>STRUCTURAL PREFERENCES</Eyebrow>
                <View style={styles.prefGrid}>
                  {profile.preferredBody && <PrefCell label="BODY" value={profile.preferredBody} />}
                  {profile.preferredAcidity && <PrefCell label="ACIDITY" value={profile.preferredAcidity} />}
                  {profile.preferredTannin && <PrefCell label="TANNIN" value={profile.preferredTannin} />}
                  {profile.preferredSweetness && <PrefCell label="SWEETNESS" value={profile.preferredSweetness} />}
                </View>
              </View>
            </>
          )}
        </Card>

        {/* Pro upsell */}
        <Card style={{ marginTop: space.lg }}>
          <Eyebrow>KELDER PRO // R89/MO</Eyebrow>
          <Headline size="md" style={{ marginTop: space.sm }}>Unlock your palate's full depth.</Headline>
          <View style={{ gap: space.sm, marginTop: space.md }}>
            <BodyText size="sm">✓ Unlimited scans</BodyText>
            <BodyText size="sm">✓ Advanced palate analytics</BodyText>
            <BodyText size="sm">✓ Cellar ageability tracking</BodyText>
            <BodyText size="sm">✓ Early access to AI sommelier</BodyText>
            <BodyText size="sm">✓ Ad-free</BodyText>
          </View>
          <BodyText size="sm" muted style={{ marginTop: space.lg }}>
            Pro subscriptions activate at App Store launch. You'll keep all your tasting history.
          </BodyText>
        </Card>

        {/* About */}
        <Card style={{ marginTop: space.lg }}>
          <Eyebrow>ABOUT KELDER</Eyebrow>
          <BodyText size="sm" muted style={{ marginTop: space.md }}>
            Hemelval is built for the South African wine community — every estate, varietal, and festival of the Western Cape. Your tasting data stays on your device; nothing is shared.
          </BodyText>
          <BodyText size="sm" muted style={{ marginTop: space.sm }}>
            Photography: Unsplash & Pexels contributors. Tasting vocabulary: WSET & the Noble Wine Aroma Wheel (UC Davis).
          </BodyText>
          <BodyText size="sm" muted style={{ marginTop: space.sm }}>
            v0.1 · {profile.noteCount} tastings logged
          </BodyText>
        </Card>
        <View style={{ height: space.huge }} />
      </View>
    </ScrollView>
  );
}

function PrefCell({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.prefCell}>
      <Eyebrow>{label}</Eyebrow>
      <BodyText size="sm">{value.replace('-', ' ')}</BodyText>
    </View>
  );
}

const styles = StyleSheet.create({
  palateBlock: { marginTop: space.md },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs, marginTop: space.sm },
  prefGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.lg, marginTop: space.sm },
  prefCell: { minWidth: 90 },
});
