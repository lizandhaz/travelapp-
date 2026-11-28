import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Companions } from './match';

/**
 * What a new person told us in first-time setup (app/setup.tsx, plan Step I): the kinds of holiday they love, who they
 * usually go with, and places they've been. Kept on the phone; places they want to go are saved to their real
 * Want to go board instead. taste.tsx turns these into signals, so scores are ranked for them from day one,
 * with no friends needed.
 */
export type StartTaste = { types: string[]; who: Companions | null; been: string[]; done: boolean };

const KEY = 'cova-start-taste';
export const EMPTY_START: StartTaste = { types: [], who: null, been: [], done: false };

export async function getStartTaste(): Promise<StartTaste> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? { ...EMPTY_START, ...(JSON.parse(raw) as Partial<StartTaste>) } : EMPTY_START;
  } catch {
    return EMPTY_START;
  }
}

/** Forget the first-time setup answers on this phone (when an account is deleted). */
export async function forgetStartTaste(): Promise<void> {
  await AsyncStorage.removeItem(KEY).catch(() => {});
}

export async function saveStartTaste(t: StartTaste): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(t));
}

/** The holiday types offered in setup, in the matching engine's words. */
export const START_TYPES: { tag: string; label: string }[] = [
  { tag: 'beach', label: 'Beaches' },
  { tag: 'island', label: 'Islands' },
  { tag: 'city', label: 'City breaks' },
  { tag: 'food', label: 'Food & drink' },
  { tag: 'culture', label: 'Culture & history' },
  { tag: 'ski', label: 'Skiing' },
  { tag: 'wildlife', label: 'Safari & wildlife' },
  { tag: 'hiking', label: 'Walking & hiking' },
  { tag: 'countryside', label: 'Countryside' },
  { tag: 'wellness', label: 'Spa & wellness' },
  { tag: 'themeparks', label: 'Theme parks' },
  { tag: 'luxury', label: 'A real treat' },
];
