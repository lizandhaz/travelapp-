import { Link, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';

import { Airmail } from '@/components/Airmail';
import { Avatar } from '@/components/Avatar';
import { Photo } from '@/components/Photo';
import { Postmark } from '@/components/Postmark';
import { Stamp } from '@/components/Stamp';
import { Text } from '@/components/Text';
import { BackLink, Card, Screen } from '@/components/ui';
import { colors, GUTTER } from '@/constants/theme';
import { formatDay, formatMonth, getDestination, getPerson, getRating } from '@/lib/data';
import NotFound from '../+not-found';

export default function RatingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const rating = getRating(id);
  const person = rating && getPerson(rating.author);
  const place = rating && getDestination(rating.destination);
  if (!rating || !person || !place) return <NotFound />;

  return (
    <Screen>
      <View style={{ paddingHorizontal: GUTTER, paddingTop: 20 }}>
        <BackLink />
        {/* The postcard itself */}
        <Card>
          <Airmail height={8} />
          <View style={{ padding: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Postmark place={place.name} date={formatMonth(rating.tripMonth)} size={72} />
              <Stamp score={rating.destinationScore} label="Place" size="lg" tilt={5} />
            </View>
            <Text variant="title" style={{ marginTop: 16 }}>
              {rating.headline}
            </Text>
            <Link href={`/destination/${place.slug}`} asChild>
              <Pressable style={{ marginTop: 4, alignSelf: 'flex-start' }}>
                <Text variant="link" style={{ fontSize: 14 }}>
                  {place.name}, {place.country}
                </Text>
              </Pressable>
            </Link>
            <Text variant="review" style={{ marginTop: 16 }}>
              {rating.review}
            </Text>
            <Link href={`/people/${person.handle}`} asChild>
              <Pressable style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 20 }}>
                <Avatar person={person} size="sm" />
                <View>
                  <Text variant="strong">{person.name}</Text>
                  <Text variant="tiny">Posted {formatDay(rating.postedAt)}, once home</Text>
                </View>
              </Pressable>
            </Link>
          </View>
        </Card>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingHorizontal: GUTTER, paddingVertical: 20 }}>
        {rating.photos.map((p) => (
          <Photo key={p.caption} palette={p.palette} caption={p.caption} style={{ width: 280, height: 200 }} />
        ))}
      </ScrollView>

      <View style={{ paddingHorizontal: GUTTER, gap: 24 }}>
        <Card style={{ padding: 16, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <View style={{ flex: 1 }}>
            <Text variant="kicker" style={{ color: colors.inkSoft, fontSize: 11 }}>
              Where they stayed
            </Text>
            <Text variant="heading" style={{ marginTop: 4 }}>
              {rating.stay.name}
            </Text>
            <Text variant="small">{rating.stay.type}</Text>
          </View>
          <Stamp score={rating.stay.score} label="Stay" tilt={-3} />
        </Card>

        {rating.foodPicks.length > 0 && (
          <View style={{ gap: 8 }}>
            <Text variant="heading">Food picks</Text>
            {rating.foodPicks.map((f) => (
              <Card key={f.name} style={{ padding: 12 }}>
                <Text variant="strong">{f.name}</Text>
                <Text variant="small">{f.note}</Text>
              </Card>
            ))}
          </View>
        )}

        {rating.topTips.length > 0 && (
          <View style={{ gap: 8 }}>
            <Text variant="heading">Top tips</Text>
            {rating.topTips.map((t, i) => (
              <View key={t} style={{ flexDirection: 'row', gap: 12 }}>
                <Text variant="heading" style={{ color: colors.postbox }}>
                  {i + 1}
                </Text>
                <Text variant="body" style={{ flex: 1, paddingTop: 2 }}>
                  {t}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </Screen>
  );
}
