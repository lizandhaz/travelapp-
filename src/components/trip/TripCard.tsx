import { router } from 'expo-router';

import { TripPostcard } from '@/components/cards';
import { quoted } from '@/components/profile';
import { countryOf } from '@/lib/knownPlaces';
import { monthYear } from '@/lib/months';
import { photoForPlaceName } from '@/lib/sample';
import { formatScore } from '@/lib/score';
import type { Trip } from '@/lib/trips';
import { useTripPhoto } from '@/lib/useTripPhoto';

/**
 * One of your trips on You, as the same postcard as the Friends feed (owner, Nov 2026): your cover photo (or the
 * place's own photo when you didn't add one), month, place and score, then your note and where you stayed. Tap to open it.
 */
export function TripCard({ trip, width }: { trip: Trip; width: number }) {
  const main = trip.stops[0];
  const cover = trip.photoPaths[0] ?? null;
  const photoUrl = useTripPhoto(cover);
  const month = monthYear(trip.month);
  return (
    <TripPostcard
      item={{
        id: trip.id,
        who: 'You',
        face: null,
        place: main?.name ?? '',
        region: main ? countryOf(main) : '',
        month: month.toUpperCase(),
        photo: cover ? null : main ? photoForPlaceName(main.name, trip.id) : null,
        photoUri: photoUrl ?? null,
        quote: quoted(trip.note),
        score: trip.score,
        stayType: trip.stay?.type ?? '',
        stayName: trip.stay?.name ?? '',
        stayScore: trip.stay?.score ?? null,
        slug: '',
      }}
      width={width}
      who={false}
      more="Your trip →"
      onPress={() => router.push(`/trip/${trip.id}`)}
      accessibilityLabel={`${main?.name}, ${month}, ${formatScore(trip.score)} out of 10. Open the trip`}
    />
  );
}
