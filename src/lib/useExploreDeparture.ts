import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { AppState } from 'react-native';

import { useAuth } from '@/lib/auth';
import { getDeparturePreference, setDeparturePreference } from '@/lib/departurePreference';
import { canUseDeviceLocation, findDeviceDeparture } from '@/lib/deviceDeparture';
import { positionOf } from '@/lib/geo';
import { rankValue } from '@/lib/match';
import { groupNearbyTrips, type DepartureCity } from '@/lib/nearbyTrips';
import { placeDetails } from '@/lib/placeDetails';
import { placeCentres } from '@/lib/placeMaps';
import { places } from '@/lib/sample';
import { useTaste } from '@/lib/taste';

const destinations = places.flatMap((place) => {
  const point = placeCentres[place.slug]?.at ?? positionOf({ name: place.name, country: '' }, false);
  return point ? [{ ...place, point, bestMonths: placeDetails[place.slug]?.bestMonths ?? [] }] : [];
});

export function useExploreDeparture() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const { ready, forSlug } = useTaste();
  const [departure, setDeparture] = useState<{ userId: string; city: DepartureCity | null } | null>(null);
  const current = departure?.userId === userId ? departure : null;
  const city = current?.city;
  const month = new Date().getMonth();

  useFocusEffect(useCallback(() => {
    if (!userId) return;
    let focused = true;
    let refreshing = false;
    async function refresh(id: string) {
      if (refreshing) return;
      refreshing = true;
      try {
        const preference = await getDeparturePreference(id).catch(() => null);
        if (!focused) return;
        setDeparture({ userId: id, city: preference?.city ?? null });
        if (preference?.source !== 'device' || !canUseDeviceLocation || AppState.currentState !== 'active') return;
        const result = await findDeviceDeparture(false).catch(() => null);
        if (focused) {
          if (result && 'city' in result) {
            setDeparture({ userId: id, city: result.city });
            if (result.city !== preference.city) await setDeparturePreference(id, { city: result.city, source: 'device' }).catch(() => {});
          }
        }
      } finally {
        refreshing = false;
      }
    }
    void refresh(userId);
    const listener = AppState.addEventListener('change', (state) => {
      if (state === 'active') void refresh(userId);
    });
    return () => {
      focused = false;
      listener.remove();
    };
  }, [userId]));

  const groups = useMemo(() => city && ready ? groupNearbyTrips(city.point, destinations.flatMap((place) => {
    const result = forSlug(place.slug);
    if (result?.yours) return [];
    return [{ ...place, taste: result ? rankValue(result) : place.score ?? 7 }];
  }), month) : [], [city, forSlug, month, ready]);

  return { city, groups };
}
