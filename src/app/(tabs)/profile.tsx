import { Link, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { ProfileView } from '@/components/ProfileView';
import { Text } from '@/components/Text';
import { TripCard } from '@/components/trip/TripCard';
import { Button, Card, Screen } from '@/components/ui';
import { APP_NAME } from '@/constants/brand';
import { colors, GUTTER } from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import type { Person } from '@/lib/data';
import { countriesIn, fetchMyTrips, type Trip } from '@/lib/trips';

const COLOURS: Person['colour'][] = ['postbox', 'airmail', 'sea', 'sun', 'ink'];

export default function You() {
  const { profile, session, signOut } = useAuth();
  const [trips, setTrips] = useState<Trip[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback((isActive: () => boolean = () => true) => {
    fetchMyTrips()
      .then((t) => {
        if (!isActive()) return;
        setTrips(t);
        setError(null);
      })
      .catch((e: Error) => isActive() && setError(e.message));
  }, []);

  // Load your trips each time You comes into view, so new and edited trips show up.
  useFocusEffect(
    useCallback(() => {
      let active = true;
      load(() => active);
      return () => {
        active = false;
      };
    }, [load]),
  );

  const name = profile?.name ?? session?.user.email?.split('@')[0] ?? 'You';
  const id = profile?.id ?? session?.user.id ?? 'x';
  const person: Person = {
    handle: profile?.handle ?? '…',
    name,
    initials: name
      .split(/\s+/)
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase(),
    homeTown: '',
    bio: '',
    colour: COLOURS[id.charCodeAt(0) % COLOURS.length],
    isFriend: false,
  };

  const list = trips ?? [];
  const stats = {
    count: list.length,
    countries: countriesIn(list),
    avg: list.length ? (list.reduce((s, t) => s + t.score, 0) / list.length).toFixed(1) : '–',
  };

  let tripList: React.ReactNode;
  if (error) {
    tripList = (
      <Card style={{ padding: 16, gap: 8 }}>
        <Text variant="body">{error}</Text>
        <Pressable accessibilityRole="button" onPress={() => load()} hitSlop={8}>
          <Text variant="link">Try again</Text>
        </Pressable>
      </Card>
    );
  } else if (!trips) {
    tripList = <ActivityIndicator color={colors.postbox} />;
  } else if (trips.length === 0) {
    tripList = <Text variant="bodySoft">No trips yet. Tap Add to save your first one.</Text>;
  } else {
    tripList = trips.map((t) => <TripCard key={t.id} trip={t} />);
  }

  return (
    <Screen tabBar>
      <ProfileView
        person={person}
        isMe
        stats={stats}
        listTitle="Your trips"
        list={tripList}
        footer={
          <View style={{ paddingHorizontal: GUTTER, marginTop: 32, gap: 16 }}>
            <Card style={{ padding: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                <View style={{ flex: 1 }}>
                  <Text variant="strong">Public profile</Text>
                  <Text variant="small">Let anyone on {APP_NAME} see your trips, not just friends.</Text>
                </View>
                <View style={{ backgroundColor: colors.sand, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4 }}>
                  <Text variant="tiny" style={{ color: colors.inkSoft }}>
                    {profile?.isPublic ? 'On' : 'Off'}
                  </Text>
                </View>
              </View>
              <Text variant="tiny" style={{ marginTop: 12 }}>
                {profile?.canGoPublic
                  ? 'Public profiles are coming soon.'
                  : 'Public profiles are for over-18s. Until then, your profile is just for friends.'}
              </Text>
            </Card>

            <Card style={{ padding: 16, gap: 12 }}>
              <Text variant="small">
                Signed in as <Text variant="strong">{session?.user.email}</Text>
              </Text>
              <Button title="Log out" kind="secondary" onPress={signOut} />
            </Card>
          </View>
        }
      >
        <View style={{ paddingHorizontal: GUTTER, marginTop: 24 }}>
          <Link href="/add" asChild>
            <Button title={list.length ? 'Add a trip' : 'Add your first trip'} />
          </Link>
        </View>
      </ProfileView>
    </Screen>
  );
}
