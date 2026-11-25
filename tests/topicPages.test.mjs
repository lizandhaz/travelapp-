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
