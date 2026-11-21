import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

import { ALL_PLACES, countryOf, plain } from './knownPlaces';
import { places as samplePlaces } from './sample';
import { supabase } from './supabase';
import { tasteChanged } from './tasteEvents';

/**
 * Real trips, stored in Supabase (see supabase/migrations/20261118120000_trips.sql,
 * 20261120120000_trip_details.sql and 20261121120000_photos_and_avatar.sql). Only the signed-in owner can read, edit
 * or delete their trips and photos.
 */

export const STAY_KINDS = ['Hotel', 'Airbnb', 'Villa', 'B&B', 'Other'] as const;
export type StayKind = (typeof STAY_KINDS)[number];
export type Visibility = 'friends' | 'private';

/** Who you went with. */
export const COMPANIONS = [
  ['solo', 'Solo'],
  ['partner', 'Partner'],
  ['friends', 'Friends'],
  ['family', 'Family'],
] as const;
export type Companions = (typeof COMPANIONS)[number][0];
export const companionsLabel = (c: Companions | null) => COMPANIONS.find(([id]) => id === c)?.[1] ?? null;

export type Place = { name: string; country: string };
export type TripStop = Place & { nights: number | null };
export type TripStay = { name: string; type: StayKind; score: number };

export type Trip = {
  id: string;
  /** "YYYY-MM" */
  month: string;
  score: number;
  visibility: Visibility;
  /** stops[0] is the main place; the rest are extra stops, in order. */
  stops: TripStop[];
  stay: TripStay | null;
  meal: string | null;
  tip: string | null;
  companions: Companions | null;
  note: string | null;
  /** Where the photos are in the private trip-photos store (up to 6; the first is the cover). */
  photoPaths: string[];
  /** When it was added, ISO date-time. */
  createdAt: string;
};

/** What the Add a trip form sends to save_trip(). */
export type TripInput = Omit<Trip, 'id' | 'createdAt'> & { id?: string };

const TRIP_SELECT = `
  id, trip_month, score, visibility, companions, note, photo_paths, created_at,
  trip_stops ( position, nights, destinations ( name, country ) ),
  stays ( name, type, score ),
  food_picks ( name ),
  top_tips ( tip )
`;

type Row = {
  id: string;
  trip_month: string;
  score: number;
  visibility: Visibility;
  companions: Companions | null;
  note: string | null;
  photo_paths: string[] | null;
  created_at: string;
  trip_stops: { position: number; nights: number | null; destinations: Place | Place[] | null }[] | null;
  stays: TripStay[] | null;
  food_picks: { name: string }[] | null;
  top_tips: { tip: string }[] | null;
};

function fromRow(r: Row): Trip {
  const stops = [...(r.trip_stops ?? [])]
    .sort((a, b) => a.position - b.position)
    .map((s) => {
      const d = Array.isArray(s.destinations) ? s.destinations[0] : s.destinations;
      return { name: d?.name ?? '?', country: d?.country ?? '', nights: s.nights };
    });
  return {
    id: r.id,
    month: r.trip_month.slice(0, 7),
    score: Number(r.score),
    visibility: r.visibility,
    stops,
    stay: r.stays?.[0] ? { ...r.stays[0], score: Number(r.stays[0].score) } : null,
    meal: r.food_picks?.[0]?.name ?? null,
    tip: r.top_tips?.[0]?.tip ?? null,
    companions: r.companions,
    note: r.note,
    photoPaths: r.photo_paths ?? [],
    createdAt: r.created_at,
  };
}

/** Your trips, highest score first (then most recent). */
export async function fetchMyTrips(): Promise<Trip[]> {
  const { data, error } = await supabase
    .from('trips')
    .select(TRIP_SELECT)
    .order('score', { ascending: false })
    .order('trip_month', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) throw new Error(friendlyError(error));
  return (data as unknown as Row[]).map(fromRow);
}

