// Hotel taste (src/lib/hotels.ts + stayVerdict in match.ts): brands, class, styles and budget (owner, Nov 2026:
// "I love Ikos resorts, Four Seasons etc, something that's luxury but not too expensive"). Run with: npm test
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { brandOf, buildHotelTaste, hotelFit, hotelInfo } from '../src/lib/hotels.ts';
import { buildProfile, stayVerdict } from '../src/lib/match.ts';
import { placeDetails } from '../src/lib/placeDetails.ts';
import { isCitySlug, parseStaySub, stayKind } from '../src/lib/placeFeatures.ts';

const prefs = (p) => ({ kind: 'hotelPrefs', prefs: { brands: [], styles: [], budget: null, ...p } });
const profileOf = (...signals) => buildProfile(signals);

/** Every sample stay, scored for a profile, best first. */
function ranked(profile, slug) {
  const slugs = slug ? [slug] : Object.keys(placeDetails);
  return slugs
    .flatMap((s) =>
      placeDetails[s].stays.map((st) => {
        const { priceFrom, friend } = parseStaySub(st.sub);
        const v = stayVerdict(profile, { name: st.name, type: stayKind(st.type), label: st.type, priceFrom, friendScore: friend ? st.score : null, city: isCitySlug(s) });
        return { slug: s, name: st.name, priceFrom, tier: hotelInfo({ name: st.name, type: st.type, priceFrom }).tier, ...v };
      }),
    )
    .sort((a, b) => b.score - a.score);
}

test('brands and classes are recognised from the name', () => {
  assert.equal(brandOf('Ikos Porto Petro')?.id, 'ikos');
  assert.equal(brandOf('Four Seasons Hotel Ritz Lisbon')?.id, 'fourseasons');
  assert.equal(brandOf('Grand-Hôtel du Cap-Ferrat, A Four Seasons Hotel')?.id, 'fourseasons');
  assert.equal(brandOf('Amangalla')?.id, 'aman');
  assert.equal(brandOf('Casa Delfino'), null);
  assert.equal(hotelInfo({ name: 'Ikos Andalusia', priceFrom: 450 }).tier, 4);
  // Someone's flat is never a luxury hotel, whatever it costs.
  assert.ok(hotelInfo({ name: 'Chalet Matterhorn View', type: 'Airbnb', priceFrom: 450 }).tier <= 3);
});

test('no hotel taste: stays score as before (the friend’s score, or 7.6)', () => {
  const p = profileOf();
  assert.equal(stayVerdict(p, { name: 'Ikos Porto Petro', type: 'Hotel', priceFrom: 450, friendScore: null }).score, 7.6);
  assert.equal(stayVerdict(p, { name: 'Casa Delfino', type: 'Hotel', priceFrom: 190, friendScore: 8.9 }).score, 8.9);
});

test('loves Ikos and Four Seasons, luxury but sensibly priced: good luxury hotels within budget come first', () => {
  const p = profileOf(prefs({ brands: ['ikos', 'fourseasons'], budget: 'luxe' }));
  const top = ranked(p).slice(0, 12);
  for (const s of top) {
    assert.ok(s.tier >= 4, `${s.name} (${s.slug}) is luxury`);
    assert.ok(s.priceFrom >= 250 && s.priceFrom <= 750, `${s.name} (£${s.priceFrom}) is within about £300–600`);
  }
  // Among hotels no friend has rated, the brands you love lead.
  const unrated = ranked(p).filter((s) => !/stayed/.test(placeDetails[s.slug].stays.find((x) => x.name === s.name).sub)).slice(0, 6);
  assert.ok(unrated.slice(0, 3).every((s) => /ikos|four seasons/i.test(s.name)), unrated.map((s) => s.name).join(', '));
  // Friends' favourites don't all read 10.
  assert.ok(ranked(p)[0].score < 10);
  // Crete: a luxury resort, not a town-house hotel.
  assert.ok(['Blue Palace Elounda', 'Domes of Elounda', 'Daios Cove'].includes(ranked(p, 'crete')[0].name), ranked(p, 'crete')[0].name);
  // Mallorca and Marbella put their Ikos near the top (a friend's 9+ luxury hotel within budget may still lead).
  assert.ok(ranked(p, 'mallorca').slice(0, 2).some((s) => s.name === 'Ikos Porto Petro'), ranked(p, 'mallorca').map((s) => s.name).join(', '));
  assert.ok(ranked(p, 'marbella').slice(0, 2).some((s) => s.name === 'Ikos Andalusia'), ranked(p, 'marbella').map((s) => s.name).join(', '));
  const ikos = ranked(p, 'mallorca').find((s) => s.name === 'Ikos Porto Petro');
  assert.equal(ikos.reason, 'Ikos, a brand you love');
  assert.ok(ikos.score >= 8.7, String(ikos.score));
});

test('too expensive or too basic counts against it, and says so', () => {
  const p = profileOf(prefs({ brands: ['ikos', 'fourseasons'], budget: 'luxe' }));
  const maldives = ranked(p, 'maldives');
  const soneva = maldives.find((s) => s.name === 'Soneva Jani');
  assert.equal(soneva.reason, 'Over your usual budget');
  assert.equal(soneva.against, true);
  assert.ok(soneva.score < 9.2, `a friend's 9.x at £1,800 a night drops (${soneva.score})`);
  // A friend's £95 flat in Lisbon sits below the Four Seasons for this person.
  const lisbon = ranked(p, 'lisbon');
  assert.ok(lisbon.findIndex((s) => s.name === 'Four Seasons Hotel Ritz Lisbon') < lisbon.findIndex((s) => s.name === 'Casa Alfama'));
});

test('a value traveller sees good-value stays first', () => {
  const p = profileOf(prefs({ budget: 'value' }));
  const top = ranked(p).slice(0, 10);
  for (const s of top) assert.ok(s.priceFrom <= 200, `${s.name} £${s.priceFrom}`);
});

test('hotels you loved teach your taste: a 9.5 at Ikos Dassia lifts other Ikos resorts', () => {
  const before = profileOf();
  const after = profileOf({ kind: 'hotel', name: 'Ikos Dassia', type: 'Hotel', priceFrom: 380, weight: 1 });
  const stay = { name: 'Ikos Porto Petro', type: 'Hotel', priceFrom: 450, friendScore: null };
  const v = stayVerdict(after, stay);
  assert.ok(v.score > stayVerdict(before, stay).score + 0.5, String(v.score));
  assert.equal(v.reason, 'Like your stay at Ikos Dassia');
});

test('a hotel like a brand you love says so', () => {
  const t = buildHotelTaste([], { brands: ['ikos'], styles: [], budget: null });
  const v = hotelFit(t, { name: 'Daios Cove', type: 'Hotel', priceFrom: 380 });
  assert.equal(v.reason, 'Like Ikos, which you love');
  assert.ok(v.fit > 0.6);
});
