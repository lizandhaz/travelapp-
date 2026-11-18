import { Link, router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Dimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MonthPill } from '@/components/MonthPill';
import { PhotoFill, Shade } from '@/components/Photo';
import { ScoreStamp } from '@/components/ScoreStamp';
import { Text } from '@/components/Text';
import { BackButton, Button, Card, ErrorNotice, Notice, Screen } from '@/components/ui';
import { colors, fonts, GUTTER } from '@/constants/theme';
import { MONTH_NAMES_SHORT, monthIndexOf, monthYear, yearOf } from '@/lib/months';
import { photoForPlaceName } from '@/lib/sample';
import { scoreWord } from '@/lib/score';
import { deleteTrip, fetchTrip, type Trip } from '@/lib/trips';

/** One of your trips, with Edit and Delete. */
export default function TripScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [trip, setTrip] = useState<Trip | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<{ message: string } | null>(null);

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

  async function remove() {
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteTrip(id);
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
            <ActivityIndicator color={colors.terracotta} />
          )}
        </View>
      </Screen>
    );
  }

  const [main, ...more] = trip.stops;
  const nights = trip.stops.reduce((n, s) => n + (s.nights ?? 0), 0);
  const h = Math.min(Dimensions.get('window').width, 480) * 0.95;
  const summary = [
    more.length ? `${trip.stops.length} places` : null,
    trip.stay ? '1 stay' : null,
    trip.meal ? '1 food & drink' : null,
    trip.tip ? '1 tip' : null,
  ].filter(Boolean);

  return (
    <Screen noTopInset>
      <View style={{ height: h }}>
        <PhotoFill photo={photoForPlaceName(main.name)} label={main.name} />
        <Shade strength={0.55} />
        <View style={{ position: 'absolute', top: insets.top + 10, left: GUTTER }}>
          <BackButton onPhoto />
        </View>
        <View style={{ position: 'absolute', left: GUTTER, right: GUTTER, bottom: 46, flexDirection: 'row', alignItems: 'flex-end' }}>
          <View style={{ flex: 1, gap: 8 }}>
            <MonthPill month={monthYear(trip.month).toUpperCase()} onPhoto />
            <Text style={{ fontFamily: fonts.displayBold, fontSize: 46, lineHeight: 48, color: colors.onDark }}>{main.name}</Text>
            {!!main.country && (
              <Text variant="body" style={{ color: colors.onDark }}>
                {main.country}
              </Text>
            )}
          </View>
          <ScoreStamp score={trip.score} size="lg" label="Your trip" />
        </View>
      </View>

      <View style={{ paddingHorizontal: GUTTER, marginTop: -26, gap: 26 }}>
        <Card style={{ flexDirection: 'row' }}>
          <Info label="How long" big={nights ? String(nights) : '–'} small={nights ? (nights === 1 ? 'night' : 'nights') : 'not added'} />
          <Info label="When" big={MONTH_NAMES_SHORT[monthIndexOf(trip.month)]} small={String(yearOf(trip.month))} border />
          <Info label="Who sees it" big={trip.visibility === 'private' ? 'Me' : 'Friends'} small={trip.visibility === 'private' ? 'just me' : 'once added'} border />
        </Card>

        <View style={{ gap: 6 }}>
          <Text variant="title" style={{ fontSize: 30, lineHeight: 36 }}>
            {scoreWord(trip.score)}.
          </Text>
          {summary.length > 0 && <Text variant="small">{summary.join(' · ')}</Text>}
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
                    {!!s.country && <Text variant="tiny">{s.country}</Text>}
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
                <View style={{ alignSelf: 'flex-start', backgroundColor: 'rgba(150,199,184,0.35)', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 }}>
                  <Text variant="label" style={{ fontSize: 9, color: colors.teal }}>
                    {trip.stay.type}
                  </Text>
                </View>
                <Text variant="subheading">{trip.stay.name}</Text>
              </View>
              <ScoreStamp score={trip.stay.score} tone="teal" label="Stay" />
            </Card>
          </Section>
        )}

        {!!trip.meal && (
          <Section title="Best meal">
            <Card style={{ padding: 16 }}>
              <Text variant="body">{trip.meal}</Text>
            </Card>
          </Section>
        )}

        {!!trip.tip && (
          <Section title="Top tip">
            <Text variant="quote">“{trip.tip}”</Text>
          </Section>
        )}

        <View style={{ gap: 12, marginTop: 4 }}>
          <Link href={`/trip/${trip.id}/edit`} asChild>
            <Button title="Edit trip" />
          </Link>
          {!confirming ? (
            <Button title="Delete trip" kind="outline" onPress={() => setConfirming(true)} />
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
