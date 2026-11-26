// The matching engine with the real sample places: travellers with a clear taste get that kind of
// place first. Run with: npm test (owner, Nov 2026: "a strong algorithm for matching places").
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { buildProfile, diversify, likeness, rankValue, scorePlace, softTop, tagRarity } from '../src/lib/match.ts';
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
  // Every pick is a city or culture break (owner added Athens and Barcelona, Nov 2026, so Paris may now sit just below the top 8).
  assert.ok(top.every((s) => tagOf(s, 'city') >= 0.5 || tagOf(s, 'culture') >= 0.5), top.join(', '));
  assert.ok(topFor([['2026-05', 9.2, 'Rome', 'Italy'], ['2025-10', 9.0, 'New York', 'United States']], 12).includes('paris'));
  for (const island of ['borabora', 'maldives', 'seychelles', 'turks']) assert.ok(!top.includes(island), `${island} in ${top.join(', ')}`);
});

test('high scores level off instead of all reading 10.0', () => {
  assert.equal(softTop(8.5), 8.5);
  assert.ok(softTop(10) < 9.7 && softTop(10) > softTop(9.6) && softTop(9.6) > softTop(9.2));
});

test('rare holiday types count more than common ones', () => {
  assert.ok((rarity.ski ?? 0) > (rarity.food ?? 0));
});

// --- The algorithm audit (owner, Nov 2026: "I want the deepest thought into fixing this algorithm") ---

const T = (month, score, name, country, companions = 'partner', nights = 7) => ({ kind: 'trip', place: featuresForPlace({ name, country }), score, month, nights, companions, stay: null });
const W = (slug) => ({ kind: 'save', place: featuresForSlug(slug), wish: true, savedAt: '2026-11-01' });
function ranked(signals, fr = friends) {
  const profile = buildProfile(signals, fr, NOW, rarity);
  return places
    .map((p) => ({ slug: p.slug, f: featuresForSlug(p.slug), r: scorePlace(profile, featuresForSlug(p.slug), fr) }))
    .filter((x) => x.r.yours == null && !profile.saved[x.f.key])
    .sort((a, b) => rankValue(b.r) - rankValue(a.r));
}
const homePicks = (signals) => diversify(ranked(signals), 8, (x) => rankValue(x.r), (a, b) => likeness(a.f, b.f));
const scoreOf = (signals, slug) => ranked(signals).find((x) => x.slug === slug)?.r.score;
const skier = [T('2026-02', 9.4, "Val d'Isère", 'France', 'friends'), T('2025-01', 9.1, 'Kitzbühel', 'Austria', 'friends'), T('2024-02', 9.0, 'Avoriaz', 'France', 'family')];
const luxury = [T('2026-01', 9.6, 'Maldives', 'Maldives'), T('2025-03', 9.3, 'Mauritius', 'Mauritius'), T('2024-11', 9.0, 'Dubai', 'United Arab Emirates')];
const budget = [T('2026-06', 9.0, 'Crete', 'Greece', 'friends'), T('2025-09', 8.8, 'Lanzarote', 'Spain', 'friends'), T('2025-05', 8.7, 'Gran Canaria', 'Spain', 'friends')];
const cities = [T('2026-05', 9.2, 'Rome', 'Italy'), T('2025-10', 9.0, 'New York', 'United States'), T('2025-04', 8.9, 'Prague', 'Czechia'), T('2025-02', 8.7, 'Vienna', 'Austria')];
const weekender = [T('2026-09', 9.1, 'Bath', 'United Kingdom', 'partner', 2), T('2026-03', 8.8, 'York', 'United Kingdom', 'partner', 2), T('2025-10', 8.9, 'The Cotswolds', 'United Kingdom', 'partner', 2)];

test('a poor fit reads clearly lower: a skier sees tropical islands well below 7.5', () => {
  for (const slug of ['maldives', 'borabora']) assert.ok(scoreOf(skier, slug) < 7.5, `${slug} ${scoreOf(skier, slug)}`);
  const all = ranked(skier).map((x) => x.r.score);
  assert.ok(Math.max(...all) - Math.min(...all) >= 2.5, `spread ${Math.min(...all)}–${Math.max(...all)}`);
});

