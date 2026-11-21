import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { APP_NAME } from '@/constants/brand';
import { colors, fonts } from '@/constants/theme';
import { Text } from './Text';

/** The app name in big spaced serif capitals, with a small terracotta star. */
export function Wordmark({ size = 34, tagline = true, center = false }: { size?: number; tagline?: boolean; center?: boolean }) {
  return (
    <View style={{ alignItems: center ? 'center' : 'flex-start' }} accessible accessibilityRole="header" accessibilityLabel={APP_NAME}>
      <View style={{ flexDirection: 'row' }}>
        <Text style={{ fontFamily: fonts.displayBold, fontSize: size, lineHeight: size * 1.1, letterSpacing: size * 0.12, color: colors.ink }}>
          {APP_NAME.toUpperCase()}
        </Text>
        <Star size={size * 0.48} style={{ marginLeft: -size * 0.08, marginTop: -size * 0.12 }} />
      </View>
      {tagline && (
        <Text variant="kicker" style={{ marginTop: 6, fontSize: 10 }}>
          Picked by you and those you trust
        </Text>
      )}
    </View>
  );
}

export function Star({ size = 16, color = colors.accent, style }: { size?: number; color?: string; style?: object }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
      <Path d="M12 1 C13 8 16 11 23 12 C16 13 13 16 12 23 C11 16 8 13 1 12 C8 11 11 8 12 1 Z" fill={color} />
    </Svg>
  );
}
