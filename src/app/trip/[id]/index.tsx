import { Link, router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Image } from 'expo-image';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChevronIcon, ForkIcon, PencilIcon, ShareIcon } from '@/components/Icons';
import { placeSlugForItem } from '@/components/lists';
import { MonthPill } from '@/components/MonthPill';
import { TripLikesAndComments } from '@/components/TripActions';
import { PhotoFill, PhotoTile, Shade } from '@/components/Photo';
import { ScoreStamp } from '@/components/ScoreStamp';
import { Text } from '@/components/Text';
import { BackButton, Button, Card, ErrorNotice, Notice, Screen } from '@/components/ui';
import { colors, fonts, GUTTER, radius, appWidth } from '@/constants/theme';
import { dayOf, MONTH_NAMES_SHORT, monthIndexOf, monthYear, yearOf } from '@/lib/months';
import { fitLines, fitWordSize } from '@/lib/fit';
import { countryOf } from '@/lib/knownPlaces';
import { getPlace, photoForPlaceName } from '@/lib/sample';
import { scoreWord } from '@/lib/score';
import { shareText, tripShareText } from '@/lib/share';
import { companionsLabel, deleteTrip, fetchTrip, type Trip } from '@/lib/trips';
import { TripPeople } from '@/components/TripPeople';
import { useTripPhoto } from '@/lib/useTripPhoto';

