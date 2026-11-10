import { router } from 'expo-router';
import { View } from 'react-native';

import { Postmark } from '@/components/Postmark';
import { Text } from '@/components/Text';
import { Button } from '@/components/ui';
import { colors } from '@/constants/theme';

export default function NotFound() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: colors.paper }}>
      <Postmark place="Return to sender" date="404" waves={false} />
      <Text variant="title" style={{ marginTop: 24 }}>
        Lost in the post
      </Text>
      <Text variant="bodySoft" style={{ marginTop: 8 }}>
        We couldn&apos;t find that page.
      </Text>
      <Button title="Back home" style={{ marginTop: 24 }} onPress={() => router.replace('/')} />
    </View>
  );
}
