import { Link } from 'expo-router';
import { KeyboardAvoidingView, Platform, Pressable, View } from 'react-native';

import { colors, GUTTER } from '@/constants/theme';
import { Airmail } from './Airmail';
import { Text } from './Text';
import { Screen } from './ui';

/** Frame for welcome, join and log in: no tab bar, airmail edge, brand name. */
export function AuthFrame({ children }: { children: React.ReactNode }) {
  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.paper }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen>
        <Airmail height={8} />
        <View style={{ paddingHorizontal: GUTTER, paddingTop: 24 }}>
          <Link href="/welcome" asChild>
            <Pressable accessibilityRole="link" style={{ alignSelf: 'flex-start' }}>
              <Logo />
            </Pressable>
          </Link>
          {children}
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}

export function Logo({ size = 26 }: { size?: number }) {
  return (
    <Text variant="title" style={{ fontSize: size, lineHeight: size * 1.2 }}>
      Postcard<Text style={{ color: colors.postbox }}>.</Text>
    </Text>
  );
}
