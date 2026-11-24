import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Dimensions, Pressable, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { ChevronIcon } from '@/components/Icons';
import { PhotoFill, PhotoTile, Shade } from '@/components/Photo';
import { ScoreStamp } from '@/components/ScoreStamp';
import { Text } from '@/components/Text';
import { TravelMapCard } from '@/components/TravelMap';
import { BackButton, Button, Card, Screen, Segmented, toneFill, type Tone } from '@/components/ui';
import { colors, fonts, GUTTER, radius } from '@/constants/theme';
import { fitLines, fitWordSize } from '@/lib/fit';
import { tripPic, tripPlace, type FriendTrip } from '@/lib/friendTrips';
import { countryOf } from '@/lib/knownPlaces';
import { getPlace } from '@/lib/sample';
import { boardCover, boardsOf, getPerson, statsOf, tripsOf, type SampleBoard, type SamplePerson } from '@/lib/samplePeople';
import type { MapPlace } from '@/lib/travelPlaces';
import NotFound from '../+not-found';

type Tab = 'trips' | 'boards' | 'followers' | 'following';
const TABS = [
  ['trips', 'Trips'],
  ['boards', 'Boards'],
  ['followers', 'Followers'],
  ['following', 'Following'],
] as const;

/** A sample friend's profile: who they are, stats, travel map, trips, boards, followers and following. */
export default function PersonScreen() {
  const { who } = useLocalSearchParams<{ who: string }>();
  const person = getPerson(who);
  const [tab, setTab] = useState<Tab>('trips');
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

  return (
    <Screen>
      <View style={{ paddingHorizontal: GUTTER, paddingTop: 14 }}>
        <BackButton />
      </View>

      <View style={{ paddingHorizontal: GUTTER, marginTop: 16, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <Avatar face={person.face} name={person.name} size={76} />
        <View style={{ flex: 1 }}>
          <Text variant="title">{person.name}</Text>
          <Text variant="small">
            @{person.handle} · {person.home}
          </Text>
          {person.followsYou && (
            <View style={{ alignSelf: 'flex-start', marginTop: 6, backgroundColor: colors.sageSoft, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 3 }}>
              <Text variant="tiny" style={{ color: colors.olive, fontFamily: fonts.sansSemiBold }}>
                Follows you
              </Text>
            </View>
          )}
        </View>
      </View>
      <Text variant="body" style={{ paddingHorizontal: GUTTER, marginTop: 14 }}>
        {person.bio}
      </Text>

      <View style={{ paddingHorizontal: GUTTER, marginTop: 16 }}>
        <Button
          title={following ? 'Following' : person.followsYou ? 'Follow back' : 'Follow'}
          kind={following ? 'outline' : 'accent'}
          size="sm"
          onPress={() => setFollowing((f) => !f)}
          accessibilityLabel={following ? `Following ${person.name}. Tap to unfollow` : `Follow ${person.name}`}
        />
      </View>

      <View style={{ marginHorizontal: GUTTER, marginTop: 14, flexDirection: 'row', gap: 8 }}>
        <Stat label="Trips" value={stats.trips} tone="blush" />
        <Stat label="Countries" value={stats.countries} tone="sage" />
        <Stat label="Of the world" value={worldShare(stats.countries)} tone="sky" />
      </View>

      <Card style={{ marginHorizontal: GUTTER, marginTop: 10, flexDirection: 'row' }}>
        <Count label="Followers" n={person.followers.length} onPress={() => setTab('followers')} />
        <View style={{ width: 1, backgroundColor: colors.line }} />
        <Count label="Following" n={person.following.length} onPress={() => setTab('following')} />
      </Card>

      {been.length > 0 && <TravelMapCard been={been} wish={wish} countries={stats.countries} title={[`${person.name}’s travel`, 'map']} open={false} />}

      <View style={{ paddingHorizontal: GUTTER, marginTop: 30 }}>
        <Segmented options={TABS} value={tab} onChange={setTab} label={`${person.name}’s profile`} />
      </View>

      <View style={{ marginTop: 20 }}>
        {tab === 'trips' && <TripGrid trips={trips} name={person.name} />}
        {tab === 'boards' && <Boards boards={boards} name={person.name} />}
        {tab === 'followers' && <People ids={person.followers} empty={`No one follows ${person.name} yet.`} />}
        {tab === 'following' && <People ids={person.following} empty={`${person.name} isn’t following anyone yet.`} />}
      </View>

      <Text variant="tiny" style={{ paddingHorizontal: GUTTER, marginTop: 28 }}>
        Sample profile for now. Real profiles arrive when your friends join.
      </Text>
    </Screen>
  );
}

function TripGrid({ trips, name }: { trips: FriendTrip[]; name: string }) {
  if (!trips.length) return <Empty text={`${name} hasn’t added a trip yet.`} />;
  const width = (Math.min(Dimensions.get('window').width, 480) - GUTTER * 2 - 14) / 2;
  return (
    <View style={{ paddingHorizontal: GUTTER, flexDirection: 'row', flexWrap: 'wrap', gap: 14, rowGap: 20 }}>
      {trips.map((t) => {
        const cover = tripPic(t, 0);
        const place = tripPlace(t);
        return (
          <Pressable
            key={t.id}
            onPress={() => router.push(`/friend-trip/${t.id}`)}
            accessibilityRole="link"
            accessibilityLabel={`${name}'s ${place} trip, ${t.month}, ${t.score.toFixed(1)} out of 10`}
            style={({ pressed }) => ({ width, opacity: pressed ? 0.9 : 1 })}
          >
            <View style={{ width, height: width * 1.15, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.blushSoft }}>
              {cover ? (
                <>
                  <PhotoFill {...cover} />
                  <Shade strength={0.5} />
                </>
              ) : (
                <View style={{ position: 'absolute', inset: 0, justifyContent: 'center', paddingHorizontal: 12 }}>
                  <Text {...fitLines(place)} style={{ fontFamily: fonts.displayItalic, fontSize: fitWordSize(place, width - 24, 28, 16), color: colors.ink }}>
                    {place}
                  </Text>
                </View>
              )}
              <View style={{ position: 'absolute', top: 8, right: 8 }}>
                <ScoreStamp score={t.score} size="sm" />
              </View>
            </View>
            <Text variant="strong" numberOfLines={1} style={{ marginTop: 8 }}>
              {place}
            </Text>
            <Text variant="tiny">{t.month}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function Boards({ boards, name }: { boards: SampleBoard[]; name: string }) {
  if (!boards.length) return <Empty text={`${name} hasn’t made a board yet.`} />;
  return (
    <View style={{ paddingHorizontal: GUTTER, gap: 16 }}>
      {boards.map((b, i) => (
        <Card key={b.name} tone={i === 0 ? 'blush' : 'white'} style={{ overflow: 'hidden' }}>
          <PhotoTile photo={boardCover(b)} shade={false} style={{ height: 130, borderRadius: 0 }} />
          <View style={{ padding: 14, gap: 10 }}>
            <View>
              <Text variant="subheading">{b.name}</Text>
              <Text variant="tiny">
                {b.slugs.length} {b.slugs.length === 1 ? 'place' : 'places'}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {b.slugs.map((s) => {
                const p = getPlace(s);
                if (!p) return null;
                return (
                  <Pressable
                    key={s}
                    onPress={() => router.push(`/place/${s}`)}
                    accessibilityRole="link"
                    accessibilityLabel={`Open ${p.name}`}
                    style={({ pressed }) => ({ borderRadius: radius.pill, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, paddingHorizontal: 12, paddingVertical: 6, opacity: pressed ? 0.8 : 1 })}
                  >
                    <Text variant="small" style={{ color: colors.ink }}>
                      {p.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </Card>
      ))}
    </View>
  );
}

function People({ ids, empty }: { ids: string[]; empty: string }) {
  const people = ids.map((id) => getPerson(id)).filter((p): p is SamplePerson => !!p);
  if (!people.length) return <Empty text={empty} />;
  return (
    <View style={{ paddingHorizontal: GUTTER, gap: 10 }}>
      {people.map((p) => (
        <Pressable
          key={p.id}
          onPress={() => router.push(`/person/${p.id}`)}
          accessibilityRole="link"
          accessibilityLabel={`${p.name}, @${p.handle}. Open their profile`}
          style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: radius.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, opacity: pressed ? 0.85 : 1 })}
        >
          <Avatar face={p.face} name={p.name} size={40} />
          <View style={{ flex: 1 }}>
            <Text variant="strong">{p.name}</Text>
            <Text variant="tiny">
              @{p.handle} · {statsOf(p).trips} trips
            </Text>
          </View>
          <ChevronIcon color={colors.muted} />
        </Pressable>
      ))}
    </View>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <Text variant="bodySoft" style={{ paddingHorizontal: GUTTER }}>
      {text}
    </Text>
  );
}

function Stat({ label, value, tone }: { label: string; value: string | number; tone: Tone }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: radius.md, backgroundColor: toneFill(tone) }}>
      <Text variant="title" style={{ fontSize: 26, lineHeight: 30 }}>
        {value}
      </Text>
      <Text variant="label" style={{ fontSize: 10, marginTop: 2 }}>
        {label}
      </Text>
    </View>
  );
}

function Count({ label, n, onPress }: { label: string; n: number; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${n} ${label.toLowerCase()}. Show them`} style={({ pressed }) => ({ flex: 1, alignItems: 'center', paddingVertical: 12, opacity: pressed ? 0.7 : 1 })}>
      <Text style={{ fontFamily: fonts.display, fontSize: 20, lineHeight: 26, color: colors.ink }}>{n}</Text>
      <Text variant="label" style={{ fontSize: 10 }}>
        {label}
      </Text>
    </Pressable>
  );
}

/** Share of the world's 195 countries: "2.6%", "12%" (as on You). */
function worldShare(countries: number): string {
  const pct = (countries / 195) * 100;
  return `${pct < 10 ? pct.toFixed(1).replace(/\.0$/, '') : Math.round(pct)}%`;
}
