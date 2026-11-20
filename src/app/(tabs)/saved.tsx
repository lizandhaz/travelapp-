import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { AccentTitle } from '@/components/AccentTitle';
import { ListCover, WishStar } from '@/components/lists';
import { Text } from '@/components/Text';
import { Button, Card, PageTitle, Screen } from '@/components/ui';
import { colors, GUTTER, radius } from '@/constants/theme';
import { boardMeta, ensureWishList, fetchBoards, WISH_LIST_NAME, type Board } from '@/lib/boards';

/** Saved: your "Want to go" list and the lists you've made. */
export default function Saved() {
  const [boards, setBoards] = useState<Board[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [opening, setOpening] = useState(false);

  const load = useCallback((isActive: () => boolean = () => true) => {
    fetchBoards()
      .then((b) => {
        if (!isActive()) return;
        setBoards(b);
        setError(null);
      })
      .catch((e: Error) => isActive() && setError(e.message));
  }, []);

  // Reload each time Saved comes into view, so changes made elsewhere show up.
  useFocusEffect(
    useCallback(() => {
      let active = true;
      load(() => active);
      return () => {
        active = false;
      };
    }, [load]),
  );

  const wish = boards?.find((b) => b.kind === 'wish') ?? null;
  const lists = boards?.filter((b) => b.kind !== 'wish') ?? [];

  async function openWish() {
    if (wish) return router.push(`/list/${wish.id}`);
    setOpening(true);
    try {
      router.push(`/list/${await ensureWishList()}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setOpening(false);
    }
  }

  return (
    <Screen tabBar>
      <PageTitle label="Saved" right={<Button title="+ New list" size="sm" onPress={() => router.push('/list/new')} />}>
        <AccentTitle before="Your" accent="lists" />
      </PageTitle>

      {error ? (
        <Card style={{ marginHorizontal: GUTTER, padding: 16, gap: 8 }}>
          <Text variant="body">{error}</Text>
          <Pressable accessibilityRole="button" onPress={() => load()} hitSlop={8}>
            <Text variant="link">Try again</Text>
          </Pressable>
        </Card>
      ) : !boards ? (
        <ActivityIndicator color={colors.terracotta} />
      ) : (
        <View style={{ paddingHorizontal: GUTTER, gap: 22 }}>
          <Pressable
            onPress={openWish}
            disabled={opening}
            accessibilityRole="button"
            accessibilityLabel={`${WISH_LIST_NAME}, ${wish ? boardMeta(wish) : 'no places yet'}`}
          >
            <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 12 }}>
              {wish ? (
                <ListCover board={wish} style={{ width: 76, borderRadius: radius.md }} />
              ) : (
                <View style={{ width: 76, height: 76, borderRadius: radius.md, backgroundColor: colors.sand, alignItems: 'center', justifyContent: 'center' }}>
                  <WishStar size={26} />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <WishStar />
                  <Text variant="subheading">{WISH_LIST_NAME}</Text>
                </View>
                <Text variant="small">{wish && wish.items.length ? boardMeta(wish) : 'Places you’d love to go. Save them from any place page.'}</Text>
              </View>
              {opening && <ActivityIndicator color={colors.terracotta} />}
            </Card>
          </Pressable>

          <View style={{ gap: 14 }}>
            <Text variant="heading" accessibilityRole="header">
              Your boards
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14 }}>
              {lists.map((b) => (
                <Pressable key={b.id} style={{ width: '47%' }} onPress={() => router.push(`/list/${b.id}`)} accessibilityRole="button" accessibilityLabel={`${b.name}, ${boardMeta(b)}`}>
                  <ListCover board={b} />
                  <Text variant="strong" numberOfLines={1} style={{ marginTop: 8 }}>
                    {b.name}
                  </Text>
                  <Text variant="tiny">{boardMeta(b)}</Text>
                </Pressable>
              ))}
              <Pressable
                onPress={() => router.push('/list/new')}
                accessibilityRole="button"
                accessibilityLabel="New list"
                style={{
                  width: '47%',
                  aspectRatio: 1,
                  borderRadius: radius.lg,
                  borderWidth: 1.5,
                  borderStyle: 'dashed',
                  borderColor: colors.line,
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <Text variant="heading" style={{ color: colors.muted }}>
                  +
                </Text>
                <Text variant="small">New list</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </Screen>
  );
}
