import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, ScrollView, View, type ViewStyle } from 'react-native';

import { colors, fonts, GUTTER, radius } from '@/constants/theme';
import type { BoardItem, FeedItem, RowItem, TasteItem } from '@/lib/sample';
import { useTaste } from '@/lib/taste';
import { Avatar } from './Avatar';
import { MonthPill } from './MonthPill';
import { PhotoFill, PhotoTile, Shade } from './Photo';
import { ScoreStamp } from './ScoreStamp';
import { Text } from './Text';
import { Card } from './ui';
import { friendTripId } from '@/lib/friendTrips';

const openPlace = (slug: string | null) => slug && router.push(`/place/${slug}`);

/** Your personal score for a sample place (falls back to the card's own score). */
function usePersonalScore(slug: string | null, fallback: number | undefined) {
  const t = useTaste();
  const r = slug ? t.forSlug(slug) : null;
  return { score: r?.score ?? fallback ?? null };
}

/** A sideways-scrolling row of cards with the screen's side padding. */
export function Row({ children, gap = 12 }: { children: React.ReactNode; gap?: number }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap, paddingHorizontal: GUTTER }}>
      {children}
    </ScrollView>
  );
}

/** Pill badge on a photo ("#1", "Eat"): white, or terracotta with `accent`. */
export function PhotoBadge({ text, style, accent = false }: { text: string; style?: ViewStyle; accent?: boolean }) {
  return (
    <View style={[{ backgroundColor: accent ? colors.accentDeep : 'rgba(255,255,255,0.94)', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3 }, style]}>
      <Text style={{ fontFamily: fonts.sansSemiBold, fontSize: 11, color: accent ? colors.onDark : colors.ink }}>{text}</Text>
    </View>
  );
}

/** Portrait photo with the name written on it (Where's trending, Trending this month). */
export function TrendCard({ item, width = 150, height = 190 }: { item: RowItem; width?: number; height?: number }) {
  return (
    <Pressable onPress={() => openPlace(item.slug)} accessibilityRole="link" accessibilityLabel={`${item.rank} ${item.name}, ${item.sub}`} style={{ width }}>
      <PhotoTile photo={item.photo} style={{ width, height }}>
        {!!item.rank && <PhotoBadge text={item.rank} accent style={{ position: 'absolute', top: 10, left: 10 }} />}
        <View style={{ position: 'absolute', left: 12, right: 12, bottom: 12 }}>
          <Text style={{ fontFamily: fonts.display, fontSize: 19, lineHeight: 22, color: colors.onDark }}>{item.name}</Text>
          {item.score == null && width <= 160 && (
            <Text style={{ fontFamily: fonts.sans, fontSize: 11, color: colors.onDark, opacity: 0.9 }}>{item.sub}</Text>
          )}
        </View>
      </PhotoTile>
      {width > 160 && (
        <Text variant="tiny" style={{ marginTop: 6, color: colors.accentText }}>
          {item.sub}
        </Text>
      )}
    </Pressable>
  );
}

