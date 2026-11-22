import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { ListCover, WishStar } from '@/components/lists';
import { Text } from '@/components/Text';
import { BackButton, Button, Card, ErrorNotice, PageTitle, Screen } from '@/components/ui';
import { colors, fonts, GUTTER, radius } from '@/constants/theme';
import { addToBoard, boardMeta, ensureWishList, fetchBoards, findOnBoard, removeFromBoard, WISH_LIST_NAME, type Board } from '@/lib/boards';

/**
 * "Save to a list" from a place page (?place=…&country=…&slug=…):
 * tick the lists it should be on, or start a new one.
 */
export default function SaveToList() {
  const { place, country = '', slug } = useLocalSearchParams<{ place: string; country?: string; slug?: string }>();
  const target = { name: place ?? '', country, slug: slug || null };
  const [boards, setBoards] = useState<Board[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<{ message: string } | null>(null);

  const load = useCallback(() => {
    fetchBoards()
      .then(setBoards)
      .catch((e: Error) => setError({ message: e.message }));
  }, []);
  useFocusEffect(load);

  const wish = boards?.find((b) => b.kind === 'wish');
  const lists = boards?.filter((b) => b.kind !== 'wish') ?? [];

  async function toggle(board: Board | undefined) {
    const key = board?.id ?? 'wish';
    setBusyId(key);
    setError(null);
    try {
      const id = board?.id ?? (await ensureWishList());
      const item = board ? findOnBoard(board, target) : undefined;
      if (item) await removeFromBoard(item.id);
      else await addToBoard(id, target);
      setBoards(await fetchBoards());
    } catch (e) {
      setError({ message: e instanceof Error ? e.message : 'Something went wrong.' });
    } finally {
      setBusyId(null);
    }
  }

  const row = (board: Board | undefined, title: string, meta: string, isWish = false) => {
    const on = !!board && !!findOnBoard(board, target);
    const key = board?.id ?? 'wish';
    return (
      <Pressable
        key={key}
        onPress={() => toggle(board)}
        disabled={busyId !== null}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: on, busy: busyId === key }}
        accessibilityLabel={`${title}, ${meta}`}
      >
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, borderColor: on ? colors.ink : colors.line }}>
          {board && board.items.length ? (
            <ListCover board={board} style={{ width: 52, borderRadius: radius.sm + 4 }} />
          ) : (
            <View style={{ width: 52, height: 52, borderRadius: radius.sm + 4, backgroundColor: colors.sand, alignItems: 'center', justifyContent: 'center' }}>
              {isWish ? <WishStar size={20} /> : <Text style={{ fontFamily: fonts.display, fontSize: 22, color: colors.muted }}>{title[0]?.toUpperCase()}</Text>}
            </View>
          )}
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              {isWish && <WishStar />}
              <Text variant="strong" numberOfLines={1}>
                {title}
              </Text>
            </View>
            <Text variant="tiny">{meta}</Text>
          </View>
          {busyId === key ? (
            <ActivityIndicator color={colors.accent} />
          ) : (
            <View
              style={{
                width: 26,
                height: 26,
                borderRadius: 13,
                borderWidth: 1.5,
                borderColor: on ? colors.ink : colors.line,
                backgroundColor: on ? colors.ink : colors.card,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {on && <Text style={{ fontFamily: fonts.sansSemiBold, fontSize: 14, lineHeight: 16, color: colors.onDark }}>✓</Text>}
            </View>
          )}
        </Card>
      </Pressable>
    );
  };

  return (
    <Screen>
      <View style={{ paddingHorizontal: GUTTER, paddingTop: 14 }}>
        <BackButton />
      </View>
      <PageTitle label="Save to a board">
        <Text variant="title">{place}</Text>
      </PageTitle>
      {!boards && !error ? (
        <ActivityIndicator color={colors.accent} />
      ) : (
        <View style={{ paddingHorizontal: GUTTER, gap: 10 }}>
          {row(wish, WISH_LIST_NAME, wish ? boardMeta(wish) : 'Places you’d love to go', true)}
          {lists.map((b) => row(b, b.name, boardMeta(b)))}
          <ErrorNotice error={error} />
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 10 }}>
            <Button
              title="+ New board"
              kind="outline"
              style={{ flex: 1 }}
              onPress={() => router.push({ pathname: '/list/new', params: { place: target.name, country: target.country, slug: target.slug ?? '' } })}
            />
            <Button title="Done" style={{ flex: 1 }} onPress={() => router.back()} />
          </View>
        </View>
      )}
    </Screen>
  );
}
