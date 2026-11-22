import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';

/**
 * Likes, comments and saves on friends' trips. Friends' trips are sample content for now, so this keeps
 * your likes and comments on the phone and starts from sample counts. When friends' real trips
 * arrive (plan Step C), this moves to the database with the same shape.
 */
export type TripComment = { who: string; text: string; when: string; mine?: boolean };

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

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export function toggleLike(id: string) {
  state = { ...state, liked: { ...state.liked, [id]: !state.liked[id] } };
  save();
  emit();
}

export function addComment(id: string, text: string) {
  const t = text.trim().slice(0, 500);
  if (!t) return;
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

/** Likes and comments for one friend's trip, kept up to date everywhere it's shown. */
export function useReactions(id: string) {
  const s = useSyncExternalStore(subscribe, () => state);
  const base = SAMPLE[id] ?? { likes: 0, comments: [] };
  const liked = !!s.liked[id];
  return {
    liked,
    likes: base.likes + (liked ? 1 : 0),
    comments: [...base.comments, ...(s.mine[id] ?? [])],
    saved: !!s.saved[id],
  };
}
