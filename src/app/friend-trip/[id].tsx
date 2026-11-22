import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Dimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/Avatar';
import { PhotoBadge, Row } from '@/components/cards';
import { MonthPill } from '@/components/MonthPill';
import { PhotoFill, PhotoTile, Shade } from '@/components/Photo';
import { ScoreStamp } from '@/components/ScoreStamp';
import { Text } from '@/components/Text';
import { BackButton, Button, Card, Screen, SectionHeader } from '@/components/ui';
import { colors, fonts, GUTTER, radius } from '@/constants/theme';
import { companionsLabel, getFriendTrip, tripPlace } from '@/lib/friendTrips';
import { scoreWord } from '@/lib/score';
import NotFound from '../+not-found';

/** A friend's trip, opened from Home's Friends feed: their score, photos, stay, food, things to do and tips. */
export default function FriendTripScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const trip = getFriendTrip(id);
  if (!trip) return <NotFound />;
  const { stay, eats, dos, tips } = trip;
  const hasPhoto = trip.photos.length > 0;
  const h = Math.min(Dimensions.get('window').width, 480) * (hasPhoto ? 0.95 : 0.7);

  return (
    <Screen noTopInset>
      <View style={{ height: h }}>
        {hasPhoto ? (
          <>
            <PhotoFill photo={trip.photos[0]} label={trip.place} />
            <Shade strength={0.6} />
          </>
        ) : (
          // No photos: the same olive-to-terracotta as a postcard without photos.
          <LinearGradient colors={[colors.olive, colors.accentDeep]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: 'absolute', inset: 0 }} />
        )}
        <View style={{ position: 'absolute', top: insets.top + 10, left: GUTTER }}>
          <BackButton onPhoto />
        </View>
        <View style={{ position: 'absolute', left: GUTTER, right: GUTTER, bottom: 40 }}>
          <MonthPill month={trip.month} onPhoto />
          <Text style={{ fontFamily: fonts.displayBold, fontSize: 40, lineHeight: 44, color: colors.onDark, marginTop: 10 }}>
            {trip.who}’s {tripPlace(trip)} trip
          </Text>
          <Text variant="body" style={{ color: colors.onDark }}>
            {trip.region}
          </Text>
        </View>
      </View>

      <Card tone="blush" style={{ marginHorizontal: GUTTER, marginTop: -24, padding: 16, gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Avatar face={trip.face} name={trip.who} size={40} />
          <View style={{ flex: 1 }}>
            <Text variant="strong">{trip.who} rated it</Text>
            <Text style={{ fontFamily: fonts.displayItalic, fontSize: 17, color: colors.accentText }}>{scoreWord(trip.score)}</Text>
          </View>
          <ScoreStamp score={trip.score} size="md" label={`${trip.who}'s score for ${trip.place}`} />
        </View>
        {(!!trip.companions || !!trip.nights) && (
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {!!trip.companions && <Fact label="Went" value={companionsLabel(trip.companions)} />}
            {!!trip.nights && <Fact label="For" value={`${trip.nights} ${trip.nights === 1 ? 'night' : 'nights'}`} />}
          </View>
        )}
        {!!trip.quote && <Text variant="quote">“{trip.quote}”</Text>}
      </Card>

      {trip.photos.length > 1 && (
        <View style={{ marginTop: 26 }}>
          <SectionHeader>Their photos</SectionHeader>
          <Row gap={10}>
            {trip.photos.map((p) => (
              <PhotoTile key={p} photo={p} style={{ width: 260, height: 325 }} shade={false} />
            ))}
          </Row>
        </View>
      )}

      {stay && (
      <View style={{ marginTop: 26 }}>
        <SectionHeader>Where they stayed</SectionHeader>
        <Card style={{ marginHorizontal: GUTTER, overflow: 'hidden' }}>
          {stay.photo && (
            <PhotoTile photo={stay.photo} style={{ height: 170, borderRadius: 0 }} shade={false}>
              <PhotoBadge text={stay.type} style={{ position: 'absolute', top: 10, left: 10 }} />
            </PhotoTile>
          )}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 }}>
            <View style={{ flex: 1 }}>
              <Text variant="subheading">{stay.name}</Text>
              <Text variant="tiny">{[stay.type, stay.sub].filter(Boolean).join(' · ')}</Text>
            </View>
            {stay.score != null && <ScoreStamp score={stay.score} size="sm" tone="olive" label={`${trip.who}'s score for ${stay.name}`} />}
          </View>
        </Card>
      </View>
      )}

      {eats.length > 0 && (
        <View style={{ marginTop: 26 }}>
          <SectionHeader>Where they ate</SectionHeader>
          <Row gap={12}>
            {eats.map((e) => (
              <View key={e.name} style={{ width: 200, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line }}>
                {e.photo ? <PhotoTile photo={e.photo} style={{ height: 130, borderRadius: 0 }} shade={false} /> : <View style={{ height: 8, backgroundColor: colors.sageSoft }} />}
                <View style={{ padding: 12, gap: 4 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                    <Text variant="strong" style={{ flex: 1 }}>
                      {e.name}
                    </Text>
                    {e.score != null && <ScoreStamp score={e.score} size="sm" label={`${trip.who}'s score for ${e.name}`} />}
                  </View>
                  {!!e.what && (
                    <Text variant="tiny" numberOfLines={3}>
                      {e.what}
                    </Text>
                  )}
                  {!!e.price && <Text variant="tiny" style={{ color: colors.accentText }}>{e.price}</Text>}
                </View>
              </View>
            ))}
          </Row>
        </View>
      )}

      {dos.length > 0 && (
        <View style={{ marginTop: 26 }}>
          <SectionHeader>What they did</SectionHeader>
          <View style={{ paddingHorizontal: GUTTER, gap: 10 }}>
            {dos.map((d, i) => (
              <Card key={d.name} tone={(['sage', 'sky', 'blush'] as const)[i % 3]} style={{ padding: 14, gap: 4 }}>
                <Text variant="label" style={{ color: colors.ink }}>
                  {d.gem ? 'Hidden gem' : d.tag}
                </Text>
                <Text variant="strong">{d.name}</Text>
                {!!d.what && <Text variant="small">{d.what}</Text>}
              </Card>
            ))}
          </View>
        </View>
      )}

      {tips.length > 0 && (
        <View style={{ marginTop: 26 }}>
          <SectionHeader>{`${trip.who}’s top tips`}</SectionHeader>
          <View style={{ paddingHorizontal: GUTTER, gap: 10 }}>
            {tips.map((t) => (
              <View key={t.tip} style={{ flexDirection: 'row', gap: 10 }}>
                <Text style={{ fontFamily: fonts.display, fontSize: 18, color: colors.accent }}>✦</Text>
                <Text variant="body" style={{ flex: 1 }}>
                  {t.tip}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={{ paddingHorizontal: GUTTER, marginTop: 30 }}>
        <Button title={`More about ${trip.place}`} kind="outline" onPress={() => router.push(`/place/${trip.slug}`)} />
      </View>
      <Text variant="tiny" style={{ paddingHorizontal: GUTTER, marginTop: 14 }}>
        Sample trip for now. Your friends’ real trips arrive with friends.
      </Text>
    </Screen>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.card, borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 8 }}>
      <Text variant="label" style={{ fontSize: 10 }}>
        {label}
      </Text>
      <Text variant="strong" style={{ fontSize: 14 }}>
        {value}
      </Text>
    </View>
  );
}
