import AsyncStorage from '@react-native-async-storage/async-storage';

import { tasteChanged } from './tasteEvents';

/**
 * What your scores are allowed to use, switched in Settings → Your scores. Stored on the phone.
 * Everything is on unless you turn it off. (The places you look at have their own switch in views.ts,
 * because turning that off also stops them being recorded.)
 */
export type MatchSettings = {
  /** Your own trips and how you rated them. */
  trips: boolean;
  /** Your Want to go list and your other lists. */
  saves: boolean;
  /** Your friends' ratings (and what they recommend). */
  friends: boolean;
};

const KEY = 'match-settings';
export const DEFAULT_MATCH_SETTINGS: MatchSettings = { trips: true, saves: true, friends: true };
let cached: MatchSettings | null = null;

export async function getMatchSettings(): Promise<MatchSettings> {
  if (cached) return cached;
  try {
    const raw = await AsyncStorage.getItem(KEY);
    cached = { ...DEFAULT_MATCH_SETTINGS, ...(raw ? (JSON.parse(raw) as Partial<MatchSettings>) : {}) };
  } catch {
    cached = { ...DEFAULT_MATCH_SETTINGS };
  }
  return cached;
}

export async function setMatchSetting(key: keyof MatchSettings, on: boolean): Promise<MatchSettings> {
  const next = { ...(await getMatchSettings()), [key]: on };
  cached = next;
  await AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
  tasteChanged();
  return next;
}
