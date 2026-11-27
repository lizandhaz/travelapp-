import { Platform, Share } from 'react-native';

import { APP_NAME } from '@/constants/brand';
import { countryOf } from './knownPlaces';
import { dayRange, longMonth } from './months';
import { formatScore, scoreWord } from './score';
import { companionsLabel, placeLabel, type Trip } from './trips';

/**
 * Opens the phone's share sheet (WhatsApp, Messages, Mail…) with plain text. On a web browser
 * without sharing, copies the text instead. False when neither is possible.
 */
export async function shareText(title: string, message: string): Promise<'shared' | 'copied' | false> {
  try {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && !navigator.share) {
      if (!navigator.clipboard) return false;
      await navigator.clipboard.writeText(message);
      return 'copied';
    }
    await Share.share({ title, message });
    return 'shared';
  } catch {
    return false;
  }
}

/**
 * One of your trips as a message for a friend: the place and month, your score, who with and how
 * long, where you stayed, your best restaurants, top tip and note. Only what you filled in. Never a
 * location or a link (privacy default).
 */
export function tripShareText(trip: Trip): string {
  const [main, ...more] = trip.stops;
  const where = placeLabel({ name: main.name, country: countryOf(main) || main.country });
  const nights = trip.stops.reduce((n, s) => n + (s.nights ?? 0), 0);
  const who = companionsLabel(trip.companions);
  const lines = [`${where} · ${trip.dates ? dayRange(trip.dates.start, trip.dates.end) : longMonth(trip.month)}`, `${formatScore(trip.score)}/10 – ${scoreWord(trip.score)}`];
  const details = [who && (trip.companions === 'solo' ? 'Solo' : `With ${who.toLowerCase()}`), nights ? `${nights} ${nights === 1 ? 'night' : 'nights'}` : null].filter(Boolean);
  if (trip.wouldReturn != null) details.push(trip.wouldReturn ? 'Would go back' : 'Wouldn’t go back');
  if (details.length) lines.push(details.join(' · '));
  if (more.length) lines.push(`Also: ${more.map((s) => s.name).join(', ')}`);
  if (trip.note) lines.push('', `“${trip.note}”`);
  const tips: string[] = [];
  if (trip.stay) tips.push(`Stayed at ${trip.stay.name} (${trip.stay.type}${trip.stay.score != null ? `, ${formatScore(trip.stay.score)}/10` : ''})`);
  if (trip.restaurants.length) tips.push(`Best ${trip.restaurants.length === 1 ? 'restaurant' : 'restaurants'}: ${trip.restaurants.join(', ')}`);
  if (trip.tip) tips.push(`Top tip: ${trip.tip}`);
  if (tips.length) lines.push('', ...tips);
  lines.push('', `Rated on ${APP_NAME}`);
  return lines.join('\n');
}
