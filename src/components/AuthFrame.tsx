import { KeyboardAvoidingView, Platform, View } from 'react-native';

import { colors, GUTTER } from '@/constants/theme';
import { Screen } from './ui';
import { Wordmark } from './Wordmark';

/** Frame for welcome, join and log in: no tab bar, centred wordmark and tagline. */
export function AuthFrame({ children }: { children: React.ReactNode }) {
  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen>
        <View style={{ paddingHorizontal: GUTTER, paddingTop: 28 }}>
          <Wordmark size={38} center />
          {children}
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}
