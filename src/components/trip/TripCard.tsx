import { Link } from 'expo-router';
import { Pressable, View } from 'react-native';

import { MonthPill } from '@/components/MonthPill';
import { PhotoStamp } from '@/components/Photo';
import { Text } from '@/components/Text';
import { colors, fonts } from '@/constants/theme';
import { monthYear } from '@/lib/months';
import { photoForPlaceName } from '@/lib/sample';
import { formatScore } from '@/lib/score';
import type { Trip } from '@/lib/trips';
import { useTripPhoto } from '@/lib/useTripPhoto';

/** One of your trips as a photo stamp (You page). Tap to open it. */
export function TripCard({ trip, width }: { trip: Trip; width: number }) {
  const main = trip.stops[0];
  const cover = trip.photoPaths[0] ?? null;
  const photoUrl = useTripPhoto(cover);
  const extras = [
    trip.stops.length > 1 ? `${trip.stops.length} places` : null,
    trip.stay ? '1 stay' : null,
    trip.meal ? '1 food & drink' : null,
    trip.tip ? '1 tip' : null,
  ].filter(Boolean);
  return (
    <Link href={`/trip/${trip.id}`} asChild>
      <Pressable accessibilityRole="link" accessibilityLabel={`${main?.name}, ${monthYear(trip.month)}, ${formatScore(trip.score)} out of 10`} style={{ width }}>
        <PhotoStamp uri={photoUrl} photo={cover ? null : main ? photoForPlaceName(main.name) : null} width={width} height={width * 1.2}>
          <View style={{ position: 'absolute', top: 18, left: 16 }}>
            <MonthPill month={monthYear(trip.month).toUpperCase()} onPhoto />
          </View>
          <View style={{ position: 'absolute', left: 16, right: 16, bottom: 16, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 }}>
            <Text numberOfLines={2} style={{ flex: 1, fontFamily: fonts.display, fontSize: 19, lineHeight: 22, color: colors.onDark }}>
              {main?.name}
            </Text>
            <Text style={{ fontFamily: fonts.display, fontSize: 20, color: colors.onDark, fontVariant: ['tabular-nums'] }}>{formatScore(trip.score)}</Text>
          </View>
        </PhotoStamp>
        <Text variant="tiny" style={{ marginTop: 6 }} numberOfLines={1}>
          {extras.length ? extras.join(' · ') : trip.visibility === 'private' ? 'Just me' : 'Friends'}
        </Text>
      </Pressable>
    </Link>
  );
}
