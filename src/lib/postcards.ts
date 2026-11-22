import { APP_NAME } from '@/constants/brand';
import { getTrip, type FriendTrip } from './friendTrips';
import { samplePostcards, type SamplePostcard } from './sample';

/**
 * Postcards (the app's word for notifications, product rule 4). A Postcard about a friend's trip
 * opens as a postcard of that trip: the same template for everyone (photo front; back with their
 * score, who they went with, how long, where they stayed and ate, a tip). Others (the app's own
 * news, a friend joining) open the place. Sample content for now.
 */
export type Postcard = SamplePostcard & {
  id: string;
  /** Who it's from, as shown ("Tom", or the app). */
  from: string;
  /** The line in the Postcards list. */
  line: string;
  /** The friend's trip it's about, if any. */
  trip: FriendTrip | null;
};

// Sample text says {app} wherever the app's name goes, so renaming the app never needs a content change.
const withApp = (s: string) => s.replace(/\{app\}/g, APP_NAME);
const ABOUT_A_TRIP = /rated|sent you a postcard|have been/;

export const postcards: Postcard[] = samplePostcards.map((p, i) => ({
  ...p,
  id: String(i),
  from: withApp(p.who),
  line: withApp(p.text),
  trip: p.who !== '{app}' && ABOUT_A_TRIP.test(p.text) ? getTrip(p.who, p.slug) : null,
}));

export const getPostcard = (id: string) => postcards.find((p) => p.id === id) ?? null;
