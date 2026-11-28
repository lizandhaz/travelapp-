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
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { colors, MAX_WIDTH } from '@/constants/theme';
import { AuthProvider, useAuth } from '@/lib/auth';
import { TasteProvider } from '@/lib/taste';

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
    // The phone's own gesture system, so drags like the best-time chart work reliably inside scrolling pages.
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <TasteProvider>
            <StatusBar style="dark" />
            {fontsLoaded && <Navigator />}
          </TasteProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
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
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* On iPad and computers, keep the app one centred column (MAX_WIDTH). */}
      <View style={{ flex: 1, width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center' }}>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
          <Stack.Protected guard={signedIn} redirectTo="/welcome">
            <Stack.Screen name="(tabs)" />
            {/* Add a trip slides up over the app (owner, Nov 2026: a clear way out). No swipe to dismiss: the score slider
                drags sideways, and leaving with unsaved work asks first. */}
            <Stack.Screen name="add" options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom', gestureEnabled: false }} />
            <Stack.Screen name="place/[slug]" />
            <Stack.Screen name="stay/[slug]" />
            <Stack.Screen name="postcards" />
            <Stack.Screen name="settings" />
            <Stack.Screen name="departure-city" />
            <Stack.Screen name="hotels" />
            <Stack.Screen name="setup" options={{ gestureEnabled: false }} />
            <Stack.Screen name="trip/[id]/index" />
            {/* No swipe-back on the form: sliding the score to the right must not leave the page. */}
            <Stack.Screen name="trip/[id]/edit" options={{ gestureEnabled: false }} />
            <Stack.Screen name="list/new" />
            <Stack.Screen name="list/[id]" />
            <Stack.Screen name="save" />
            <Stack.Screen name="map" />
            <Stack.Screen name="collection/[id]" />
            <Stack.Screen name="taste/[tag]" />
            <Stack.Screen name="friend-trip/[id]" />
            <Stack.Screen name="postcard/[id]" />
            <Stack.Screen name="people" />
            <Stack.Screen name="user/[id]" />
            <Stack.Screen name="person/[who]/index" />
            <Stack.Screen name="person/[who]/follows" />
            <Stack.Screen name="person/[who]/board" />
          </Stack.Protected>
          <Stack.Protected guard={!signedIn} redirectTo="/">
            <Stack.Screen name="welcome" />
            <Stack.Screen name="signup" />
            <Stack.Screen name="login" />
          </Stack.Protected>
          {/* Readable signed in or out (linked from Join and Settings). */}
          <Stack.Screen name="privacy" />
        </Stack>
      </View>
    </View>
  );
}
