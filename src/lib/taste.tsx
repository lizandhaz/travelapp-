import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { useAuth } from './auth';
import { fetchBoards, placesOn } from './boards';
import { countryOf } from './knownPlaces';
import { buildProfile, itemScore, tagRarity, scorePlace, stayScore, stayVerdict, topTastes, type FriendRating, type PlaceResult, type Profile, type Signal } from './match';
import { featuresForPlace, featuresForSlug, findSampleStay, isCitySlug, parseStaySub, sampleFriendRatings, stayKind, tagsForListName, tasteItemInfo } from './placeFeatures';
import { getHotelPrefs } from './hotelPrefs';
import { EMPTY_HOTEL_PREFS, type HotelPrefs } from './hotels';
import { places } from './sample';
import { onTasteChanged } from './tasteEvents';
import { getStartTaste } from './startTaste';
import { fetchMyTrips, type Place } from './trips';
import { fetchPlaceViews } from './views';
import { DEFAULT_MATCH_SETTINGS, getMatchSettings, type MatchSettings } from './matchSettings';

/**
 * Your taste, for the whole app: built from your trips and saved places (and friends'
 * ratings), and rebuilt whenever one of those changes. Screens use useTaste() to get
 * your personal score out of 10 for any place (the app shows scores only, no % match).
 * The maths is in lib/match.ts.
 */

type TasteValue = {
  /** False until your trips and lists have loaded (numbers are neutral until then). */
  ready: boolean;
  profile: Profile;
  /** Whether friends' ratings are used (Settings → Your scores). */
  usingFriends: boolean;
  /** Your score and reasons for a sample place page. */
  forSlug: (slug: string) => PlaceResult | null;
  /** The same for any place by name. */
  forPlace: (place: Place) => PlaceResult;
  /** Your score out of 10 for a stay on a place page (`slug` = the place it's in). */
  stayScoreFor: (stay: { name: string; type: string; sub: string | null; score: number | null }, slug?: string) => number;
  /** The main reason for a stay's score ("Ikos, a brand you love"), and whether it counts against it. */
  stayWhy: (stay: { name: string; type: string; sub: string | null; score: number | null }, slug?: string) => { reason: string | null; against: boolean };
  /** True once we know anything about the hotels you like (rated or saved hotels, or the "Hotels you love" page). */
  knowsHotels: boolean;
  /** What you told us on the "Hotels you love" page. */
  hotelPrefs: HotelPrefs;
  /** Your score out of 10 for a place to eat on a place page. */
  eatScoreFor: (eat: { score: number | null; from: string | null }) => number;
  /** Your score and a friends' line for a "Made for your taste" item, judged on the item itself. */
  forItem: (item: { slug: string; kind: string; name: string; friends: string }) => { score: number; note: string };
  /** The holiday types you like most. */
  tastes: string[];
  /** Is this sample place on one of your lists? */
  isSaved: (slug: string) => boolean;
};

const EMPTY = buildProfile([]);

// How telling each holiday type is, from every sample place (worked out once).
let rarityCache: ReturnType<typeof tagRarity> | null = null;
const rarity = () => (rarityCache ??= tagRarity(places.map((p) => featuresForSlug(p.slug)?.tags ?? {})));

// Results for each place, remembered per taste profile. Kept outside the component and keyed
// by the profile itself, so a new profile (after a trip or a save) can never reuse old results.
const resultsByProfile = new WeakMap<Profile, Map<string, PlaceResult | null>>();
function resultsFor(profile: Profile) {
  let m = resultsByProfile.get(profile);
  if (!m) resultsByProfile.set(profile, (m = new Map()));
  return m;
}
const Ctx = createContext<TasteValue | null>(null);

