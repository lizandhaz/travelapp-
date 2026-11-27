import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { colors, fonts, GUTTER, radius } from '@/constants/theme';
import { fitLines, fitWordSize } from '@/lib/fit';
import { tripPic, tripPlace, type FriendTrip } from '@/lib/friendTrips';
import { TASTE_LABELS } from '@/lib/taste';
import { AccentTitle } from './AccentTitle';
import { ChevronIcon } from './Icons';
import { MonthPill } from './MonthPill';
import { PhotoStamp } from './Photo';
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

/** "Your taste" / "Tom's taste": plain outline tags. */
export function TasteTags({ label, tastes }: { label: string; tastes: string[] }) {
  if (!tastes.length) return null;
  return (
    <View style={{ paddingHorizontal: GUTTER, marginTop: 14, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
      <Text variant="label">{label}</Text>
      {tastes.map((t) => (
        <View key={t} style={{ borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4 }}>
          <Text variant="small" style={{ color: colors.ink }}>
            {TASTE_LABELS[t] ?? t}
          </Text>
        </View>
      ))}
    </View>
  );
}

type Order = 'newest' | 'oldest' | 'top';

/**
 * "Your trips" / "Tom's trips": Newest (default) / Oldest / Top rated, a year filter when there's more
 * than one year, and a two-column grid drawn by `render`. `when` gives a trip's sortable month ("2026-08").
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
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14, rowGap: 18 }}>{shown.map(render)}</View>
        </View>
      )}
    </View>
  );
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

/** A friend's trip as a photo stamp, like your own trips (components/trip/TripCard). Tap to open it. */
export function FriendTripStamp({ trip, width }: { trip: FriendTrip; width: number }) {
  const place = tripPlace(trip);
  const pic = tripPic(trip, 0);
  const nameSize = fitWordSize(place, width - 2 * Math.max(6, Math.round(width * 0.025)) - 32, 22, 15);
  return (
    <Pressable
      onPress={() => router.push(`/friend-trip/${trip.id}`)}
      accessibilityRole="link"
      accessibilityLabel={`${trip.who}'s ${place} trip, ${trip.month}, ${trip.score.toFixed(1)} out of 10`}
      style={{ width }}
    >
      <PhotoStamp {...(pic ?? {})} width={width} height={width * 1.2}>
        <View style={{ position: 'absolute', top: 18, left: 16 }}>
          <MonthPill month={trip.month.toUpperCase()} onPhoto />
        </View>
        <View style={{ position: 'absolute', left: 16, right: 16, bottom: 14 }}>
          <Text {...fitLines(place)} style={{ fontFamily: fonts.display, fontSize: nameSize, lineHeight: Math.round(nameSize * 1.18), color: colors.onDark }}>
            {place}
          </Text>
          <Text numberOfLines={1} style={{ marginTop: 2, fontFamily: fonts.display, fontSize: 17, color: colors.onDark, fontVariant: ['tabular-nums'] }}>
            {trip.score.toFixed(1)}
          </Text>
        </View>
      </PhotoStamp>
    </Pressable>
  );
}