/** Photo with a score stamp, name and a line below (Island escapes, Weekends away…). */
export function PlaceCard({ item, width = 200, height = 220 }: { item: RowItem; width?: number; height?: number }) {
  const { score } = usePersonalScore(item.slug, item.score);
  return (
    <Pressable onPress={() => openPlace(item.slug)} accessibilityRole="link" accessibilityLabel={`${item.name}, ${item.sub}`} style={{ width }}>
      <PhotoTile photo={item.photo} style={{ width, height }} shade={false}>
        {score != null && (
          <View style={{ position: 'absolute', top: 8, right: 8 }}>
            <ScoreStamp score={score} size="sm" />
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
  const t = useTaste();
  // Judged on the thing itself (friends who went, and how much you go for this kind of thing),
  // not on places you've saved.
  const { score, note } = t.forItem(item);
  return (
    <Pressable onPress={() => openPlace(item.slug)} accessibilityRole="link" accessibilityLabel={`${item.kind}: ${item.name}, ${score.toFixed(1)} out of 10. ${note}`} style={{ width }}>
      <PhotoTile photo={item.photo} style={{ width, height: 160 }} shade={false}>
        <PhotoBadge text={item.kind} style={{ position: 'absolute', top: 10, left: 10 }} />
        <View style={{ position: 'absolute', top: 8, right: 8 }}>
          <ScoreStamp score={score} size="sm" />
        </View>
      </PhotoTile>
      <Text variant="subheading" style={{ marginTop: 8 }}>
        {item.name}
      </Text>
      <Text variant="tiny" style={{ color: colors.accentText, marginTop: 1 }}>
        {item.where}
      </Text>
      <Text variant="tiny" style={{ marginTop: 4, color: colors.ink }}>
        ✦ {note}
      </Text>
    </Pressable>
  );
}

/** One friend's trip in the Friends feed: a big photo with who, when, where and their score, then their words and stay. */
export function FeedCard({ item }: { item: FeedItem }) {
  const open = () => router.push(`/friend-trip/${friendTripId(item)}`);
  const label = `${item.who}'s ${item.place} trip, ${item.month}. ${item.score.toFixed(1)} out of 10. Open their trip`;
  return (
    <Pressable onPress={open} accessibilityRole="link" accessibilityLabel={label} style={({ pressed }) => pressed && { opacity: 0.92 }}>
      <Card>
        {item.photo ? (
          <View style={{ height: 380 }}>
            <PhotoFill photo={item.photo} />
            <LinearGradient colors={['rgba(0,0,0,0.38)', 'transparent']} style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 110 }} />
            <Shade strength={0.6} />
            <View style={{ position: 'absolute', top: 14, left: 14, right: 14, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ borderWidth: 2, borderColor: colors.onDark, borderRadius: 22 }}>
                <Avatar face={item.face} name={item.who} size={36} />
              </View>
              <Text style={{ flex: 1, fontFamily: fonts.sansSemiBold, fontSize: 15, color: colors.onDark }}>{item.who}</Text>
              <MonthPill month={item.month} onPhoto />
            </View>
            <View style={{ position: 'absolute', left: 18, right: 18, bottom: 18, flexDirection: 'row', alignItems: 'flex-end', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: fonts.displayBold, fontSize: 34, lineHeight: 38, color: colors.onDark }}>{item.place}</Text>
                <Text variant="label" style={{ color: colors.onDark, marginTop: 2 }}>
                  {item.region}
                </Text>
              </View>
              <ScoreStamp score={item.score} size="md" label="Destination" />
            </View>
          </View>
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 16 }}>
            <Avatar face={item.face} name={item.who} size={36} />
            <View style={{ flex: 1 }}>
              <Text variant="strong">
                {item.who}’s {item.place} trip
              </Text>
              <Text variant="tiny">{item.region}</Text>
            </View>
            <MonthPill month={item.month} />
            <ScoreStamp score={item.score} size="sm" label="Destination" />
          </View>
        )}
        <View style={{ padding: 16, gap: 14 }}>
          {!!item.quote && <Text variant="quote">{item.quote}</Text>}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.sageSoft, borderRadius: radius.md, padding: 10 }}>
            <ScoreStamp score={item.stayScore} size="sm" tone="olive" label={item.stayType} />
            <View style={{ flex: 1 }}>
              <Text variant="label" style={{ fontSize: 10 }}>
                Stayed at · {item.stayType}
              </Text>
              <Text variant="strong" style={{ fontSize: 15 }}>
                {item.stayName}
              </Text>
            </View>
            <Text variant="small" style={{ color: colors.accentText }}>
              Their trip →
            </Text>
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

/** A tile on the Explore board (masonry style). */
export function BoardTile({ item, height }: { item: BoardItem & { href?: string }; height: number }) {
  const isPlace = item.kind === 'place';
  const { score } = usePersonalScore(isPlace ? item.slug : null, item.score);
  return (
    <Pressable
      onPress={() => (item.href ? router.push(item.href as never) : openPlace(item.slug))}
      accessibilityRole={item.slug || item.href ? 'link' : undefined}
      accessibilityLabel={`${item.kind === 'place' ? '' : `${item.kind}: `}${item.name}. ${item.sub}`}
      style={{ marginBottom: 14 }}
    >
      <PhotoTile photo={item.photo} style={{ height, borderRadius: radius.md }} shade={false}>
        {isPlace && score != null ? (
          <View style={{ position: 'absolute', top: 8, left: 8 }}>
            <ScoreStamp score={score} size="sm" />
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
