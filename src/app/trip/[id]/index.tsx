import { Link, router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { Airmail } from '@/components/Airmail';
import { Postmark } from '@/components/Postmark';
import { Stamp } from '@/components/Stamp';
import { Text } from '@/components/Text';
import { BackLink, Button, Card, ErrorNotice, Notice, Screen } from '@/components/ui';
import { colors, GUTTER } from '@/constants/theme';
import { formatMonth } from '@/lib/data';
import { longMonth } from '@/lib/months';
import { deleteTrip, fetchTrip, SCORE_WORDS, type Trip } from '@/lib/trips';

/** One of your real trips, laid out as a postcard, with Edit and Delete. */
export default function TripScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
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
        <View style={{ padding: GUTTER, paddingTop: 20, gap: 12 }}>
          <BackLink />
          {error ? (
            <Text variant="body">{error}</Text>
          ) : trip === null ? (
            <Text variant="body">That trip couldn’t be found. It may have been deleted.</Text>
          ) : (
            <ActivityIndicator color={colors.postbox} />
          )}
        </View>
      </Screen>
    );
  }

  const [main, ...more] = trip.stops;

  return (
    <Screen>
      <View style={{ paddingHorizontal: GUTTER, paddingTop: 20, gap: 24 }}>
        <View>
          <BackLink />
          <Card>
            <Airmail height={8} />
            <View style={{ padding: 20 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Postmark place={main.name} date={formatMonth(trip.month)} size={72} />
                <Stamp score={trip.score} label="Trip" size="lg" tilt={5} />
              </View>
              <Text variant="title" style={{ marginTop: 16 }}>
                {main.name}
              </Text>
              {!!main.country && <Text variant="bodySoft">{main.country}</Text>}
              <Text variant="quote" style={{ marginTop: 10, fontSize: 20 }}>
                {SCORE_WORDS[trip.score]}
              </Text>
              <Text variant="small" style={{ marginTop: 10 }}>
                {longMonth(trip.month)} · {trip.visibility === 'private' ? 'Just me' : 'Friends'}
              </Text>
            </View>
          </Card>
        </View>

        {more.length > 0 && (
          <Section title="Also on this trip">
            <Card>
              {more.map((s, i) => (
                <View
                  key={`${s.name}-${i}`}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    padding: 12,
                    borderTopWidth: i ? 1 : 0,
                    borderTopColor: colors.sand,
                  }}
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
          <Card style={{ padding: 16, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <View style={{ flex: 1 }}>
              <Text variant="kicker" style={{ color: colors.inkSoft, fontSize: 11 }}>
                Where you stayed
              </Text>
              <Text variant="heading" style={{ marginTop: 4 }}>
                {trip.stay.name}
              </Text>
              <Text variant="small">{trip.stay.type}</Text>
            </View>
            <Stamp score={trip.stay.score} label="Stay" tilt={-3} />
          </Card>
        )}

        {!!trip.meal && (
          <Section title="Best meal">
            <Card style={{ padding: 12 }}>
              <Text variant="body">{trip.meal}</Text>
            </Card>
          </Section>
        )}

        {!!trip.tip && (
          <Section title="Top tip">
            <Text variant="quote">“{trip.tip}”</Text>
          </Section>
        )}

        <View style={{ gap: 12, marginTop: 8 }}>
          <Link href={`/trip/${trip.id}/edit`} asChild>
            <Button title="Edit trip" kind="dark" />
          </Link>
          {!confirming ? (
            <Button title="Delete trip" kind="secondary" onPress={() => setConfirming(true)} />
          ) : (
            <Notice>
              <Text variant="strong">Delete this trip?</Text>
              <Text variant="small" style={{ marginBottom: 12 }}>
                This can’t be undone.
              </Text>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <Button title="Keep it" kind="secondary" style={{ flex: 1 }} onPress={() => setConfirming(false)} />
                <Button
                  title={deleting ? 'Deleting…' : 'Delete'}
                  style={{ flex: 1 }}
                  disabled={deleting}
                  onPress={remove}
                />
              </View>
            </Notice>
          )}
          <ErrorNotice error={deleteError} />
        </View>
      </View>
    </Screen>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 8 }}>
      <Text variant="heading">{title}</Text>
      {children}
    </View>
  );
}
