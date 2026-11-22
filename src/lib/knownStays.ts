import { plain } from './knownPlaces';
import { stayKind } from './placeFeatures';
import { placeDetails } from './placeDetails';
import { getPlace } from './sample';
import type { StayKind } from './trips';

/**
 * Hotels, villas, B&Bs and so on the app already knows (from the sample places), for the
 * "Where you stayed" suggestions in Add a trip. You can still type any name.
 */
export type KnownStay = { name: string; type: StayKind; place: string; region: string };

let all: KnownStay[] | null = null;
function knownStays(): KnownStay[] {
  if (all) return all;
  const seen = new Set<string>();
  all = [];
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

/**
 * Stays matching what's typed (2+ letters): ones in the trip's place first, then names that start
 * with the words typed, then names that contain them. Up to `limit`.
 */
export function searchStays(query: string, tripPlace?: string | null, limit = 6): KnownStay[] {
  const q = plain(query);
  if (q.length < 2) return [];
  const here = tripPlace ? plain(tripPlace) : '';
  const rank = (s: KnownStay) => {
    const n = plain(s.name);
    const words = n.split(' ');
    const match = n.startsWith(q) ? 0 : words.some((w) => w.startsWith(q)) ? 1 : n.includes(q) ? 2 : 9;
    const inPlace = here && (plain(s.place).includes(here) || here.includes(plain(s.place)) || plain(s.region).includes(here)) ? 0 : 1;
    return match === 9 ? null : inPlace * 10 + match;
  };
  return knownStays()
    .map((s) => ({ s, r: rank(s) }))
    .filter((x): x is { s: KnownStay; r: number } => x.r != null)
    .sort((a, b) => a.r - b.r || a.s.name.localeCompare(b.s.name))
    .slice(0, limit)
    .map((x) => x.s);
}
