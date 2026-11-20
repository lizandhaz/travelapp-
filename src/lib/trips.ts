import { destinations as sampleDestinations } from './data';
import { supabase } from './supabase';

/**
 * Real trips, stored in Supabase (see supabase/migrations/20261118120000_trips.sql).
 * Only the signed-in owner can read, edit or delete their trips.
 */

export const STAY_KINDS = ['Hotel', 'Airbnb', 'Villa', 'B&B', 'Other'] as const;
export type StayKind = (typeof STAY_KINDS)[number];
export type Visibility = 'friends' | 'private';

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
};

/** What the Add a trip form sends to save_trip(). */
export type TripInput = Omit<Trip, 'id'> & { id?: string };

/** A word for each score, shown under the score picker and on trip pages. */
export const SCORE_WORDS: Record<number, string> = {
  1: 'Never again',
  2: 'Awful',
  3: 'Poor',
  4: 'Not great',
  5: 'OK',
  6: 'Decent',
  7: 'Good',
  8: 'Great',
  9: 'Loved it',
  10: 'Perfect',
};

const TRIP_SELECT = `
  id, trip_month, score, visibility,
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
    score: r.score,
    visibility: r.visibility,
    stops,
    stay: r.stays?.[0] ?? null,
    meal: r.food_picks?.[0]?.name ?? null,
    tip: r.top_tips?.[0]?.tip ?? null,
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
    },
  });
  if (error) throw new Error(friendlyError(error));
  return data as string;
}

export async function deleteTrip(id: string): Promise<void> {
  const { error } = await supabase.from('trips').delete().eq('id', id);
  if (error) throw new Error(friendlyError(error));
}

/** Places to suggest when searching: the starting list plus places you've used. */
export async function fetchPlaces(): Promise<Place[]> {
  const fallback = sampleDestinations.map((d) => ({ name: d.name, country: d.country }));
  const { data, error } = await supabase.from('destinations').select('name, country').order('name').limit(500);
  if (error || !data?.length) return fallback;
  return data as Place[];
}

/** "Lisbon, Portugal" (or just "Lisbon" when there's no country). */
export function placeLabel(p: Place) {
  return p.country ? `${p.name}, ${p.country}` : p.name;
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
  return new Set(trips.flatMap((t) => t.stops.map((s) => s.country.toLowerCase()).filter(Boolean))).size;
}

type DbError = { message?: string; code?: string; details?: string | null };

function friendlyError(e: DbError): string {
  const m = e.message ?? '';
  if (/future/i.test(m)) return "That month is in the future. Trips are for holidays you're back from.";
  if (/network|fetch/i.test(m)) return "Couldn't connect. Check you're online and try again.";
  if (/save_trip|function .* does not exist|schema cache/i.test(m))
    return 'Trips aren’t set up in the database yet (the Step 2 setup needs running in Supabase).';
  if (/Trip not found/i.test(m)) return 'That trip couldn’t be found. It may have been deleted.';
  if (/check constraint|violates/i.test(m)) return 'Something in the trip isn’t quite right. Please check it and try again.';
  return 'Something went wrong. Please try again in a moment.';
}
