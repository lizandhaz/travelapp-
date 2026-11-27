// Search a topic, and each place page leads with it (owner, Nov 2026). Uses the real sample places. Run with: npm test
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { searchTrips, topicPicks } from '../src/lib/explore.ts';

test('"golf trips" opens golf places tailored to golf', () => {
  const r = searchTrips('golf trips');
  assert.ok(r && r.places.length >= 6);
  assert.ok(r.places.every((p) => p.topic === 'golf'), 'every golf result opens its golf version');
  const algarve = topicPicks('algarve', 'golf');
  assert.equal(algarve.label, 'Golf');
  assert.ok(algarve.picks.some((p) => p.name === 'Monte Rei'));
  assert.ok(!algarve.picks.some((p) => /Benagil/.test(p.name)), 'only golf things');
});

test('other topics tailor pages too, and unknown topics leave the page alone', () => {
  assert.ok(topicPicks('paris', 'museums').picks.some((p) => /Orsay/.test(p.name)));
  assert.ok(topicPicks('santorini', 'wine').picks.some((p) => p.name === 'Santo Wines'));
  assert.ok(topicPicks('maldives', 'snorkel').picks.some((p) => p.name === 'Hanifaru Bay'));
  assert.equal(topicPicks('paris', ''), null);
  assert.equal(topicPicks('paris', 'golf'), null);
});

// One taste page for every taste on a profile (owner, Nov 2026: tap "Food" or "Skiing" under Your taste).
test('taste pages: ski is ski resorts, food is foodie places, nightlife has no golf clubs', async () => {
  const { tastePage } = await import('../src/lib/explore.ts');
  const ski = tastePage('ski');
  for (const slug of ['verbier', 'zermatt', 'chamonix', 'courchevel']) assert.ok(ski.places.some((p) => p.slug === slug), `ski has ${slug}`);
  assert.ok(!ski.places.some((p) => ['maldives', 'paris', 'borabora'].includes(p.slug)), 'no beaches or cities for ski');
  assert.ok(ski.spots.length > 0 && ski.places.every((p) => p.topic === 'ski' || p.topic === undefined));
  const food = tastePage('food');
  assert.ok(food.places.length >= 20 && food.places.length < 60, `food is picky: ${food.places.length}`);
  assert.ok(food.places.some((p) => p.slug === 'puglia') && food.places.some((p) => p.slug === 'sicily'));
  const night = tastePage('nightlife');
  assert.ok(!night.spots.some((s) => /golf/i.test(s.name)), 'no golf clubs as nightlife');
  // Any taste works, even one with nothing yet.
  assert.deepEqual(tastePage('not-a-taste').places, []);
});
