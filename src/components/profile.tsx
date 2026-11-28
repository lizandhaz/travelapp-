import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, View } from 'react-native';

import { appWidth, colors, fonts, GUTTER, radius } from '@/constants/theme';
import { tripPic, tripPlace, type FriendTrip } from '@/lib/friendTrips';
import { TASTE_LABELS } from '@/lib/taste';
import { AccentTitle } from './AccentTitle';
import { TripPostcard } from './cards';
import { ChevronIcon } from './Icons';
import { Text } from './Text';
import { Chip, toneFill, type Tone } from './ui';

/**
 * The pieces every profile shares (owner, Nov 2026: "everyone's profile the same as mine"): You
 * (app/(tabs)/profile.tsx) and a friend's profile (app/person/[who]/index.tsx) are built from these.
 */

/** Picture, name, a line under it, then followers and following (and requests, on yours) at the top. */
export function ProfileTop({
  picture,
  name,
  line,
  right,
  counts,
}: {
  picture: React.ReactNode;
  name: string;
  line: string;
  right?: React.ReactNode;
  counts: { label: string; n: number | undefined; onPress: () => void }[];
}) {
  return (
    <View style={{ paddingHorizontal: GUTTER, paddingTop: 20, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
      {picture}
      <View style={{ flex: 1 }}>
        <Text variant="title" numberOfLines={1} style={{ fontSize: 28, lineHeight: 32 }}>
          {name}
        </Text>
        <Text variant="small" numberOfLines={1}>
          {line}
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: 16, rowGap: 2, marginTop: 6 }}>
          {counts.map((c) => (
            <Pressable key={c.label} onPress={c.onPress} accessibilityRole="link" accessibilityLabel={`${c.n ?? 0} ${c.n === 1 ? c.label.toLowerCase().replace(/s$/, '') : c.label.toLowerCase()}. Show them`} hitSlop={6}>
              <Text variant="small" style={{ color: colors.muted }}>
                <Text style={{ fontFamily: fonts.sansSemiBold, fontSize: 15, color: colors.ink, fontVariant: ['tabular-nums'] }}>{c.n ?? '–'}</Text> {c.n === 1 ? c.label.toLowerCase().replace(/s$/, '') : c.label.toLowerCase()}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
      {right}
    </View>
  );
}

/** Trips, countries and share of the world, as three coloured tiles. */
/** `onCountries` makes Countries and "% of the world" tappable (You: opens the list of countries you've been to). */
export function ProfileStats({ trips, countries, onCountries }: { trips: number; countries: number; onCountries?: () => void }) {
  const hint = 'Shows the countries you’ve been to.';
  return (
    <View style={{ marginHorizontal: GUTTER, marginTop: 14, flexDirection: 'row', gap: 8 }}>
      <Stat label="Trips" value={trips} tone="cream" />
      <Stat label="Countries" value={countries} tone="sage" onPress={onCountries} a11y={`${countries} ${countries === 1 ? 'country' : 'countries'}. ${hint}`} />
      <Stat label="Of the world" value={worldShare(countries)} tone="sky" onPress={onCountries} a11y={`${worldShare(countries)} of the world. ${hint}`} />
    </View>
  );
}

function Stat({ label, value, tone, onPress, a11y }: { label: string; value: string | number; tone: Tone; onPress?: () => void; a11y?: string }) {
  const style = { flex: 1, alignItems: 'center' as const, paddingVertical: 14, borderRadius: radius.md, backgroundColor: toneFill(tone), borderWidth: tone === 'cream' ? 1 : 0, borderColor: colors.line };
  const body = (
    <>
      <Text variant="title" style={{ fontSize: 26, lineHeight: 30 }}>
        {value}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 2 }}>
        <Text variant="label" style={{ fontSize: 10 }}>
          {label}
        </Text>
        {onPress && <ChevronIcon color={colors.muted} size={10} strokeWidth={2.4} />}
      </View>
    </>
  );
  return onPress ? (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={a11y} style={({ pressed }) => [style, { opacity: pressed ? 0.75 : 1 }]}>
      {body}
    </Pressable>
  ) : (
    <View style={style}>{body}</View>
  );
}

/** How much of the world: "2.6%" (one decimal under 10%), "12%". */
export function worldShare(countries: number): string {
  const pct = (countries / 195) * 100;
  return `${pct < 10 ? pct.toFixed(1).replace(/\.0$/, '') : Math.round(pct)}%`;
}

/**
 * "Your taste" / "Tom's taste": outline tags, each opening the places for that taste (owner, Nov 2026), on one
 * shared page (app/taste/[tag].tsx), scored for you. A small › says they open; they darken a little when pressed.
 */
export function TasteTags({ label, tastes }: { label: string; tastes: string[] }) {
  if (!tastes.length) return null;
  return (
    <View style={{ paddingHorizontal: GUTTER, marginTop: 14, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
      <Text variant="label">{label}</Text>
      {tastes.map((t) => {
        const name = TASTE_LABELS[t] ?? t;
        return (
          <Pressable
            key={t}
            onPress={() => router.push({ pathname: '/taste/[tag]', params: { tag: t } })}
            accessibilityRole="link"
            accessibilityLabel={`${name}. See places picked for this taste`}
            hitSlop={4}
            style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 3, borderWidth: 1, borderColor: pressed ? colors.sage : colors.line, backgroundColor: pressed ? colors.sageSoft : colors.card, borderRadius: 999, paddingLeft: 12, paddingRight: 9, paddingVertical: 4 })}
          >
            <Text variant="small" style={{ color: colors.ink }}>
              {name}
            </Text>
            <ChevronIcon color={colors.muted} size={11} strokeWidth={2.2} />
          </Pressable>
        );
      })}
    </View>
  );
}