/** One of your trips, with Edit and Delete. */
export default function TripScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [trip, setTrip] = useState<Trip | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<{ message: string } | null>(null);
  const [shareNote, setShareNote] = useState<string | null>(null);
  const cover = trip?.photoPaths[0] ?? null;
  const photoUrl = useTripPhoto(cover);

  // Reload whenever the screen comes back into view (e.g. after editing).
  useFocusEffect(
    useCallback(() => {
      let active = true;
      fetchTrip(id)
        .then((t) => active && setTrip(t))
        .catch((e: Error) => active && setError(e.message));
      return () => {
        active = false;
      };
    }, [id]),
  );

  async function share() {
    if (!trip) return;
    const done = await shareText(`My ${trip.stops[0]?.name} trip`, tripShareText(trip));
    setShareNote(done === 'copied' ? 'Copied. Paste it into a message.' : done ? null : 'Sharing isn’t available on this device.');
  }

  async function remove() {
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteTrip(id, trip?.photoPaths ?? []);
      if (router.canGoBack()) router.back();
      else router.replace('/profile');
    } catch (e) {
      setDeleteError({ message: e instanceof Error ? e.message : 'Couldn’t delete. Please try again.' });
      setDeleting(false);
    }
  }

  if (!trip) {
    return (
      <Screen>
        <View style={{ padding: GUTTER, gap: 16 }}>
          <BackButton />
          {error ? (
            <Text variant="body">{error}</Text>
          ) : trip === null ? (
            <Text variant="body">That trip couldn’t be found. It may have been deleted.</Text>
          ) : (
            <ActivityIndicator color={colors.accent} />
          )}
        </View>
      </Screen>
    );
  }

  const [main, ...more] = trip.stops;
  const nights = trip.stops.reduce((n, s) => n + (s.nights ?? 0), 0);
  // The place's own page (where friends stayed and ate, things to do), when there is one.
  const guide = placeSlugForItem({ slug: null, name: main.name });
  const screenW = appWidth();
  const h = screenW * 0.95;
  // Big, but each word on one line and clear of the score stamp (lib/fit.ts).
  const titleSize = fitWordSize(main.name, screenW - GUTTER * 2 - 100, 46, 28);
  const summary = [
    more.length ? `${trip.stops.length} places` : null,
    trip.stay ? '1 stay' : null,
    trip.restaurants.length ? `${trip.restaurants.length} ${trip.restaurants.length === 1 ? 'restaurant' : 'restaurants'}` : null,
    trip.tip ? '1 tip' : null,
    trip.wouldReturn === true ? 'Would go back' : trip.wouldReturn === false ? 'Wouldn’t go back' : null,
  ].filter(Boolean);

  return (
    <Screen noTopInset>
      {/* The back button and the title stack, so a long title grows the header instead of running into the button. */}
      <View style={{ minHeight: h, paddingTop: insets.top + 10, paddingBottom: 46, justifyContent: 'space-between' }}>
        <PhotoFill uri={photoUrl} photo={cover ? null : photoForPlaceName(main.name, trip.id)} label={main.name} />
        <Shade strength={0.55} />
        <View style={{ paddingHorizontal: GUTTER, alignItems: 'flex-start' }}>
          <BackButton onPhoto />
        </View>
        <View style={{ paddingHorizontal: GUTTER, marginTop: 24, flexDirection: 'row', alignItems: 'flex-end', gap: 12 }}>
          <View style={{ flex: 1, gap: 8 }}>
            <MonthPill month={monthYear(trip.month).toUpperCase()} onPhoto />
            <Text {...fitLines(main.name)} style={{ fontFamily: fonts.displayBold, fontSize: titleSize, lineHeight: Math.round(titleSize * 1.05), color: colors.onDark }}>
              {main.name}
            </Text>
            {!!countryOf(main) && (
              <Text variant="body" style={{ color: colors.onDark }}>
                {countryOf(main)}
              </Text>
            )}
          </View>
          <ScoreStamp score={trip.score} size="lg" label="Your trip" />
        </View>
      </View>

      <View style={{ paddingHorizontal: GUTTER, marginTop: -26, gap: 26 }}>
        <Card style={{ flexDirection: 'row' }}>
          <Info label="With" big={companionsLabel(trip.companions) ?? '–'} small={trip.companions ? (trip.companions === 'solo' ? 'just you' : trip.companions === 'work' ? 'a work trip' : 'together') : 'not added'} />
          <Info label="How long" big={nights ? String(nights) : '–'} small={nights ? (nights === 1 ? 'night' : 'nights') : 'not added'} border />
          <Info label="When" {...whenInfo(trip)} border />
        </Card>
        <TripPeople tripId={trip.id} />

        {trip.photoPaths.length > 1 && (
          <View style={{ marginHorizontal: -GUTTER }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingHorizontal: GUTTER }}>
              {trip.photoPaths.map((path, i) => (
                <TripPhoto key={path} path={path} index={i} />
              ))}
            </ScrollView>
          </View>
        )}

        <View style={{ gap: 6 }}>
          {trip.note ? (
            <Text variant="title" style={{ fontSize: 26, lineHeight: 33 }}>
              “{trip.note}”
            </Text>
          ) : (
            <Text variant="title" style={{ fontSize: 30, lineHeight: 36 }}>
              {scoreWord(trip.score)}.
            </Text>
          )}
          <Text variant="small">
            {[trip.note ? scoreWord(trip.score) : null, ...summary, trip.visibility === 'private' ? 'Just me' : 'Followers'].filter(Boolean).join(' · ')}
          </Text>
          <Text variant="tiny">Added {addedOn(trip.createdAt)}</Text>
        </View>

        {more.length > 0 && (
          <Section title="Also on this trip">
            <Card>
              {more.map((s, i) => (
                <View
                  key={`${s.name}-${i}`}
                  style={{ flexDirection: 'row', alignItems: 'center', padding: 14, borderTopWidth: i ? 1 : 0, borderTopColor: colors.line }}
                >
                  <View style={{ flex: 1 }}>
                    <Text variant="strong">{s.name}</Text>
                    {!!countryOf(s) && <Text variant="tiny">{countryOf(s)}</Text>}
                  </View>
                  {s.nights ? <Text variant="small">{s.nights === 1 ? '1 night' : `${s.nights} nights`}</Text> : null}
                </View>
              ))}
            </Card>
          </Section>
        )}

        {trip.stay && (
          <Section title="Where you stayed">
            <Card style={{ padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <View style={{ flex: 1, gap: 4 }}>
                <View style={{ alignSelf: 'flex-start', backgroundColor: 'rgba(167,182,154,0.35)', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 }}>
                  <Text variant="label" style={{ fontSize: 9, color: colors.olive }}>
                    {trip.stay.type}
                  </Text>
                </View>
                <Text variant="subheading">{trip.stay.name}</Text>
                {trip.stay.wouldReturn != null && <Text variant="tiny">{trip.stay.wouldReturn ? 'Would stay again' : 'Wouldn’t stay again'}</Text>}
              </View>
              {trip.stay.score != null && <ScoreStamp score={trip.stay.score} tone="olive" label="Stay" />}
            </Card>
          </Section>
        )}

        {trip.restaurants.length > 0 && (
          <Section title={trip.restaurants.length === 1 ? 'Best restaurant' : 'Best restaurants'}>
            <Card style={{ paddingHorizontal: 16 }}>
              {trip.restaurants.map((r, i) => (
                <View key={`${i}-${r}`} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderTopWidth: i ? 1 : 0, borderTopColor: colors.line }}>
                  <ForkIcon color={colors.accentDeep} size={18} />
                  <Text variant="body" style={{ flex: 1 }}>
                    {r}
                  </Text>
                </View>
              ))}
            </Card>
          </Section>
        )}

        <TripLikesAndComments id={trip.id} />

        {!!trip.tip && (
          <Section title="Top tip">
            <Text variant="quote">“{trip.tip}”</Text>
          </Section>
        )}

        {/* The place's own page, as a card with its photo. */}
        {!!guide && (
          <Pressable
            onPress={() => router.push(`/place/${guide}`)}
            accessibilityRole="link"
            accessibilityLabel={`More about ${main.name}: where friends stayed, ate and what to do`}
            style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 10, paddingRight: 16, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, opacity: pressed ? 0.88 : 1 })}
          >
            <PhotoTile photo={getPlace(guide)?.photo} shade={false} style={{ width: 64, height: 64, borderRadius: radius.md }} />
            <View style={{ flex: 1 }}>
              <Text variant="subheading">More about {main.name}</Text>
              <Text variant="small">Where friends stayed, ate and what to do</Text>
            </View>
            <ChevronIcon color={colors.muted} />
          </Pressable>
        )}

        <View style={{ gap: 12, marginTop: 4 }}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Button
              title="Share"
              kind="accent"
              icon={<ShareIcon color={colors.onDark} size={18} />}
              style={{ flex: 1 }}
              onPress={share}
              accessibilityLabel="Share with a friend"
              accessibilityHint="Opens your phone’s share sheet with your score, stay, restaurants and tip"
            />
            <Link href={`/trip/${trip.id}/edit`} asChild>
              <Button title="Edit" kind="outline" icon={<PencilIcon color={colors.ink} size={17} />} style={{ flex: 1 }} accessibilityLabel="Edit trip" />
            </Link>
          </View>
          {!!shareNote && (
            <Text variant="small" style={{ textAlign: 'center' }}>
              {shareNote}
            </Text>
          )}
          {!confirming ? (
            <Pressable onPress={() => setConfirming(true)} accessibilityRole="button" hitSlop={8} style={{ alignSelf: 'center', paddingVertical: 10, paddingHorizontal: 16 }}>
              <Text variant="small" style={{ color: colors.accentText, fontFamily: fonts.sansSemiBold }}>
                Delete trip
              </Text>
            </Pressable>
          ) : (
            <Notice>
              <Text variant="strong">Delete this trip?</Text>
              <Text variant="small" style={{ marginBottom: 12 }}>
                This can’t be undone.
              </Text>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <Button title="Keep it" kind="outline" style={{ flex: 1 }} onPress={() => setConfirming(false)} />
                <Button title={deleting ? 'Deleting…' : 'Delete'} kind="accent" style={{ flex: 1 }} disabled={deleting} onPress={remove} />
              </View>
            </Notice>
          )}
          <ErrorNotice error={deleteError} />
        </View>
      </View>
    </Screen>
  );
}

