// The matching engine with the real sample places: travellers with a clear taste get that kind of
// place first. Run with: npm test (owner, Nov 2026: "a strong algorithm for matching places").
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { buildProfile, rankValue, scorePlace, softTop, tagRarity } from '../src/lib/match.ts';
import { featuresForPlace, featuresForSlug, sampleFriendRatings } from '../src/lib/placeFeatures.ts';
import { places } from '../src/lib/sample.ts';

const NOW = new Date('2026-11-25');
const rarity = tagRarity(places.map((p) => featuresForSlug(p.slug).tags));
const friends = sampleFriendRatings();

/** The top n places for someone with these trips (places they've been left out), as slugs. */
function topFor(trips, n) {
  const signals = trips.map(([month, score, name, country, companions = 'partner']) => ({
    kind: 'trip', place: featuresForPlace({ name, country }), score, month, nights: 7, companions, stay: null,
  }));
  const profile = buildProfile(signals, friends, NOW, rarity);
  return places
    .map((p) => ({ slug: p.slug, r: scorePlace(profile, featuresForSlug(p.slug), friends) }))
    .filter((x) => x.r.yours == null)
    .sort((a, b) => rankValue(b.r) - rankValue(a.r))
    .slice(0, n)
    .map((x) => x.slug);
}
const tagOf = (slug, tag) => featuresForSlug(slug).tags[tag] ?? 0;

test('a beach lover gets beaches and islands first', () => {
  const top = topFor([
    ['2026-08', 9.2, 'Corfu', 'Greece'], ['2025-07', 9.3, 'Algarve', 'Portugal'], ['2025-05', 9.0, 'Mallorca', 'Spain'],
    ['2025-03', 8.9, 'Tenerife', 'Spain'], ['2025-12', 7.6, 'Dubai', 'United Arab Emirates', 'family'], ['2024-10', 8.5, 'Milan', 'Italy'],
  ], 8);
  assert.ok(top.every((s) => Math.max(tagOf(s, 'beach'), tagOf(s, 'island'), tagOf(s, 'coast')) >= 0.5), top.join(', '));
});

test('a skier gets ski resorts first, including the less famous ones', () => {
  const top = topFor([['2026-02', 9.4, "Val d'Isère", 'France', 'friends'], ['2025-01', 9.1, 'Kitzbühel', 'Austria', 'friends'], ['2024-02', 9.0, 'Avoriaz', 'France', 'family']], 6);
  assert.ok(top.every((s) => tagOf(s, 'ski') >= 0.5), top.join(', '));
  assert.ok(top.includes('valthorens'), top.join(', '));
});

test('a city lover gets cities, not the highest-rated islands', () => {
  const top = topFor([
    ['2026-05', 9.2, 'Rome', 'Italy'], ['2025-10', 9.0, 'New York', 'United States'], ['2025-04', 8.9, 'Prague', 'Czechia'],
    ['2025-02', 8.7, 'Vienna', 'Austria'], ['2024-11', 8.8, 'Barcelona', 'Spain', 'friends'], ['2024-08', 6.0, 'Ayia Napa', 'Cyprus', 'friends'],
  ], 8);
  assert.ok(top.includes('paris'), top.join(', '));
  for (const island of ['borabora', 'maldives', 'seychelles', 'turks']) assert.ok(!top.includes(island), `${island} in ${top.join(', ')}`);
});

test('high scores level off instead of all reading 10.0', () => {
  assert.equal(softTop(8.5), 8.5);
  assert.ok(softTop(10) < 9.7 && softTop(10) > softTop(9.6) && softTop(9.6) > softTop(9.2));
});

test('rare holiday types count more than common ones', () => {
  assert.ok((rarity.ski ?? 0) > (rarity.food ?? 0));
});
