import { useLocalSearchParams } from 'expo-router';
import { Dimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/Avatar';
import { MonthPill } from '@/components/MonthPill';
import { PhotoFill, PhotoTile, Shade } from '@/components/Photo';
import { PhotoBadge, Row } from '@/components/cards';
import { ScoreStamp } from '@/components/ScoreStamp';
import { Text } from '@/components/Text';
import { BackButton, Card, Screen, SectionHeader } from '@/components/ui';
import { colors, fonts, GUTTER } from '@/constants/theme';
import { scoreWord } from '@/lib/score';
import { aboutPlace, getPlace } from '@/lib/sample';
import NotFound from '../+not-found';

/** A place page (sample content for now; real place pages come in plan Step E). */
export default function PlaceScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const insets = useSafeAreaInsets();
  const place = getPlace(slug);
  if (!place) return <NotFound />;
  const { said, ideas } = aboutPlace(slug);
  const h = Math.min(Dimensions.get('window').width, 480) * 1.05;

  return (
    <Screen noTopInset>
      <View style={{ height: h }}>
        <PhotoFill photo={place.photo} label={place.name} />
        <Shade strength={0.55} />
        <View style={{ position: 'absolute', top: insets.top + 10, left: GUTTER }}>
          <BackButton onPhoto />
        </View>
        <View style={{ position: 'absolute', left: GUTTER, right: GUTTER, bottom: 22, flexDirection: 'row', alignItems: 'flex-end' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: fonts.displayBold, fontSize: 46, lineHeight: 48, color: colors.onDark }}>{place.name}</Text>
            <Text variant="body" style={{ color: colors.onDark }}>
              {place.region}
            </Text>
          </View>
          {place.score != null && <ScoreStamp score={place.score} size="lg" label="Your score" />}
        </View>
      </View>

      <View style={{ paddingHorizontal: GUTTER, paddingTop: 20, gap: 6 }}>
        {place.score != null && (
          <Text variant="quote" style={{ fontFamily: fonts.displayItalic }}>
            {scoreWord(place.score)}
          </Text>
        )}
        <Text variant="tiny">Your score blends ratings from your friends and people with similar taste. Preview: sample content.</Text>
      </View>

      {said.length > 0 && (
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
        </View>
      )}

      {ideas.length > 0 && (
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
    </Screen>
  );
}
