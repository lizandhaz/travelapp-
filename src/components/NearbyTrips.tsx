import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, AppState, View } from 'react-native';

import { PlaceCard, Row } from '@/components/cards';
import { Text } from '@/components/Text';
import { Card, SectionHeader } from '@/components/ui';
import { colors, GUTTER } from '@/constants/theme';
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

export function NearbyTrips() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const { ready, forSlug } = useTaste();
  const [departure, setDeparture] = useState<{ userId: string; city: DepartureCity | null; lastKnown?: boolean } | null>(null);
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
          } else {
            setDeparture({ userId: id, city: preference.city, lastKnown: true });
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
  }), month).filter((group) => group.places.length) : [], [city, forSlug, month, ready]);

  return (
    <View style={{ marginTop: 28 }}>
      <SectionHeader action={city ? 'Change' : 'Set city'} onAction={() => router.push('/departure-city')}>
        {city ? `From ${city.name}` : 'Trips near you'}
      </SectionHeader>
      {!current || (city && !ready) ? (
        <ActivityIndicator color={colors.muted} accessibilityLabel="Loading trips near you" />
      ) : !city || !groups.length ? (
        <View style={{ paddingHorizontal: GUTTER }}>
          <Card tone="cream" style={{ padding: 14 }}>
            <Text variant="bodySoft">{city ? 'No suggestions from this city yet. Try a nearby city.' : 'Choose a city to see holiday ideas from there.'}</Text>
          </Card>
        </View>
      ) : (
        <View style={{ gap: 18 }}>
          {current.lastKnown && <Text variant="tiny" style={{ paddingHorizontal: GUTTER }}>Using your last city.</Text>}
          {groups.map((group) => (
            <View key={group.id}>
              <Text variant="subheading" accessibilityRole="header" style={{ paddingHorizontal: GUTTER, marginBottom: 8 }}>{group.label}</Text>
              <Row>
                {group.places.slice(0, 6).map((place) => (
                  <PlaceCard key={place.slug} width={155} height={150} item={{ slug: place.slug, name: place.name, sub: place.region, photo: place.photo, score: place.score ?? undefined }} />
                ))}
              </Row>
            </View>
          ))}
          <Text variant="tiny" style={{ paddingHorizontal: GUTTER }}>Grouped by approximate distance.</Text>
        </View>
      )}
    </View>
  );
}
