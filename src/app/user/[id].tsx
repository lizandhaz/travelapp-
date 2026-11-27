import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { AccentTitle } from '@/components/AccentTitle';
import { Avatar } from '@/components/Avatar';
import { Row } from '@/components/cards';
import { ListCover } from '@/components/lists';
import { FriendTripPostcard, ProfileStats, ProfileTop, TripsSection, profilePostcardWidth } from '@/components/profile';
import { SafetySheet } from '@/components/SafetySheet';
import { Text } from '@/components/Text';
import { TravelMapCard } from '@/components/TravelMap';
import { BackButton, Button, Card, Screen, SectionHeader } from '@/components/ui';
import { colors, GUTTER, radius } from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import { boardMeta, fetchBoardsOf, type Board } from '@/lib/boards';
import { follow, unfollow } from '@/lib/friends';
import { fetchTripsOfPerson, type RealFriendTrip } from '@/lib/friendsFeed';
import { isoMonth } from '@/lib/samplePeople';
import { countryOf } from '@/lib/knownPlaces';
import { fetchProfileCard, type ProfileCard } from '@/lib/profiles';
import type { MapPlace } from '@/lib/travelPlaces';
import { useTripPhoto } from '@/lib/useTripPhoto';

/**
 * A real person's profile (owner, Nov 2026: public or private, their choice). Laid out like You. What shows depends
 * on what they share with you: followers see what they share; on a public profile, anyone sees the parts set to
 * "Everyone". The database decides (profile_card, and the rules on trips and boards); this page just shows it.
 */
