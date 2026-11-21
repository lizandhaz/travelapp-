import { Image } from 'expo-image';
import { Pressable, View, type ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { colors, fonts, radius } from '@/constants/theme';
import type { Board, BoardItem } from '@/lib/boards';
import { photos, type PhotoName } from '@/lib/photos';
import { getPlace, photoForPlaceName, places } from '@/lib/sample';
import { Text } from './Text';

/** The sample photo for a saved place, if we have one. */
export function photoForItem(item: Pick<BoardItem, 'slug' | 'name'>): PhotoName | null {
  return (item.slug ? getPlace(item.slug)?.photo : null) ?? photoForPlaceName(item.name);
}

/** A sample place page for a saved place, if there is one. */
export function placeSlugForItem(item: Pick<BoardItem, 'slug' | 'name'>): string | null {
  if (item.slug && getPlace(item.slug)) return item.slug;
  const n = item.name.trim().toLowerCase().replace(/^the /, '');
  return places.find((p) => p.name.toLowerCase().replace(/^the /, '') === n)?.slug ?? null;
}

/** The four-point star used for "Want to go" (teal). */
export function WishStar({ size = 12, color = colors.teal }: { size?: number; color?: string }) {
  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path d="M12 1.5c.6 5.4 2.6 8.4 9.5 10.5-6.9 2.1-8.9 5.1-9.5 10.5-.6-5.4-2.6-8.4-9.5-10.5C9.4 9.9 11.4 6.9 12 1.5z" fill={color} />
      </Svg>
    </View>
  );
}

/** A square photo for a place, or its first letter on sand. */
export function PlaceThumb({ item, size = 56, style }: { item: Pick<BoardItem, 'slug' | 'name'>; size?: number; style?: ViewStyle }) {
  const photo = photoForItem(item);
  return (
    <View style={[{ width: size, height: size, borderRadius: radius.sm + 4, overflow: 'hidden', backgroundColor: colors.sand, alignItems: 'center', justifyContent: 'center' }, style]}>
      {photo ? (
        <Image source={photos[photo]} style={{ width: size, height: size }} contentFit="cover" />
      ) : (
        <Text style={{ fontFamily: fonts.display, fontSize: size * 0.4, color: colors.terracottaText }}>{item.name.trim()[0]?.toUpperCase()}</Text>
      )}
    </View>
  );
}

/** A list's cover: up to three of its places' photos (one big, two small), or an empty tile. */
export function ListCover({ board, style }: { board: Board; style?: ViewStyle }) {
  const shown = board.items.slice(0, 3);
  const tile = (item: BoardItem | undefined, flex: number) =>
    item ? (
      <View style={{ flex }}>
        <PlaceThumb item={item} size={400} style={{ width: '100%', height: '100%', borderRadius: 0 }} />
      </View>
    ) : null;
  return (
    <View style={[{ aspectRatio: 1, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.sand, flexDirection: 'row', gap: 2 }, style]}>
      {shown.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          {board.kind === 'wish' ? <WishStar size={28} /> : <Text style={{ fontFamily: fonts.display, fontSize: 36, color: colors.muted }}>{board.name.trim()[0]?.toUpperCase()}</Text>}
        </View>
      ) : (
        <>
          {tile(shown[0], 2)}
          {shown.length > 1 && (
            <View style={{ flex: 1, gap: 2 }}>
              {tile(shown[1], 1)}
              {tile(shown[2], 1)}
            </View>
          )}
        </>
      )}
    </View>
  );
}

/**
 * One-tap "Want to go": a pill on a photo (variant "photo") or a full-width
 * button (variant "block"). Teal with a tick once it's on your list.
 */
export function WantToGoButton({
  saved,
  busy,
  onPress,
  variant,
  style,
}: {
  saved: boolean;
  busy?: boolean;
  onPress: () => void;
  variant: 'photo' | 'block';
  style?: ViewStyle;
}) {
  const block = variant === 'block';
  return (
    <Pressable
      onPress={onPress}
      disabled={busy}
      accessibilityRole="button"
      accessibilityState={{ selected: saved, busy }}
      accessibilityLabel={saved ? 'On your Want to go list. Tap to remove' : 'Add to your Want to go list'}
      hitSlop={6}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 7,
          borderRadius: radius.pill,
          paddingHorizontal: block ? 18 : 14,
          paddingVertical: block ? 14 : 9,
          backgroundColor: saved ? colors.teal : block ? colors.card : 'rgba(255,255,255,0.94)',
          borderWidth: block && !saved ? 1.5 : 0,
          borderColor: colors.teal,
        },
        style,
      ]}
    >
      <WishStar size={block ? 16 : 14} color={saved ? colors.onDark : colors.teal} />
      <Text style={{ fontFamily: fonts.sansSemiBold, fontSize: block ? 16 : 14, color: saved ? colors.onDark : colors.teal }}>
        {saved ? 'Want to go ✓' : 'Want to go'}
      </Text>
    </Pressable>
  );
}
