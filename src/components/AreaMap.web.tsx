import Svg, { Circle, Path } from 'react-native-svg';
import { View } from 'react-native';

import { colors } from '@/constants/theme';
import { toMap } from '@/lib/geo';
import { placeCentres, type MapPin } from '@/lib/placeMaps';
import { WORLD_LAND_PATH, WORLD_VIEWBOX } from '@/lib/worldMap';
import { Text } from './Text';

/** Web stand-in for the real map (react-native-maps only runs on phones): the world with the place marked. */
export function AreaMap({ slug, name, width, height }: { slug: string; name: string; width: number; height: number; pins: MapPin[]; picked: number | null; stay: number | null; focus?: { n: number | null; key: number }; onPin: (n: number) => void }) {
  const centre = placeCentres[slug];
  if (!centre) return null;
  const { x, y } = toMap(centre.at);
  return (
    <View style={{ width, height, backgroundColor: colors.skySoft, alignItems: 'center', justifyContent: 'center' }} accessibilityLabel={`World map with ${name} marked`}>
      <Svg width={width} height={(width * WORLD_VIEWBOX.height) / WORLD_VIEWBOX.width} viewBox={`0 0 ${WORLD_VIEWBOX.width} ${WORLD_VIEWBOX.height}`}>
        <Path d={WORLD_LAND_PATH} fill={colors.mapLand} />
        <Circle cx={x} cy={y} r={4} fill={colors.accentDeep} stroke={colors.card} strokeWidth={1.5} />
      </Svg>
      <Text variant="tiny" style={{ marginTop: 8 }}>
        On your phone this is a real map with the numbered spots.
      </Text>
    </View>
  );
}
