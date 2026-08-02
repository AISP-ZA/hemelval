/**
 * Cellar — the user's owned bottles + tasting history, read from the live palate store.
 * Every note logged via the tasting flow appears here immediately.
 */

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable, Linking, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Eyebrow, Headline, BodyText, Card, Chip, Button, Stars, Divider } from '../components/index.js';
import { color, space } from '../theme/tokens.js';
import { aromaLabel } from '@kelder/engine';
import { usePalate } from '../hooks/usePalate.js';
import { MOCK_WINES, MOCK_ESTATES, type MockEstate } from '../lib/mockData.js';
import { EstateDetailScreen } from './EstateDetailScreen.js';

export function CellarScreen() {
  const insets = useSafeAreaInsets();
  const { notes, profile, wineForNote, removeNote } = usePalate();
  const [estateView, setEstateView] = useState<MockEstate | null>(null);

  const avgRating = profile.noteCount > 0
    ? (notes.reduce((s, n) => s + n.stars, 0) / notes.length).toFixed(1)
    : '—';

  if (estateView) {
    return (
      <EstateDetailScreen
        estate={estateView}
        onBack={() => setEstateView(null)}
        onWinePress={() => { setEstateView(null); }}
      />
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: color.canvas }} contentContainerStyle={{ paddingTop: insets.top + 16 }}>
      <View style={{ padding: space.xl }}>
        <Eyebrow>YOUR CELLAR</Eyebrow>
        <Headline size="xl" style={{ marginTop: space.sm }}>{profile.noteCount} {profile.noteCount === 1 ? 'wine' : 'wines'} tasted.</Headline>

        {/* Stats */}
        <View style={styles.statRow}>
          <View style={styles.stat}>
            <Headline size="lg">{profile.noteCount}</Headline>
            <BodyText size="sm" muted>TASTED</BodyText>
          </View>
          <View style={styles.stat}>
            <Headline size="lg">{avgRating}★</Headline>
            <BodyText size="sm" muted>AVG RATING</BodyText>
          </View>
          <View style={styles.stat}>
            <Headline size="lg">{profile.topVarietals.length}</Headline>
            <BodyText size="sm" muted>VARIETALS</BodyText>
          </View>
        </View>

        {/* Palate summary — live from engine */}
        {profile.noteCount > 0 && (
          <>
            <Divider />
            <Eyebrow>YOUR PALATE // LIVE</Eyebrow>
            {profile.preferredBody && <BodyText size="sm" style={{ marginTop: space.sm }}>Preferred body: <BodyText size="sm">{profile.preferredBody.replace('-', ' ')}</BodyText></BodyText>}
            {profile.topVarietals.length > 0 && (
              <View style={styles.chipRow}>
                {profile.topVarietals.slice(0, 6).map((v) => (
                  <Chip key={v.slug} tone="accent">{v.slug.replace('-', ' ')} · {v.avgStars.toFixed(1)}★</Chip>
                ))}
              </View>
            )}
            {profile.topDescriptors.length > 0 && (
              <View style={styles.chipRow}>
                {profile.topDescriptors.slice(0, 8).map((d) => (
                  <Chip key={d.id} tone="neutral">{aromaLabel(d.id)}</Chip>
                ))}
              </View>
            )}
          </>
        )}

        <Divider />

        <Eyebrow>TASTING JOURNAL</Eyebrow>
        {notes.length === 0 ? (
          <Card style={{ marginTop: space.md }}>
            <BodyText muted>Your journal is empty. Head to the Discover or Scan tab to log your first tasting and start building your palate.</BodyText>
          </Card>
        ) : (
          notes.map((t) => {
            const wine = wineForNote(t);
            return (
              <Card key={t.id} style={styles.entry}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    <Pressable onPress={() => {
                      const e = MOCK_ESTATES.find((es) => es.id === wine?.estateId);
                      if (e) setEstateView(e);
                    }}>
                      <BodyText>
                        <Text style={{ color: color.gold }}>{wine?.name ?? 'Unknown wine'}</Text>{wine?.year ? ` ${wine.year}` : ''}
                      </BodyText>
                    </Pressable>
                    {wine && (
                      <Pressable onPress={() => {
                        const e = MOCK_ESTATES.find((es) => es.id === wine.estateId);
                        if (e) setEstateView(e);
                      }}>
                        <BodyText size="sm" muted>
                          <Text style={{ textDecorationLine: 'underline' }}>{wine.estateName}</Text>
                          {' · '}{new Date(t.tastedAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </BodyText>
                      </Pressable>
                    )}
                  </View>
                  <Stars value={t.stars} size={14} />
                </View>
                {/* Show captured aromas/flavors from the structured note */}
                {(t.nose?.aromas?.length || t.palate?.flavors?.length) ? (
                  <View style={styles.chipRowSmall}>
                    {[...(t.nose?.aromas ?? []), ...(t.palate?.flavors ?? [])].slice(0, 5).map((id) => (
                      <Chip key={id} tone="neutral">{aromaLabel(id)}</Chip>
                    ))}
                  </View>
                ) : null}
                {t.palate?.body && (
                  <BodyText size="sm" muted style={{ marginTop: space.sm }}>
                    {t.palate.body.replace('-', ' ')} body{t.palate.finish ? ` · ${t.palate.finish.replace('-', ' ')} finish` : ''}
                  </BodyText>
                )}
                {t.freeText && <BodyText size="sm" muted style={{ marginTop: space.sm }}>{t.freeText}</BodyText>}
              </Card>
            );
          })
        )}

        <View style={{ height: space.huge }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  statRow: { flexDirection: 'row', gap: space.xl, marginTop: space.xl },
  stat: { flex: 1, gap: space.xs },
  entry: { marginVertical: space.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs, marginTop: space.md },
  chipRowSmall: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs, marginTop: space.sm },
});
