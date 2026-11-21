// Tests for the matching engine (src/lib/match.ts). Run with: npm test
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { buildProfile, eatMatch, fitFor, matchPercent, placeKey, scorePlace, stayMatch, topTastes, tripWeight } from '../src/lib/match.ts';

const NOW = new Date('2026-11-21');
const place = (name, country, tags, extra = {}) => ({
  key: placeKey(name, country),
  name,
  tags,
  pos: null,
  warmth: null,
  goodFor: [],
  priceFrom: null,
  baseScore: 8,
  ...extra,
});

// A few places to compare
const algarve = place('Algarve', 'Portugal', { beach: 1, coast: 1 }, { pos: [37.1, -8.2], warmth: 28, goodFor: ['couples', 'families'] });
const comporta = place('Comporta', 'Portugal', { beach: 1, slow: 1 }, { pos: [38.4, -8.8], warmth: 27, goodFor: ['couples'], baseScore: 8.6 });
const maldives = place('The Maldives', 'Maldives', { beach: 1, island: 1, luxury: 0.6 }, { pos: [3.2, 73.5], warmth: 31, goodFor: ['couples'], baseScore: 9.4 });
const paris = place('Paris', 'France', { city: 1, culture: 1, food: 0.6 }, { pos: [48.9, 2.35], warmth: 24, goodFor: ['couples', 'friends'], baseScore: 8.5 });
const york = place('York', 'England', { city: 1, culture: 1, history: 0.6, shortbreak: 1 }, { pos: [53.96, -1.08], warmth: 20, goodFor: ['families'], baseScore: 8.2 });
const zermatt = place('Zermatt', 'Switzerland', { ski: 1, mountains: 1 }, { pos: [46, 7.75], warmth: 2, goodFor: ['friends'], baseScore: 9.0 });

const trip = (p, score, extra = {}) => ({ kind: 'trip', place: p, score, month: '2026-06', nights: 7, companions: 'partner', ...extra });

test('a brand-new person gets neutral numbers: 70% and the base score', () => {
  const profile = buildProfile([], [], NOW);
  assert.equal(fitFor(profile, paris), 0.5);
  const r = scorePlace(profile, paris, []);
  assert.equal(r.match, 70);
  assert.equal(r.score, 8.5);
});

test('loving beach trips ranks beaches above cities, and above the base score', () => {
  const profile = buildProfile([trip(algarve, 9.5), { kind: 'save', place: maldives, wish: true }], [], NOW);
  const beach = scorePlace(profile, comporta, []);
  const city = scorePlace(profile, paris, []);
  assert.ok(beach.match > city.match, `beach ${beach.match}% should beat city ${city.match}%`);
  assert.ok(beach.score > 8.6, `beach score ${beach.score} should be above its base 8.6`);
  assert.ok(beach.match >= 80, `beach match ${beach.match}% should be high`);
});

test('a disliked city trip pushes other cities down', () => {
  const profile = buildProfile([trip(paris, 4), trip(algarve, 9)], [], NOW);
  const r = scorePlace(profile, york, []);
  assert.ok(r.match < 70, `York ${r.match}% should be below neutral`);
  assert.ok(r.score < 8.2, `York ${r.score} should be below its base 8.2`);
});

test('places you have been show your own score', () => {
  const profile = buildProfile([trip(algarve, 9.5)], [], NOW);
  const r = scorePlace(profile, algarve, []);
  assert.equal(r.yours, 9.5);
  assert.equal(r.score, 9.5);
  assert.equal(r.reasons[0], 'You gave it 9.5');
});

test('adding a trip like a place raises that place (scores respond to what you do)', () => {
  const before = scorePlace(buildProfile([trip(paris, 8)], [], NOW), comporta, []).score;
  const after = scorePlace(buildProfile([trip(paris, 8), trip(algarve, 9.5)], [], NOW), comporta, []).score;
  assert.ok(after > before, `${after} should be above ${before}`);
});

test('more recent and longer trips count for more', () => {
  assert.ok(tripWeight(9, '2026-06', 7, NOW) > tripWeight(9, '2016-06', 7, NOW));
  assert.ok(tripWeight(9, '2026-06', 10, NOW) > tripWeight(9, '2026-06', 1, NOW));
  assert.ok(tripWeight(4, '2026-06', 7, NOW) < 0, 'a poor trip pushes away');
  assert.equal(tripWeight(6.5, '2026-06', 7, NOW), 0, 'a 6.5 is neutral');
});

test('friends who agree with you count for more', () => {
  const ratings = [
    { friend: 'Maya', placeKey: algarve.key, score: 9.4 }, // agrees with your 9.5
    { friend: 'Tom', placeKey: algarve.key, score: 5.5 }, // doesn't
    { friend: 'Maya', placeKey: comporta.key, score: 9.5 },
    { friend: 'Tom', placeKey: comporta.key, score: 6 },
  ];
  const profile = buildProfile([trip(algarve, 9.5)], ratings, NOW);
  assert.ok(profile.friendWeights.Maya > 1, `Maya ${profile.friendWeights.Maya}`);
  assert.ok(profile.friendWeights.Tom < 1, `Tom ${profile.friendWeights.Tom}`);
  const r = scorePlace(profile, comporta, ratings);
  const plainAverage = (2 * 8.6 + 9.5 + 6) / 4;
  assert.ok(r.breakdown.base > plainAverage, `base ${r.breakdown.base} should lean to Maya over ${plainAverage}`);
  assert.equal(r.breakdown.friendsCount, 2);
});

