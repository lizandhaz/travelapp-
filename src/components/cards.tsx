import { router } from 'expo-router';
import { Pressable, ScrollView, View, type ViewStyle } from 'react-native';

import { colors, fonts, GUTTER, radius } from '@/constants/theme';
import type { BoardItem, FeedItem, RowItem, TasteItem } from '@/lib/sample';
import { Avatar } from './Avatar';
import { MonthPill } from './MonthPill';
import { PhotoFill, PhotoTile } from './Photo';
import { ScoreStamp } from './ScoreStamp';
import { Text } from './Text';
import { Card } from './ui';

const openPlace = (slug: string | null) => slug && router.push(`/place/${slug}`);

/** A sideways-scrolling row of cards with the screen's side padding. */
export function Row({ children, gap = 12 }: { children: React.ReactNode; gap?: number }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap, paddingHorizontal: GUTTER }}>
      {children}
    </ScrollView>
  );
}

/** White pill badge on a photo ("#1", "Eat", "95% match"). */
export function PhotoBadge({ text, style }: { text: string; style?: ViewStyle }) {
  return (
    <View style={[{ backgroundColor: 'rgba(255,255,255,0.94)', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3 }, style]}>
      <Text style={{ fontFamily: fonts.sansSemiBold, fontSize: 11, color: colors.ink }}>{text}</Text>
    </View>
  );
}

/** Portrait photo with the name written on it (Where's trending, Trending this month). */
export function TrendCard({ item, width = 150, height = 190 }: { item: RowItem; width?: number; height?: number }) {
  return (
    <Pressable onPress={() => openPlace(item.slug)} accessibilityRole="link" accessibilityLabel={`${item.rank} ${item.name}, ${item.sub}`} style={{ width }}>
      <PhotoTile photo={item.photo} style={{ width, height }}>
        {!!item.rank && <PhotoBadge text={item.rank} style={{ position: 'absolute', top: 10, left: 10 }} />}
        <View style={{ position: 'absolute', left: 12, right: 12, bottom: 12 }}>
          <Text style={{ fontFamily: fonts.display, fontSize: 19, lineHeight: 22, color: colors.onDark }}>{item.name}</Text>
          {item.score == null && width <= 160 && (
            <Text style={{ fontFamily: fonts.sans, fontSize: 11, color: colors.onDark, opacity: 0.9 }}>{item.sub}</Text>
          )}
        </View>
      </PhotoTile>
      {width > 160 && (
        <Text variant="tiny" style={{ marginTop: 6 }}>
          {item.sub}
        </Text>
      )}
    </Pressable>
  );
}

/** Photo with a score stamp, name and a line below (Island escapes, Weekends away…). */
export function PlaceCard({ item, width = 200, height = 220 }: { item: RowItem; width?: number; height?: number }) {
  return (
    <Pressable onPress={() => openPlace(item.slug)} accessibilityRole="link" accessibilityLabel={`${item.name}, ${item.sub}`} style={{ width }}>
      <PhotoTile photo={item.photo} style={{ width, height }} shade={false}>
        {item.score != null && (
          <View style={{ position: 'absolute', top: 8, right: 8 }}>
            <ScoreStamp score={item.score} size="sm" />
          </View>
        )}
      </PhotoTile>
      <Text variant="subheading" style={{ marginTop: 8 }}>
        {item.name}
      </Text>
      <Text variant="tiny">{item.sub}</Text>
    </Pressable>
  );
}

