import { plain } from './knownPlaces';
import { stayKind } from './placeFeatures';
import { placeDetails } from './placeDetails';
import { getPlace } from './sample';
import { STAY_GUIDE } from './stayGuide';
import type { StayKind } from './trips';

/**
 * Places to stay the app knows, for the "Where you stayed" suggestions in Add a trip: the hand-picked
 * guide of well-known stays in popular areas (stayGuide.ts), plus the stays in the sample place details.
 * You can still type any name.
 */
export type KnownStay = {
  name: string;
  type: StayKind;
  /** The area or place it's in ("Tenerife"). */
  place: string;
  /** Country or region. */
  region: string;
  /** Shown instead of the kind when it's more exact ("Hostel", "Riad / B&B", "Camp or lodge"). */
  label?: string;
  /** Towns and places in its area, plain (for matching the trip's place). */
  near?: string[];
};

const KINDS: Record<string, { type: StayKind; label?: string }> = {
  '^': { type: 'Villa' },
  '+': { type: 'B&B', label: 'B&B or guesthouse' },
  '~': { type: 'Other', label: 'Hostel' },
  '*': { type: 'Other', label: 'Lodge or camp' },
};

let all: KnownStay[] | null = null;
function knownStays(): KnownStay[] {
  if (all) return all;
  const seen = new Set<string>();
  all = [];
  for (const [area, country, nearList, stays] of STAY_GUIDE) {
    const near = [area, ...nearList.split('|')].map(plain);
    for (const raw of stays.split('|')) {
      const kind = KINDS[raw[0]];
      const name = kind ? raw.slice(1) : raw;
      const key = plain(name);
      if (seen.has(key)) continue;
      seen.add(key);
      all.push({ name, type: kind?.type ?? 'Hotel', label: kind?.label, place: area, region: country, near });
    }
  }
  for (const [slug, d] of Object.entries(placeDetails)) {
    const place = getPlace(slug);
    for (const s of d.stays) {
      const key = plain(s.name);
      if (seen.has(key)) continue;
      seen.add(key);
      all.push({ name: s.name, type: stayKind(s.type) as StayKind, place: place?.name ?? '', region: place?.region ?? '' });
    }
  }
  return all;
}

/** Is this stay in (or near) the trip's place? Matches the area, its towns, or the country when the trip is a whole country. */
function isHere(s: KnownStay, here: string, country: string): boolean {
  if (!here) return false;
  if (s.near?.some((n) => n === here || (n.length >= 4 && here.includes(n)) || (here.length >= 4 && n.includes(here)))) return true;
  const place = plain(s.place);
  if (place && (place === here || (place.length >= 4 && here.includes(place)) || (here.length >= 4 && place.includes(here)))) return true;
  // The trip is a whole country ("Greece"): everything there.
  return here === plain(s.region) || (!!country && here === country && plain(s.region) === country);
}

/**
 * Stays for what's typed. With the trip's place known, its stays come first and show from the first letter
 * (and with nothing typed yet, its best-known ones, so you can just tap). Elsewhere, from 2 letters:
 * names that start with what's typed, then a word that does, then any match. Up to `limit`.
 */
export function searchStays(query: string, tripPlace?: string | null, limit = 6, tripCountry?: string | null): KnownStay[] {
  const q = plain(query);
  const here = tripPlace ? plain(tripPlace) : '';
  const country = tripCountry ? plain(tripCountry) : '';
  const stays = knownStays();
  if (!q) return here ? stays.filter((s) => isHere(s, here, country)).slice(0, limit) : [];
  const rank = (s: KnownStay) => {
    const inPlace = isHere(s, here, country);
    if (!inPlace && q.length < 2) return null;
    const n = plain(s.name);
    const words = n.split(' ');
    const match = n.startsWith(q) ? 0 : words.some((w) => w.startsWith(q)) ? 1 : n.includes(q) ? 2 : 9;
    return match === 9 ? null : (inPlace ? 0 : 10) + match;
  };
  return stays
    .map((s, i) => ({ s, i, r: rank(s) }))
    .filter((x): x is { s: KnownStay; i: number; r: number } => x.r != null)
    .sort((a, b) => a.r - b.r || a.i - b.i)
    .slice(0, limit)
    .map((x) => x.s);
}
