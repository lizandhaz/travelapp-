import { useEffect, useState } from 'react';

import { getFriendTrip, type FriendTrip } from './friendTrips';
import { countryOf } from './knownPlaces';
import { monthYear } from './months';
import { places, type FeedItem } from './sample';
import { myUserId, supabase } from './supabase';
import { fetchTrip, fetchTripsOf, fromRow, TRIP_SELECT, tripPhotoUrl, type Trip, type TripRow } from './trips';

/**
 * Real trips from the people you follow (plan Step C): their "Followers" trips, newest first, for
 * Home → From your friends, and as postcards and trip pages. The database only shows a trip to its
 * owner's accepted followers, and only when it's set to Followers.
 */

export type Person = { userId: string; name: string; handle: string; avatarPath: string | null };

/** People you follow or who follow you (accepted), with names and profile pictures. */
export async function fetchMyPeople(): Promise<Person[]> {
  const { data, error } = await supabase.rpc('my_people');
  if (error) throw new Error(error.message);
  return ((data ?? []) as { user_id: string; name: string; handle: string; avatar_path: string | null }[]).map((p) => ({
    userId: p.user_id,
    name: p.name,
    handle: p.handle,
    avatarPath: p.avatar_path,
  }));
}

const firstName = (name: string) => name.trim().split(/\s+/)[0] || name;

