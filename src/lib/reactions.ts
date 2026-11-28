import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useSyncExternalStore } from 'react';

import { postedAgo } from './friendsFeed';
import { supabase } from './supabase';

/**
 * Likes, comments and saves on trips. Real trips (a uuid id: yours, or a friend's you can see) keep likes
 * and comments in the database (plan Step H: trip_likes, trip_comments, trip_reactions()), so the trip's
 * owner sees them in Postcards. Sample friends' trips ("maya-hydra") keep yours on the phone, on top of
 * sample counts. Saving a friend's trip stays on the phone.
 */
export type TripComment = { who: string; text: string; when: string; mine?: boolean; /** Real comments only (for reporting). */ id?: string };

// Sample likes and comments, by trip id ("maya-hydra").
const SAMPLE: Record<string, { likes: number; comments: TripComment[] }> = {
  'maya-hydra': {
    likes: 14,
    comments: [
      { who: 'Priya', text: 'Adding this to my Want to go list!', when: '1h' },
      { who: 'Tom', text: 'Did you get the water taxi to Bisti?', when: '40m' },
    ],
  },
  'priya-positano': { likes: 9, comments: [{ who: 'Sophie', text: 'Villa Limone looks unreal.', when: 'Yesterday' }] },
  'tom-kyoto': {
    likes: 21,
    comments: [
      { who: 'Maya', text: 'The ryokan tip is so good.', when: '2d' },
      { who: 'Sam', text: 'Going in April because of this.', when: '1d' },
    ],
  },
  'sophie-southafrica': { likes: 17, comments: [{ who: 'Sam', text: 'Kruger was the best thing I’ve ever done.', when: '5d' }] },
  'maya-marrakech': { likes: 6, comments: [] },
  'jonah-zanzibar': { likes: 11, comments: [{ who: 'Priya', text: 'Stone Town at dusk 😍', when: '3w' }] },
};

/** saved: friends' trips you've saved, with when you saved them (newest first on Saved and You). */
type State = { liked: Record<string, boolean>; mine: Record<string, TripComment[]>; saved: Record<string, number> };
const KEY = 'trip-reactions';
let state: State = { liked: {}, mine: {}, saved: {} };
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const save = () => AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {});

AsyncStorage.getItem(KEY)
  .then((raw) => {
    if (raw) {
      state = { liked: {}, mine: {}, saved: {}, ...(JSON.parse(raw) as Partial<State>) };
      emit();
    }
  })
  .catch(() => {});

/** Forget likes, comments and saved friends' trips kept on this phone (when an account is deleted). */
export async function forgetLocalReactions() {
  state = { liked: {}, mine: {}, saved: {} };
  emit();
  await AsyncStorage.removeItem(KEY).catch(() => {});
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export function toggleLike(id: string) {
  if (isReal(id)) return toggleRealLike(id);
  state = { ...state, liked: { ...state.liked, [id]: !state.liked[id] } };
  save();
  emit();
}

export function addComment(id: string, text: string) {
  const t = text.trim().slice(0, 500);
  if (!t) return;
  if (isReal(id)) return addRealComment(id, t);
  state = { ...state, mine: { ...state.mine, [id]: [...(state.mine[id] ?? []), { who: 'You', text: t, when: 'Just now', mine: true }] } };
  save();
  emit();
}

/** Saves (or unsaves) a friend's whole trip: their stays, food, things to do and tips. */
export function toggleSavedTrip(id: string) {
  const saved = { ...state.saved };
  if (saved[id]) delete saved[id];
  else saved[id] = Date.now();
  state = { ...state, saved };
  save();
  emit();
}

/** The friends' trips you've saved, newest first. */
export function useSavedTrips(): string[] {
  const s = useSyncExternalStore(subscribe, () => state);
  return Object.entries(s.saved)
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id);
}

/** Likes and comments for one trip, kept up to date everywhere it's shown. */
export function useReactions(id: string) {
  const s = useSyncExternalStore(subscribe, () => state);
  const live = useSyncExternalStore(subscribe, () => liveById[id]);
  const real = isReal(id);
  useEffect(() => {
    if (real && !liveById[id]) loadReal(id);
  }, [id, real]);
  if (real) {
    const l = live ?? { likes: 0, liked: false, likers: [], comments: [] };
    return { ...l, saved: !!s.saved[id] };
  }
  const base = SAMPLE[id] ?? { likes: 0, comments: [] };
  const liked = !!s.liked[id];
  return {
    liked,
    likes: base.likes + (liked ? 1 : 0),
    comments: [...base.comments, ...(s.mine[id] ?? [])],
    likers: [] as string[],
    saved: !!s.saved[id],
  };
}

// ---------------------------------------------------------------------------
// Real trips: likes and comments in the database
// ---------------------------------------------------------------------------

const isReal = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
type Live = { likes: number; liked: boolean; likers: string[]; comments: TripComment[] };
const liveById: Record<string, Live> = {};
const setLive = (id: string, l: Live) => {
  liveById[id] = l;
  emit();
};

type ReactionRow = { kind: 'like' | 'comment'; id: string | null; name: string; body: string | null; created_at: string; mine: boolean };

/** Loads a real trip's likes and comments (names only for people you know; others read "Someone"). */
export async function loadReal(id: string): Promise<void> {
  const { data, error } = await supabase.rpc('trip_reactions', { p_trip: id });
  if (error) return; // the database update hasn't run yet, or no access: show none
  const rows = (data ?? []) as ReactionRow[];
  const likes = rows.filter((r) => r.kind === 'like');
  setLive(id, {
    likes: likes.length,
    liked: likes.some((r) => r.mine),
    likers: likes.map((r) => (r.mine ? 'You' : r.name)),
    comments: rows
      .filter((r) => r.kind === 'comment')
      .map((r) => ({ who: r.mine ? 'You' : r.name, text: r.body ?? '', when: postedAgo(r.created_at), mine: r.mine, id: r.id ?? undefined })),
  });
}

async function toggleRealLike(id: string) {
  const before = liveById[id] ?? { likes: 0, liked: false, likers: [], comments: [] };
  const liked = !before.liked;
  setLive(id, { ...before, liked, likes: before.likes + (liked ? 1 : -1), likers: liked ? [...before.likers, 'You'] : before.likers.filter((n) => n !== 'You') });
  const { error } = liked ? await supabase.from('trip_likes').insert({ trip_id: id }) : await supabase.from('trip_likes').delete().eq('trip_id', id);
  if (error) setLive(id, before);
}

async function addRealComment(id: string, text: string) {
  const before = liveById[id] ?? { likes: 0, liked: false, likers: [], comments: [] };
  setLive(id, { ...before, comments: [...before.comments, { who: 'You', text, when: 'Just now', mine: true }] });
  const { error } = await supabase.from('trip_comments').insert({ trip_id: id, body: text });
  if (error) setLive(id, before);
  else loadReal(id);
}
