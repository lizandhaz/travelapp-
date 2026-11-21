import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { colors, fonts } from '@/constants/theme';
import type { ExploreItem } from '@/lib/explore';
import type { PhotoName } from '@/lib/photos';
import type { RowItem } from '@/lib/sample';
import { useTaste } from '@/lib/taste';
import { PhotoBadge } from './cards';
import { PhotoTile } from './Photo';
import { ScoreStamp } from './ScoreStamp';
import { Text } from './Text';

/** A photo tile with a collection's name ("Island escapes"), opening its page. */
export function CollectionTile({ id, title, photo, count }: { id: string; title: string; photo: PhotoName; count: number }) {
  return (
    <Pressable onPress={() => router.push(`/collection/${id}`)} accessibilityRole="link" accessibilityLabel={`${title}, ${count} ${count === 1 ? 'idea' : 'ideas'}`}>
      <PhotoTile photo={photo} style={{ width: 128, height: 160 }}>
        <View style={{ position: 'absolute', left: 10, right: 10, bottom: 10 }}>
          <Text style={{ fontFamily: fonts.display, fontSize: 17, lineHeight: 20, color: colors.onDark }}>{title}</Text>
          <Text style={{ fontFamily: fonts.sansMedium, fontSize: 11, color: colors.onDark, opacity: 0.9, marginTop: 2 }}>{count}</Text>
        </View>
      </PhotoTile>
    </Pressable>
  );
}

/** Places sorted best for you first (your personal score, then the base score). */
export function useSortedForYou(items: RowItem[]): RowItem[] {
  const taste = useTaste();
  return [...items].sort((a, b) => (taste.forSlug(b.slug)?.score ?? b.score ?? 0) - (taste.forSlug(a.slug)?.score ?? a.score ?? 0));
}

/** A restaurant, stay, thing to do or festival from a place, with your score and why. */
export function ItemCard({ item, width = 210 }: { item: ExploreItem; width?: number }) {
  const taste = useTaste();
  const { score, note } = taste.forItem({ slug: item.slug, kind: item.scoreKind, name: item.name, friends: '' });
  return (
    <Pressable
      onPress={() => router.push(`/place/${item.slug}`)}
      accessibilityRole="link"
      accessibilityLabel={`${item.kind}: ${item.name}, ${item.place}. ${score.toFixed(1)} out of 10. ${note}`}
      style={{ width }}
    >
      <PhotoTile photo={item.photo} style={{ width, height: 150 }} shade={false}>
        <PhotoBadge text={item.kind} style={{ position: 'absolute', top: 10, left: 10, maxWidth: width - 80 }} />
        <View style={{ position: 'absolute', top: 8, right: 8 }}>
          <ScoreStamp score={score} size="sm" />
        </View>
      </PhotoTile>
      <Text variant="subheading" numberOfLines={2} style={{ marginTop: 8 }}>
        {item.name}
      </Text>
      <Text variant="tiny" style={{ color: colors.accentText, marginTop: 1 }}>
        {item.place}
      </Text>
      {!!note && (
        <Text variant="tiny" numberOfLines={2} style={{ marginTop: 3, color: colors.ink }}>
          ✦ {note}
        </Text>
      )}
    </Pressable>
  );
}

/** Things sorted best for you first. */
export function useSortedItems(items: ExploreItem[]): ExploreItem[] {
  const taste = useTaste();
  const score = (i: ExploreItem) => taste.forItem({ slug: i.slug, kind: i.scoreKind, name: i.name, friends: '' }).score;
  return [...items].sort((a, b) => score(b) - score(a));
}
