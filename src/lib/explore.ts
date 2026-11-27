import { countryOf } from './knownPlaces';
import { currentMonth } from './months';
import type { PhotoName } from './photos';
import { placeDetails, type PlaceDetail } from './placeDetails';
import { featuresForSlug, parseStaySub } from './placeFeatures';
import { board, friendsFeed, getPlace, photoForActivity, places, type BoardItem, type RowItem } from './sample';
import { describeQuery, hasCriteria, parseTripQuery, searchPlaces, thingMatches, topicById, type PageThing, type SearchablePlace } from './tripQuery';

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

/** Sample places on the Amalfi Coast (for its collection). */
const AMALFI = ['positano', 'capri'];

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
  /** A photo of this very thing, or null: never a photo of something else (owner, Nov 2026: "only show things that are accurate"). */
  photo: PhotoName | null;
  /** Its place's photo: only for a collection's cover, never on the thing's own card. */
  cover: PhotoName | null;
};

export type ItemCollection = { id: string; title: string; items: () => ExploreItem[]; /** A chosen cover photo. */ photo?: PhotoName };

function gather(pick: (slug: string, placeName: string, placePhoto: PhotoName | null) => ExploreItem[]): ExploreItem[] {
  return places.flatMap((p) => pick(p.slug, p.name, p.photo));
}

/** Every stay whose "from" price a night passes the test, cheapest first. */
function staysPriced(ok: (price: number) => boolean): ExploreItem[] {
  return gather((slug, place, photo) =>
    (placeDetails[slug]?.stays ?? [])
      .map((s) => ({ s, price: parseStaySub(s.sub).priceFrom }))
      .filter(({ price }) => price != null && ok(price))
      .map(({ s }) => ({ key: `${slug}-${s.name}`, slug, place, kind: s.type, scoreKind: 'Stay' as const, name: s.name, what: s.sub, photo: s.photo, cover: photo })),
  ).sort((a, b) => (parseStaySub(a.what).priceFrom ?? 0) - (parseStaySub(b.what).priceFrom ?? 0));
}