export default function UserProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const me = session?.user.id ?? '';
  const [card, setCard] = useState<ProfileCard | null | undefined>(undefined);
  const [trips, setTrips] = useState<RealFriendTrip[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [busy, setBusy] = useState(false);
  const [safety, setSafety] = useState(false);
  const face = useTripPhoto(card?.avatarPath ?? null);

  const apply = (r: Loaded) => {
    setCard(r.card);
    setTrips(r.trips);
    setBoards(r.boards);
  };
  const load = () => loadProfile(id).then(apply);
  useEffect(() => {
    let live = true;
    loadProfile(id)
      .then((r) => live && apply(r))
      .catch(() => live && setCard(null));
    return () => {
      live = false;
    };
  }, [id]);

  if (card === undefined)
    return (
      <Screen>
        <ActivityIndicator color={colors.accent} style={{ marginTop: 120 }} />
      </Screen>
    );
  if (card === null)
    return (
      <Screen>
        <View style={{ paddingHorizontal: GUTTER, paddingTop: 14, gap: 20 }}>
          <BackButton />
          <Text variant="body">This profile isn’t available.</Text>
        </View>
      </Screen>
    );

  const first = card.name.split(' ')[0];
  const isMe = card.status === 'me';
  const been: MapPlace[] = trips.map((t) => ({ name: t.place, country: countryOf({ name: t.place, country: t.country }), href: `/friend-trip/${t.id}` }));
  const cardWidth = profilePostcardWidth();

  async function toggleFollow() {
    if (!card) return;
    setBusy(true);
    try {
      if (card.status === 'none') await follow(card.id);
      else await unfollow(card.id, me);
      await load();
    } catch {
      // Leave as it was.
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <View style={{ paddingHorizontal: GUTTER, paddingTop: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <BackButton />
        {!isMe && (
          <Pressable onPress={() => setSafety(true)} accessibilityRole="button" accessibilityLabel={`Report or block ${card.name}`} hitSlop={10}>
            <Text style={{ fontSize: 20, color: colors.muted, letterSpacing: 1 }}>•••</Text>
          </Pressable>
        )}
      </View>

      <ProfileTop
        picture={<Avatar name={card.name} uri={face} size={76} />}
        name={card.name}
        line={`@${card.handle} · ${card.isPublic ? 'Public profile' : 'Private profile'}`}
        counts={[
          { label: 'Followers', n: card.followers, onPress: () => {} },
          { label: 'Following', n: card.following, onPress: () => {} },
        ]}
      />

      {!isMe && (
        <View style={{ paddingHorizontal: GUTTER, marginTop: 16, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Button
            title={card.status === 'following' ? 'Following' : card.status === 'requested' ? 'Requested' : card.followsYou ? 'Follow back' : 'Follow'}
            kind={card.status === 'none' ? 'accent' : 'outline'}
            size="sm"
            style={{ flex: 1 }}
            disabled={busy}
            onPress={toggleFollow}
            accessibilityLabel={card.status === 'none' ? `Follow ${card.name}` : `${card.status === 'following' ? 'Following' : 'Requested'} ${card.name}. Tap to undo`}
          />
          {card.followsYou && (
            <View style={{ backgroundColor: colors.sageSoft, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 8 }}>
              <Text variant="small" style={{ color: colors.olive }}>
                Follows you
              </Text>
            </View>
          )}
        </View>
      )}

      {card.seeStats && card.trips != null && <ProfileStats trips={card.trips} countries={card.countries ?? 0} />}
      {card.seeStats && been.length > 0 && <TravelMapCard been={been} wish={[]} countries={card.countries ?? 0} title={[`${first}’s travel`, 'map']} open={false} />}

      {!card.seeTrips && !card.seeBoards && !card.seeStats && (
        <Card tone="cream" style={{ marginHorizontal: GUTTER, marginTop: 20, padding: 18, gap: 6 }}>
          <Text variant="subheading">This profile is private</Text>
          <Text variant="small">Follow {first} to see their trips once they accept.</Text>
        </Card>
      )}

      {!card.seeTrips && (card.seeBoards || card.seeStats) && (
        <Text variant="small" style={{ paddingHorizontal: GUTTER, marginTop: 18 }}>
          {first} shares trips with followers only.{card.status === 'none' ? ` Follow to see them.` : ''}
        </Text>
      )}

      {card.seeBoards && boards.length > 0 && (
        <View style={{ marginTop: 30 }}>
          <SectionHeader>
            <AccentTitle before={`${first}’s`} accent="boards" variant="heading" />
          </SectionHeader>
          <Row gap={14}>
            {boards.map((b) => (
              <View key={b.id} style={{ width: 140 }} accessible accessibilityLabel={`${b.name}, ${boardMeta(b)}`}>
                <ListCover board={b} style={{ width: 140, height: 140, borderRadius: radius.lg }} />
                <Text variant="strong" numberOfLines={1} style={{ marginTop: 8 }}>
                  {b.name}
                </Text>
                <Text variant="tiny">{boardMeta(b)}</Text>
              </View>
            ))}
          </Row>
        </View>
      )}

      {card.seeTrips && (
        <TripsSection
          title={[`${first}’s`, 'trips']}
          trips={trips}
          when={(t) => isoMonth(t.month)}
          score={(t) => t.score}
          render={(t) => <FriendTripPostcard key={t.id} trip={t} width={cardWidth} />}
          empty={<Text variant="bodySoft">{first} hasn’t shared a trip yet.</Text>}
        />
      )}

      {!isMe && <SafetySheet target={{ userId: card.id, name: card.name }} visible={safety} onClose={() => setSafety(false)} onBlocked={() => router.back()} />}
    </Screen>
  );
}

type Loaded = { card: ProfileCard | null; trips: RealFriendTrip[]; boards: Board[] };

/** Their card, then only the parts they share with you. */
async function loadProfile(id: string): Promise<Loaded> {
  const card = await fetchProfileCard(id);
  if (!card) return { card: null, trips: [], boards: [] };
  const person = { userId: card.id, name: card.name, handle: card.handle, avatarPath: card.avatarPath };
  const [trips, boards] = await Promise.all([card.seeTrips ? fetchTripsOfPerson(person) : Promise.resolve([]), card.seeBoards ? fetchBoardsOf(card.id) : Promise.resolve([])]);
  return { card, trips, boards };
}
