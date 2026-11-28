import assert from 'node:assert/strict';
import test from 'node:test';

import { curateExploreFeed } from '../src/lib/explore.ts';
import { cityNear, estimateJourney, groupNearbyTrips, searchDepartureCities } from '../src/lib/nearbyTrips.ts';

const london = [51.51, -0.13];
const miami = [25.76, -80.19];
const paris = [48.86, 2.35];
const turks = [21.78, -72.27];

test('a manual city or region is available without device location', () => {
  assert.equal(searchDepartureCities('London, England')[0]?.name, 'London');
  assert.equal(searchDepartureCities('Florida')[0]?.name, 'Florida');
  assert.equal(searchDepartureCities('Miami')[0]?.name, 'Miami');
  assert.equal(searchDepartureCities('unfindable-place').length, 0);
});

test('approximate location resolves offline and leaves remote points unassigned', () => {
  assert.equal(cityNear(london)?.name, 'London');
  assert.ok(cityNear(miami)?.region === 'USA');
  assert.equal(cityNear([0, -120]), null);
  assert.equal(cityNear([NaN, 0]), null);
});

test('the same destinations group differently from London and Florida', () => {
  assert.equal(estimateJourney(london, paris)?.group, 'weekend');
  assert.equal(estimateJourney(miami, paris)?.group, 'long');
  assert.equal(estimateJourney(miami, turks)?.group, 'weekend');
  assert.equal(estimateJourney(london, turks)?.group, 'long');
  assert.equal(estimateJourney(london, london), null);
});

test('taste and the season change the order inside a group without changing the score', () => {
  const places = [
    { name: 'Paris', point: paris, bestMonths: [4], taste: 8.6 },
    { name: 'The Alps', point: [46.02, 7.75], bestMonths: [0], taste: 8.78 },
  ];
  assert.equal(groupNearbyTrips(london, places, 0)[0].places[0], places[1]);
  assert.equal(groupNearbyTrips(london, places, 4)[0].places[0], places[0]);
  assert.equal(places[1].taste, 8.78);
});

test('Explore blends nearby places into its existing cards without repeating destinations', () => {
  const place = (slug) => ({ slug, kind: 'place', name: slug, sub: '', photo: null });
  const parisStory = { ...place('paris'), kind: 'Eat', name: 'Lunch in Paris' };
  const cards = [place('paris'), parisStory, place('bath'), place('turks'), place('paris'), place('york'), place('bath')];
  const ranked = [
    { id: 'weekend', places: [{ slug: 'paris' }, { slug: 'york' }, { slug: 'bath' }] },
    { id: 'long', places: [{ slug: 'turks' }] },
  ];
  assert.deepEqual(curateExploreFeed(cards, [{ slug: 'paris' }], ranked).map(({ name }) => name), ['york', 'Lunch in Paris', 'bath', 'turks']);
  assert.deepEqual(curateExploreFeed(cards, [{ slug: 'paris' }]).map(({ name }) => name), ['Lunch in Paris', 'bath', 'turks', 'york']);
});