function Info({ label, big, small, border }: { label: string; big: string; small: string; border?: boolean }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', paddingVertical: 14, borderLeftWidth: border ? 1 : 0, borderLeftColor: colors.line }}>
      <Text variant="label" style={{ fontSize: 10 }}>
        {label}
      </Text>
      <Text variant="heading" style={{ marginTop: 6 }}>
        {big}
      </Text>
      <Text variant="tiny">{small}</Text>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 10 }}>
      <Text variant="heading" accessibilityRole="header">
        {title}
      </Text>
      {children}
    </View>
  );
}

/** "20 Nov 2026" */
function addedOn(iso: string) {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? '' : `${d.getDate()} ${MONTH_NAMES_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}

/** One of the trip's photos in the row under the header. */
function TripPhoto({ path, index }: { path: string; index: number }) {
  const url = useTripPhoto(path);
  return (
    <View style={{ width: 150, height: 190, borderRadius: 16, overflow: 'hidden', backgroundColor: colors.sand }}>
      {url && <Image source={{ uri: url }} style={{ width: 150, height: 190 }} contentFit="cover" accessibilityLabel={`Photo ${index + 1}`} />}
    </View>
  );
}

/** "When" on the trip: the month and year, or with exact dates "10–17" / "Aug 2026" (or "28 Aug" / "– 3 Sep 2026"). */
function whenInfo(trip: Trip): { big: string; small: string } {
  if (!trip.dates) return { big: MONTH_NAMES_SHORT[monthIndexOf(trip.month)], small: String(yearOf(trip.month)) };
  const { start, end } = trip.dates;
  const sameMonth = start.slice(0, 7) === end.slice(0, 7);
  return sameMonth
    ? { big: `${dayOf(start)}–${dayOf(end)}`, small: `${MONTH_NAMES_SHORT[monthIndexOf(start)]} ${yearOf(start)}` }
    : { big: `${dayOf(start)} ${MONTH_NAMES_SHORT[monthIndexOf(start)]}`, small: `– ${dayOf(end)} ${MONTH_NAMES_SHORT[monthIndexOf(end)]} ${yearOf(end)}` };
}
