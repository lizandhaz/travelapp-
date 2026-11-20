import { router } from 'expo-router';
import { useState } from 'react';
import { Dimensions, Pressable, View } from 'react-native';

import { AccentTitle } from '@/components/AccentTitle';
import { FeedCard, PickCard, PlaceCard, Row, TasteCard, TrendCard } from '@/components/cards';
import { SearchIcon, SendIcon } from '@/components/Icons';
import { PhotoStamp } from '@/components/Photo';
import { ScoreStamp } from '@/components/ScoreStamp';
import { Text } from '@/components/Text';
import { Chip, IconCircle, Screen, SectionHeader, Segmented } from '@/components/ui';
import { Wordmark } from '@/components/Wordmark';
import { colors, fonts, GUTTER } from '@/constants/theme';
import { friendsFeed, hero, PHOTO_CREDITS, rows, TASTES, unreadPostcardCount } from '@/lib/sample';

export default function Home() {
  const [side, setSide] = useState<'for-you' | 'friends'>('for-you');

  return (
    <Screen tabBar>
      <View style={{ paddingHorizontal: GUTTER, paddingTop: 16, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Wordmark />
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 2 }}>
          <IconCircle label="Search" onPress={() => router.push('/explore')}>
            <SearchIcon color={colors.ink} />
          </IconCircle>
          <IconCircle label="Postcards" badge={unreadPostcardCount} onPress={() => router.push('/postcards')}>
            <SendIcon color={colors.ink} />
          </IconCircle>
        </View>
      </View>

      <View style={{ paddingHorizontal: GUTTER, marginTop: 18, marginBottom: 20 }}>
        <Segmented
          label="Home"
          value={side}
          onChange={setSide}
          options={[
            ['for-you', 'For you'],
            ['friends', 'Friends'],
          ]}
        />
      </View>

      {side === 'for-you' ? <ForYou /> : <Friends />}
    </Screen>
  );
}

function ForYou() {
  const width = Math.min(Dimensions.get('window').width, 480) - GUTTER * 2;
  const [taste, setTaste] = useState(0);
  const tasteItems = rows.taste.filter(TASTES[taste].match);

  return (
    <View style={{ gap: 32 }}>
      <View style={{ paddingHorizontal: GUTTER, gap: 10 }}>
        <Pressable onPress={() => router.push(`/place/${hero.slug}`)} accessibilityRole="link" accessibilityLabel={`${hero.name}, ${hero.sub}, ${hero.score} out of 10`}>
          <PhotoStamp photo={hero.photo} width={width} height={width * 1.3}>
            <View style={{ position: 'absolute', left: 22, right: 22, bottom: 24, flexDirection: 'row', alignItems: 'flex-end' }}>
              <View style={{ flex: 1 }}>
                <Text variant="label" style={{ color: colors.onDark }}>
                  {hero.kicker}
                </Text>
                <Text style={{ fontFamily: fonts.displayBold, fontSize: 52, lineHeight: 57, color: colors.onDark, marginTop: 6 }}>{hero.name}</Text>
                <Text variant="label" style={{ color: colors.onDark, marginTop: 8 }}>
                  {hero.sub} →
                </Text>
              </View>
              <ScoreStamp score={hero.score} size="xl" />
            </View>
          </PhotoStamp>
        </Pressable>
        <Text variant="tiny">Your score blends ratings from your friends and people with similar taste.</Text>
      </View>

      <View>
        <SectionHeader action="See all" onAction={() => router.push('/explore')}>
          <AccentTitle before="Where's" accent="trending" variant="heading" />
        </SectionHeader>
        <Row>
          {rows.trending.map((i) => (
            <TrendCard key={i.slug} item={i} />
          ))}
        </Row>
      </View>

      <PlaceRow before="Island" accent="escapes" items={rows.islands} width={230} height={260} />
      <PlaceRow before="Weekends" accent="away" items={rows.weekends} />
      <PlaceRow before="One night" accent="away" items={rows.overnight} width={170} height={190} />

      <View>
        <SectionHeader>
          <AccentTitle before="Made for your" accent="taste" variant="heading" />
        </SectionHeader>
        <Row gap={8}>
          {TASTES.map((t, i) => (
            <Chip key={t.label} label={t.label} selected={taste === i} onPress={() => setTaste(i)} />
          ))}
        </Row>
        <View style={{ height: 14 }} />
        <Row gap={14}>
          {tasteItems.map((i) => (
            <TasteCard key={`${i.slug}-${i.name}`} item={i} />
          ))}
        </Row>
      </View>

      <View>
        <SectionHeader action="Explore" onAction={() => router.push('/explore')}>
          <AccentTitle before="Picked for" accent="you" variant="heading" />
        </SectionHeader>
        <View style={{ paddingHorizontal: GUTTER, gap: 12 }}>
          {pairs(rows.picked).map((pair, i) => (
            <View key={i} style={{ flexDirection: 'row', gap: 12 }}>
              {pair.map((p) => (
                <PickCard key={p.slug} item={p} />
              ))}
              {pair.length === 1 && <View style={{ flex: 1 }} />}
            </View>
          ))}
        </View>
      </View>

      <Text variant="tiny" style={{ paddingHorizontal: GUTTER, fontSize: 10, lineHeight: 14 }}>
        {PHOTO_CREDITS}
      </Text>
    </View>
  );
}

function PlaceRow({ before, accent, items, width, height }: { before: string; accent: string; items: typeof rows.islands; width?: number; height?: number }) {
  return (
    <View>
      <SectionHeader action="See all" onAction={() => router.push('/explore')}>
        <AccentTitle before={before} accent={accent} variant="heading" />
      </SectionHeader>
      <Row>
        {items.map((i) => (
          <PlaceCard key={i.slug} item={i} width={width} height={height} />
        ))}
      </Row>
    </View>
  );
}

function Friends() {
  return (
    <View style={{ paddingHorizontal: GUTTER, gap: 18 }}>
      <Text variant="tiny">Preview: these are sample trips. Your friends’ real trips arrive with friends.</Text>
      {friendsFeed.map((f) => (
        <FeedCard key={`${f.who}-${f.place}`} item={f} />
      ))}
    </View>
  );
}

function pairs<T>(xs: T[]): T[][] {
  const out: T[][] = [];
  xs.forEach((x, i) => (i % 2 ? out[out.length - 1].push(x) : out.push([x])));
  return out;
}
