import { Link } from 'expo-router';
import { Pressable, View } from 'react-native';

import { Airmail } from '@/components/Airmail';
import { Stamp } from '@/components/Stamp';
import { Text } from '@/components/Text';
import { Card } from '@/components/ui';
import { colors, fonts } from '@/constants/theme';
import { longMonth } from '@/lib/months';
import { SCORE_WORDS, type Trip } from '@/lib/trips';

/** A real trip in a list (You page). Tap to open it. */
export function TripCard({ trip }: { trip: Trip }) {
  const [main, ...more] = trip.stops;
  return (
    <Card>
      <Airmail />
      <Link href={`/trip/${trip.id}`} asChild>
        <Pressable style={{ padding: 16, flexDirection: 'row', gap: 16 }} accessibilityRole="link">
          <View style={{ flex: 1 }}>
            <Text variant="kicker" style={{ color: colors.inkSoft, fontSize: 11 }}>
              {longMonth(trip.month)}
              {trip.visibility === 'private' ? ' · Just me' : ''}
            </Text>
            <Text variant="heading" style={{ marginTop: 4 }}>
              {main?.name}
              {main?.country ? <Text variant="bodySoft">, {main.country}</Text> : null}
            </Text>
            {more.length > 0 && (
              <Text variant="small" style={{ marginTop: 2 }}>
                + {more.map((s) => s.name).join(', ')}
              </Text>
            )}
            <Text style={{ fontFamily: fonts.displayItalic, fontSize: 15, color: colors.ink, marginTop: 6 }}>
              {SCORE_WORDS[trip.score]}
            </Text>
            {trip.stay && (
              <Text variant="small" style={{ marginTop: 4 }}>
                Stayed at <Text style={{ fontFamily: fonts.sansMedium, color: colors.ink }}>{trip.stay.name}</Text> (
                {trip.stay.type}) · {trip.stay.score}/10
              </Text>
            )}
          </View>
          <Stamp score={trip.score} tilt={3} />
        </Pressable>
      </Link>
    </Card>
  );
}
