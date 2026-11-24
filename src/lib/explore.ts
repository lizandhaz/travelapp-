import { countryOf } from './knownPlaces';
import { currentMonth } from './months';
import type { PhotoName } from './photos';
import { placeDetails } from './placeDetails';
import { featuresForSlug, parseStaySub } from './placeFeatures';
import { board, friendsFeed, getPlace, places, type BoardItem, type RowItem } from './sample';
import { describeQuery, hasCriteria, parseTripQuery, searchPlaces, type SearchablePlace } from './tripQuery';

/**
 * Explore's collections, worked out from each sample place's details (holiday types,
 * monthly temperatures, stay prices, who it suits, friends' ratings). Each collection
 * says why a place is in it ("27° in November", "from £95 a night").
 * Real places and ratings arrive in plan Steps E–F; this keeps working with them.
 */

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const thisMonth = () => Number(currentMonth().slice(5)) - 1;

/** Why a place is in a collection, or false if it isn't. */
type Test = (slug: string) => string | false;

export type PlaceCollection = { id: string; title: string; test: Test; photo?: PhotoName };

const tags = (slug: string) => featuresForSlug(slug)?.tags ?? {};
const price = (slug: string) => {
  const m = placeDetails[slug]?.staysFrom?.match(/£\s?(\d+)/);
  return m ? Number(m[1]) : null;
};
const kicker = (slug: string) => placeDetails[slug]?.kicker ?? '';
const goodFor = (slug: string) => (placeDetails[slug]?.goodFor ?? []).map((g) => g.toLowerCase());
const region = (slug: string) => getPlace(slug)?.region ?? '';

/** The friend who rated a place highest (Friends feed and "What friends said"). */
function topFriend(slug: string): { who: string; score: number } | null {
  const all = [...friendsFeed.filter((f) => f.slug === slug).map((f) => ({ who: f.who, score: f.score })), ...(placeDetails[slug]?.said ?? []).map((s) => ({ who: s.who, score: s.score ?? 0 }))];
  return all.sort((a, b) => b.score - a.score)[0] ?? null;
}

const UK = /England|Scotland|Wales|Cornwall|Cotswolds/;

