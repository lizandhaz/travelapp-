import { router, useLocalSearchParams } from 'expo-router';

import { TripForm } from '@/components/trip/TripForm';

/**
 * Add a trip: opened by the "+" in the tab bar (and a place page's "I've been", with ?place=…&country=…), sliding up
 * over the screen you were on. The × (or the phone's back button) takes you back there; if you've entered anything it
 * asks first ("Discard this trip?"). After saving, the new trip opens in its place.
 */
export default function AddTrip() {
  const { place, country } = useLocalSearchParams<{ place?: string; country?: string }>();
  return (
    <TripForm
      startPlace={place ? { name: place, country: country ?? '' } : undefined}
      onClose={() => (router.canGoBack() ? router.back() : router.replace('/'))}
      onSaved={(id) => router.replace(`/trip/${id}`)}
    />
  );
}
