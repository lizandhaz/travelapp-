import AsyncStorage from '@react-native-async-storage/async-storage';

import { BRANDS, BUDGETS, EMPTY_HOTEL_PREFS, STYLE_LABEL, type HotelPrefs } from './hotels';
import { myUserId } from './supabase';
import { tasteChanged } from './tasteEvents';

/**
 * What you told us on the "Hotels you love" page (app/hotels.tsx): brands, styles and a budget a night. Kept on the
 * phone for each signed-in account (so two people sharing a phone don't mix), and used by the matching engine for
 * every hotel's score.
 */
const key = (user: string | null) => `cova-hotel-prefs:${user ?? 'signed-out'}`;

export async function getHotelPrefs(): Promise<HotelPrefs> {
  try {
    const raw = await AsyncStorage.getItem(key(await myUserId()));
    if (!raw) return EMPTY_HOTEL_PREFS;
    const p = JSON.parse(raw) as Partial<HotelPrefs>;
    return {
      brands: (p.brands ?? []).filter((id) => BRANDS.some((b) => b.id === id)),
      styles: (p.styles ?? []).filter((s) => s in STYLE_LABEL),
      budget: p.budget && p.budget in BUDGETS ? p.budget : null,
    };
  } catch {
    return EMPTY_HOTEL_PREFS;
  }
}

export async function saveHotelPrefs(p: HotelPrefs): Promise<void> {
  await AsyncStorage.setItem(key(await myUserId()), JSON.stringify(p)).catch(() => {});
  tasteChanged();
}

/** Forget them on this phone (when an account is deleted). */
export async function forgetHotelPrefs(user?: string | null): Promise<void> {
  await AsyncStorage.removeItem(key(user ?? (await myUserId()))).catch(() => {});
}

/** A short line for what you told us: "Ikos, Four Seasons · £300 to £600 a night". */
export function hotelPrefsLine(p: HotelPrefs): string | null {
  const names = p.brands.map((id) => BRANDS.find((b) => b.id === id)?.name).filter(Boolean) as string[];
  const bits = [names.length > 2 ? `${names.slice(0, 2).join(', ')} +${names.length - 2}` : names.join(', '), p.budget ? BUDGETS[p.budget].sub : ''].filter(Boolean);
  return bits.length ? bits.join(' · ') : null;
}
