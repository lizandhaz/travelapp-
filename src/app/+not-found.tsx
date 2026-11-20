import { router } from 'expo-router';
import { View } from 'react-native';

import { AccentTitle } from '@/components/AccentTitle';
import { MonthPill } from '@/components/MonthPill';
import { Text } from '@/components/Text';
import { Button } from '@/components/ui';
import { colors } from '@/constants/theme';

export default function NotFound() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 14, backgroundColor: colors.bg }}>
      <MonthPill month="Return to sender" />
      <AccentTitle before="Lost in the" accent="post" />
      <Text variant="bodySoft">We couldn&apos;t find that page.</Text>
      <Button title="Back home" style={{ marginTop: 8 }} onPress={() => router.replace('/')} />
    </View>
  );
}
