/**
 * AwardBadge — renders award recognition with editorial craft.
 *
 * Two visual archetypes (per the design research):
 *  - Medallion: circular metallic, for competition medals (Veritas, DWWA, IWSC).
 *    Radial gradient implied via layered circles; beveled rim.
 *  - Stamp: rounded rectangle seal, for guide/critic ratings (Platter's, Tim Atkin).
 *    Brand wordmark dominant, stars or score as the value.
 *
 * Kept restrained — tiered visual weight so a Platter's 5-star or Veritas
 * Double Gold reads prominently, while a 90-point is inline.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { color, font, space, radius } from '../theme/tokens.js';

export interface AwardDescriptor {
  body: string;       // "Platter's", "Veritas", "Tim Atkin MW", "DWWA", "IWSC"
  result: string;     // "5★", "95/100", "Double Gold", "Platinum"
  year?: number;
  wine?: string;
}

/** Determine if an award is "top tier" (gets a prominent badge vs inline). */
function isTopTier(award: AwardDescriptor): boolean {
  const r = award.result.toLowerCase();
  return (
    r.includes('5★') || r.includes('5 ★') ||
    r.includes('double gold') ||
    r.includes('platinum') ||
    (r.includes('/') && parseInt(r) >= 95) ||
    (parseInt(r) >= 95)
  );
}

/** The two award families. */
function awardFamily(body: string): 'medallion' | 'stamp' {
  const b = body.toLowerCase();
  // Competition medals → medallion
  if (b.includes('veritas') || b.includes('decanter') || b.includes('dwwa') || b.includes('iwsc') || b.includes('michelangelo')) {
    return 'medallion';
  }
  // Guide ratings + critics → stamp
  return 'stamp';
}

export function AwardBadge({ award, size = 'md' }: { award: AwardDescriptor; size?: 'sm' | 'md' }) {
  if (!isTopTier(award)) {
    // Inline for non-top-tier (90-point etc.)
    return (
      <View style={styles.inline}>
        <Text style={[font.captionMonoSm, { color: color.bodyMid }]}>
          {award.body} · {award.result}{award.year ? ` · ${award.year}` : ''}
        </Text>
      </View>
    );
  }

  const family = awardFamily(award.body);
  if (family === 'medallion') return <Medallion award={award} size={size} />;
  return <Stamp award={award} size={size} />;
}

// ── Medallion (circular metallic — Veritas, DWWA, IWSC) ─────────────────────

function Medallion({ award, size }: { award: AwardDescriptor; size: 'sm' | 'md' }) {
  const dim = size === 'sm' ? 48 : 64;
  // Determine metal color from result
  const r = award.result.toLowerCase();
  const metal = r.includes('gold') ? '#c9a96a' : r.includes('silver') ? '#b8b0a8' : r.includes('bronze') ? '#a8765a' : '#c9a96a';

  return (
    <View style={styles.medallionWrap}>
      <View style={[styles.medallion, { width: dim, height: dim, borderRadius: dim / 2 }]}>
        {/* Outer rim (darker) */}
        <View style={[styles.medallionRim, { borderRadius: dim / 2, borderColor: metal }]} />
        {/* Inner face (radial gradient implied by layered fills) */}
        <View style={[styles.medallionFace, { borderRadius: (dim - 8) / 2 }]}>
          <Text style={[font.captionMonoSm, { color: color.canvas, fontSize: size === 'sm' ? 7 : 8, letterSpacing: 0.5 }]}>
            {award.body.split(' ')[0].toUpperCase()}
          </Text>
          <Text style={{ color: color.canvas, fontSize: size === 'sm' ? 9 : 11, fontWeight: '700', lineHeight: size === 'sm' ? 11 : 13, textAlign: 'center' }}>
            {award.result.replace('Double ', '').replace(' ', '\n')}
          </Text>
        </View>
      </View>
      {award.year && (
        <Text style={[font.captionMonoSm, { color: color.bodyMid, marginTop: space.xs, fontSize: 8 }]}>
          {award.year}
        </Text>
      )}
    </View>
  );
}

// ── Stamp (rounded seal — Platter's, Tim Atkin, James Suckling) ─────────────

function Stamp({ award, size }: { award: AwardDescriptor; size: 'sm' | 'md' }) {
  const isStars = award.result.includes('★');
  return (
    <View style={[styles.stamp, size === 'sm' && { paddingVertical: 4, paddingHorizontal: 8 }]}>
      <Text style={[font.captionMonoSm, { color: color.gold, fontSize: size === 'sm' ? 8 : 9 }]}>
        {award.body.toUpperCase()}
      </Text>
      <Text style={{
        fontFamily: 'Georgia, serif',
        fontSize: size === 'sm' ? 16 : 20,
        fontWeight: '600',
        color: color.ink,
        lineHeight: size === 'sm' ? 18 : 22,
        marginTop: 2,
      }}>
        {award.result}
      </Text>
      {award.year && (
        <Text style={[font.captionMonoSm, { color: color.bodyMid, fontSize: 8, marginTop: 2 }]}>
          {award.year}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  inline: { paddingVertical: space.xs },
  medallionWrap: { alignItems: 'center', gap: 0 },
  medallion: {
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#1c0d11',
  },
  medallionRim: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    borderWidth: 2,
  },
  medallionFace: {
    width: '82%', height: '82%',
    backgroundColor: '#2a1218',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#3a1a22',
  },
  stamp: {
    borderWidth: 1, borderColor: color.goldSoft,
    borderRadius: radius.sm,
    paddingVertical: 6, paddingHorizontal: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(201,169,106,0.06)',
  },
});