test('reasons explain the score', () => {
  const ratings = [{ friend: 'Maya', placeKey: comporta.key, score: 9.1 }];
  const profile = buildProfile([trip(algarve, 9.5)], ratings, NOW);
  const r = scorePlace(profile, comporta, ratings);
  assert.ok(r.reasons.includes('Like Algarve, which you gave 9.5'), r.reasons.join(' / '));
  assert.ok(r.reasons.some((x) => x.startsWith('Maya gave it 9.1')), r.reasons.join(' / '));
});

test('who you travel with matters', () => {
  const profile = buildProfile([trip(algarve, 9, { companions: 'family' }), trip(comporta, 9, { companions: 'family' })], [], NOW);
  const forFamilies = { ...york, key: 'a|x', tags: { beach: 1 }, goodFor: ['families'] };
  const notForFamilies = { ...york, key: 'b|x', tags: { beach: 1 }, goodFor: ['solo'] };
  assert.ok(scorePlace(profile, forFamilies, []).match > scorePlace(profile, notForFamilies, []).match);
});

test('warm-weather people get a lower match for a ski resort', () => {
  const profile = buildProfile([trip(algarve, 9.5), trip(comporta, 9)], [], NOW);
  assert.ok(scorePlace(profile, zermatt, []).match < 65);
});

test('scores stay between 1 and 10 with one decimal, matches between 40 and 99', () => {
  const profile = buildProfile([trip(algarve, 10), trip(comporta, 10), { kind: 'save', place: maldives, wish: true }], [], NOW);
  for (const p of [algarve, comporta, maldives, paris, york, zermatt]) {
    const r = scorePlace(profile, { ...p, key: p.key + '-other', baseScore: 9.9 }, []);
    assert.ok(r.score >= 1 && r.score <= 10, `${p.name} ${r.score}`);
    assert.equal(Math.round(r.score * 10) / 10, r.score);
    assert.ok(r.match >= 40 && r.match <= 99);
  }
  assert.equal(matchPercent(5), 99);
  assert.equal(matchPercent(-5), 40);
});

test('stays: a villa person gets villas matched higher', () => {
  const profile = buildProfile([trip(algarve, 9, { stay: { type: 'Villa', score: 9.5 } }), trip(paris, 8, { stay: { type: 'Hotel', score: 5 } })], [], NOW);
  assert.ok(stayMatch(profile, { type: 'Villa', priceFrom: null, friendScore: null }) > stayMatch(profile, { type: 'Hotel', priceFrom: null, friendScore: null }));
  assert.equal(stayMatch(buildProfile([], [], NOW), { type: 'B&B', priceFrom: null, friendScore: null }), 70);
});

test('food: food-led trips raise places to eat', () => {
  const foodie = buildProfile([trip(place('Bologna', 'Italy', { food: 1, city: 0.5 }), 9.5)], [], NOW);
  const beachy = buildProfile([trip(algarve, 9.5)], [], NOW);
  assert.ok(eatMatch(foodie, { friendScore: 8.5 }) > eatMatch(beachy, { friendScore: 8.5 }));
});

test('your taste lists what you like most', () => {
  const profile = buildProfile([trip(algarve, 9.5), trip(comporta, 9), trip(paris, 4)], [], NOW);
  const top = topTastes(profile);
  assert.equal(top[0], 'beach');
  assert.ok(!top.includes('city'));
});

test('ranking for you prefers a great fit over a famous place you would half enjoy', async () => {
  const { rankValue } = await import('../src/lib/match.ts');
  assert.ok(rankValue({ score: 9.0, match: 89 }) > rankValue({ score: 9.2, match: 70 }));
});

// --- What you want next: Want to go, lists, list names and pages you look at ---

const mauritius = place('Mauritius', 'Mauritius', { island: 1, beach: 1 }, { pos: [-20.2, 57.5], warmth: 28, goodFor: ['couples'], baseScore: 9 });
const ladigue = place('La Digue', 'Seychelles', { island: 1, beach: 1 }, { pos: [-4.4, 55.8], warmth: 30, goodFor: ['couples'], baseScore: 9.2 });
const borabora = place('Bora Bora', 'French Polynesia', { island: 1, beach: 1, luxury: 0.4 }, { pos: [-16.5, -151.7], warmth: 29, goodFor: ['couples'], baseScore: 9.3 });
const lisbon = place('Lisbon', 'Portugal', { city: 1, food: 1 }, { pos: [38.7, -9.1], warmth: 24, goodFor: ['friends'], baseScore: 8.7 });
const cityTrips = [trip(paris, 9.5, { companions: 'friends' }), trip(york, 9, { companions: 'friends' }), trip(place('Rome', 'Italy', { city: 1, culture: 1, food: 1 }, { pos: [41.9, 12.5], warmth: 27 }), 9, { companions: 'friends' })];
const wishes = [maldives, ladigue, borabora].map((p) => ({ kind: 'save', place: p, wish: true, savedAt: '2026-11-10' }));

