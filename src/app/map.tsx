import { ActivityIndicator, View } from 'react-native';

import { AccentTitle } from '@/components/AccentTitle';
import { TravelMapFull } from '@/components/TravelMap';
import { Text } from '@/components/Text';
import { BackButton, PageTitle, Screen } from '@/components/ui';
import { colors, GUTTER } from '@/constants/theme';
import { useTravelPlaces } from '@/lib/travelPlaces';

/** The full travel map, opened by tapping the map on You. */
export default function MapScreen() {
  const data = useTravelPlaces();
  return (
    <Screen>
      <View style={{ paddingHorizontal: GUTTER, paddingTop: 14 }}>
        <BackButton />
      </View>
      <PageTitle label={data && !data.failed ? `${data.countries} ${data.countries === 1 ? 'country' : 'countries'}` : 'Your travel map'}>
        <AccentTitle before="Your travel" accent="map" />
      </PageTitle>
      {data?.failed ? (
        <Text variant="body" accessibilityRole="alert" style={{ paddingHorizontal: GUTTER }}>
          {data.failed}
        </Text>
      ) : data ? (
        <TravelMapFull been={data.been} wish={data.wish} />
      ) : (
        <ActivityIndicator color={colors.accent} />
      )}
      {data && !data.failed && !data.been.length && !data.wish.length && (
        <Text variant="small" style={{ paddingHorizontal: GUTTER, marginTop: 12 }}>
          Add trips and save places, and they’ll appear here.
        </Text>
      )}
    </Screen>
  );
}
