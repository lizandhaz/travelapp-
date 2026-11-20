import { router, useLocalSearchParams } from 'expo-router';
import { Dimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/Avatar';
import { MonthPill } from '@/components/MonthPill';
import { PhotoFill, PhotoTile, Shade } from '@/components/Photo';
import { BestTimeChart, DoRow, EatRow, MoreAbout, PlaceFacts, SaidList, StayRow } from '@/components/place';
import { PhotoBadge, Row } from '@/components/cards';
import { ScoreStamp } from '@/components/ScoreStamp';
import { Text } from '@/components/Text';
import { BackButton, Button, Card, Screen, SectionHeader } from '@/components/ui';
import { colors, fonts, GUTTER } from '@/constants/theme';
import { countryOf } from '@/lib/knownPlaces';
import { placeDetails } from '@/lib/placeDetails';
import { scoreWord } from '@/lib/score';
import { aboutPlace, getPlace } from '@/lib/sample';
import NotFound from '../+not-found';

/** A place page (sample content from the prototype for now; real place pages come in plan Step E). */
export default function PlaceScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const insets = useSafeAreaInsets();
  const place = getPlace(slug);
  if (!place) return <NotFound />;
  const detail = placeDetails[slug] ?? null;
  const { said, ideas } = aboutPlace(slug);
  const moreSaid = (detail?.said ?? []).filter((s) => !said.some((f) => f.who === s.who));
  const h = Math.min(Dimensions.get('window').width, 480) * 1.0;
  const country = countryOf({ name: place.name, country: place.region.split(', ').pop() ?? '' });

  return (
    <Screen noTopInset>
      <View style={{ height: h }}>
        <PhotoFill photo={place.photo} label={place.name} />
        <Shade strength={0.55} />
        <View style={{ position: 'absolute', top: insets.top + 10, left: GUTTER }}>
          <BackButton onPhoto />
        </View>
        <View style={{ position: 'absolute', left: GUTTER, right: GUTTER, bottom: detail ? 48 : 22 }}>
          {!!detail?.kicker && (
            <Text variant="label" style={{ color: colors.onDark, opacity: 0.95 }}>
              {detail.kicker}
            </Text>
          )}
          <Text style={{ fontFamily: fonts.displayBold, fontSize: 46, lineHeight: 50, color: colors.onDark }}>{place.name}</Text>
          <Text variant="body" style={{ color: colors.onDark }}>
            {place.region}
          </Text>
        </View>
      </View>

      {place.score != null && (
        <Card style={{ marginHorizontal: GUTTER, marginTop: -30, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <ScoreStamp score={place.score} size="md" label="Your score" />
          <View style={{ flex: 1 }}>
            <Text variant="subheading">
              Your score · <Text variant="subheading" style={{ fontFamily: fonts.displayItalic }}>{scoreWord(place.score)}</Text>
            </Text>
            <Text variant="small">{detail?.scoreNote ?? 'From your friends and people with your taste.'}</Text>
          </View>
        </Card>
      )}

      {detail && (
        <View style={{ marginTop: 12 }}>
          <PlaceFacts detail={detail} />
        </View>
      )}

      {detail && <BestTimeChart detail={detail} />}

      {(said.length > 0 || moreSaid.length > 0) && (
        <View style={{ marginTop: 28 }}>
          <SectionHeader>What friends said</SectionHeader>
          <View style={{ paddingHorizontal: GUTTER, gap: 12 }}>
            {said.map((s) => (
              <Card key={s.who + s.month} style={{ padding: 16, gap: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Avatar face={s.face} name={s.who} size={34} />
                  <Text variant="strong" style={{ flex: 1 }}>
                    {s.who}
                  </Text>
                  <MonthPill month={s.month} />
                </View>
                {!!s.quote && <Text variant="quote">{s.quote}</Text>}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <ScoreStamp score={s.score} size="sm" label="Destination" />
                  <Text variant="small" style={{ flex: 1 }}>
                    Stayed at <Text variant="strong">{s.stayName}</Text> ({s.stayType})
                  </Text>
                  <ScoreStamp score={s.stayScore} size="sm" tone="teal" label={s.stayType} />
                </View>
              </Card>
            ))}
          </View>
          {moreSaid.length > 0 && (
            <View style={{ marginTop: said.length ? 16 : 0 }}>
              <SaidList items={moreSaid} />
            </View>
          )}
        </View>
      )}

      {!!detail?.stays.length && <StayRow stays={detail.stays} />}
      {!!detail?.eats.length && <EatRow eats={detail.eats} />}
      {!!detail?.dos.length && <DoRow dos={detail.dos} />}

      {!detail && ideas.length > 0 && (
        <View style={{ marginTop: 28 }}>
          <SectionHeader>Things friends loved here</SectionHeader>
          <Row gap={14}>
            {ideas.map((i) => (
              <View key={i.name} style={{ width: 200 }}>
                <PhotoTile photo={i.photo} style={{ width: 200, height: 150 }} shade={false}>
                  <PhotoBadge text={i.kind} style={{ position: 'absolute', top: 10, left: 10 }} />
                </PhotoTile>
                <Text variant="subheading" style={{ marginTop: 8 }}>
                  {i.name}
                </Text>
                <Text variant="tiny">{i.sub}</Text>
              </View>
            ))}
          </Row>
        </View>
      )}

      {detail && <MoreAbout name={place.name} detail={detail} />}

      <View style={{ paddingHorizontal: GUTTER, marginTop: 28, flexDirection: 'row', gap: 12 }}>
        <Button title="Save to a list" kind="outline" style={{ flex: 1 }} onPress={() => router.push({ pathname: '/save', params: { place: place.name, country, slug } })} />
        <Button
          title="I’ve been"
          kind="accent"
          style={{ flex: 1 }}
          onPress={() => router.push({ pathname: '/add', params: { place: place.name, country } })}
        />
      </View>

      <Text variant="tiny" style={{ paddingHorizontal: GUTTER, marginTop: 18 }}>
        Sample content for now.{detail?.credits ? ` ${detail.credits}` : ''}
      </Text>
    </Screen>
  );
}
