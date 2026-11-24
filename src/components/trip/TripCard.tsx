import { Link } from 'expo-router';
import { Pressable, View } from 'react-native';

import { MonthPill } from '@/components/MonthPill';
import { PhotoStamp } from '@/components/Photo';
import { Text } from '@/components/Text';
import { colors, fonts } from '@/constants/theme';
import { monthYear } from '@/lib/months';
import { photoForPlaceName } from '@/lib/sample';
import { fitLines, fitWordSize } from '@/lib/fit';
import { formatScore } from '@/lib/score';
import type { Trip } from '@/lib/trips';
import { useTripPhoto } from '@/lib/useTripPhoto';

/** One of your trips as a photo stamp (You page). Tap to open it. */
export function TripCard({ trip, width }: { trip: Trip; width: number }) {
  const main = trip.stops[0];
  const cover = trip.photoPaths[0] ?? null;
  const photoUrl = useTripPhoto(cover);
  // The name has the card's full width (minus frame and padding); the score sits underneath.
  const nameSize = fitWordSize(main?.name ?? '', width - 2 * Math.max(6, Math.round(width * 0.025)) - 32, 22, 15);
  return (
    <Link href={`/trip/${trip.id}`} asChild>
      <Pressable accessibilityRole="link" accessibilityLabel={`${main?.name}, ${monthYear(trip.month)}, ${formatScore(trip.score)} out of 10`} style={{ width }}>
        <PhotoStamp uri={photoUrl} photo={cover ? null : main ? photoForPlaceName(main.name, trip.id) : null} width={width} height={width * 1.2}>
          <View style={{ position: 'absolute', top: 18, left: 16 }}>
            <MonthPill month={monthYear(trip.month).toUpperCase()} onPhoto />
          </View>
          <View style={{ position: 'absolute', left: 16, right: 16, bottom: 14 }}>
            <Text {...fitLines(main?.name ?? '')} style={{ fontFamily: fonts.display, fontSize: nameSize, lineHeight: Math.round(nameSize * 1.18), color: colors.onDark }}>
              {main?.name}
            </Text>
            <Text numberOfLines={1} style={{ marginTop: 2, fontFamily: fonts.display, fontSize: 17, color: colors.onDark, fontVariant: ['tabular-nums'] }}>
              {formatScore(trip.score)}
            </Text>
          </View>
        </PhotoStamp>
      </Pressable>
    </Link>
  );
}