export const itemCollections: ItemCollection[] = [
  {
    // Owner, Nov 2026: where friends stayed, ate and what they did on the Amalfi Coast (Positano for now; more places join as they're added).
    id: 'amalfi',
    title: 'Amalfi Coast',
    photo: 'own-capri-faraglioni',
    items: () =>
      gather((slug, place, photo) => {
        if (!AMALFI.includes(slug)) return [];
        const d = placeDetails[slug];
        return [
          ...(d?.stays ?? []).map((x) => ({ key: `${slug}-${x.name}`, slug, place, kind: x.type, scoreKind: 'Stay' as const, name: x.name, what: x.sub, photo: x.photo, cover: photo })),
          ...(d?.eats ?? []).map((x) => ({ key: `${slug}-${x.name}`, slug, place, kind: 'Eat', scoreKind: 'Eat' as const, name: x.name, what: x.what, photo: x.photo, cover: photo })),
          ...(d?.dos ?? []).map((x) => ({ key: `${slug}-${x.name}`, slug, place, kind: x.gem ? 'Hidden gem' : x.tag, scoreKind: 'Do' as const, name: x.name, what: x.what, photo: photoForActivity(x), cover: photo })),
        ];
      }),
  },
  {
    id: 'gems',
    title: 'Hidden gems',
    items: () =>
      gather((slug, place, photo) =>
        (placeDetails[slug]?.dos ?? []).filter((d) => d.gem).map((d) => ({ key: `${slug}-${d.name}`, slug, place, kind: 'Hidden gem', scoreKind: 'Do' as const, name: d.name, what: d.what, photo: photoForActivity(d), cover: photo })),
      ),
  },
  {
    id: 'stays',
    title: 'Where friends stayed',
    items: () =>
      gather((slug, place, photo) =>
        (placeDetails[slug]?.stays ?? [])
          .filter((s) => parseStaySub(s.sub).friend)
          .map((s) => ({ key: `${slug}-${s.name}`, slug, place, kind: s.type, scoreKind: 'Stay' as const, name: s.name, what: s.sub, photo: s.photo, cover: photo })),
      ),
  },
  // Stays by budget (owner, Nov 2026: filter where to stay by price). Each opens the stay's own page.
  {
    id: 'stays-value',
    title: 'Stays under £150 a night',
    items: () => staysPriced((p) => p < 150),
  },
  {
    id: 'stays-splurge',
    title: 'Worth the splurge',
    items: () => staysPriced((p) => p >= 500),
  },
  {
    id: 'eats',
    title: 'Friends’ favourite restaurants',
    items: () =>
      gather((slug, place, photo) =>
        (placeDetails[slug]?.eats ?? []).filter((e) => e.from).map((e) => ({ key: `${slug}-${e.name}`, slug, place, kind: 'Eat', scoreKind: 'Eat' as const, name: e.name, what: e.what, photo: e.photo, cover: photo })),
      ),
  },
  {
    id: 'todo',
    title: 'Things to do',
    items: () =>
      gather((slug, place, photo) =>
        (placeDetails[slug]?.dos ?? []).filter((d) => !d.gem).map((d) => ({ key: `${slug}-${d.name}`, slug, place, kind: d.tag, scoreKind: 'Do' as const, name: d.name, what: d.what, photo: photoForActivity(d), cover: photo })),
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
          photo: null,
          cover: photo,
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
// Well-known golf holiday spots among the sample places (owner, Nov 2026: "golf holidays" found nothing).
const GOLF = new Set(['algarve', 'mallorca', 'tenerife', 'dubai', 'cyprus', 'costabrava', 'mauritius', 'turks', 'marbella']);
// …and well-known wine places ("wine tasting" put Heidelberg first).
const WINE = new Set(['tuscany', 'southafrica', 'madeira', 'santorini', 'sicily', 'porto', 'lanzarote', 'bordeaux']);

/** What's on a place's page, for search topics: things to do, restaurants, culture, stays and tips. */
function pageThings(d: PlaceDetail | undefined): PageThing[] {
  return [
    ...(d?.dos ?? []).map((x) => ({ name: x.name, text: `${x.tag} ${x.what ?? ''}`, kind: 'do' as const })),
    ...(d?.eats ?? []).map((x) => ({ name: x.name, text: `restaurant ${x.what ?? ''}`, kind: 'eat' as const })),
    ...(d?.culture ?? []).map((x) => ({ name: x.name, text: `${x.tag} ${x.what ?? ''}`, kind: 'culture' as const })),
    ...(d?.stays ?? []).map((x) => ({ name: '', text: `${x.name} ${x.sub ?? ''}`, kind: 'stay' as const })),
    ...(d?.tips ?? []).map((x) => ({ name: '', text: x.tip, kind: 'tip' as const })),
    { name: '', text: d?.kicker ?? '', kind: 'about' as const },
  ];
}

/** One thing on a place's page that fits what you searched for. */
export type TopicPick = { kind: 'do' | 'eat' | 'culture' | 'stay' | 'tip'; label: string; name: string; what: string | null };

/**
 * A place page tailored to a search (owner, Nov 2026: search "golf" and each place shows its golf). The things on the
 * page that fit the topic: things to do and culture first, then where to stay, eat, and tips.
 * Null when the topic is unknown or the place has nothing for it.
 */
export function topicPicks(slug: string, topicId: string | undefined): { label: string; picks: TopicPick[]; stayNames: string[] } | null {
  const topic = topicById(topicId);
  const d = placeDetails[slug];
  if (!topic || !d) return null;
  const fits = (kind: PageThing['kind'], name: string, text: string) => thingMatches(topic, { kind, name, text });
  const picks: TopicPick[] = [
    ...d.dos.filter((x) => fits('do', x.name, `${x.tag} ${x.what ?? ''}`)).map((x) => ({ kind: 'do' as const, label: x.tag, name: x.name, what: x.what })),
    ...d.culture.filter((x) => fits('culture', x.name, `${x.tag} ${x.what ?? ''}`)).map((x) => ({ kind: 'culture' as const, label: x.tag, name: x.name, what: x.what })),
    ...d.stays.filter((x) => fits('stay', '', `${x.name} ${x.sub ?? ''}`)).map((x) => ({ kind: 'stay' as const, label: x.type, name: x.name, what: x.sub })),
    ...d.eats.filter((x) => fits('eat', x.name, `restaurant ${x.what ?? ''}`)).map((x) => ({ kind: 'eat' as const, label: x.price ? `Eat · ${x.price}` : 'Eat', name: x.name, what: x.what })),
    ...d.tips.filter((x) => fits('tip', '', x.tip)).map((x) => ({ kind: 'tip' as const, label: 'Top tip', name: x.tip, what: x.from ? `From ${x.from}` : null })),
  ];
  if (!picks.length) return null;
  return { label: topic.label, picks, stayNames: picks.filter((p) => p.kind === 'stay').map((p) => p.name) };
}

function searchablePlaces(): SearchablePlace[] {
  searchable ??= places.map((p) => {
    const f = featuresForSlug(p.slug);
    const d = placeDetails[p.slug];
    // What's on the page, for search topics: things to do, restaurants, culture, stays and tips.
    return {
      things: pageThings(d),
      slug: p.slug,
      name: p.name,
      where: `${p.region} ${countryOf({ name: p.name, country: p.region.split(', ').pop() ?? '' })}`,
      tags: { ...(f?.tags ?? {}), ...(GOLF.has(p.slug) ? { golf: 1 } : {}), ...(WINE.has(p.slug) ? { wine: 1 } : {}) },
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
  // Searching for a topic ("golf trips") opens each place tailored to it.
  const topic = q.topics[0]?.id;
  return {
    understood: describeQuery(q),
    places: found.map((r) => {
      const p = getPlace(r.slug)!;
      return { slug: p.slug, name: p.name, sub: r.reasons.slice(0, 3).join(' · ') || p.region, photo: p.photo, score: p.score ?? undefined, topic: topic && topicPicks(p.slug, topic) ? topic : undefined };
    }),
  };
}

// ---------------------------------------------------------------------------
// Collection tiles (Home's "Dip into collections", Explore's "Find your next trip")
// ---------------------------------------------------------------------------

export type CollectionTileInfo = { id: string; title: string; photo: PhotoName; count: number };

/**
 * Every collection with at least three things in it, each with its own cover photo: no two tiles share
 * a photo (owner, Nov 2026). Chosen covers (a collection's `photo`) are kept first; the rest take the
 * first photo of theirs not already used, and a collection with no unused photo is left out.
 */
export function collectionTiles(): CollectionTileInfo[] {
  const all = [
    ...placeCollections().map((c) => ({ id: c.id, title: c.title, cover: c.photo ?? null, photos: placesIn(c).map((p) => p.photo) })),
    ...itemCollections.map((c) => ({ id: c.id, title: c.title, cover: c.photo ?? null, photos: c.items().map((i) => i.photo ?? i.cover) })),
  ].filter((c) => c.photos.length >= 3);
  const used = new Set<PhotoName>(all.map((c) => c.cover).filter((p): p is PhotoName => !!p));
  const out: CollectionTileInfo[] = [];
  for (const c of all) {
    let photo = c.cover;
    if (!photo) {
      photo = c.photos.find((p): p is PhotoName => !!p && !used.has(p)) ?? null;
      if (photo) used.add(photo);
    }
    if (photo) out.push({ id: c.id, title: c.title, photo, count: c.photos.length });
  }
  return out;
}

// ---------------------------------------------------------------------------
// A taste's page (owner, Nov 2026: tap "Food" or "Skiing" under Your taste on a profile)
// ---------------------------------------------------------------------------

/** Tastes that are also search topics: their page lists matching spots too, and opens places tailored to them. */
const TASTE_TOPIC: Record<string, { topic: string; /** How many things on a page bring in a place not tagged with the taste (0 = never). */ min: number }> = {
  food: { topic: 'food', min: 2 },
  ski: { topic: 'ski', min: 0 }, // cable cars and glaciers aren't skiing: only real ski resorts
  wellness: { topic: 'spa', min: 2 },
  hiking: { topic: 'walking', min: 0 }, // a stroll round the city walls or the old town isn't a hiking holiday
  outdoors: { topic: 'walking', min: 0 },
  nightlife: { topic: 'nightlife', min: 2 },
  history: { topic: 'history', min: 2 },
  culture: { topic: 'sights', min: 2 },
  golf: { topic: 'golf', min: 1 },
  wine: { topic: 'wine', min: 2 },
};

/**
 * Everything for one taste, for the shared taste page (app/taste/[tag].tsx): any holiday type the matching engine
 * knows, now or later. Places count when the taste is part of what they are (their tag is at least 0.5), or, for a
 * taste that's also a search topic, when their page has enough things for it (TASTE_TOPIC's `min`: Verbier's W Spa
 * for spas; never for skiing, as cable cars aren't ski resorts). Each place's line says why; spots are the restaurants, stays and things to do that fit, at most
 * two a place. The screen sorts both best for you first.
 */
export function tastePage(tag: string): { topic: string | null; places: RowItem[]; spots: ExploreItem[] } {
  const topic = TASTE_TOPIC[tag]?.topic ?? null;
  const min = TASTE_TOPIC[tag]?.min ?? 0;
  const found: RowItem[] = [];
  const spots: ExploreItem[] = [];
  for (const p of searchablePlaces()) {
    const place = getPlace(p.slug);
    if (!place) continue;
    const picks = topic ? (topicPicks(p.slug, topic)?.picks ?? []).filter((x) => x.kind !== 'tip') : [];
    const weight = p.tags[tag] ?? 0;
    // Every place has restaurants, so for food only food things beyond them (markets, cooking classes) count towards it.
    const counted = topic === 'food' ? picks.filter((x) => x.kind !== 'eat') : picks;
    if (weight < 0.5 && (!min || counted.length < min)) continue;
    // For food, the restaurants lead the line and the spots.
    const shown = topic === 'food' ? [...picks.filter((x) => x.kind === 'eat'), ...picks.filter((x) => x.kind !== 'eat')] : picks;
    const why = shown.length ? shown.slice(0, 2).map((x) => x.name).join(' · ') : kicker(p.slug) || place.region;
    found.push({ slug: p.slug, name: place.name, sub: why, photo: place.photo, score: place.score ?? undefined, topic: shown.length ? topic! : undefined });
    for (const x of shown.slice(0, 2))
      spots.push({
        key: `${p.slug}-${x.name}`,
        slug: p.slug,
        place: place.name,
        kind: x.kind === 'eat' ? 'Eat' : x.kind === 'culture' ? `Culture · ${x.label}` : x.label,
        scoreKind: x.kind === 'stay' ? 'Stay' : x.kind === 'eat' ? 'Eat' : 'Do',
        name: x.name,
        what: x.what,
        photo: x.kind === 'do' || x.kind === 'culture' ? photoForActivity({ name: x.name, what: x.what }) : null,
        cover: place.photo,
      });
  }
  return { topic, places: found, spots };
}
