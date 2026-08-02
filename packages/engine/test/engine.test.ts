import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  isValidStars, averageStars, points100ToStars, starsToPoints100,
  AROMA_DESCRIPTORS, aromasByCategory, AROMA_BY_ID,
  suggestPairings, servingTempFor,
  buildPalateProfile, matchScore, validateTastingNote,
  VARIETAL_BY_SLUG, resolveVarietal, signatureVarietals,
} from '../src/index.ts';

test('star validation', () => {
  assert.equal(isValidStars(3), true);
  assert.equal(isValidStars(3.5), true);
  assert.equal(isValidStars(5), true);
  assert.equal(isValidStars(0.5), true);
  assert.equal(isValidStars(3.7), false, 'non-half step rejected');
  assert.equal(isValidStars(0), false, 'below min');
  assert.equal(isValidStars(5.5), false, 'above max');
});

test('averageStars rounds to nearest 0.5', () => {
  assert.equal(averageStars([4, 4, 5]), 4.5);
  assert.equal(averageStars([3, 4, 3, 4]), 3.5);
  assert.equal(averageStars([]), 0);
});

test('100-point ↔ stars round-trips within tolerance', () => {
  for (const p of [70, 80, 85, 90, 95, 100]) {
    const back = starsToPoints100(points100ToStars(p));
    assert.ok(Math.abs(back - p) <= 3, `${p}pt round-trips (got ${back})`);
  }
  // 100 → 5 stars
  assert.equal(points100ToStars(100), 5);
  // 50 → 0.5 stars
  assert.equal(points100ToStars(50), 0.5);
});

test('aroma wheel integrity', () => {
  assert.ok(AROMA_DESCRIPTORS.length >= 60, 'rich descriptor set');
  // every descriptor has a unique id
  const ids = new Set(AROMA_DESCRIPTORS.map((d) => d.id));
  assert.equal(ids.size, AROMA_DESCRIPTORS.length, 'ids unique');
  // every id is lookupable
  for (const d of AROMA_DESCRIPTORS) {
    assert.equal(AROMA_BY_ID.get(d.id), d);
  }
  // fynbos present (SA-specific floral)
  assert.ok(AROMA_BY_ID.has('fynbos'), 'fynbos descriptor included');
});

test('aromasByCategory groups correctly', () => {
  const fruity = aromasByCategory('fruity');
  assert.ok(fruity.length > 5);
  assert.ok(fruity.every((d) => d.category === 'fruity'));
});

test('SA varietal knowledge', () => {
  // signatures present
  assert.ok(VARIETAL_BY_SLUG.get('chenin-blanc')?.signature, 'Chenin is signature');
  assert.ok(VARIETAL_BY_SLUG.get('pinotage')?.signature, 'Pinotage is signature');
  assert.ok(VARIETAL_BY_SLUG.get('mcc')?.signature, 'MCC is signature');
  // alias resolution: Steen → Chenin Blanc
  const steen = resolveVarietal('Steen');
  assert.equal(steen?.slug, 'chenin-blanc', 'Steen resolves to Chenin');
  // at least 3 signature varietals
  assert.ok(signatureVarietals().length >= 3);
});

test('serving temperatures are sane', () => {
  const red = servingTempFor('red');
  assert.ok(red.minC >= 14 && red.maxC <= 18, 'reds 14-18C');
  const spark = servingTempFor('sparkling');
  assert.ok(spark.minC >= 3 && spark.maxC <= 8, 'sparkling coldest');
  const white = servingTempFor('white');
  assert.ok(white.minC < red.minC, 'white colder than red');
});

test('food pairing — Pinotage → braai', () => {
  const pairings = suggestPairings('red', { varietalSlug: 'pinotage' });
  assert.ok(pairings.includes('braai'), 'Pinotage pairs with braai');
  assert.ok(pairings.includes('steak'), 'Pinotage pairs with steak');
});

test('food pairing — Chenin → pork/curry', () => {
  const pairings = suggestPairings('white', { varietalSlug: 'chenin-blanc' });
  assert.ok(pairings.includes('pork'), 'Chenin pairs with pork');
  assert.ok(pairings.includes('curry'), 'Chenin pairs with curry');
});

test('food pairing — MCC → oysters', () => {
  const pairings = suggestPairings('sparkling', { isSparkling: true });
  assert.ok(pairings.includes('oysters'), 'MCC pairs with oysters');
});

test('palate profile + match score', () => {
  // user who has tasted 6 Pinotage reds, all 4–5 stars
  const notes = Array.from({ length: 6 }, (_, i) => ({
    id: `n${i}`, wineVintageId: 'v1', userId: 'u1', tastedAt: '2026-01-01',
    stars: i % 2 === 0 ? 5 : 4.5,
    palate: { body: 'medium' as const, flavors: ['cherry-red', 'leather'] },
    nose: { aromas: ['cherry-red'] },
  }));
  const varietalByVintage = { v1: 'pinotage' };
  const typeByVintage = { v1: 'red' as const };
  const profile = buildPalateProfile('u1', notes, varietalByVintage, typeByVintage);
  assert.equal(profile.noteCount, 6);
  assert.equal(profile.topTypes[0]?.type, 'red');
  assert.equal(profile.topVarietals[0]?.slug, 'pinotage');
  assert.ok(profile.avgStars > 4);

  // a Pinotage candidate should score high
  const pinotageScore = matchScore(profile, {
    varietalSlug: 'pinotage', type: 'red',
    descriptorIds: ['cherry-red', 'leather'], body: 'medium',
  });
  // a Sauvignon Blanc candidate should score lower
  const sbScore = matchScore(profile, {
    varietalSlug: 'sauvignon-blanc', type: 'white',
    descriptorIds: ['cut-grass', 'passionfruit'], body: 'light',
  });
  assert.ok(pinotageScore > sbScore, `Pinotage (${pinotageScore}) > SB (${sbScore}) for a Pinotage lover`);
  assert.ok(pinotageScore >= 60, 'known-liked wine scores reasonably high');
});

test('cold-start match returns neutral 50', () => {
  const empty = buildPalateProfile('u2', [], {}, {});
  const score = matchScore(empty, { type: 'red', varietalSlug: 'shiraz' });
  assert.equal(score, 50, 'cold start returns 50');
});

test('validateTastingNote', () => {
  assert.equal(validateTastingNote({ stars: 4 }), null);
  assert.equal(validateTastingNote({ stars: 3.5 }), null);
  assert.ok(validateTastingNote({ stars: 3.7 }), 'rejects 3.7');
  assert.ok(validateTastingNote({}), 'requires stars');
  assert.ok(validateTastingNote({ stars: 6 }), 'rejects > 5');
});