export function placeCollections(): PlaceCollection[] {
  const m = thisMonth();
  const month = MONTHS[m];
  return [
    { id: 'sun-now', title: `Sunshine in ${month}`, test: (s) => ((placeDetails[s]?.temps?.[m] ?? 0) >= 24 ? `${placeDetails[s]!.temps![m]}° in ${month}` : false) },
    { id: 'best-now', title: `At their best in ${month}`, test: (s) => (placeDetails[s]?.bestMonths.includes(m) ? placeDetails[s]!.bestTime ?? `Best in ${month}` : false) },
    {
      id: 'friends-faves',
      title: 'Friends’ favourites',
      test: (s) => {
        const f = topFriend(s);
        return f && f.score >= 9 ? `${f.who} gave it ${f.score.toFixed(1)}` : false;
      },
    },
    { id: 'islands', title: 'Island escapes', test: (s) => ((tags(s).island ?? 0) >= 0.5 ? kicker(s) || region(s) : false) },
    { id: 'beaches', title: 'Beach holidays', photo: 'own-water-villas', test: (s) => ((tags(s).beach ?? 0) >= 0.6 ? kicker(s) || region(s) : false) },
    {
      id: 'winter-sun',
      title: 'Winter sun',
      test: (s) => {
        const t = placeDetails[s]?.temps;
        if (!t) return false;
        const avg = Math.round((t[11] + t[0] + t[1]) / 3);
        return avg >= 25 ? `${t[0]}° in January` : false;
      },
    },
    { id: 'cities', title: 'City breaks', photo: 'own-new-york-central-park', test: (s) => ((tags(s).city ?? 0) >= 0.6 ? region(s) : false) },
    {
      id: 'food',
      title: 'Foodie trips',
      test: (s) => {
        if ((tags(s).food ?? 0) < 0.5) return false;
        const eat = placeDetails[s]?.eats[0];
        return eat ? `Try ${eat.name}` : region(s);
      },
    },
    { id: 'culture', title: 'Culture and history', test: (s) => (Math.max(tags(s).culture ?? 0, tags(s).history ?? 0) >= 0.6 ? kicker(s) || region(s) : false) },
    { id: 'weekends', title: 'Weekends away', test: (s) => (/Weekend/.test(kicker(s)) ? region(s) : false) },
    { id: 'one-night', title: 'One night away', test: (s) => (/One night/.test(kicker(s)) ? region(s) : false) },
    {
      id: 'no-fly',
      title: 'Holiday without flying',
      test: (s) => (UK.test(region(s)) ? 'No flight needed' : s === 'paris' ? 'By Eurostar' : false),
    },
    { id: 'lakes-mountains', title: 'Lakes and mountains', test: (s) => (Math.max(tags(s).lakes ?? 0, tags(s).mountains ?? 0) >= 0.6 && (tags(s).ski ?? 0) < 0.5 ? kicker(s) || region(s) : false) },
    { id: 'ski', title: 'Ski and snow', photo: 'own-skiing', test: (s) => ((tags(s).ski ?? 0) >= 0.5 ? placeDetails[s]?.bestTime ?? region(s) : false) },
    { id: 'countryside', title: 'Countryside escapes', test: (s) => ((tags(s).countryside ?? 0) >= 0.6 ? region(s) : false) },
    {
      id: 'splurge',
      title: 'Once in a lifetime',
      test: (s) => {
        const p = price(s);
        return (p != null && p >= 300) || (tags(s).luxury ?? 0) >= 0.5 ? (p != null ? `from £${p} a night` : region(s)) : false;
      },
    },
    {
      id: 'value',
      title: 'Good value',
      test: (s) => {
        const p = price(s);
        return p != null && p <= 130 ? `from £${p} a night` : false;
      },
    },
    { id: 'couples', title: 'Romantic trips', test: (s) => (goodFor(s).includes('couples') ? region(s) : false) },
    { id: 'friends', title: 'Trips with friends', test: (s) => (goodFor(s).includes('friends') ? region(s) : false) },
    { id: 'families', title: 'Family holidays', test: (s) => (goodFor(s).includes('families') ? region(s) : false) },
    { id: 'solo', title: 'Solo trips', test: (s) => (goodFor(s).includes('solo') ? region(s) : false) },
  ];
}

/** The places in a collection, each as a card (its "sub" line says why). */
export function placesIn(c: PlaceCollection): RowItem[] {
  return places.flatMap((p) => {
    const why = c.test(p.slug);
    return why ? [{ slug: p.slug, name: p.name, sub: why, photo: p.photo, score: p.score ?? undefined }] : [];
  });
}

// ---------------------------------------------------------------------------
// Things to do, eat and stay, gathered from every place
// ---------------------------------------------------------------------------

export type ExploreItem = {
  key: string;
  slug: string;
  place: string;
  /** "Stay", "Eat", "Do", "Hidden gem" or a culture tag ("Festival"). */
  kind: string;
  /** For scoring: Stay / Eat / Do. */
  scoreKind: 'Stay' | 'Eat' | 'Do';
  name: string;
  what: string | null;
  photo: PhotoName | null;
};

export type ItemCollection = { id: string; title: string; items: () => ExploreItem[] };

function gather(pick: (slug: string, placeName: string, placePhoto: PhotoName | null) => ExploreItem[]): ExploreItem[] {
  return places.flatMap((p) => pick(p.slug, p.name, p.photo));
}

