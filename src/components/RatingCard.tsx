import { Link } from 'expo-router';
import { Pressable, View } from 'react-native';

import { colors, fonts } from '@/constants/theme';
import { formatDay, formatMonth, getDestination, getPerson, type Rating } from '@/lib/data';
import { Airmail } from './Airmail';
import { Avatar } from './Avatar';
import { Photo } from './Photo';
import { Stamp } from './Stamp';
import { Text } from './Text';
import { Card } from './ui';

/** One friend's rating, styled like the back of a postcard. */
export function RatingCard({ rating, showAuthor = true }: { rating: Rating; showAuthor?: boolean }) {
  const person = getPerson(rating.author);
  const place = getDestination(rating.destination);
  if (!person || !place) return null;

  return (
    <Card>
      <Airmail />
      <Link href={`/rating/${rating.id}`} asChild>
        <Pressable style={{ padding: 16 }}>
          {showAuthor && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <Avatar person={person} size="sm" />
              <View>
                <Text variant="strong">{person.name}</Text>
                <Text variant="tiny">
                  Went {formatMonth(rating.tripMonth)} · posted {formatDay(rating.postedAt)}
                </Text>
              </View>
            </View>
          )}
          <View style={{ flexDirection: 'row', gap: 16 }}>
            <View style={{ flex: 1 }}>
              <Text variant="kicker" style={{ color: colors.inkSoft, fontSize: 11 }}>
                {place.name}, {place.country}
              </Text>
              <Text variant="heading" style={{ marginTop: 4 }}>
                {rating.headline}
              </Text>
              <Text variant="small" style={{ marginTop: 8 }}>
                Stayed at <Text style={{ fontFamily: fonts.sansMedium, color: colors.ink }}>{rating.stay.name}</Text> (
                {rating.stay.type}) · {rating.stay.score}/10
              </Text>
            </View>
            <Stamp score={rating.destinationScore} tilt={3} />
          </View>
          {rating.photos[0] && (
            <Photo
              palette={rating.photos[0].palette}
              caption={rating.photos[0].caption}
              style={{ height: 160, marginTop: 16 }}
            />
          )}
          {rating.foodPicks[0] && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 }}>
              <View style={{ backgroundColor: 'rgba(226,164,59,0.25)', paddingHorizontal: 6, paddingVertical: 2 }}>
                <Text style={{ fontFamily: fonts.sansSemiBold, fontSize: 12 }}>Eat</Text>
              </View>
              <Text variant="body" style={{ fontSize: 14 }}>
                {rating.foodPicks[0].name}
              </Text>
            </View>
          )}
        </Pressable>
      </Link>
    </Card>
  );
}