export async function fetchTrip(id: string): Promise<Trip | null> {
  const { data, error } = await supabase.from('trips').select(TRIP_SELECT).eq('id', id).maybeSingle();
  if (error) throw new Error(friendlyError(error));
  return data ? fromRow(data as unknown as Row) : null;
}

/** Saves a new trip, or edits one when input.id is set. Returns the trip's id. */
export async function saveTrip(input: TripInput): Promise<string> {
  const { data, error } = await supabase.rpc('save_trip', {
    p_trip: {
      id: input.id ?? null,
      month: input.month,
      score: input.score,
      visibility: input.visibility,
      stops: input.stops.map((s) => ({ name: s.name.trim(), country: s.country.trim(), nights: s.nights })),
      stay: input.stay,
      meal: input.meal?.trim() || null,
      tip: input.tip?.trim() || null,
      companions: input.companions,
      note: input.note?.trim() || null,
      photo_paths: input.photoPaths,
    },
  });
  if (error) throw new Error(friendlyError(error));
  tasteChanged();
  return data as string;
}

/** Deletes a trip and its photos. */
export async function deleteTrip(id: string, photoPaths: string[] = []): Promise<void> {
  const { error } = await supabase.from('trips').delete().eq('id', id);
  if (error) throw new Error(friendlyError(error));
  tasteChanged();
  await deleteTripPhotos(photoPaths);
}

/** The most photos a trip can have. */
export const MAX_PHOTOS = 6;

// ---------------------------------------------------------------------------
// Photos: private store "trip-photos", one folder per person.
// ---------------------------------------------------------------------------

const BUCKET = 'trip-photos';
const MAX_WIDTH = 1600;

/**
 * Shrinks a photo you picked and re-saves it as a new JPEG (which leaves out
 * any hidden location data), then uploads it to your own folder.
 * Returns where it was stored.
 */