export const itemCollections: ItemCollection[] = [
  {
    id: 'gems',
    title: 'Hidden gems',
    items: () =>
      gather((slug, place, photo) =>
        (placeDetails[slug]?.dos ?? []).filter((d) => d.gem).map((d) => ({ key: `${slug}-${d.name}`, slug, place, kind: 'Hidden gem', scoreKind: 'Do' as const, name: d.name, what: d.what, photo })),
      ),
  },
  {
    id: 'stays',
    title: 'Where friends stayed',
    items: () =>
      gather((slug, place, photo) =>
        (placeDetails[slug]?.stays ?? [])
          .filter((s) => parseStaySub(s.sub).friend)
          .map((s) => ({ key: `${slug}-${s.name}`, slug, place, kind: s.type, scoreKind: 'Stay' as const, name: s.name, what: s.sub, photo: s.photo ?? photo })),
      ),
  },
  {
    id: 'eats',
    title: 'Friends’ favourite restaurants',
    items: () =>
      gather((slug, place, photo) =>
        (placeDetails[slug]?.eats ?? []).filter((e) => e.from).map((e) => ({ key: `${slug}-${e.name}`, slug, place, kind: 'Eat', scoreKind: 'Eat' as const, name: e.name, what: e.what, photo: e.photo ?? photo })),
      ),
  },
  {
    id: 'todo',
    title: 'Things to do',
    items: () =>
      gather((slug, place, photo) =>
        (placeDetails[slug]?.dos ?? []).filter((d) => !d.gem).map((d) => ({ key: `${slug}-${d.name}`, slug, place, kind: d.tag, scoreKind: 'Do' as const, name: d.name, what: d.what, photo })),
      ),
  },
  {
    id: 'culture-items',
    title: 'Culture and festivals',
    items: () =>
      gather((slug, place, photo) =>
        (placeDetails[slug]?.culture ?? []).map((c) => ({
          key: `${slug}-${c.name}`,
          slug,
          place,
          kind: `Culture · ${c.tag}`,
          scoreKind: 'Do' as const,
          name: c.name,
          what: c.what,
          photo,
        })),
      ),
  },
];

/** Search words across places and things ("lagoon", "sushi", "Portugal"). */
export function searchExplore(query: string): { places: RowItem[]; items: ExploreItem[] } {
  const words = query
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2);
  if (!words.length) return { places: [], items: [] };
  const hit = (text: string) => words.every((w) => text.toLowerCase().includes(w)) || words.some((w) => text.toLowerCase().split(/\W+/).includes(w));
  const placeHits = places.filter((p) => hit(`${p.name} ${p.region} ${countryOf({ name: p.name, country: p.region.split(', ').pop() ?? '' })} ${kicker(p.slug)} ${Object.keys(tags(p.slug)).join(' ')}`));
  const itemHits = itemCollections.flatMap((c) => c.items()).filter((i) => hit(`${i.name} ${i.kind} ${i.what ?? ''} ${i.place}`));
  return {
    places: placeHits.map((p) => ({ slug: p.slug, name: p.name, sub: p.region, photo: p.photo, score: p.score ?? undefined })),
    items: itemHits.filter((i, n, a) => a.findIndex((x) => x.key === i.key) === n).slice(0, 30),
  };
}

// ---------------------------------------------------------------------------
// The Explore feed: the prototype's board, then every other place and thing, mixed
// ---------------------------------------------------------------------------

/** A tile in the Explore feed. `href` opens a collection instead of a place. */
export type FeedItem = BoardItem & { href?: string };

const STAY_KINDS = ['Hotel', 'Villa', 'B&B', 'Airbnb', 'Riad', 'Ryokan', 'Other'];

/**
 * The long Explore feed: the prototype's 64 tiles first (its collection tiles open the
 * matching collection, or are left out), then every other place and thing to stay, eat,
 * do and see from all 39 places, taking turns so the feed never runs one kind for long.
 */
