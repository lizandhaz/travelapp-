import type { Companions } from './match';
import { photos, type PhotoName } from './photos';
import { placeDetails, type PlaceDetail } from './placeDetails';
import { friendsFeed, getPlace } from './sample';

/**
 * A friend's trip summary (sample content for now): what they rated it, who they went with, how
 * long they stayed, where they stayed, where they ate, what they did and their tips. Built from the
 * Friends feed, or from the place's details where that friend is named. Used by the friend's trip
 * page and by Postcards. Real friends' trips arrive with friends (plan Step 3).
 */
export type FriendTrip = {
  id: string;
  who: string;
  face: PhotoName | null;
  slug: string;
  place: string;
  region: string;
  month: string;
  score: number;
  quote: string | null;
  companions: Companions;
  nights: number;
  photos: PhotoName[];
  stay: { name: string; type: string; score: number | null; sub: string | null; photo: PhotoName | null } | null;
  eats: PlaceDetail['eats'];
  dos: PlaceDetail['dos'];
  tips: PlaceDetail['tips'];
};

export const tripId = (who: string, slug: string) => `${who}-${slug}`.toLowerCase();
export const friendTripId = (f: { who: string; slug: string }) => tripId(f.who, f.slug);

/** "With friends", "On their own"… */
export function companionsLabel(c: Companions): string {
  return { solo: 'On their own', partner: 'With their partner', friends: 'With friends', family: 'With family' }[c];
}

// Who they went with and how long for (sample).
const EXTRAS: Record<string, { companions: Companions; nights: number }> = {
  'maya-hydra': { companions: 'partner', nights: 6 },
  'maya-maldives': { companions: 'partner', nights: 7 },
  'maya-marrakech': { companions: 'friends', nights: 4 },
  'priya-positano': { companions: 'partner', nights: 4 },
  'tom-kyoto': { companions: 'friends', nights: 7 },
};

const isPhoto = (name: string): name is PhotoName => name in photos;
const stripQuotes = (q: string | null) => (q ? q.replace(/^[“"]|[”"]$/g, '') : null);

export function getTrip(who: string, slug: string): FriendTrip | null {
  const place = getPlace(slug);
  const detail = placeDetails[slug];
  if (!place) return null;
  const feed = friendsFeed.find((f) => f.who === who && f.slug === slug);
  const said = detail?.said.find((s) => s.who === who);
  if (!feed && !said?.score) return null;
  const id = tripId(who, slug);
  const theirs = <T extends { from: string | null }>(list: T[] | undefined) => (list ?? []).filter((x) => x.from === who);
  const stayed = detail?.stays.find((s) => (feed ? s.name === feed.stayName : (s.sub ?? '').includes(`${who} stayed`)));
  const more = [1, 2, 3, 4, 5].map((n) => `${slug}-${n}`).filter(isPhoto);
  const extras = EXTRAS[id] ?? { companions: 'friends' as Companions, nights: 4 };
  return {
    id,
    who,
    face: feed?.face ?? said?.face ?? null,
    slug,
    place: feed?.place ?? place.name,
    region: feed?.region ?? place.region,
    month: feed?.month ?? said!.month,
    score: feed?.score ?? said!.score!,
    quote: stripQuotes(feed?.quote ?? said?.quote ?? null),
    ...extras,
    photos: [...new Set([...(feed?.photo ? [feed.photo] : []), ...more])],
    stay: feed
      ? { name: feed.stayName, type: feed.stayType, score: feed.stayScore, sub: stayed?.sub ?? null, photo: stayed?.photo ?? null }
      : stayed
        ? { name: stayed.name, type: stayed.type, score: stayed.score, sub: stayed.sub, photo: stayed.photo }
        : null,
    eats: theirs(detail?.eats).slice(0, 4),
    dos: theirs(detail?.dos).slice(0, 4),
    tips: theirs(detail?.tips).slice(0, 3),
  };
}

/** A trip by its id ("maya-hydra"). */
export function getFriendTrip(id: string): FriendTrip | null {
  const dash = id.indexOf('-');
  if (dash < 1) return null;
  const who = id.slice(0, dash);
  return getTrip(who.charAt(0).toUpperCase() + who.slice(1), id.slice(dash + 1));
}