export async function uploadTripPhoto(localUri: string, width?: number, kind: 'trip' | 'avatar' = 'trip'): Promise<string> {
  const { data: auth } = await supabase.auth.getSession();
  const userId = auth.session?.user.id;
  if (!userId) throw new Error('Please log in again to add a photo.');

  const ctx = ImageManipulator.manipulate(localUri);
  const target = kind === 'avatar' ? 800 : MAX_WIDTH;
  if (!width || width > target) ctx.resize({ width: target });
  const image = await ctx.renderAsync();
  const saved = await image.saveAsync({ format: SaveFormat.JPEG, compress: 0.8, base64: true });
  if (!saved.base64) throw new Error('Couldn’t read that photo. Try another one.');

  const path = `${userId}/${kind === 'avatar' ? 'avatar-' : ''}${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, base64ToBytes(saved.base64), {
    contentType: 'image/jpeg',
    upsert: false,
  });
  if (error) throw new Error(friendlyError(error));
  return path;
}

export async function deleteTripPhotos(paths: string[]): Promise<void> {
  if (paths.length) await supabase.storage.from(BUCKET).remove(paths); // best effort: a leftover file is harmless
}

const urlCache = new Map<string, { url: string; until: number }>();

/** A short-lived private link to show one of your photos. */
export async function tripPhotoUrl(path: string): Promise<string | null> {
  const hit = urlCache.get(path);
  if (hit && hit.until > Date.now()) return hit.url;
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 60);
  if (error || !data?.signedUrl) return null;
  urlCache.set(path, { url: data.signedUrl, until: Date.now() + 55 * 60 * 1000 });
  return data.signedUrl;
}

const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
function base64ToBytes(b64: string): Uint8Array {
  const clean = b64.replace(/[^A-Za-z0-9+/]/g, '');
  const out = new Uint8Array(Math.floor((clean.length * 3) / 4));
  let o = 0;
  for (let i = 0; i < clean.length; i += 4) {
    const n =
      (B64.indexOf(clean[i]) << 18) |
      (B64.indexOf(clean[i + 1]) << 12) |
      ((B64.indexOf(clean[i + 2] ?? 'A') & 63) << 6) |
      (B64.indexOf(clean[i + 3] ?? 'A') & 63);
    if (o < out.length) out[o++] = (n >> 16) & 255;
    if (o < out.length && i + 2 < clean.length) out[o++] = (n >> 8) & 255;
    if (o < out.length && i + 3 < clean.length) out[o++] = n & 255;
  }
  return out.subarray(0, o);
}

/** Places to suggest when searching: places you've used, the starting list and popular places. */
export async function fetchPlaces(): Promise<Place[]> {
  const sample = samplePlaces.map((p) => ({ name: p.name, country: p.region.split(', ').pop() ?? '' }));
  const { data } = await supabase.from('destinations').select('name, country').order('name').limit(500);
  const all = [...((data as Place[] | null) ?? []), ...sample, ...ALL_PLACES].map((p) => ({ name: p.name, country: countryOf(p) }));
  const seen = new Set<string>();
  return all.filter((p) => {
    const key = `${plain(p.name)}|${plain(p.country)}`; // "Malaga" and "Málaga" are the same place
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** "Lisbon, Portugal" (or just "Lisbon" when there's no country). */
export function placeLabel(p: Place) {
  return p.country && p.country.toLowerCase() !== p.name.toLowerCase() ? `${p.name}, ${p.country}` : p.name;
}

/** Turns typed text into a place: "Sintra, Portugal" → name + country. */
export function parsePlace(text: string): Place {
  const t = text.trim().replace(/\s+/g, ' ');
  const i = t.lastIndexOf(',');
  if (i > 0 && i < t.length - 1) return { name: t.slice(0, i).trim(), country: t.slice(i + 1).trim() };
  return { name: t, country: '' };
}

/** Countries visited across trips (for the You page). */
export function countriesIn(trips: Trip[]) {
  return new Set(trips.flatMap((t) => t.stops.map((s) => countryOf(s).toLowerCase()).filter(Boolean))).size;
}

type DbError = { message?: string; code?: string; details?: string | null };

export function friendlyError(e: DbError): string {
  const m = e.message ?? '';
  if (/up to 50 lists|up to 300 places/i.test(m)) return m;
  if (/main_stop_has_nights/i.test(m)) return 'How long did you stay? Pick the number of nights.';
  if (/future/i.test(m)) return "That month is in the future. Trips are for holidays you're back from.";
  if (/network|fetch/i.test(m)) return "Couldn't connect. Check you're online and try again.";
  if (/save_trip|function .* does not exist|schema cache|column .* does not exist|bucket not found|relation .* does not exist/i.test(m))
    return 'The latest database update hasn’t been run in Supabase yet (see the steps Claude gave you).';
  if (/payload too large|exceeded the maximum/i.test(m)) return 'That photo is too big. Try another one.';
  if (/Trip not found/i.test(m)) return 'That trip couldn’t be found. It may have been deleted.';
  if (/check constraint|violates/i.test(m)) return 'Something in the trip isn’t quite right. Please check it and try again.';
  return 'Something went wrong. Please try again in a moment.';
}

/** Sets (or clears, with null) your profile picture. Returns the stored path. */
export async function setProfilePicture(localUri: string | null, width?: number, oldPath?: string | null): Promise<string | null> {
  const { data: auth } = await supabase.auth.getSession();
  const userId = auth.session?.user.id;
  if (!userId) throw new Error('Please log in again.');
  const path = localUri ? await uploadTripPhoto(localUri, width && width > 800 ? 800 : width, 'avatar') : null;
  const { error } = await supabase.from('profiles').update({ avatar_path: path }).eq('id', userId);
  if (error) {
    if (path) await deleteTripPhotos([path]);
    throw new Error(friendlyError(error));
  }
  if (oldPath && oldPath !== path) await deleteTripPhotos([oldPath]);
  return path;
}
