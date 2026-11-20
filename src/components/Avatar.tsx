import { Image } from 'expo-image';
import { View } from 'react-native';

import { colors, fonts } from '@/constants/theme';
import { photos, type PhotoName } from '@/lib/photos';
import { Text } from './Text';

/** A round face photo, or initials on navy when there's no photo. */
export function Avatar({ face, uri, name, size = 40 }: { face?: PhotoName | null; uri?: string | null; name: string; size?: number }) {
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return (
    <View
      accessibilityElementsHidden
      style={{ width: size, height: size, borderRadius: size / 2, overflow: 'hidden', backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' }}
    >
      {uri || face ? (
        <Image source={uri ? { uri } : photos[face!]} style={{ width: size, height: size }} contentFit="cover" />
      ) : (
        <Text style={{ fontFamily: fonts.display, fontSize: size * 0.38, color: colors.onDark }}>{initials}</Text>
      )}
    </View>
  );
}
