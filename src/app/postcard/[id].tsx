import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Dimensions, View } from 'react-native';

import { AccentTitle } from '@/components/AccentTitle';
import { PostcardCard } from '@/components/PostcardCard';
import { BackButton, Button, PageTitle, Screen } from '@/components/ui';
import { GUTTER } from '@/constants/theme';
import { getPostcard } from '@/lib/postcards';
import NotFound from '../+not-found';

/** One Postcard about a friend's trip: the trip as a postcard (tap to turn over), then their whole trip or the place. */
export default function PostcardScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [flipped, setFlipped] = useState(false);
  const card = getPostcard(id);
  if (!card?.trip) return <NotFound />;
  const trip = card.trip;
  const width = Math.min(Dimensions.get('window').width, 480) - GUTTER * 2;

  return (
    <Screen>
      <View style={{ paddingHorizontal: GUTTER, paddingTop: 12 }}>
        <BackButton />
      </View>
      <PageTitle label="Postcard">
        <AccentTitle before="From" accent={trip.who} />
      </PageTitle>
      <View style={{ paddingHorizontal: GUTTER, gap: 12 }}>
        <PostcardCard trip={trip} width={width} flipped={flipped} onFlip={() => setFlipped((f) => !f)} />
        <Button title={flipped ? 'See the front' : 'Turn over'} kind="outline" onPress={() => setFlipped((f) => !f)} />
        <Button title={`See ${trip.who}’s whole trip`} kind="dark" onPress={() => router.push(`/friend-trip/${trip.id}`)} />
        <Button title={`More about ${trip.place}`} kind="outline" onPress={() => router.push(`/place/${trip.slug}`)} />
      </View>
    </Screen>
  );
}