/** "Made for your taste": a thing to eat, drink, do or stay, with why it's picked. */
export function TasteCard({ item, width = 220 }: { item: TasteItem; width?: number }) {
  return (
    <Pressable onPress={() => openPlace(item.slug)} accessibilityRole="link" style={{ width }}>
      <PhotoTile photo={item.photo} style={{ width, height: 160 }} shade={false}>
        <PhotoBadge text={item.kind} style={{ position: 'absolute', top: 10, left: 10 }} />
        <PhotoBadge text={item.match} style={{ position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(150,199,184,0.95)' }} />
      </PhotoTile>
      <Text variant="subheading" style={{ marginTop: 8 }}>
        {item.name}
      </Text>
      <Text variant="tiny" style={{ color: colors.terracottaText, marginTop: 1 }}>
        {item.where}
      </Text>
      <Text variant="tiny" style={{ marginTop: 4, color: colors.ink }}>
        ✦ {item.because}
      </Text>
      <Text variant="tiny" style={{ marginTop: 2 }}>
        {item.friends}
      </Text>
    </Pressable>
  );
}

/** "Picked for you": a white card with photo, stamp and the reason. */
export function PickCard({ item }: { item: RowItem }) {
  return (
    <Pressable onPress={() => openPlace(item.slug)} accessibilityRole="link" style={{ flex: 1 }}>
      <Card>
        <View style={{ height: 150 }}>
          <PhotoFill photo={item.photo} />
          {item.score != null && (
            <View style={{ position: 'absolute', top: 8, right: 8 }}>
              <ScoreStamp score={item.score} size="sm" />
            </View>
          )}
        </View>
        <View style={{ padding: 12 }}>
          <Text variant="subheading">{item.name}</Text>
          <Text variant="tiny">{item.sub}</Text>
        </View>
      </Card>
    </Pressable>
  );
}

/** One friend's trip in the Friends feed. */
export function FeedCard({ item }: { item: FeedItem }) {
  return (
    <Card>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14 }}>
        <Avatar face={item.face} name={item.who} size={36} />
        <View style={{ flex: 1 }}>
          <Text variant="body" style={{ fontSize: 15 }}>
            <Text variant="strong">{item.who}</Text> went to <Text variant="strong">{item.place}</Text>
          </Text>
          <Text variant="tiny">{item.region}</Text>
        </View>
        <MonthPill month={item.month} />
      </View>
      {item.photo && (
        <Pressable onPress={() => openPlace(item.slug)} accessibilityRole="link" accessibilityLabel={`Open ${item.place}`} style={{ height: 300 }}>
          <PhotoFill photo={item.photo} />
        </Pressable>
      )}
      <View style={{ padding: 16, gap: 14 }}>
        {!!item.quote && <Text variant="quote">{item.quote}</Text>}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <ScoreStamp score={item.score} size="sm" label="Destination" />
          <View style={{ flex: 1 }}>
            <Text variant="label" style={{ fontSize: 10 }}>
              Destination
            </Text>
            <Text variant="body" style={{ fontSize: 14 }}>
              {item.place}
            </Text>
          </View>
          <ScoreStamp score={item.stayScore} size="sm" tone="teal" label={item.stayType} />
          <View style={{ flex: 1 }}>
            <View style={{ alignSelf: 'flex-start', backgroundColor: 'rgba(150,199,184,0.35)', borderRadius: 999, paddingHorizontal: 7, paddingVertical: 1 }}>
              <Text variant="label" style={{ fontSize: 9, color: colors.teal }}>
                {item.stayType}
              </Text>
            </View>
            <Text variant="body" style={{ fontSize: 14 }}>
              {item.stayName}
            </Text>
          </View>
        </View>
      </View>
    </Card>
  );
}

/** A tile on the Explore board (masonry style). */
export function BoardTile({ item, height }: { item: BoardItem; height: number }) {
  const isPlace = item.kind === 'place';
  return (
    <Pressable onPress={() => openPlace(item.slug)} accessibilityRole={item.slug ? 'link' : undefined} style={{ marginBottom: 14 }}>
      <PhotoTile photo={item.photo} style={{ height, borderRadius: radius.md }} shade={false}>
        {isPlace && item.score != null ? (
          <View style={{ position: 'absolute', top: 8, left: 8 }}>
            <ScoreStamp score={item.score} size="sm" />
          </View>
        ) : (
          <PhotoBadge text={item.kind} style={{ position: 'absolute', top: 8, left: 8 }} />
        )}
      </PhotoTile>
      <Text variant="strong" style={{ marginTop: 6 }}>
        {item.name}
      </Text>
      <Text variant="tiny">{item.sub}</Text>
    </Pressable>
  );
}
