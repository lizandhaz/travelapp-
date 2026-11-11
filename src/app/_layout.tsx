// Import each font style separately so only these 8 are bundled into the app.
import { DMSans_400Regular } from '@expo-google-fonts/dm-sans/400Regular';
import { DMSans_500Medium } from '@expo-google-fonts/dm-sans/500Medium';
import { DMSans_600SemiBold } from '@expo-google-fonts/dm-sans/600SemiBold';
import { DMSans_700Bold } from '@expo-google-fonts/dm-sans/700Bold';
import { Fraunces_400Regular } from '@expo-google-fonts/fraunces/400Regular';
import { Fraunces_400Regular_Italic } from '@expo-google-fonts/fraunces/400Regular_Italic';
import { Fraunces_600SemiBold } from '@expo-google-fonts/fraunces/600SemiBold';
import { Fraunces_700Bold } from '@expo-google-fonts/fraunces/700Bold';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { colors } from '@/constants/theme';
import { AuthProvider, useAuth } from '@/lib/auth';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Fraunces-Regular': Fraunces_400Regular,
    'Fraunces-Italic': Fraunces_400Regular_Italic,
    'Fraunces-SemiBold': Fraunces_600SemiBold,
    'Fraunces-Bold': Fraunces_700Bold,
    'DMSans-Regular': DMSans_400Regular,
    'DMSans-Medium': DMSans_500Medium,
    'DMSans-SemiBold': DMSans_600SemiBold,
    'DMSans-Bold': DMSans_700Bold,
  });

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        {fontsLoaded && <Navigator />}
      </AuthProvider>
    </SafeAreaProvider>
  );
}

/**
 * Signed in: the tabs and detail screens. Signed out: welcome, join and log in.
 * Switching happens automatically when you log in or out.
 */
function Navigator() {
  const { loading, session } = useAuth();
  const signedIn = !!session;

  useEffect(() => {
    if (!loading) SplashScreen.hideAsync();
  }, [loading]);

  if (loading) return null;

  return (
    <View style={{ flex: 1, backgroundColor: colors.paper }}>
      {/* On a computer browser, keep the app phone-width and centred. */}
      <View style={{ flex: 1, width: '100%', maxWidth: Platform.OS === 'web' ? 480 : undefined, alignSelf: 'center' }}>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.paper } }}>
          <Stack.Protected guard={signedIn} redirectTo="/welcome">
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="destination/[slug]" />
            <Stack.Screen name="rating/[id]" />
            <Stack.Screen name="people/[handle]" />
          </Stack.Protected>
          <Stack.Protected guard={!signedIn} redirectTo="/">
            <Stack.Screen name="welcome" />
            <Stack.Screen name="signup" />
            <Stack.Screen name="login" />
          </Stack.Protected>
        </Stack>
      </View>
    </View>
  );
}
