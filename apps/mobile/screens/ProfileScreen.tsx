/**
 * Profile — user identity (live Supabase Auth), palate summary, Pro, about.
 *
 * When guest: shows sign-up / sign-in form.
 * When logged in: shows display name, email, palate, Pro upsell, sign-out.
 */

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TextInput, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Eyebrow, Headline, BodyText, Card, Button, Chip, Divider } from '../components/index.js';
import { TasteProfileChart, aggregateTasteValues } from '../components/TasteProfileChart.js';
import { color, font, space, radius } from '../theme/tokens.js';
import { aromaLabel } from '@kelder/engine';
import { usePalate } from '../hooks/usePalate.js';
import { useAuth } from '../hooks/useAuth.js';

export function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { profile: palateProfile, notes } = usePalate();
  const { profile, isRegistered, register, signIn, signOut, authError } = useAuth();

  // Auth form state
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const coldStart = palateProfile.noteCount < 5;
  const topType = palateProfile.topTypes[0]?.type;
  const typeLabel = topType ? (topType === 'red' ? 'structured reds' : topType === 'white' ? 'crisp whites' : topType) : null;

  async function handleAuth() {
    setError(null);
    setBusy(true);
    const result = mode === 'signup'
      ? await register(email, password, name || undefined)
      : await signIn(email, password);
    setBusy(false);
    if (!result.ok) setError(result.error ?? 'Something went wrong');
  }

  // ── Guest: show auth form ──────────────────────────────────────────────
  if (!isRegistered) {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: color.canvas }} contentContainerStyle={{ paddingTop: insets.top + 16 }}>
        <View style={{ padding: space.xl }}>
          <Eyebrow>JOIN HEMELVAL</Eyebrow>
          <Headline size="xl" style={{ marginTop: space.sm }}>
            {mode === 'signup' ? 'Create your cellar.' : 'Welcome back.'}
          </Headline>
          <BodyText muted style={{ marginTop: space.sm }}>
            {mode === 'signup'
              ? 'Sign up to save your tastings, sync your cellar across devices, and get personalized wine recommendations.'
              : 'Sign in to access your tasting history and palate profile.'}
          </BodyText>

          {mode === 'signup' && (
            <View style={{ marginTop: space.xl }}>
              <Eyebrow>NAME (OPTIONAL)</Eyebrow>
              <TextInput
                style={styles.input}
                placeholder="Your name"
                placeholderTextColor={color.bodyMid}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>
          )}

          <View style={{ marginTop: space.md }}>
            <Eyebrow>EMAIL</Eyebrow>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor={color.bodyMid}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={{ marginTop: space.md }}>
            <Eyebrow>PASSWORD</Eyebrow>
            <TextInput
              style={styles.input}
              placeholder="At least 6 characters"
              placeholderTextColor={color.bodyMid}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {(error || authError) && (
            <View style={styles.errorBox}>
              <Text style={[font.captionMonoSm, { color: color.crit }]}>⚠ {error || authError}</Text>
            </View>
          )}

          <Button variant="primary" style={{ marginTop: space.lg }} onPress={handleAuth} disabled={busy || !email || !password}>
            {busy ? 'PLEASE WAIT…' : mode === 'signup' ? 'CREATE ACCOUNT' : 'SIGN IN'}
          </Button>

          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: space.sm, marginTop: space.lg }}>
            <BodyText size="sm" muted>
              {mode === 'signup' ? 'Already have an account?' : "Don't have one yet?"}
            </BodyText>
            <Pressable hitSlop={8} onPress={() => { setMode(mode === 'signup' ? 'login' : 'signup'); setError(null); }}>
              <Text style={[font.captionMonoSm, { color: color.gold, textDecorationLine: 'underline' }]}>
                {mode === 'signup' ? 'SIGN IN' : 'SIGN UP'}
              </Text>
            </Pressable>
          </View>

          <BodyText size="sm" muted style={{ marginTop: space.xl, textAlign: 'center' }}>
            You can browse wines, estates, and events without an account.
            Sign up when you want to start building your palate.
          </BodyText>
        </View>
      </ScrollView>
    );
  }

  // ── Logged in: show profile ────────────────────────────────────────────
  return (
    <ScrollView style={{ flex: 1, backgroundColor: color.canvas }} contentContainerStyle={{ paddingTop: insets.top + 16 }}>
      <View style={{ padding: space.xl }}>
        <Eyebrow>YOUR PROFILE</Eyebrow>
        <Headline size="xl" style={{ marginTop: space.sm }}>{profile.displayName || 'Wine lover'}</Headline>
        <BodyText muted size="sm" style={{ marginTop: space.xs }}>{profile.email}</BodyText>
        {profile.isPro && <Chip tone="systems" style={{ marginTop: space.sm }}>✓ HEMELVAL PRO</Chip>}
      </View>

      <View style={{ paddingHorizontal: space.xl }}>
        {/* Palate summary */}
        <Card>
          <Eyebrow>YOUR PALATE // {palateProfile.noteCount} TASTED</Eyebrow>
          {palateProfile.noteCount === 0 ? (
            <BodyText muted style={{ marginTop: space.sm }}>
              You haven't logged a tasting yet. Scan a bottle to begin.
            </BodyText>
          ) : (
            <>
              <BodyText style={{ marginTop: space.sm }}>
                {typeLabel
                  ? `Your palate skews toward ${typeLabel} and ${palateProfile.topVarietals[0]?.slug.replace('-', ' ') ?? 'a range of varietals'}.`
                  : 'Your palate is still taking shape.'}
              </BodyText>
              <Divider />
              {palateProfile.topVarietals.length > 0 && (
                <View style={styles.palateBlock}>
                  <Eyebrow>FAVOURITE VARIETALS</Eyebrow>
                  <View style={styles.chipRow}>
                    {palateProfile.topVarietals.slice(0, 6).map((v) => (
                      <Chip key={v.slug} tone="accent">{v.slug.replace('-', ' ')} · {v.avgStars.toFixed(1)}★</Chip>
                    ))}
                  </View>
                </View>
              )}
              {palateProfile.topDescriptors.length > 0 && (
                <View style={styles.palateBlock}>
                  <Eyebrow>YOUR SIGNATURE AROMAS</Eyebrow>
                  <View style={styles.chipRow}>
                    {palateProfile.topDescriptors.slice(0, 10).map((d) => (
                      <Chip key={d.id} tone="neutral">{aromaLabel(d.id)}</Chip>
                    ))}
                  </View>
                </View>
              )}
              <View style={styles.palateBlock}>
                <Eyebrow>STRUCTURAL PREFERENCES</Eyebrow>
                <View style={styles.prefGrid}>
                  {palateProfile.preferredBody && <PrefCell label="BODY" value={palateProfile.preferredBody} />}
                  {palateProfile.preferredAcidity && <PrefCell label="ACIDITY" value={palateProfile.preferredAcidity} />}
                  {palateProfile.preferredTannin && <PrefCell label="TANNIN" value={palateProfile.preferredTannin} />}
                  {palateProfile.preferredSweetness && <PrefCell label="SWEETNESS" value={palateProfile.preferredSweetness} />}
                </View>
              </View>
              {/* Taste profile chart — aggregate of user's rated wines */}
              {palateProfile.noteCount >= 2 && (
                <View style={{ marginTop: space.lg }}>
                  <TasteProfileChart
                    values={aggregateTasteValues(notes)}
                    label="YOUR TASTE FINGERPRINT"
                  />
                </View>
              )}
            </>
          )}
        </Card>

        {/* Pro upsell */}
        {!profile.isPro && (
          <Card style={{ marginTop: space.lg }}>
            <Eyebrow>HEMELVAL PRO // R89/MO</Eyebrow>
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
        )}

        {/* About */}
        <Card style={{ marginTop: space.lg }}>
          <Eyebrow>ABOUT HEMELVAL</Eyebrow>
          <BodyText size="sm" muted style={{ marginTop: space.md }}>
            Hemelval is built for the South African wine community — every estate, varietal, and festival of the Western Cape. Your tasting data stays on your device; nothing is shared.
          </BodyText>
          <BodyText size="sm" muted style={{ marginTop: space.sm }}>v0.1 · {palateProfile.noteCount} tastings logged</BodyText>
        </Card>

        <Button variant="outline" style={{ marginTop: space.lg }} onPress={() => signOut()}>SIGN OUT</Button>
        <View style={{ height: space.huge }} />
      </View>
    </ScrollView>
  );
}

function PrefCell({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.prefCell}>
      <Eyebrow>{label}</Eyebrow>
      <BodyText size="sm">{value.replace(/-/g, ' ')}</BodyText>
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: color.canvasSoft,
    borderWidth: 1,
    borderColor: color.hairline,
    borderRadius: radius.sm,
    padding: space.md,
    color: color.ink,
    marginTop: space.xs,
    ...font.bodyMd,
  },
  errorBox: { marginTop: space.md, padding: space.md, backgroundColor: 'color.critFill', borderRadius: radius.sm },
  palateBlock: { marginTop: space.md },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs, marginTop: space.sm },
  prefGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.lg, marginTop: space.sm },
  prefCell: { minWidth: 90 },
});
