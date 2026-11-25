import { Image } from 'expo-image';
import { Pressable, View } from 'react-native';

import { colors } from '@/constants/theme';
import { placeMaps, type MapPin } from '@/lib/placeMaps';
import { Text } from './Text';

/**
 * Web stand-in for the real map (react-native-maps only runs on phones): the place's drawn map, so the
 * page still looks right in a browser. On a phone this is Apple Maps with the same pins.
 */
export function AreaMap({
  slug,
  name,
  width,
  height,
  preview = false,
  onPress,
}: {
  slug: string;
  name: string;
  width: number;
  height: number;
  pins: MapPin[];
  picked: number | null;
  stay: number | null;
  focus?: { n: number | null; key: number };
  onPin: (n: number) => void;
  preview?: boolean;
  onPress?: () => void;
}) {
  const map = placeMaps[slug];
  const body = (
    <View style={{ width, height, backgroundColor: colors.sand, alignItems: 'center', justifyContent: 'center' }} accessibilityLabel={`Map of ${name}`}>
      {map?.image ? (
        <Image source={map.image} style={{ width, height: Math.min(height, (width * 250) / 400) }} contentFit="cover" />
      ) : (
        <Text variant="tiny">Map of {name}</Text>
      )}
      {!preview && (
        <Text variant="tiny" style={{ marginTop: 8 }}>
          On your phone this is a real map you can zoom.
        </Text>
      )}
    </View>
  );
  return preview && onPress ? (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`Map of ${name}. Opens the full map.`}>
      {body}
    </Pressable>
  ) : (
    body
  );
}
