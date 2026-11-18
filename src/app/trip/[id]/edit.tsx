import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { Text } from '@/components/Text';
import { TripForm } from '@/components/trip/TripForm';
import { BackButton, Screen } from '@/components/ui';
import { colors, GUTTER } from '@/constants/theme';
import { fetchTrip, type Trip } from '@/lib/trips';

export default function EditTrip() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [trip, setTrip] = useState<Trip | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTrip(id)
      .then(setTrip)
      .catch((e: Error) => setError(e.message));
  }, [id]);

  if (trip) {
    return <TripForm initial={trip} back onSaved={() => router.back()} />;
  }
  return (
    <Screen>
      <View style={{ padding: GUTTER, paddingTop: 20, gap: 12 }}>
        <BackButton />
        {error ? (
          <Text variant="body">{error}</Text>
        ) : trip === null ? (
          <Text variant="body">That trip couldn’t be found. It may have been deleted.</Text>
        ) : (
          <ActivityIndicator color={colors.terracotta} />
        )}
      </View>
    </Screen>
  );
}
