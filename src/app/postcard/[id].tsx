import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Dimensions, View } from 'react-native';

import { AccentTitle } from '@/components/AccentTitle';
import { PostcardCard } from '@/components/PostcardCard';
import { Row } from '@/components/cards';
import { PhotoTile } from '@/components/Photo';
import { TripActions } from '@/components/TripActions';
import { BackButton, Button, PageTitle, Screen, SectionHeader } from '@/components/ui';
import { colors, GUTTER } from '@/constants/theme';
import { personHref } from '@/lib/samplePeople';
import { getPostcard } from '@/lib/postcards';
import { photoCount, tripPic, tripPlace } from '@/lib/friendTrips';
import { useFriendTrip } from '@/lib/friendsFeed';
import NotFound from '../+not-found';

/**
 * A friend's trip as a postcard (tap to turn over), then scroll down for their photos, Like / Comment / Save, their
 * whole trip and the place. Opened from Postcards (id = the Postcard's id) and from Home's friends feed
 * (id = the friend's trip id, e.g. "maya-hydra").
 */
export default function PostcardScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [flipped, setFlipped] = useState(false);
  const fromPostcard = getPostcard(id)?.trip ?? null;
  const loaded = useFriendTrip(fromPostcard ? undefined : id);
  const trip = fromPostcard ?? loaded.trip;
  if (!trip) return loaded.loading ? <Loading /> : <NotFound />;
  const pics = Array.from({ length: photoCount(trip) }, (_, i) => tripPic(trip, i)!);
  const width = Math.min(Dimensions.get('window').width, 480) - GUTTER * 2;

  return (
    <Screen>
      <View style={{ paddingHorizontal: GUTTER, paddingTop: 12 }}>
        <BackButton />
      </View>
      <PageTitle label="Postcard">
        <AccentTitle before={`${trip.who}’s`} accent={tripPlace(trip)} after="trip" />
      </PageTitle>
      <View style={{ paddingHorizontal: GUTTER, gap: 12 }}>
        <PostcardCard trip={trip} width={width} flipped={flipped} onFlip={() => setFlipped((f) => !f)} />
        {pics.length > 0 && <Button title={flipped ? 'See the front' : 'Turn over'} kind="outline" onPress={() => setFlipped((f) => !f)} />}
        <View style={{ paddingTop: 6, paddingHorizontal: 4 }}>
          <TripActions id={trip.id} who={trip.who} place={trip.place} slug={trip.slug} country={trip.country} />
        </View>
      </View>

      {pics.length > 0 && (
        <View style={{ marginTop: 26 }}>
          <SectionHeader>{`${trip.who}’s photos`}</SectionHeader>
          <Row gap={12}>
            {pics.map((p, i) => (
              <PhotoTile key={i} {...p} style={{ width: Math.round(width * 0.78), height: Math.round(width * 0.98) }} shade={false} />
            ))}
          </Row>
        </View>
      )}

      <View style={{ paddingHorizontal: GUTTER, gap: 12, marginTop: 26 }}>
        <Button title={`See ${trip.who}’s whole trip`} kind="dark" onPress={() => router.push(`/friend-trip/${trip.id}`)} />
        {!!trip.slug && <Button title={`More about ${trip.place}`} kind="outline" onPress={() => router.push(`/place/${trip.slug}`)} />}
        {!!personHref(trip.who) && <Button title={`See ${trip.who}’s profile`} kind="outline" onPress={() => router.push(personHref(trip.who) as never)} />}
      </View>
    </Screen>
  );
}

function Loading() {
  return (
    <Screen>
      <View style={{ paddingHorizontal: GUTTER, paddingTop: 12, gap: 40 }}>
        <BackButton />
        <ActivityIndicator color={colors.accent} />
      </View>
    </Screen>
  );
}
