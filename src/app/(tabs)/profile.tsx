import * as ImagePicker from 'expo-image-picker';
import { Link, router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Pressable, ScrollView, View } from 'react-native';

import { AccentTitle } from '@/components/AccentTitle';
import { Avatar } from '@/components/Avatar';
import { PlusIcon, SlidersIcon } from '@/components/Icons';
import { Text } from '@/components/Text';
import { TravelMapCard } from '@/components/TravelMap';
import { TripCard } from '@/components/trip/TripCard';
import { Button, Card, Chip, IconCircle, Screen, TONES, toneFill, type Tone } from '@/components/ui';
import { colors, GUTTER, radius } from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import { TASTE_LABELS, useTaste } from '@/lib/taste';
import { beenPlaces, wishPlaces } from '@/lib/travelPlaces';
import { fetchBoards, type BoardItem } from '@/lib/boards';
import { countriesIn, fetchMyTrips, setProfilePicture, type Trip } from '@/lib/trips';
import { useTripPhoto } from '@/lib/useTripPhoto';

export default function You() {
  const { profile, session } = useAuth();
  const taste = useTaste();
  const [trips, setTrips] = useState<Trip[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [wishItems, setWishItems] = useState<BoardItem[]>([]);

  const load = useCallback((isActive: () => boolean = () => true) => {
    // The map's "Want to go" places. If lists can't load, the map just shows where you've been.
    fetchBoards()
      .then((b) => isActive() && setWishItems(b.find((x) => x.kind === 'wish')?.items ?? []))
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
  const wish = useMemo(() => wishPlaces(wishItems), [wishItems]);

  // Your trips: newest first by default, or oldest first / top rated, and a year filter.
  const [order, setOrder] = useState<'newest' | 'oldest' | 'top'>('newest');
  const [year, setYear] = useState<string | null>(null);
  const years = useMemo(() => [...new Set(list.map((t) => t.month.slice(0, 4)))].sort().reverse(), [list]);
  const shown = useMemo(() => {
    const byDate = (a: Trip, b: Trip) => a.month.localeCompare(b.month) || a.createdAt.localeCompare(b.createdAt);
    const sorted = [...list].sort((a, b) => (order === 'top' ? b.score - a.score || byDate(b, a) : order === 'newest' ? byDate(b, a) : byDate(a, b)));
    return year ? sorted.filter((t) => t.month.startsWith(year)) : sorted;
  }, [list, order, year]);
  const cardWidth = (Math.min(Dimensions.get('window').width, 480) - GUTTER * 2 - 14) / 2;

  return (
    <Screen tabBar>
      <View style={{ paddingHorizontal: GUTTER, paddingTop: 20, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <ProfilePicture name={name} />
        <View style={{ flex: 1 }}>
          <Text variant="title" style={{ fontSize: 28, lineHeight: 32 }}>
            {name}
          </Text>
          <Text variant="small">
            @{profile?.handle ?? '…'} · {profile?.isPublic ? 'Public profile' : 'Private account'}
          </Text>
        </View>
        <IconCircle label="Settings" onPress={() => router.push('/settings')}>
          <SlidersIcon color={colors.ink} />
        </IconCircle>
      </View>

      <View style={{ paddingHorizontal: GUTTER, marginTop: 20, flexDirection: 'row', gap: 10 }}>
        <Button title="Find friends" kind="outline" size="sm" style={{ flex: 1 }} onPress={() => router.push('/people')} />
        <Link href="/add" asChild>
          <Button title="Add a trip" kind="outline" size="sm" style={{ flex: 1 }} />
        </Link>
      </View>

      <View style={{ marginHorizontal: GUTTER, marginTop: 14, flexDirection: 'row', gap: 8 }}>
        <Stat label="Trips" value={list.length} tone="blush" />
        <Stat label="Countries" value={countriesIn(list)} tone="sage" />
      </View>

      {taste.tastes.length > 0 && (
        <View style={{ paddingHorizontal: GUTTER, marginTop: 14, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
          <Text variant="label">Your taste</Text>
          {taste.tastes.map((t, i) => (
            <View key={t} style={{ backgroundColor: toneFill(TONES[i % TONES.length]), borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4 }}>
              <Text variant="small" style={{ color: colors.ink }}>
                {TASTE_LABELS[t] ?? t}
              </Text>
            </View>
          ))}
        </View>
      )}

      {trips && <TravelMapCard been={been} wish={wish} countries={countriesIn(list)} />}

      <View style={{ paddingHorizontal: GUTTER, marginTop: 30, gap: 16 }}>
        <AccentTitle before="Your" accent="trips" variant="heading" />
        {error ? (
          <Card style={{ padding: 16, gap: 8 }}>
            <Text variant="body">{error}</Text>
            <Pressable accessibilityRole="button" onPress={() => load()} hitSlop={8}>
              <Text variant="link">Try again</Text>
            </Pressable>
          </Card>
        ) : !trips ? (
          <ActivityIndicator color={colors.accent} />
        ) : trips.length === 0 ? (
          <Card style={{ padding: 20, gap: 12, alignItems: 'flex-start' }}>
            <Text variant="body">No trips yet. Add the last place you went and how it was.</Text>
            <Link href="/add" asChild>
              <Button title="Add your first trip" />
            </Link>
          </Card>
        ) : (
          <View style={{ gap: 14 }}>
            <View accessibilityRole="tablist" accessibilityLabel="Order your trips" style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
              {(
                [
                  ['newest', 'Newest'],
                  ['oldest', 'Oldest'],
                  ['top', 'Top rated'],
                ] as const
              ).map(([id, label]) => (
                <Chip key={id} label={label} selected={order === id} onPress={() => setOrder(id)} accessibilityLabel={`Order: ${label}`} />
              ))}
            </View>
            {years.length > 1 && (
              <View style={{ marginHorizontal: -GUTTER }}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: GUTTER }}>
                  <YearChip label="All years" selected={year == null} onPress={() => setYear(null)} />
                  {years.map((y) => (
                    <YearChip key={y} label={y} selected={year === y} onPress={() => setYear(year === y ? null : y)} />
                  ))}
                </ScrollView>
              </View>
            )}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14, rowGap: 18 }}>
              {shown.map((t) => (
                <TripCard key={t.id} trip={t} width={cardWidth} />
              ))}
            </View>
          </View>
        )}
      </View>
    </Screen>
  );
}

/** A small year filter pill ("2026"). */
function YearChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label === 'All years' ? 'Show trips from all years' : `Show trips from ${label}`}
      style={{ borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5, backgroundColor: selected ? colors.sage + '73' : 'transparent', borderWidth: 1, borderColor: selected ? 'transparent' : colors.line }}
    >
      <Text variant="small" style={{ color: colors.ink, fontVariant: ['tabular-nums'] }}>
        {label}
      </Text>
    </Pressable>
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
