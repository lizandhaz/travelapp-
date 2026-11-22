import MapView, { Marker } from 'react-native-maps';

import { colors } from '@/constants/theme';

/**
 * The real map of a place's area (Apple Maps on iPhone, Google on Android; both come with Expo Go,
 * no key needed). Pinch out to see the country and the world. Shows the place only: never your
 * own location (product rule 2), so it never asks for location permission.
 */
export function AreaMap({ at, span, name, width, height }: { at: [number, number]; span: number; name: string; width: number; height: number }) {
  return (
    <MapView
      style={{ width, height }}
      initialRegion={{ latitude: at[0], longitude: at[1], latitudeDelta: span, longitudeDelta: span * (width / height) }}
      showsUserLocation={false}
      showsMyLocationButton={false}
      showsPointsOfInterests
      rotateEnabled={false}
      pitchEnabled={false}
      accessibilityLabel={`Map of the area around ${name}`}
    >
      <Marker coordinate={{ latitude: at[0], longitude: at[1] }} title={name} pinColor={colors.accentDeep} />
    </MapView>
  );
}