/** "2 hours ago", "Yesterday", "3 days ago", "12 Nov". */
export function postedAgo(iso: string, now = Date.now()): string {
  const mins = Math.max(0, Math.round((now - new Date(iso).getTime()) / 60000));
  if (mins < 2) return 'Just now';
  if (mins < 60) return `${mins} minutes ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

/** The sample place page for a place name, if there is one ("Lake Como" → "como"). */
function slugFor(name: string): string {
  const n = name.trim().toLowerCase().replace(/^the /, '');
  return places.find((p) => p.name.toLowerCase().replace(/^the /, '') === n)?.slug ?? '';
}

/** A real trip of someone you follow, in the shape the postcard and friend's-trip pages use. */
export type RealFriendTrip = FriendTrip & { real: true; ownerId: string; country: string; posted: string };

function toFriendTrip(t: Trip, who: Person | undefined, photoUrls: string[], faceUrl: string | null): RealFriendTrip {
  const main = t.stops[0];
  const country = main ? countryOf(main) : '';
  return {
    id: t.id,
    real: true,
    ownerId: t.ownerId,
    who: firstName(who?.name ?? 'Someone'),
    face: null,
    faceUrl,
    slug: main ? slugFor(main.name) : '',
    place: main?.name ?? '?',
    region: country,
    country,
    month: monthYear(t.month),
    score: t.score,
    quote: t.note,
    companions: t.companions,
    nights: main?.nights ?? null,
    photos: [],
    photoUrls,
    stay: t.stay ? { name: t.stay.name, type: t.stay.type, score: t.stay.score, sub: null, photo: null, wouldReturn: t.stay.wouldReturn ?? null } : null,
    wouldReturn: t.wouldReturn,
    eats: t.restaurants.map((name) => ({ name, price: null, what: null, score: null, from: null, match: null, photo: null })),
    dos: [],
    tips: t.tip ? [{ tip: t.tip, from: null }] : [],
    posted: postedAgo(t.createdAt),
  };
}

const signAll = async (paths: string[]) => (await Promise.all(paths.map((p) => tripPhotoUrl(p).catch(() => null)))).filter((u): u is string => !!u);

/** Your followed people's trips, newest first (up to `limit`), ready for the feed. */
export async function fetchFriendsTrips(limit = 30): Promise<RealFriendTrip[]> {
  const me = await myUserId();
  if (!me) return [];
  // Only people you follow or who follow you (overnight audit, Nov 2026): the database also lets you read every public
  // profile's trips, so "not mine" alone would fill "From your friends" with strangers' trips, shown as "Someone".
  const people = await fetchMyPeople();
  if (!people.length) return [];
  const rows = await supabase
    .from('trips')
    .select(TRIP_SELECT)
    .in('owner_id', people.slice(0, 500).map((p) => p.userId))
    .order('created_at', { ascending: false })
    .limit(limit);
  if (rows.error) throw new Error(rows.error.message);
  const byId = new Map(people.map((p) => [p.userId, p]));
  const trips = (rows.data as unknown as TripRow[]).map(fromRow);
  const faces = new Map<string, string | null>();
  await Promise.all(
    [...new Set(trips.map((t) => t.ownerId))].map(async (id) => {
      const path = byId.get(id)?.avatarPath;
      faces.set(id, path ? await tripPhotoUrl(path).catch(() => null) : null);
    }),
  );
  // The feed only needs the cover; the postcard signs the rest when it opens.
  return Promise.all(trips.map(async (t) => toFriendTrip(t, byId.get(t.ownerId), await signAll(t.photoPaths.slice(0, 1)), faces.get(t.ownerId) ?? null)));
}

/** One person's trips that you're allowed to see (their followers', or everyone's on a public profile), as cards. */
export async function fetchTripsOfPerson(person: Person): Promise<RealFriendTrip[]> {
  const trips = await fetchTripsOf(person.userId);
  const face = person.avatarPath ? await tripPhotoUrl(person.avatarPath).catch(() => null) : null;
  return Promise.all(trips.map(async (t) => toFriendTrip(t, person, await signAll(t.photoPaths.slice(0, 1)), face)));
}

/** A real trip as a Home feed card. */
export function feedItemFor(t: RealFriendTrip): FeedItem {
  return {
    id: t.id,
    who: t.who,
    face: null,
    faceUri: t.faceUrl ?? null,
    place: t.place,
    region: t.region,
    month: t.month.toUpperCase(),
    photo: null,
    photoUri: t.photoUrls?.[0] ?? null,
    quote: t.quote ? `“${t.quote}”` : null,
    score: t.score,
    stayType: t.stay?.type ?? '',
    stayName: t.stay?.name ?? '',
    stayScore: t.stay?.score ?? null,
    slug: t.slug,
    country: t.country,
    posted: t.posted,
  };
}

const isUuid = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

/**
 * A friend's trip for the postcard and trip pages: a sample trip straight away, or a real one (by its
 * id) loaded from the database with all its photos. `trip` is null while loading or if it can't be seen.
 */
export function useFriendTrip(id: string | undefined): { trip: FriendTrip | RealFriendTrip | null; loading: boolean; error: string | null; retry: () => void } {
  const sample = id ? getFriendTrip(id) : null;
  const [real, setReal] = useState<{ id: string; trip: RealFriendTrip | null; error?: string } | null>(null);
  const [attempt, setAttempt] = useState(0);
  const wantReal = !!id && !sample && isUuid(id);
  useEffect(() => {
    if (!wantReal || !id) return;
    let live = true;
    (async () => {
      // A failed connection isn't "not found" (overnight audit): keep the message so the page can say so.
      let t: Trip | null;
      try {
        t = await fetchTrip(id);
      } catch (e) {
        return live && setReal({ id, trip: null, error: e instanceof Error ? e.message : 'Couldn’t connect. Check you’re online and try again.' });
      }
      if (!t) return live && setReal({ id, trip: null });
      const [people, photoUrls] = await Promise.all([fetchMyPeople().catch(() => []), signAll(t.photoPaths)]);
      const who = people.find((p) => p.userId === t.ownerId);
      const faceUrl = who?.avatarPath ? await tripPhotoUrl(who.avatarPath).catch(() => null) : null;
      if (live) setReal({ id, trip: toFriendTrip(t, who, photoUrls, faceUrl) });
    })();
    return () => {
      live = false;
    };
  }, [id, wantReal, attempt]);
  const retry = () => {
    setReal(null);
    setAttempt((n) => n + 1);
  };
  if (sample) return { trip: sample, loading: false, error: null, retry };
  if (!wantReal) return { trip: null, loading: false, error: null, retry };
  return real?.id === id ? { trip: real.trip, loading: false, error: real.error ?? null, retry } : { trip: null, loading: true, error: null, retry };
}
