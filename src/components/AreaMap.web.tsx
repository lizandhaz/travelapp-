import Svg, { Circle, Path } from 'react-native-svg';
import { View } from 'react-native';

import { colors } from '@/constants/theme';
import { toMap } from '@/lib/geo';
import { WORLD_LAND_PATH, WORLD_VIEWBOX } from '@/lib/worldMap';
import { Text } from './Text';

/** Web stand-in for the real area map (react-native-maps only runs on phones): the world with the place marked. */
export function AreaMap({ at, name, width, height }: { at: [number, number]; span: number; name: string; width: number; height: number }) {
  const { x, y } = toMap(at);
  return (
    <View style={{ width, height, backgroundColor: colors.skySoft, alignItems: 'center', justifyContent: 'center' }} accessibilityLabel={`World map with ${name} marked`}>
      <Svg width={width} height={(width * WORLD_VIEWBOX.height) / WORLD_VIEWBOX.width} viewBox={`0 0 ${WORLD_VIEWBOX.width} ${WORLD_VIEWBOX.height}`}>
        <Path d={WORLD_LAND_PATH} fill={colors.mapLand} />
        <Circle cx={x} cy={y} r={4} fill={colors.accentDeep} stroke={colors.card} strokeWidth={1.5} />
      </Svg>
      <Text variant="tiny" style={{ marginTop: 8 }}>
        On your phone this is a real map you can zoom.
      </Text>
    </View>
  );
}
