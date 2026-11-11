import { LinearGradient } from 'expo-linear-gradient';
import { View, type ViewStyle } from 'react-native';

import { colors, fonts, radius } from '@/constants/theme';
import { Text } from './Text';

/** Placeholder "photo": a soft gradient with a caption, until real uploads exist. */
export function Photo({
  palette,
  caption,
  style,
}: {
  palette: [string, string];
  caption?: string;
  style?: ViewStyle;
}) {
  return (
    <View
      style={[{ overflow: 'hidden', borderRadius: radius.sm, backgroundColor: colors.sand }, style]}
      accessible
      accessibilityRole="image"
      accessibilityLabel={caption ?? 'Holiday photo'}
    >
      <LinearGradient colors={palette} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1 }} />
      {caption && (
        <View
          style={{
            position: 'absolute',
            left: 8,
            bottom: 8,
            backgroundColor: 'rgba(255,251,244,0.88)',
            borderRadius: 2,
            paddingHorizontal: 6,
            paddingVertical: 2,
          }}
        >
          <Text style={{ fontFamily: fonts.displayItalic, fontSize: 12, color: colors.ink }}>{caption}</Text>
        </View>
      )}
    </View>
  );
}
