import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Dimensions, Pressable, View } from 'react-native';

import { AccentTitle } from '@/components/AccentTitle';
import { Avatar } from '@/components/Avatar';
import { Row } from '@/components/cards';
import { PhotoTile } from '@/components/Photo';
import { FriendTripStamp, ProfileStats, ProfileTop, TasteTags, TripsSection } from '@/components/profile';
import { Text } from '@/components/Text';
import { TravelMapCard } from '@/components/TravelMap';
import { BackButton, Button, Screen, SectionHeader } from '@/components/ui';
import { colors, GUTTER, radius } from '@/constants/theme';
import type { FriendTrip } from '@/lib/friendTrips';
import { countryOf } from '@/lib/knownPlaces';
import { getPlace } from '@/lib/sample';
import { boardCover, boardsOf, getPerson, isoMonth, statsOf, tasteOf, tripsOf } from '@/lib/samplePeople';
import type { MapPlace } from '@/lib/travelPlaces';
import NotFound from '../../+not-found';

/**
 * A sample friend's profile, laid out like You (owner, Nov 2026): picture, name, followers and following
 * at the top, Follow, stats, their taste, travel map, their collections (boards) and their trips.
 */
export default function PersonScreen() {
  const { who } = useLocalSearchParams<{ who: string }>();
  const person = getPerson(who);
  const [following, setFollowing] = useState(true);
  const trips = useMemo(() => (person ? tripsOf(person) : []), [person]);
  const boards = useMemo(() => (person ? boardsOf(person) : []), [person]);
  if (!person) return <NotFound />;

  const stats = statsOf(person);
  const placeOf = (slug: string): MapPlace | null => {
    const p = getPlace(slug);
    return p ? { name: p.name, country: countryOf({ name: p.name, country: p.region.split(', ').pop() ?? '' }), href: `/place/${slug}` } : null;
  };
  const been = trips.map((t) => placeOf(t.slug)).filter((p): p is MapPlace => !!p);
  const wish = (boards[0]?.slugs ?? []).map(placeOf).filter((p): p is MapPlace => !!p);
  const cardWidth = (Math.min(Dimensions.get('window').width, 480) - GUTTER * 2 - 14) / 2;
  const follows = (tab: 'followers' | 'following') => () => router.push({ pathname: '/person/[who]/follows', params: { who: person.id, tab } });

  return (
    <Screen>
      <View style={{ paddingHorizontal: GUTTER, paddingTop: 14 }}>
        <BackButton />
      </View>

      <ProfileTop
        picture={<Avatar face={person.face} name={person.name} size={76} />}
        name={person.name}
        line={`@${person.handle} · ${person.home}`}
        counts={[
          { label: 'Followers', n: person.followers.length, onPress: follows('followers') },
          { label: 'Following', n: person.following.length, onPress: follows('following') },
        ]}
      />

      <Text variant="body" style={{ paddingHorizontal: GUTTER, marginTop: 14 }}>
        {person.bio}
      </Text>

      <View style={{ paddingHorizontal: GUTTER, marginTop: 16, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Button
          title={following ? 'Following' : person.followsYou ? 'Follow back' : 'Follow'}
          kind={following ? 'outline' : 'accent'}
          size="sm"
          style={{ flex: 1 }}
          onPress={() => setFollowing((f) => !f)}
          accessibilityLabel={following ? `Following ${person.name}. Tap to unfollow` : `Follow ${person.name}`}
        />
        {person.followsYou && (
          <View style={{ backgroundColor: colors.sageSoft, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 8 }}>
            <Text variant="small" style={{ color: colors.olive }}>
              Follows you
            </Text>
          </View>
        )}
      </View>

      <ProfileStats trips={stats.trips} countries={stats.countries} />
      <TasteTags label={`${person.name}’s taste`} tastes={tasteOf(person)} />

      {been.length > 0 && <TravelMapCard been={been} wish={wish} countries={stats.countries} title={[`${person.name}’s travel`, 'map']} open={false} />}

      {boards.length > 0 && (
        <View style={{ marginTop: 30 }}>
          <SectionHeader>
            <AccentTitle before={`${person.name}’s`} accent="collections" variant="heading" />
          </SectionHeader>
          <Row gap={14}>
            {boards.map((b, i) => (
              <Pressable
                key={b.name}
                onPress={() => router.push({ pathname: '/person/[who]/board', params: { who: person.id, i: String(i) } })}
                accessibilityRole="link"
                accessibilityLabel={`${b.name}, ${b.slugs.length} places`}
                style={{ width: 140 }}
              >
                <PhotoTile photo={boardCover(b)} shade={false} style={{ width: 140, height: 140, borderRadius: radius.lg }} />
                <Text variant="strong" numberOfLines={1} style={{ marginTop: 8 }}>
                  {b.name}
                </Text>
                <Text variant="tiny">
                  {b.slugs.length} {b.slugs.length === 1 ? 'place' : 'places'}
                </Text>
              </Pressable>
            ))}
          </Row>
        </View>
      )}

      <TripsSection
        title={[`${person.name}’s`, 'trips']}
        trips={trips}
        when={tripWhen}
        score={tripScore}
        render={(t) => <FriendTripStamp key={t.id} trip={t} width={cardWidth} />}
        empty={<Text variant="bodySoft">{person.name} hasn’t added a trip yet.</Text>}
      />

      <Text variant="tiny" style={{ paddingHorizontal: GUTTER, marginTop: 28 }}>
        Sample profile for now. Real profiles arrive when your friends join.
      </Text>
    </Screen>
  );
}

const tripWhen = (t: FriendTrip) => isoMonth(t.month);
const tripScore = (t: FriendTrip) => t.score;