test('your Want to go list has as much say as all your trips put together', () => {
  const tripsOnly = buildProfile(cityTrips, [], NOW);
  const withWishes = buildProfile([...cityTrips, ...wishes], [], NOW);
  const before = scorePlace(tripsOnly, mauritius, []);
  const after = scorePlace(withWishes, mauritius, []);
  assert.ok(after.match - before.match >= 10, `Mauritius ${before.match}% → ${after.match}%`);
  // …and a city break you'd enjoy still scores well, so it's a balance, not a switch.
  assert.ok(scorePlace(withWishes, lisbon, []).match > 70, 'still above neutral');
});

test('who your wish-list places suit counts towards "who you travel with"', () => {
  const p = buildProfile([...cityTrips, ...wishes], [], NOW);
  assert.ok(p.nextGoodFor.couples > 0.9);
  const forCouples = { ...mauritius, key: 'c|x' };
  const forFriends = { ...mauritius, key: 'f|x', goodFor: ['friends'] };
  assert.ok(scorePlace(p, forCouples, []).match > scorePlace(buildProfile(cityTrips, [], NOW), forCouples, []).match);
  assert.ok(scorePlace(p, forFriends, []).match > 0);
});

test('saves fade slowly but never below 60%', async () => {
  const { saveWeight } = await import('../src/lib/match.ts');
  assert.equal(saveWeight(true, '2026-11-21', NOW), 1);
  assert.ok(Math.abs(saveWeight(true, '2025-11-21', NOW) - 0.6) < 0.01, 'a year old: 0.5 → floor 0.6');
  assert.equal(saveWeight(false, '2026-11-21', NOW), 0.7);
});

test('looking at a place again and again lifts it, and the lift fades with time', async () => {
  const { viewWeight } = await import('../src/lib/match.ts');
  const base = [...cityTrips, ...wishes];
  const plain = scorePlace(buildProfile(base, [], NOW), mauritius, []);
  const keen = scorePlace(buildProfile([...base, { kind: 'view', place: mauritius, views: 4, seconds: 260, lastViewed: '2026-11-20' }], [], NOW), mauritius, []);
  const old = scorePlace(buildProfile([...base, { kind: 'view', place: mauritius, views: 4, seconds: 260, lastViewed: '2026-07-20' }], [], NOW), mauritius, []);
  assert.ok(keen.match >= plain.match + 8, `${plain.match}% → ${keen.match}%`);
  assert.ok(keen.score > plain.score);
  assert.ok(old.match < keen.match && old.match >= plain.match);
  assert.ok(keen.reasons.includes('You’ve looked at it 4 times'), keen.reasons.join(' / '));
  assert.ok(viewWeight(1, 2, '2026-11-21', NOW) < viewWeight(5, 400, '2026-11-21', NOW));
  assert.ok(viewWeight(50, 100000, '2026-11-21', NOW) <= 0.5, 'browsing never outweighs a loved trip');
});

test('no extra lift for looking at somewhere already saved or been', async () => {
  const { interestLift } = await import('../src/lib/match.ts');
  const p = buildProfile([...wishes, { kind: 'view', place: maldives, views: 9, seconds: 900, lastViewed: '2026-11-20' }], [], NOW);
  assert.equal(interestLift(p, maldives), 0);
});

test('a list called "Ski trips" makes ski resorts a better match', () => {
  const without = buildProfile(cityTrips, [], NOW);
  const withList = buildProfile([...cityTrips, { kind: 'interest', tags: { ski: 1, mountains: 0.6 }, label: 'Ski trips' }], [], NOW);
  assert.ok(scorePlace(withList, zermatt, []).match > scorePlace(without, zermatt, []).match);
});

test('a restaurant is matched on the restaurant: friends who loved it, and how much you like food', async () => {
  const { itemMatch } = await import('../src/lib/match.ts');
  const foodie = buildProfile([trip(place('Bologna', 'Italy', { food: 1 }), 9.5)], [], NOW);
  const loved = itemMatch(foodie, { tasteTag: 'food', friendScore: 9.3, friendRecommended: true });
  const unknown = itemMatch(foodie, { tasteTag: 'food', friendScore: null, friendRecommended: false });
  const meh = itemMatch(foodie, { tasteTag: 'food', friendScore: 6.5, friendRecommended: true });
  assert.ok(loved > unknown && unknown > meh, `${loved} > ${unknown} > ${meh}`);
  // Saving faraway islands doesn't change how a café is matched.
  const islander = buildProfile([{ kind: 'save', place: maldives, wish: true }], [], NOW);
  assert.equal(itemMatch(islander, { tasteTag: 'food', friendScore: 9, friendRecommended: true }) > 0, true);
});