test('someone new sees each place on its own rating (no guessing about them)', () => {
  for (const x of ranked([]).slice(0, 10)) assert.ok(Math.abs(x.r.score - Math.min(9.9, x.f.baseScore)) <= 0.3, `${x.slug} ${x.r.score} vs ${x.f.baseScore}`);
});

test('two interests show both: a city lover who saves tropical islands sees cities and islands', () => {
  const picks = homePicks([...cities, W('maldives'), W('seychelles')]);
  const islands = picks.filter((x) => (x.f.tags.island ?? 0) >= 0.5 || (x.f.tags.tropical ?? 0) >= 0.5).length;
  const cityish = picks.filter((x) => (x.f.tags.city ?? 0) >= 0.5 || (x.f.tags.culture ?? 0) >= 0.5).length;
  assert.ok(islands >= 2 && cityish >= 3, picks.map((x) => x.slug).join(', '));
});

test('price and luxury count: a luxury traveller and a budget one get different places', () => {
  const avg = (sig) => { const p = homePicks(sig); return p.reduce((s, x) => s + (x.f.priceFrom ?? 0), 0) / p.length; };
  assert.ok(avg(luxury) > 1.8 * avg(budget), `luxury £${avg(luxury)} vs budget £${avg(budget)}`);
  assert.ok(scoreOf(luxury, 'borabora') > scoreOf(budget, 'borabora') + 1, 'Bora Bora suits the luxury traveller far more');
});

test('a weekender gets places near home, not the other side of the world', () => {
  const picks = homePicks(weekender).map((x) => x.slug);
  for (const far of ['kyoto', 'sanfrancisco', 'newyork', 'singapore']) assert.ok(!picks.slice(0, 5).includes(far), picks.join(', '));
});

test('a wildlife trip finds wildlife: loving Victoria Falls lifts a safari', () => {
  const wild = [T('2025-08', 9.5, 'Victoria Falls', 'Zimbabwe', 'partner'), T('2024-08', 9.2, 'Kruger', 'South Africa', 'partner')];
  assert.ok(ranked(wild).slice(0, 6).some((x) => x.slug === 'tanzania'), ranked(wild).slice(0, 6).map((x) => x.slug).join(', '));
});

test("friends whose taste is like yours count more, and one friend's rating moves a score", () => {
  const hydra = featuresForSlug('hydra');
  const ten = [{ friend: 'Zed', placeKey: hydra.key, score: 9.9, tags: hydra.tags }];
  const six = [{ friend: 'Zed', placeKey: hydra.key, score: 6.0, tags: hydra.tags }];
  const none = scorePlace(buildProfile([], [], NOW, rarity), hydra, []).score;
  assert.ok(scorePlace(buildProfile([], ten, NOW, rarity), hydra, ten).score > none, 'a friend who loved it lifts it');
  assert.ok(scorePlace(buildProfile([], six, NOW, rarity), hydra, six).score <= none - 1, "a friend who didn't drops it a lot");
  const beachFan = buildProfile([T('2026-08', 9.2, 'Corfu', 'Greece'), T('2025-07', 9.3, 'Algarve', 'Portugal')], [
    { friend: 'Sun', placeKey: 'a', score: 9.5, tags: { beach: 1, island: 1 } }, { friend: 'Sun', placeKey: 'b', score: 7, tags: { city: 1 } },
    { friend: 'Snow', placeKey: 'c', score: 9.5, tags: { ski: 1 } }, { friend: 'Snow', placeKey: 'd', score: 7, tags: { beach: 1 } },
  ], NOW, rarity);
  assert.ok(beachFan.friendWeights.Sun > 1.2 && beachFan.friendWeights.Snow < 1, JSON.stringify(beachFan.friendWeights));
});