export function exploreFeed(): FeedItem[] {
  const cols = [...placeCollections(), ...itemCollections];
  const byTitle = new Map(cols.map((c) => [c.title.toLowerCase().replace(/’/g, "'"), c.id]));
  const seen = new Set<string>();
  const out: FeedItem[] = [];

  for (const b of board) {
    if (b.kind === 'Collection') {
      const id = byTitle.get(b.name.toLowerCase().replace(/’/g, "'"));
      if (id) out.push({ ...b, href: `/collection/${id}` });
      continue;
    }
    seen.add(b.kind === 'place' ? `place:${b.slug}` : `${b.slug}:${b.name.toLowerCase()}`);
    out.push(b);
  }

  const morePlaces: FeedItem[] = places
    .filter((p) => !seen.has(`place:${p.slug}`))
    .map((p) => ({ slug: p.slug, kind: 'place', name: `${p.name}, ${p.region}`, sub: kicker(p.slug) || p.region, photo: p.photo, score: p.score ?? undefined }));
  const things = itemCollections.flatMap((c) => c.items());
  const asTile = (i: ExploreItem): FeedItem => ({ slug: i.slug, kind: i.kind, name: i.name, sub: i.place, photo: i.photo });
  const fresh = (i: ExploreItem) => !seen.has(`${i.slug}:${i.name.toLowerCase()}`);
  const pools = [
    morePlaces,
    things.filter((i) => i.kind === 'Eat' && fresh(i)).map(asTile),
    things.filter((i) => STAY_KINDS.includes(i.kind) && fresh(i)).map(asTile),
    things.filter((i) => i.scoreKind === 'Do' && i.kind !== 'Hidden gem' && !i.kind.includes('·') && fresh(i)).map(asTile),
    things.filter((i) => (i.kind === 'Hidden gem' || i.kind.includes('·')) && fresh(i)).map(asTile),
  ];
  // Take turns from each pool (a place, a meal, a stay, something to do, a gem or festival…).
  while (pools.some((p) => p.length)) {
    for (const p of pools) {
      const next = p.shift();
      if (next && !seen.has(`${next.slug}:${next.name.toLowerCase()}`)) {
        seen.add(`${next.slug}:${next.name.toLowerCase()}`);
        out.push(next);
      }
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Search: "beach in February", "romantic weekend", "Greece" (lib/tripQuery.ts)
// ---------------------------------------------------------------------------

const noFlyTest = (slug: string) => UK.test(region(slug)) || slug === 'paris';

let searchable: SearchablePlace[] | null = null;
/** Every sample place in the search's terms (worked out once). */
function searchablePlaces(): SearchablePlace[] {
  searchable ??= places.map((p) => {
    const f = featuresForSlug(p.slug);
    const d = placeDetails[p.slug];
    return {
      slug: p.slug,
      name: p.name,
      where: `${p.region} ${countryOf({ name: p.name, country: p.region.split(', ').pop() ?? '' })}`,
      tags: f?.tags ?? {},
      temps: d?.temps ?? null,
      bestMonths: d?.bestMonths ?? [],
      goodFor: d?.goodFor ?? [],
      priceFrom: price(p.slug),
      noFly: noFlyTest(p.slug),
      rating: p.score ?? f?.baseScore ?? null,
    };
  });
  return searchable;
}

/**
 * Explore's search. Null when the words carry no meaning ("a nice trip"); otherwise what we
 * understood ("Beach", "February") and the places that fit, best first, each with why.
 */
export function searchTrips(text: string): { understood: string[]; places: RowItem[] } | null {
  const q = parseTripQuery(text);
  if (!hasCriteria(q)) return null;
  const found = searchPlaces(q, searchablePlaces(), thisMonth());
  return {
    understood: describeQuery(q),
    places: found.map((r) => {
      const p = getPlace(r.slug)!;
      return { slug: p.slug, name: p.name, sub: r.reasons.slice(0, 3).join(' · ') || p.region, photo: p.photo, score: p.score ?? undefined };
    }),
  };
}