/** Your trips and saved places as signals for the engine, leaving out anything switched off in Settings. */
async function loadSignals(): Promise<{ signals: Signal[]; settings: MatchSettings; hotelPrefs: HotelPrefs }> {
  const settings = await getMatchSettings();
  const [trips, boards, views] = await Promise.all([
    settings.trips ? fetchMyTrips() : [],
    settings.saves ? fetchBoards().catch(() => []) : [],
    fetchPlaceViews().catch(() => []),
  ]);
  const next: Signal[] = [];
  for (const t of trips) {
    t.stops.forEach((s, i) =>
      next.push({
        kind: 'trip',
        place: featuresForPlace({ name: s.name, country: countryOf(s) }),
        score: t.score,
        month: t.month,
        nights: s.nights,
        // Company and stay belong to the trip, so count them once (on the main place).
        // A work trip says nothing about who you like to holiday with.
        companions: i === 0 && t.companions !== 'work' ? t.companions : null,
        stay: i === 0 && t.stay && t.stay.score != null ? { type: t.stay.type, score: t.stay.score } : null,
        extraStop: i > 0,
      }),
    );
    // The hotel itself (its brand, class and price) for your hotel taste: a 10 → +1, 6.5 → 0, 3.5 → −1.
    if (t.stay?.name && t.stay.score != null) {
      const known = findSampleStay(t.stay.name);
      next.push({
        kind: 'hotel',
        name: t.stay.name,
        type: t.stay.type,
        priceFrom: known?.priceFrom ?? null,
        city: known ? known.city : !!t.stops[0] && (featuresForPlace({ name: t.stops[0].name, country: countryOf(t.stops[0]) }).tags.city ?? 0) >= 0.5,
        weight: Math.max(-1, Math.min(1, (t.stay.score - 6.5) / 3)),
      });
    }
  }
  for (const b of boards) {
    // Places only: hotels, restaurants and so on saved under a place don't count as places to go.
    for (const item of placesOn(b.items)) {
      const place = item.slug ? (featuresForSlug(item.slug) ?? featuresForPlace(item)) : featuresForPlace({ name: item.name, country: countryOf(item) });
      next.push({ kind: 'save', place, wish: b.kind === 'wish', savedAt: item.createdAt });
    }
    // Hotels saved under a place: a lighter "like" for your hotel taste.
    for (const item of b.items) {
      if (item.kind !== 'stay') continue;
      const known = findSampleStay(item.name, item.parentSlug);
      next.push({ kind: 'hotel', name: item.name, type: known?.type ?? 'Hotel', priceFrom: known?.priceFrom ?? null, city: known?.city ?? false, weight: b.kind === 'wish' ? 0.6 : 0.5 });
    }
    // A list's name can say what it's for ("Ski trips").
    const hint = b.kind === 'list' ? tagsForListName(b.name) : {};
    if (Object.keys(hint).length) next.push({ kind: 'interest', tags: hint, label: b.name });
  }
  // What you told us in first-time setup (app/setup.tsx): the holidays you love, and places you've been.
  const start = await getStartTaste();
  if (start.types.length) next.push({ kind: 'interest', tags: Object.fromEntries(start.types.map((t) => [t, 1])), label: 'The holidays you love' });
  const aYearAgo = new Date(Date.now() - 365 * 864e5).toISOString().slice(0, 7);
  start.been.forEach((slug, i) => {
    const place = featuresForSlug(slug);
    if (place) next.push({ kind: 'trip', place, score: 8.5, month: aYearAgo, nights: null, companions: i === 0 ? start.who : null, told: true });
  });
  // The "Hotels you love" page (app/hotels.tsx). A luxury budget also says something about the places you go for.
  const hotelPrefs = await getHotelPrefs();
  if (hotelPrefs.brands.length || hotelPrefs.styles.length || hotelPrefs.budget) {
    next.push({ kind: 'hotelPrefs', prefs: hotelPrefs });
    if (hotelPrefs.budget === 'luxe' || hotelPrefs.budget === 'splurge') next.push({ kind: 'interest', tags: { luxury: hotelPrefs.budget === 'splurge' ? 0.8 : 0.5 }, label: 'Hotels you love' });
  }
  // Views come after saves, so a view of somewhere already saved counts for little.
  for (const v of views) {
    const place = featuresForSlug(v.slug) ?? featuresForPlace({ name: v.name, country: v.country });
    next.push({ kind: 'view', place, views: v.views, seconds: v.seconds, lastViewed: v.lastViewed });
  }
  return { signals: next, settings, hotelPrefs };
}

/** A place page's stay in the engine's terms. */
function stayInput(stay: { name: string; type: string; sub: string | null; score: number | null }, slug: string | undefined, usingFriends: boolean) {
  const { priceFrom, friend } = parseStaySub(stay.sub);
  return { name: stay.name, type: stayKind(stay.type), label: stay.type, priceFrom, friendScore: usingFriends && friend ? stay.score : null, city: slug ? isCitySlug(slug) : false };
}

