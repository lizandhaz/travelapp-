import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { AppState } from 'react-native';

import { useAuth } from '@/lib/auth';
import { getDeparturePreference, setDeparturePreference } from '@/lib/departurePreference';
import { canUseDeviceLocation, findDeviceDeparture } from '@/lib/deviceDeparture';
import { positionOf } from '@/lib/geo';
import { distanceKm, rankValue } from '@/lib/match';
import { MONTH_NAMES_LONG } from '@/lib/months';
import { groupNearbyTrips, type DepartureCity } from '@/lib/nearbyTrips';
import { placeDetails } from '@/lib/placeDetails';
import { placeCentres } from '@/lib/placeMaps';
import { places } from '@/lib/sample';
import { useTaste } from '@/lib/taste';

const LONDON: [number, number] = [51.51, -0.13];

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

  const ranked = useMemo(() => city && ready ? groupNearbyTrips(city.point, destinations.flatMap((place) => {
    const result = forSlug(place.slug);
    if (result?.yours) return [];
    return [{ ...place, taste: result ? rankValue(result) : place.score ?? 7 }];
  }), month) : [], [city, forSlug, month, ready]);

  // At most one quiet reason per card, never the group's name (owner, Nov 2026: personal without showing the machinery):
  // short hops say they're easy from your city; further trips say when they're in season.
  const groups = useMemo(() => ranked.map((group) => ({
    id: group.id,
    places: group.places.map((place) => ({
      slug: place.slug,
      why: group.id === 'weekend' && city ? `Easy from ${city.name}` : place.bestMonths.includes(month) ? `At its best in ${MONTH_NAMES_LONG[month]}` : null,
    })),
  })), [city, month, ranked]);
  // Places you could do in a weekend from your city, for Explore's "Weekends" chip.
  const weekends = useMemo(() => new Set(groups.find((g) => g.id === 'weekend')?.places.map((p) => p.slug) ?? []), [groups]);
  // The prototype's travel times ("2h 16m by Eurostar") are from London, so they only show near London.
  const nearLondon = !!city && distanceKm(city.point, LONDON) < 120;

  return { city, groups, weekends, nearLondon };
}
