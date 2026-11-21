import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { useAuth } from './auth';
import { fetchBoards } from './boards';
import { countryOf } from './knownPlaces';
import { buildProfile, itemScore, scorePlace, stayScore, topTastes, type FriendRating, type PlaceResult, type Profile, type Signal } from './match';
import { featuresForPlace, featuresForSlug, parseStaySub, sampleFriendRatings, stayKind, tagsForListName, tasteItemInfo } from './placeFeatures';
import { onTasteChanged } from './tasteEvents';
import { fetchMyTrips, type Place } from './trips';
import { fetchPlaceViews } from './views';

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
  /** Your score and reasons for a sample place page. */
  forSlug: (slug: string) => PlaceResult | null;
  /** The same for any place by name. */
  forPlace: (place: Place) => PlaceResult;
  /** Your score out of 10 for a stay on a place page. */
  stayScoreFor: (stay: { type: string; sub: string | null; score: number | null }) => number;
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

// Results for each place, remembered per taste profile. Kept outside the component and keyed
// by the profile itself, so a new profile (after a trip or a save) can never reuse old results.
const resultsByProfile = new WeakMap<Profile, Map<string, PlaceResult | null>>();
function resultsFor(profile: Profile) {
  let m = resultsByProfile.get(profile);
  if (!m) resultsByProfile.set(profile, (m = new Map()));
  return m;
}
const Ctx = createContext<TasteValue | null>(null);

/** Your trips and saved places as signals for the engine. */
async function loadSignals(): Promise<Signal[]> {
  const [trips, boards, views] = await Promise.all([fetchMyTrips(), fetchBoards().catch(() => []), fetchPlaceViews().catch(() => [])]);
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
        companions: i === 0 ? t.companions : null,
        stay: i === 0 && t.stay ? { type: t.stay.type, score: t.stay.score } : null,
        extraStop: i > 0,
      }),
    );
  }
  for (const b of boards) {
    for (const item of b.items) {
      const place = item.slug ? (featuresForSlug(item.slug) ?? featuresForPlace(item)) : featuresForPlace({ name: item.name, country: countryOf(item) });
      next.push({ kind: 'save', place, wish: b.kind === 'wish', savedAt: item.createdAt });
    }
    // A list's name can say what it's for ("Ski trips").
    const hint = b.kind === 'list' ? tagsForListName(b.name) : {};
    if (Object.keys(hint).length) next.push({ kind: 'interest', tags: hint, label: b.name });
  }
  // Views come after saves, so a view of somewhere already saved counts for little.
  for (const v of views) {
    const place = featuresForSlug(v.slug) ?? featuresForPlace({ name: v.name, country: v.country });
    next.push({ kind: 'view', place, views: v.views, seconds: v.seconds, lastViewed: v.lastViewed });
  }
  return next;
}

export function TasteProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const userId = session?.user.id ?? null;
  const [loaded, setLoaded] = useState<{ user: string; signals: Signal[] } | null>(null);

  useEffect(() => {
    if (!userId) return;
    let active = true;
    const refresh = () =>
      loadSignals()
        .then((signals) => active && setLoaded({ user: userId, signals }))
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
  const friends: FriendRating[] = useMemo(() => sampleFriendRatings(), []);
  const profile = useMemo(() => (signals ? buildProfile(signals, friends) : EMPTY), [signals, friends]);

  const value = useMemo<TasteValue>(() => {
    const cache = resultsFor(profile);
    return {
      ready: signals != null,
      profile,
      forSlug: (slug) => {
        if (!cache.has(slug)) {
          const f = featuresForSlug(slug);
          cache.set(slug, f ? scorePlace(profile, f, friends) : null);
        }
        return cache.get(slug)!;
      },
      forPlace: (place) => scorePlace(profile, featuresForPlace(place), friends),
      stayScoreFor: ({ type, sub, score }) => {
        const { priceFrom, friend } = parseStaySub(sub);
        return stayScore(profile, { type: stayKind(type), priceFrom, friendScore: friend ? score : null });
      },
      eatScoreFor: ({ score, from }) => itemScore(profile, { tasteTag: 'food', friendScore: score, friendRecommended: !!from }),
      forItem: (item) => {
        const info = tasteItemInfo(item);
        const score = info.stay
          ? stayScore(profile, { type: stayKind(info.stay.type), priceFrom: parseStaySub(info.stay.sub).priceFrom, friendScore: info.friendScore })
          : itemScore(profile, info);
        return { score, note: info.note };
      },
      tastes: topTastes(profile),
      isSaved: (slug) => {
        const f = featuresForSlug(slug);
        return !!f && profile.saved[f.key] != null;
      },
    };
  }, [profile, friends, signals]);

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
  shortbreak: 'Short breaks',
};

/** One line on how your scores are worked out, e.g. under Home's top pick. */
export function tasteNote(p: Profile): string {
  const bits = [
    p.counts.trips ? `${p.counts.trips} ${p.counts.trips === 1 ? 'trip' : 'trips'}` : null,
    p.counts.wish + p.counts.lists ? `${p.counts.wish + p.counts.lists} saved ${p.counts.wish + p.counts.lists === 1 ? 'place' : 'places'}` : null,
    p.counts.views ? `the ${p.counts.views === 1 ? 'place' : `${p.counts.views} places`} you’ve looked at` : null,
  ].filter(Boolean);
  return bits.length
    ? `Your scores use your ${bits.length > 1 ? `${bits.slice(0, -1).join(', ')} and ${bits[bits.length - 1]}` : bits[0]}, plus your friends’ ratings.`
    : 'Add trips and save places, and these scores become yours.';
}