export function TasteProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const userId = session?.user.id ?? null;
  const [loaded, setLoaded] = useState<{ user: string; signals: Signal[]; settings: MatchSettings; hotelPrefs: HotelPrefs } | null>(null);

  useEffect(() => {
    if (!userId) return;
    let active = true;
    const refresh = () =>
      loadSignals()
        .then((l) => active && setLoaded({ user: userId, ...l }))
        .catch(() => {}); // keep what we had; numbers stay as they were
    refresh();
    const stop = onTasteChanged(refresh);
    return () => {
      active = false;
      stop();
    };
  }, [userId]);

  // Only use signals that belong to whoever is signed in now.
  const signals = loaded && loaded.user === userId ? loaded.signals : null;
  const usingFriends = (loaded && loaded.user === userId ? loaded.settings : DEFAULT_MATCH_SETTINGS).friends;
  const hotelPrefs = loaded && loaded.user === userId ? loaded.hotelPrefs : EMPTY_HOTEL_PREFS;
  // Friends' ratings only count when "Use my friends' scores" is on.
  const friends: FriendRating[] = useMemo(() => (usingFriends ? sampleFriendRatings() : []), [usingFriends]);
  const profile = useMemo(() => (signals ? buildProfile(signals, friends, new Date(), rarity()) : EMPTY), [signals, friends]);

  const value = useMemo<TasteValue>(() => {
    const cache = resultsFor(profile);
    return {
      ready: signals != null,
      profile,
      usingFriends,
      forSlug: (slug) => {
        if (!cache.has(slug)) {
          const f = featuresForSlug(slug);
          cache.set(slug, f ? scorePlace(profile, f, friends) : null);
        }
        return cache.get(slug)!;
      },
      forPlace: (place) => scorePlace(profile, featuresForPlace(place), friends),
      stayScoreFor: (stay, slug) => stayVerdict(profile, stayInput(stay, slug, usingFriends)).score,
      stayWhy: (stay, slug) => {
        const v = stayVerdict(profile, stayInput(stay, slug, usingFriends));
        return { reason: v.reason, against: v.against };
      },
      knowsHotels: profile.hotels.evidence > 0,
      hotelPrefs,
      eatScoreFor: ({ score, from }) =>
        itemScore(profile, { tasteTag: 'food', friendScore: usingFriends ? score : null, friendRecommended: usingFriends && !!from }),
      forItem: (item) => {
        const raw = tasteItemInfo(item);
        // With friends' scores switched off, judge it on your taste alone.
        const info = usingFriends ? raw : { ...raw, friendScore: null, friendRecommended: false, note: 'Judged on your taste' };
        const score = info.stay
          ? stayScore(profile, { name: info.stay.name, type: stayKind(info.stay.type), label: info.stay.type, priceFrom: parseStaySub(info.stay.sub).priceFrom, friendScore: info.friendScore, city: isCitySlug(item.slug) })
          : itemScore(profile, info);
        return { score, note: info.note };
      },
      tastes: topTastes(profile),
      isSaved: (slug) => {
        const f = featuresForSlug(slug);
        return !!f && profile.saved[f.key] != null;
      },
    };
  }, [profile, friends, signals, usingFriends, hotelPrefs]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTaste(): TasteValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useTaste must be used inside <TasteProvider>');
  return v;
}

/** Friendly names for holiday types ("Your taste" on You). */
export const TASTE_LABELS: Record<string, string> = {
  beach: 'Beaches',
  island: 'Islands',
  city: 'City breaks',
  culture: 'Culture',
  food: 'Food',
  lakes: 'Lakes',
  mountains: 'Mountains',
  ski: 'Skiing',
  hiking: 'Hiking',
  outdoors: 'The outdoors',
  slow: 'Slow trips',
  coast: 'The coast',
  wellness: 'Spas',
  nightlife: 'Nightlife',
  countryside: 'Countryside',
  history: 'History',
  themeparks: 'Theme parks',
  family: 'Family trips',
  wildlife: 'Wildlife',
  luxury: 'Treats',
  tropical: 'Tropical beaches',
  shortbreak: 'Short breaks',
};

/** One line on how your scores are worked out, e.g. under Home's top pick. */
export function tasteNote(p: Profile, usingFriends = true): string {
  const bits = [
    p.counts.trips ? `${p.counts.trips} ${p.counts.trips === 1 ? 'trip' : 'trips'}` : null,
    p.counts.wish + p.counts.lists ? `${p.counts.wish + p.counts.lists} saved ${p.counts.wish + p.counts.lists === 1 ? 'place' : 'places'}` : null,
    p.counts.views ? `the ${p.counts.views === 1 ? 'place' : `${p.counts.views} places`} you’ve looked at` : null,
  ].filter(Boolean);
  return bits.length
    ? `Your scores use your ${bits.length > 1 ? `${bits.slice(0, -1).join(', ')} and ${bits[bits.length - 1]}` : bits[0]}${usingFriends ? ', plus your friends’ ratings' : ''}.`
    : usingFriends
      ? 'Add trips and save places, and these scores become yours.'
      : 'Add trips and save places, and these scores become yours. Friends’ scores are switched off.';
}
