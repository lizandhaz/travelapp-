import { View } from 'react-native';

import { colors, fonts } from '@/constants/theme';
import type { Person } from '@/lib/data';
import { Text } from './Text';

const SIZE = { sm: 32, md: 40, lg: 80 };

export function Avatar({ person, size = 'md' }: { person: Person; size?: keyof typeof SIZE }) {
  const d = SIZE[size];
  return (
    <View
      accessibilityElementsHidden
      style={{
        width: d,
        height: d,
        borderRadius: d / 2,
        backgroundColor: colors[person.colour],
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontFamily: fonts.display, fontSize: d * 0.36, color: colors.card }}>{person.initials}</Text>
    </View>
  );
}