type Order = 'newest' | 'oldest' | 'top';

/**
 * "Your trips" / "Tom's trips": Newest (default) / Oldest / Top rated, a year filter when there's more
 * than one year, and a sideways row of trip postcards drawn by `render`. `when` gives a trip's sortable month ("2026-08").
 */
export function TripsSection<T>({
  title,
  trips,
  when,
  score,
  render,
  empty,
}: {
  title: [string, string];
  trips: T[];
  when: (t: T) => string;
  score: (t: T) => number;
  render: (t: T) => React.ReactNode;
  empty?: React.ReactNode;
}) {
  const [order, setOrder] = useState<Order>('newest');
  const [year, setYear] = useState<string | null>(null);
  const years = useMemo(() => [...new Set(trips.map((t) => when(t).slice(0, 4)))].sort().reverse(), [trips, when]);
  const shown = useMemo(() => {
    const byDate = (a: T, b: T) => when(a).localeCompare(when(b));
    const sorted = [...trips].sort((a, b) => (order === 'top' ? score(b) - score(a) || byDate(b, a) : order === 'newest' ? byDate(b, a) : byDate(a, b)));
    return year ? sorted.filter((t) => when(t).startsWith(year)) : sorted;
  }, [trips, order, year, when, score]);

  return (
    <View style={{ paddingHorizontal: GUTTER, marginTop: 30, gap: 16 }}>
      <AccentTitle before={title[0]} accent={title[1]} variant="heading" />
      {!trips.length ? (
        empty
      ) : (
        <View style={{ gap: 14 }}>
          <View accessibilityRole="tablist" accessibilityLabel="Order the trips" style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
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
          {/* A sideways row of postcards (owner, Nov 2026), each snapping into place, the next peeking in. Only the cards
              near the screen are drawn (overnight audit), so a long trip history doesn't ask for every photo at once. */}
          <View style={{ marginHorizontal: -GUTTER }}>
            <FlatList
              key={`${order}-${year ?? 'all'}`}
              horizontal
              data={shown}
              renderItem={({ item }) => render(item) as React.ReactElement}
              keyExtractor={(item, i) => (item as { id?: string }).id ?? String(i)}
              ItemSeparatorComponent={RowGap}
              initialNumToRender={3}
              maxToRenderPerBatch={3}
              windowSize={5}
              showsHorizontalScrollIndicator={false}
              decelerationRate="fast"
              snapToInterval={profilePostcardWidth() + 14}
              contentContainerStyle={{ paddingHorizontal: GUTTER, alignItems: 'flex-start' }}
            />
          </View>
        </View>
      )}
    </View>
  );
}

/** The space between postcards in the row. */
function RowGap() {
  return <View style={{ width: 14 }} />;
}

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

/** How wide a trip postcard is on a profile: most of the screen, so the next one peeks in from the side. */
export const profilePostcardWidth = () => Math.round(Math.min(appWidth() * 0.8, 340));

/** "Their words" in curly quotes, however they were written. */
export const quoted = (s: string | null | undefined) => (s && s.trim() ? `“${s.trim().replace(/^[“"]+|[”"]+$/g, '')}”` : null);

/** A friend's trip on their profile, as the same postcard as the Friends feed (owner, Nov 2026). Tap to open it. */
export function FriendTripPostcard({ trip, width }: { trip: FriendTrip; width: number }) {
  const pic = tripPic(trip, 0);
  const place = tripPlace(trip);
  return (
    <TripPostcard
      item={{
        id: trip.id,
        who: trip.who,
        face: trip.face,
        place,
        region: trip.region,
        month: trip.month.toUpperCase(),
        photo: pic?.photo ?? null,
        photoUri: pic?.uri ?? null,
        quote: quoted(trip.quote),
        score: trip.score,
        stayType: trip.stay?.type ?? '',
        stayName: trip.stay?.name ?? '',
        stayScore: trip.stay?.score ?? null,
        slug: trip.slug,
      }}
      width={width}
      who={false}
      onPress={() => router.push(`/friend-trip/${trip.id}`)}
      accessibilityLabel={`${trip.who}'s ${place} trip, ${trip.month}, ${trip.score.toFixed(1)} out of 10. Open the trip`}
    />
  );
}
