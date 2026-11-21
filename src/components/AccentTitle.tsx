import { View, type TextStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { colors, fonts } from '@/constants/theme';
import { Text, type TextVariant } from './Text';

/**
 * A heading with one italic word and a hand-drawn terracotta swash under it,
 * e.g. "Where did *you* go?" → <AccentTitle before="Where did" accent="you" after="go?" />.
 */
export function AccentTitle({
  before,
  accent,
  after,
  variant = 'title',
  accessibilityRole = 'header',
}: {
  before?: string;
  accent: string;
  after?: string;
  variant?: TextVariant;
  accessibilityRole?: 'header' | 'text';
}) {
  const size = variant === 'title' ? 32 : variant === 'heading' ? 22 : 40;
  const italic: TextStyle = { fontFamily: fonts.displayItalic, fontSize: size };
  return (
    <View
      accessible
      accessibilityRole={accessibilityRole}
      accessibilityLabel={[before, accent, after].filter(Boolean).join(' ')}
      style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-end' }}
    >
      {!!before && <Text variant={variant}>{before} </Text>}
      <View>
        <Text variant={variant} style={italic}>
          {accent}
        </Text>
        <Svg
          width="100%"
          height={size * 0.24}
          viewBox="0 0 100 10"
          preserveAspectRatio="none"
          style={{ position: 'absolute', left: 0, bottom: -size * 0.1 }}
        >
          <Path d="M2 7 C 25 1, 55 1, 98 5" stroke={colors.accent} strokeWidth={2.4} fill="none" strokeLinecap="round" />
        </Svg>
      </View>
      {!!after && <Text variant={variant}> {after}</Text>}
    </View>
  );
}
