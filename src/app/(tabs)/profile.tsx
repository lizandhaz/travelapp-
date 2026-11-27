import * as ImagePicker from 'expo-image-picker';
import { Link, router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, View } from 'react-native';

import { AccentTitle } from '@/components/AccentTitle';
import { CountriesSheet } from '@/components/CountriesSheet';
import { Avatar } from '@/components/Avatar';
import { PlusIcon, SlidersIcon } from '@/components/Icons';
import { Text } from '@/components/Text';
import { ProfileStats, ProfileTop, TasteTags, TripsSection, profilePostcardWidth } from '@/components/profile';
import { TravelMapCard } from '@/components/TravelMap';
import { TripCard } from '@/components/trip/TripCard';
import { Button, Card, IconCircle, Screen, SectionHeader } from '@/components/ui';
import { Row, SavedTripCard } from '@/components/cards';
import { ListCover } from '@/components/lists';
import { useSavedTrips } from '@/lib/reactions';
import { fetchFollows, type Follows } from '@/lib/friends';
import { colors, GUTTER, radius } from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import { useTaste } from '@/lib/taste';
import { beenPlaces, wishPlaces } from '@/lib/travelPlaces';
import { boardMeta, fetchBoards, type Board } from '@/lib/boards';
import { fetchMyTrips, setProfilePicture, visitedCountries, type Trip } from '@/lib/trips';
import { useTripPhoto } from '@/lib/useTripPhoto';

