import { View } from 'react-native';

import { colors } from '@/constants/theme';
import { Text } from './Text';

/** A trip month in a slightly tilted outline pill, like a postmark: "JUN 2026". */
export function MonthPill({ month, onPhoto = false, tilt = -4 }: { month: string; onPhoto?: boolean; tilt?: number }) {
  const color = onPhoto ? colors.onDark : colors.accentText;
  return (
    <View
      style={{
        alignSelf: 'flex-start',
        borderWidth: 1.5,
        borderColor: color,
        borderRadius: 999,
        paddingHorizontal: 9,
        paddingVertical: 3,
        transform: [{ rotate: `${tilt}deg` }],
      }}
    >
      <Text variant="label" style={{ color, fontSize: 10, letterSpacing: 1.6 }}>
        {month}
      </Text>
    </View>
  );
}
