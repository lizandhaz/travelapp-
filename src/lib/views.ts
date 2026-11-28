import AsyncStorage from '@react-native-async-storage/async-storage';

import { supabase } from './supabase';
import { tasteChanged } from './tasteEvents';

/**
 * Place pages you've looked at (supabase/migrations/20261124120000_place_views.sql),
 * used to improve your matches. Private to you. You can switch it off and clear it
 * in Settings; when it's off, nothing is recorded or used.
 */

export type PlaceView = { slug: string; name: string; country: string; views: number; seconds: number; lastViewed: string };

const SETTING = 'use-views-for-matches';
let enabled: boolean | null = null;

/** Forget the on/off setting on this phone (when an account is deleted). */
export async function forgetViewsSetting() {
  enabled = null;
  await AsyncStorage.removeItem(SETTING).catch(() => {});
}

/** Is "use what I look at" switched on? (On unless you've turned it off.) */
export async function viewsEnabled(): Promise<boolean> {
  if (enabled == null) enabled = (await AsyncStorage.getItem(SETTING).catch(() => null)) !== 'off';
  return enabled;
}

export async function setViewsEnabled(on: boolean): Promise<void> {
  enabled = on;
  await AsyncStorage.setItem(SETTING, on ? 'on' : 'off').catch(() => {});
  tasteChanged();
}

/** Records one visit to a place page (a quick glance under 3 seconds doesn't count). */
export async function recordPlaceView(slug: string, name: string, country: string, seconds: number): Promise<void> {
  if (seconds < 3 || !(await viewsEnabled())) return;
  const { error } = await supabase.rpc('record_place_view', { p_slug: slug, p_name: name, p_country: country, p_seconds: Math.round(seconds) });
  if (!error) tasteChanged(); // best effort: a missed view is no loss
}

/** Your viewed places (empty when switched off, or before the database update has run). */
export async function fetchPlaceViews(): Promise<PlaceView[]> {
  if (!(await viewsEnabled())) return [];
  const { data, error } = await supabase.from('place_views').select('place_slug, name, country, views, seconds, last_viewed_at').limit(500);
  if (error || !data) return [];
  return (data as { place_slug: string; name: string; country: string; views: number; seconds: number; last_viewed_at: string }[]).map((r) => ({
    slug: r.place_slug,
    name: r.name,
    country: r.country,
    views: r.views,
    seconds: r.seconds,
    lastViewed: r.last_viewed_at,
  }));
}

/** Deletes everything you've looked at. */
export async function clearPlaceViews(): Promise<void> {
  const { data: auth } = await supabase.auth.getSession();
  const userId = auth.session?.user.id;
  if (!userId) return;
  const { error } = await supabase.from('place_views').delete().eq('owner_id', userId);
  if (error) throw new Error('Couldn’t clear it just now. Please try again.');
  tasteChanged();
}
