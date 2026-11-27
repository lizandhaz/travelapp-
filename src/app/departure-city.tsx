import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { AccentTitle } from '@/components/AccentTitle';
import { Text } from '@/components/Text';
import { BackButton, Button, Card, Input, Notice, PageTitle, Screen } from '@/components/ui';
import { colors, GUTTER } from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import { getDeparturePreference, setDeparturePreference } from '@/lib/departurePreference';
import { canUseDeviceLocation, findDeviceDeparture } from '@/lib/deviceDeparture';
import { searchDepartureCities } from '@/lib/nearbyTrips';

type Preference = Parameters<typeof setDeparturePreference>[1];

export default function DepartureCityScreen() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const [preference, setPreference] = useState<Preference | undefined>(undefined);
  const [query, setQuery] = useState('');
  const [explaining, setExplaining] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const mounted = useRef(false);
  const matches = useMemo(() => searchDepartureCities(query), [query]);

  useEffect(() => {
    mounted.current = true;
    if (userId) getDeparturePreference(userId).catch(() => null).then((saved) => {
      if (mounted.current) setPreference(saved);
    });
    return () => { mounted.current = false; };
  }, [userId]);

  async function save(id: string, next: Preference) {
    await setDeparturePreference(id, next);
    if (!mounted.current) return;
    if (router.canGoBack()) router.back();
    else router.replace('/explore');
  }

  async function pick(next: Preference) {
    if (busy || !userId) return;
    setBusy(true);
    setMessage('');
    try {
      await save(userId, next);
    } catch {
      if (mounted.current) setMessage('Couldn’t save your choice. Please try again.');
    } finally {
      if (mounted.current) setBusy(false);
    }
  }

  async function useLocation() {
    if (busy || !userId) return;
    setBusy(true);
    setMessage('');
    try {
      const result = await findDeviceDeparture(true).catch(() => null);
      if (!mounted.current) return;
      if (result && 'city' in result) await save(userId, { city: result.city, source: 'device' });
      else setMessage(result && result.reason === 'denied'
        ? 'Location access is off. You can choose your city below.'
        : 'We couldn’t find a nearby city. You can choose one below.');
    } catch {
      if (mounted.current) setMessage('Couldn’t save your city. Please try again.');
    } finally {
      if (mounted.current) {
        setExplaining(false);
        setBusy(false);
      }
    }
  }

  return (
    <Screen keyboardShouldPersistTaps="handled">
      <View style={{ paddingHorizontal: GUTTER, paddingTop: 12 }}><BackButton /></View>
      <PageTitle label="Trips near you">
        {explaining ? <AccentTitle before="Use your" accent="location" /> : <AccentTitle before="Your departure" accent="city" />}
      </PageTitle>
      <View style={{ paddingHorizontal: GUTTER, gap: 14 }}>
        {explaining ? (
          <Card tone="cream" style={{ padding: 16, gap: 14 }}>
            <Text variant="body">We use your approximate location while you’re using the app to suggest holidays near you. We only save the city on this device.</Text>
            <Button title={busy ? 'Finding your city…' : 'Continue'} disabled={busy} onPress={useLocation} />
            <Button title="Choose a city instead" kind="outline" disabled={busy} onPress={() => setExplaining(false)} />
          </Card>
        ) : (
          <>
            {preference === undefined && <ActivityIndicator color={colors.muted} accessibilityLabel="Loading departure city" />}
            {preference && <Text variant="strong">From {preference.city.name}, {preference.city.region}</Text>}
            {!!message && <Notice tone="info">{message}</Notice>}
            <Input value={query} onChangeText={setQuery} placeholder="Search for a city or region" accessibilityLabel="Search for a city or region" autoCorrect={false} editable={!busy} />
            {matches.length > 0 ? (
              <Card>
                {matches.map((city) => (
                  <Pressable key={city.id} disabled={busy} accessibilityRole="button" accessibilityState={{ selected: city.id === preference?.city.id }} onPress={() => pick({ city, source: 'manual' })} style={{ paddingHorizontal: 16, paddingVertical: 11 }}>
                    <Text variant="strong">{city.name}</Text>
                    <Text variant="small">{city.region}</Text>
                  </Pressable>
                ))}
              </Card>
            ) : !!query.trim() && <Text variant="bodySoft">No cities found. Try a nearby town or a different spelling.</Text>}
            {canUseDeviceLocation && <Button title="Use my location" kind="outline" disabled={busy} onPress={() => setExplaining(true)} />}
            {preference && <Button title="Remove saved city" kind="outline" disabled={busy} onPress={() => pick(null)} />}
          </>
        )}
      </View>
    </Screen>
  );
}