export default function You() {
  const { profile, session } = useAuth();
  const taste = useTaste();
  const [trips, setTrips] = useState<Trip[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [boards, setBoards] = useState<Board[]>([]);
  const [follows, setFollows] = useState<Follows | null>(null);
  const savedTrips = useSavedTrips();

  const load = useCallback((isActive: () => boolean = () => true) => {
    // The map's "Want to go" places. If lists can't load, the map just shows where you've been.
    fetchBoards()
      .then((b) => isActive() && setBoards(b))
      .catch(() => {});
    fetchFollows()
      .then((f) => isActive() && setFollows(f))
      .catch(() => {});
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
  const list = useMemo(() => trips ?? [], [trips]);
  const been = useMemo(() => beenPlaces(list), [list]);
  const wish = useMemo(() => wishPlaces(boards.find((x) => x.kind === 'wish')?.items ?? []), [boards]);
  // One list for the tiles, the map's count and the countries sheet, so the numbers always match.
  const countries = useMemo(() => visitedCountries(list), [list]);
  const [showCountries, setShowCountries] = useState(false);

  const cardWidth = profilePostcardWidth();

  return (
    <Screen tabBar>
      <ProfileTop
        picture={<ProfilePicture name={name} />}
        name={name}
        line={`@${profile?.handle ?? '…'} · ${profile?.isPublic ? 'Public profile' : 'Private account'}`}
        counts={[
          { label: 'Followers', n: follows?.followers.length, onPress: () => router.push({ pathname: '/people', params: { tab: 'followers' } }) },
          { label: 'Following', n: follows?.following.length, onPress: () => router.push({ pathname: '/people', params: { tab: 'following' } }) },
        ]}
        right={
          <IconCircle label="Settings" onPress={() => router.push('/settings')}>
            <SlidersIcon color={colors.ink} />
          </IconCircle>
        }
      />

      <View style={{ paddingHorizontal: GUTTER, marginTop: 20, flexDirection: 'row', gap: 10 }}>
        <Button title="Find friends" kind="outline" size="sm" style={{ flex: 1 }} onPress={() => router.push('/people')} />
        <Link href="/add" asChild>
          <Button title="Add a trip" kind="outline" size="sm" style={{ flex: 1 }} />
        </Link>
      </View>

      <ProfileStats trips={list.length} countries={countries.length} onCountries={() => setShowCountries(true)} />
      <CountriesSheet visible={showCountries} onClose={() => setShowCountries(false)} countries={countries} />
      <TasteTags label="Your taste" tastes={taste.tastes} />

      {trips && <TravelMapCard been={been} wish={wish} countries={countries.length} />}

      {/* Your boards (owner, Nov 2026; was "Your collections"): your boards and friends' trips you've saved; each opens. */}
      {(boards.length > 0 || savedTrips.length > 0) && (
        <View style={{ marginTop: 30 }}>
          <SectionHeader action="See all" onAction={() => router.navigate('/saved')}>
            <AccentTitle before="Your" accent="boards" variant="heading" />
          </SectionHeader>
          <Row gap={14}>
            {[...boards.filter((b) => b.kind === 'wish'), ...boards.filter((b) => b.kind !== 'wish')].map((b) => (
              <Pressable key={b.id} onPress={() => router.push(`/list/${b.id}`)} accessibilityRole="link" accessibilityLabel={`${b.name}, ${boardMeta(b)}`} style={{ width: 140 }}>
                <ListCover board={b} style={{ width: 140, borderRadius: radius.lg }} />
                <Text variant="strong" numberOfLines={1} style={{ marginTop: 8 }}>
                  {b.name}
                </Text>
                <Text variant="tiny">{boardMeta(b)}</Text>
              </Pressable>
            ))}
            {savedTrips.map((id) => (
              <SavedTripCard key={id} id={id} width={140} />
            ))}
          </Row>
        </View>
      )}

      {error ? (
        <Card style={{ marginHorizontal: GUTTER, marginTop: 30, padding: 16, gap: 8 }}>
          <Text variant="body">{error}</Text>
          <Pressable accessibilityRole="button" onPress={() => load()} hitSlop={8}>
            <Text variant="link">Try again</Text>
          </Pressable>
        </Card>
      ) : !trips ? (
        <ActivityIndicator color={colors.accent} style={{ marginTop: 30 }} />
      ) : (
        <TripsSection
          title={['Your', 'trips']}
          trips={list}
          when={tripWhen}
          score={tripScore}
          render={(t) => <TripCard key={t.id} trip={t} width={cardWidth} />}
          empty={
            <Card style={{ padding: 20, gap: 12, alignItems: 'flex-start' }}>
              <Text variant="body">No trips yet. Add the last place you went and how it was.</Text>
              <Link href="/add" asChild>
                <Button title="Add your first trip" />
              </Link>
            </Card>
          }
        />
      )}
    </Screen>
  );
}



/** Your picture (or initials). Tap it to choose a photo. */
function ProfilePicture({ name }: { name: string }) {
  const { profile, refreshProfile } = useAuth();
  const url = useTripPhoto(profile?.avatarPath);
  const [busy, setBusy] = useState(false);

  async function choose() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      exif: false, // never read location data from photos
      quality: 0.8,
    });
    const asset = !result.canceled ? result.assets[0] : null;
    if (!asset) return;
    setBusy(true);
    try {
      await setProfilePicture(asset.uri, asset.width, profile?.avatarPath);
      await refreshProfile();
    } catch (e) {
      Alert.alert('Couldn’t save your picture', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Pressable
      onPress={choose}
      disabled={busy}
      accessibilityRole="button"
      accessibilityLabel={profile?.avatarPath ? 'Change your profile picture' : 'Add a profile picture'}
    >
      <View style={{ opacity: busy ? 0.5 : 1 }}>
        <Avatar name={name} uri={url} size={76} />
      </View>
      <View
        style={{
          position: 'absolute',
          right: -2,
          bottom: -2,
          width: 26,
          height: 26,
          borderRadius: 13,
          backgroundColor: colors.ink,
          borderWidth: 2,
          borderColor: colors.bg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {busy ? <ActivityIndicator size="small" color={colors.stamp} /> : <PlusIcon color={colors.stamp} size={14} strokeWidth={2.6} />}
      </View>
    </Pressable>
  );
}



// Stable helpers for TripsSection (outside the component, so sorting isn't redone every render).
const tripWhen = (t: Trip) => `${t.month}|${t.createdAt}`;
const tripScore = (t: Trip) => t.score;
