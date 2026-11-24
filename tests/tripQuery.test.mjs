// Tests for Explore's search (src/lib/tripQuery.ts). Run with: npm test
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { describeQuery, hasCriteria, parseTripQuery, placeForQuery, searchPlaces } from '../src/lib/tripQuery.ts';

const P = (slug, extra = {}) => ({
  slug,
  name: slug,
  where: '',
  tags: {},
  temps: null,
  bestMonths: [],
  goodFor: [],
  priceFrom: null,
  noFly: false,
  rating: 8,
  ...extra,
});
const warmAllYear = [27, 27, 28, 29, 30, 30, 30, 30, 30, 29, 28, 27];
const ukTemps = [8, 8, 11, 14, 17, 20, 22, 22, 19, 15, 11, 8];
const places = [
  P('maldives', { name: 'The Maldives', where: 'Maldives', tags: { beach: 1, island: 1, luxury: 1 }, temps: warmAllYear, bestMonths: [0, 1, 2, 3], goodFor: ['Couples'], priceFrom: 650 }),
  P('crete', { name: 'Crete', where: 'Greece', tags: { beach: 1, island: 1, food: 1 }, temps: [15, 15, 17, 20, 24, 28, 30, 30, 27, 24, 20, 17], bestMonths: [4, 5, 8, 9], goodFor: ['Couples', 'Families'], priceFrom: 90 }),
  P('bath', { name: 'Bath', where: 'England', tags: { city: 1, shortbreak: 1, wellness: 1 }, temps: ukTemps, bestMonths: [3, 4, 11], goodFor: ['Couples', 'Friends'], priceFrom: 160, noFly: true }),
  P('zermatt', { name: 'Zermatt', where: 'Switzerland', tags: { ski: 1, mountains: 1 }, temps: [-2, 0, 4, 8, 12, 16, 19, 19, 15, 10, 4, 0], bestMonths: [0, 1, 2, 11], goodFor: ['Friends', 'Couples'], priceFrom: 300 }),
  P('orlando', { name: 'Orlando', where: 'Florida USA', tags: { themeparks: 1, family: 1 }, temps: [22, 23, 26, 28, 31, 32, 33, 33, 32, 29, 26, 23], bestMonths: [1, 2, 3, 10], goodFor: ['Families'], priceFrom: 120 }),
];

test('reads months, seasons and warmth', () => {
  const q = parseTripQuery('Beach in February');
  assert.deepEqual(q.months, [1]);
  assert.deepEqual(q.tags.map((t) => t.tag), ['beach']);
  assert.equal(parseTripQuery('winter sun').warm, true);
  assert.deepEqual(parseTripQuery('winter sun').months.sort((a, b) => a - b), [0, 1, 2, 10, 11]);
  assert.deepEqual(parseTripQuery('somewhere for Christmas').months, [11]);
  assert.deepEqual(parseTripQuery('summer').months, [5, 6, 7]);
  assert.deepEqual(parseTripQuery('sept').months, [8]);
});

test('reads who, length, flying and budget', () => {
  const q = parseTripQuery('Romantic city break, no flying');
  assert.deepEqual(q.who, ['couples']);
  assert.equal(q.short, true);
  assert.equal(q.noFly, true);
  assert.deepEqual(q.tags.map((t) => t.tag), ['city']);
  assert.deepEqual(q.words, []);
  assert.equal(parseTripQuery('cheap family holiday with the kids').budget, 'value');
  assert.deepEqual(parseTripQuery('cheap family holiday with the kids').who, ['families']);
  assert.equal(parseTripQuery('a five star treat').budget, 'luxury');
});

test('keeps place names and countries as words, ignoring filler', () => {
  assert.deepEqual(parseTripQuery('Greece').words, ['greece']);
  assert.deepEqual(parseTripQuery('somewhere nice in Portugal').words, ['portugal']);
  assert.equal(hasCriteria(parseTripQuery('a nice trip')), false);
  assert.equal(hasCriteria(parseTripQuery('ski')), true);
});

test('says what it understood', () => {
  assert.deepEqual(describeQuery(parseTripQuery('warm beach in February for couples')), ['Warm', 'Beach', 'February', 'Couples']);
});

test('warm in February finds the warm places, with the temperature', () => {
  const r = searchPlaces(parseTripQuery('warm in February'), places, 10);
  assert.deepEqual(r.map((x) => x.slug).slice(0, 1), ['maldives']);
  assert.ok(r[0].reasons.includes('27° in February'));
  assert.ok(!r.some((x) => x.slug === 'bath' || x.slug === 'zermatt'));
});

test('a country only shows places there', () => {
  assert.deepEqual(searchPlaces(parseTripQuery('greece'), places, 10).map((x) => x.slug), ['crete']);
  assert.deepEqual(searchPlaces(parseTripQuery('beach in greece'), places, 10).map((x) => x.slug), ['crete']);
});

test('ski, families and no flying', () => {
  assert.deepEqual(searchPlaces(parseTripQuery('skiing'), places, 10).map((x) => x.slug), ['zermatt']);
  assert.equal(searchPlaces(parseTripQuery('family holiday'), places, 10)[0].slug, 'orlando');
  const nf = searchPlaces(parseTripQuery('weekend without flying'), places, 10);
  assert.deepEqual(nf.map((x) => x.slug), ['bath']);
  assert.ok(nf[0].reasons.includes('No flight needed'));
});

test('good value uses the cheapest stay', () => {
  const r = placeForQuery(parseTripQuery('cheap beach'), places[1], 10);
  assert.equal(r.fit, 1);
  assert.ok(r.reasons.includes('From £90 a night'));
  assert.equal(placeForQuery(parseTripQuery('cheap'), places[0], 10), null);
});
