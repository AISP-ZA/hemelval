import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  isValidStars, averageStars, points100ToStars, starsToPoints100,
  AROMA_DESCRIPTORS, aromasByCategory, AROMA_BY_ID, aromaLabel,
  suggestPairings, servingTempFor, findWinesForFood, PAIRINGS,
  buildPalateProfile, matchScore, validateTastingNote,
  VARIETAL_BY_SLUG, VARIETALS, resolveVarietal, signatureVarietals,
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

// ── Regression: no dangling aroma references in varietal data ───────────────
// Every typicalAromas id referenced by a varietal must resolve to a real
// descriptor in the controlled vocabulary. Before this guard, varietals.ts
// used `as string` casts to bypass the type checker for ids that didn't
// exist (raspberry, plum, wax, game, green-apple) — those aromas silently
// failed label lookup and corrupted palate profiles.
test('every varietal typicalAroma resolves to a controlled descriptor', () => {
  const dangling: string[] = [];
  for (const v of VARIETALS) {
    for (const id of v.typicalAromas ?? []) {
      if (!AROMA_BY_ID.has(id)) {
        dangling.push(`${v.slug} → '${id}'`);
      }
    }
  }
  assert.deepEqual(dangling, [], `dangling aroma ids: ${dangling.join(', ')}`);
});

test('previously-missing descriptors are now in the controlled vocab', () => {
  // These were the 5 ids that varietals.ts referenced but didn't exist.
  for (const id of ['raspberry', 'plum', 'wax', 'game', 'green-apple']) {
    assert.ok(AROMA_BY_ID.has(id), `${id} is a controlled descriptor`);
    // aromaLabel must return the human label, not the raw id (the old bug)
    assert.notEqual(aromaLabel(id), id, `${id} has a real label`);
  }
});

// ── findWinesForFood — the "What are you eating?" feature (was 0% covered) ──
test('findWinesForFood — braai', () => {
  const m = findWinesForFood('braai wors at the braai');
  assert.ok(m.tags.includes('braai'));
  assert.ok(m.varietalSlugs.includes('pinotage'), 'Pinotage recommended for braai');
  assert.ok(m.wineTypes.includes('red'));
  assert.ok(m.explanation.length > 0);
});

test('findWinesForFood — oysters', () => {
  const m = findWinesForFood('fresh oysters');
  assert.ok(m.tags.includes('oysters'));
  assert.ok(m.varietalSlugs.includes('mcc'), 'MCC recommended for oysters');
});

test('findWinesForFood — bobotie (SA Cape Malay)', () => {
  const m = findWinesForFood('bobotie');
  assert.ok(m.tags.includes('curry') || m.tags.includes('bobotie'), 'bobotie maps to a curry/bobotie tag');
  assert.ok(m.varietalSlugs.length > 0);
});

test('findWinesForFood — chocolate dessert', () => {
  const m = findWinesForFood('chocolate brownie');
  assert.ok(m.tags.includes('dessert-choc'));
  assert.ok(m.wineTypes.includes('fortified') || m.wineTypes.includes('dessert'));
});

test('findWinesForFood — unknown food returns versatile fallback', () => {
  const m = findWinesForFood('quatzlcoatl surprise');
  assert.equal(m.tags.length, 0, 'no tags for unknown food');
  assert.ok(m.varietalSlugs.includes('chenin-blanc'), 'falls back to Chenin');
  assert.ok(m.varietalSlugs.includes('pinot-noir'), 'falls back to Pinot Noir');
});

test('findWinesForFood — only recommends varietals we actually know', () => {
  // Regression: TAG_WINE_MAP previously recommended 'gewurztraminer' which
  // is not in our VARIETALS list — a dangling slug that breaks downstream UI.
  for (const slug of findWinesForFood('spicy thai curry').varietalSlugs) {
    assert.ok(VARIETAL_BY_SLUG.has(slug), `recommended slug '${slug}' is a known varietal`);
  }
});

// ── suggestPairings — no invalid tags (regression for dead-code escapes) ────
// Before this guard, suggestPairings pushed 'salmon' and 'salad' as PairingTag
// via `as PairingTag` casts — those aren't valid tags and would surface as
// undefined labels in the UI.
test('suggestPairings only emits valid PairingTags', () => {
  const validTags = new Set(Object.keys(PAIRINGS));
  for (const type of ['red', 'white', 'rose', 'sparkling', 'orange'] as const) {
    for (const vslug of ['', 'pinotage', 'pinot-noir', 'chenin-blanc', 'shiraz']) {
      const tags = suggestPairings(type, vslug ? { varietalSlug: vslug } : undefined);
      for (const t of tags) {
        assert.ok(validTags.has(t), `invalid tag '${t}' from suggestPairings(${type}, ${vslug})`);
      }
    }
  }
});

test('suggestPairings — Pinot Noir recommends fish (not the old dead-code path)', () => {
  const tags = suggestPairings('red', { varietalSlug: 'pinot-noir' });
  assert.ok(tags.includes('fish-rich'), 'Pinot Noir pairs with oily fish');
  assert.ok(!tags.includes('salmon' as never), 'no invalid salmon tag');
});

test('suggestPairings — rosé type fallback recommends valid tags', () => {
  const tags = suggestPairings('rose');
  assert.ok(tags.includes('pizza'), 'rosé pairs with pizza');
  assert.ok(!tags.includes('salad' as never), 'no invalid salad tag');
});
