// "Best time to go" in plain words (owner, Nov 2026). Run with: npm test
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { bestSummary, monthLine, monthRuns, monthVerdicts, rangeText } from '../src/lib/bestTime.ts';
import { placeDetails } from '../src/lib/placeDetails.ts';

test('a month is never both best and very busy: busy best months become "good"', () => {
  const data = { temps: null, bestMonths: [4, 5, 6, 7, 8, 9, 10, 11], crowds: [2, 1, 1, 2, 2, 1, 2, 2, 2, 3, 3, 3] };
  const v = monthVerdicts(data);
  assert.deepEqual(v.slice(4, 9), ['best', 'best', 'best', 'best', 'best']);
  assert.deepEqual(v.slice(9), ['good', 'good', 'good']);
  assert.equal(v[0], 'off');
  // All best months very busy: they still count as best.
  assert.deepEqual(monthVerdicts({ temps: null, bestMonths: [6, 7], crowds: Array(12).fill(3) }).filter((x) => x === 'best').length, 2);
});

test('month ranges read naturally, even over New Year', () => {
  assert.deepEqual(monthRuns([10, 11, 0, 1, 2]), [[10, 2]]);
  assert.equal(rangeText([10, 11, 0, 1, 2]), 'November to March');
  assert.equal(rangeText([5, 8, 9]), 'June, September and October');
  assert.equal(rangeText([5, 8, 9, 10]), 'June and September to November');
  assert.equal(rangeText([0, 1, 2, 3, 6, 7], true), 'Jan–Apr, Jul, Aug');
  assert.equal(rangeText([4, 5, 6], true), 'May–Jul');
  assert.equal(rangeText([...Array(12).keys()]), 'all year round');
});

test('Mauritius: one clear line and a sentence per month', () => {
  const d = placeDetails.mauritius;
  const s = bestSummary(d);
  assert.match(s, /^Best May, June and September · 25–26° by day · quietest in June$/);
  assert.match(s, /° by day/);
  assert.match(monthLine(d, 4), /^May · \d+° · busy · one of the best months$/);
  assert.match(monthLine(d, 10), /^November · 28° · great weather, but very busy$/);
  assert.match(bestSummary(placeDetails.verbier), /^Best January to March · −1 to 4° by day/);
});

test('every place with best months gets a summary', () => {
  for (const [slug, d] of Object.entries(placeDetails)) if (d.bestMonths.length) assert.ok(bestSummary(d).startsWith('Best '), slug);
});
