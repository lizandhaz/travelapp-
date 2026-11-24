import { getTrip, type FriendTrip } from './friendTrips';
import { countryOf } from './knownPlaces';
import { placeDetails } from './placeDetails';
import { featuresForSlug } from './placeFeatures';
import type { PhotoName } from './photos';
import { getPlace, places } from './sample';

/**
 * Example profiles for the sample friends (Maya, Priya, Tom, Sam, Jonah, Sophie, Harriet): who they are, their
 * trips (every sample place they rated, from the Friends feed and "What friends said"), who they
 * follow and who follows them, their boards and their stats. Sample content until real profiles are
 * shown to followers; the profile screen is app/person/[who].tsx.
 */

export type SampleBoard = { name: string; slugs: string[] };

export type SamplePerson = {
  /** "tom" (used in links: /person/tom). */
  id: string;
  name: string;
  handle: string;
  home: string;
  bio: string;
  face: PhotoName | null;
  /** Ids of the sample people they follow, and who follows them. */
  following: string[];
  followers: string[];
  /** They follow you back (shown as "Follows you"). */
  followsYou: boolean;
};

const PEOPLE: Omit<SamplePerson, 'followers'>[] = [
  { id: 'maya', name: 'Maya', handle: 'mayatravels', home: 'Bristol', bio: 'Islands, slow mornings and a good book by the water.', face: null, following: ['priya', 'tom', 'sophie', 'jonah'], followsYou: true },
  { id: 'priya', name: 'Priya', handle: 'priya.eats', home: 'London', bio: 'I plan holidays around lunch. Coast, food, repeat.', face: null, following: ['maya', 'sam', 'sophie', 'harriet'], followsYou: true },
  { id: 'tom', name: 'Tom', handle: 'tomwanders', home: 'Manchester', bio: 'Cities, mountains and the odd ski week. Always the long walk.', face: null, following: ['maya', 'jonah', 'sam'], followsYou: true },
  { id: 'sam', name: 'Sam', handle: 'samontheslopes', home: 'Edinburgh', bio: 'Snow in winter, safari when I can. Early starts are worth it.', face: null, following: ['tom', 'priya'], followsYou: false },
  { id: 'jonah', name: 'Jonah', handle: 'jonah.j', home: 'Leeds', bio: 'Weekends away with the kids. Castles, beaches, ice cream.', face: null, following: ['maya', 'tom', 'sophie'], followsYou: true },
  { id: 'harriet', name: 'Harriet', handle: 'harrietabroad', home: 'London', bio: 'Summer festivals, long lunches and gelato wherever I can find it.', face: null, following: ['maya', 'priya', 'sophie', 'tom'], followsYou: true },
  { id: 'sophie', name: 'Sophie', handle: 'sophieabroad', home: 'Brighton', bio: 'Big trips, rarely. I save for the ones I’ll talk about for years.', face: null, following: ['maya', 'priya', 'jonah', 'harriet'], followsYou: false },
];

const withFollowers: SamplePerson[] = PEOPLE.map((p) => ({ ...p, followers: PEOPLE.filter((o) => o.following.includes(p.id)).map((o) => o.id) }));

export const samplePeople = withFollowers;

/** A sample person by id ("tom") or name ("Tom"). */
export function getPerson(idOrName: string | null | undefined): SamplePerson | null {
  if (!idOrName) return null;
  const k = idOrName.trim().toLowerCase();
  return withFollowers.find((p) => p.id === k || p.name.toLowerCase() === k) ?? null;
}

/** The profile link for a name, or null when they're not a sample person (e.g. a real friend). */
export const personHref = (name: string) => (getPerson(name) ? `/person/${getPerson(name)!.id}` : null);

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
/** "Mar 2026" → a sortable number (later is bigger). */
export function monthValue(m: string): number {
  const [mon, year] = m.split(' ');
  return Number(year) * 12 + Math.max(0, MONTHS.indexOf(mon?.slice(0, 3)));
}

/** Every sample trip someone has, newest first. */
export function tripsOf(p: SamplePerson): FriendTrip[] {
  return places
    .map((pl) => getTrip(p.name, pl.slug))
    .filter((t): t is FriendTrip => !!t)
    .sort((a, b) => monthValue(b.month) - monthValue(a.month));
}

const countryFor = (slug: string) => {
  const pl = getPlace(slug);
  if (!pl) return '';
  return countryOf({ name: pl.name, country: pl.region.split(', ').pop() ?? '' }) || pl.region;
};

export function statsOf(p: SamplePerson) {
  const trips = tripsOf(p);
  const countries = new Set(trips.map((t) => countryFor(t.slug)).filter(Boolean)).size;
  return { trips: trips.length, countries };
}

// Board themes: a name and the holiday type a place needs to be on it.
const THEMES: { name: string; tag: string }[] = [
  { name: 'Beach escapes', tag: 'beach' },
  { name: 'Ski trips', tag: 'ski' },
  { name: 'City weekends', tag: 'city' },
  { name: 'Food trips', tag: 'food' },
  { name: 'Family days out', tag: 'family' },
];

/**
 * Their boards: "Want to go" (good places they haven't been, picked by what they rate highly), and
 * one themed board made from the kind of holiday they go on most.
 */
export function boardsOf(p: SamplePerson): SampleBoard[] {
  const been = new Set(tripsOf(p).map((t) => t.slug));
  const tagScore = (tag: string, slugs: string[]) => slugs.reduce((n, s) => n + (featuresForSlug(s)?.tags[tag] ?? 0), 0);
  const theme = [...THEMES].sort((a, b) => tagScore(b.tag, [...been]) - tagScore(a.tag, [...been]))[0];
  const seed = [...p.id].reduce((n, c) => n + c.charCodeAt(0), 0);
  const notBeen = places.filter((pl) => !been.has(pl.slug) && placeDetails[pl.slug]);
  const wish = notBeen
    .map((pl, i) => ({ slug: pl.slug, w: tagScore(theme.tag, [pl.slug]) + ((i * 7 + seed) % 10) / 20 }))
    .sort((a, b) => b.w - a.w)
    .slice(0, 5)
    .map((x) => x.slug);
  const themed = places
    .filter((pl) => (featuresForSlug(pl.slug)?.tags[theme.tag] ?? 0) >= 0.5)
    .map((pl) => pl.slug)
    .slice(0, 6);
  return [
    { name: 'Want to go', slugs: wish },
    ...(themed.length >= 2 ? [{ name: theme.name, slugs: themed }] : []),
  ];
}

/** A board's cover: the first place on it with one of the owner's photos. */
export const boardCover = (b: SampleBoard): PhotoName | null => b.slugs.map((s) => getPlace(s)?.photo).find(Boolean) ?? null;

/** Their taste: the holiday types of the places they rated well (as "Your taste" on You), top four. */
export function tasteOf(p: SamplePerson): string[] {
  const sum: Record<string, number> = {};
  for (const t of tripsOf(p)) {
    const w = (t.score - 6.5) / 3.5;
    for (const [tag, v] of Object.entries(featuresForSlug(t.slug)?.tags ?? {})) sum[tag] = (sum[tag] ?? 0) + w * v;
  }
  return Object.entries(sum)
    .filter(([, v]) => v > 0.6)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([t]) => t);
}

/** "Aug 2026" → "2026-08", for sorting and the year filter. */
export function isoMonth(m: string): string {
  const v = monthValue(m);
  return `${Math.floor(v / 12)}-${String((v % 12) + 1).padStart(2, '0')}`;
}
