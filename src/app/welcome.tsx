import { Link } from 'expo-router';
import { Dimensions, View } from 'react-native';

import { AuthFrame } from '@/components/AuthFrame';
import { PhotoStamp } from '@/components/Photo';
import { Text } from '@/components/Text';
import { Button } from '@/components/ui';
import { APP_NAME } from '@/constants/brand';
import { colors, fonts } from '@/constants/theme';

export default function Welcome() {
  const w = Math.min(Dimensions.get('window').width, 480) * 0.7;
  return (
    <AuthFrame>
      <View style={{ alignItems: 'center', marginTop: 28 }}>
        <PhotoStamp photo="own-corfu" width={w} height={w * 1.18} tilt={-3}>
          <View style={{ position: 'absolute', left: 20, right: 20, bottom: 22 }}>
            <Text style={{ fontFamily: fonts.displayBold, fontSize: 30, color: colors.onDark }}>Corfu</Text>
            <Text variant="label" style={{ color: colors.onDark }}>
              Maya rated it 9.4
            </Text>
          </View>
        </PhotoStamp>
      </View>
      <Text variant="title" style={{ textAlign: 'center', marginTop: 28 }}>
        Where your friends loved staying
      </Text>
      <Text variant="bodySoft" style={{ textAlign: 'center', marginTop: 10 }}>
        Rate the holidays you’ve been on. See the ones your friends would go back to.
      </Text>
      <View style={{ gap: 12, marginTop: 28 }}>
        <Link href="/signup" asChild>
          <Button title={`Join ${APP_NAME}`} size="lg" />
        </Link>
        <Link href="/login" asChild>
          <Button title="I already have an account" kind="outline" size="lg" />
        </Link>
      </View>
      <Text variant="tiny" style={{ textAlign: 'center', marginTop: 24 }}>
        {APP_NAME} is for ages 13 and over. Public profiles are for over-18s only.
      </Text>
    </AuthFrame>
  );
}
