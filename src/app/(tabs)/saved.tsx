import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Dimensions, Pressable, View } from 'react-native';

import { AccentTitle } from '@/components/AccentTitle';
import { SavedTripCard } from '@/components/cards';
import { useSavedTrips } from '@/lib/reactions';
import { PlusIcon } from '@/components/Icons';
import { ListCover, WishStar } from '@/components/lists';
import { Text } from '@/components/Text';
import { Button, Card, PageTitle, Screen } from '@/components/ui';
import { colors, GUTTER, radius } from '@/constants/theme';
import { boardMeta, ensureWishList, fetchBoards, WISH_LIST_NAME, type Board } from '@/lib/boards';

/** Saved: your "Want to go" list, the lists you've made, and friends' trips you've saved. */
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

  const savedTrips = useSavedTrips();
  const half = Math.floor((Math.min(Dimensions.get('window').width, 480) - GUTTER * 2 - 14) / 2);
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
      <PageTitle label="Saved" right={<Button title="+ New board" size="sm" onPress={() => router.push('/list/new')} />}>
        <AccentTitle before="Your" accent="boards" />
      </PageTitle>

      {error ? (
        <Card style={{ marginHorizontal: GUTTER, padding: 16, gap: 8 }}>
          <Text variant="body">{error}</Text>
          <Pressable accessibilityRole="button" onPress={() => load()} hitSlop={8}>
            <Text variant="link">Try again</Text>
          </Pressable>
        </Card>
      ) : !boards ? (
        <ActivityIndicator color={colors.accent} />
      ) : (
        <View style={{ paddingHorizontal: GUTTER, gap: 22 }}>
          <Pressable
            onPress={openWish}
            disabled={opening}
            accessibilityRole="button"
            accessibilityLabel={`${WISH_LIST_NAME}, ${wish ? boardMeta(wish) : 'no places yet'}`}
          >
            <Card tone="cream" style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 12 }}>
              {wish ? (
                <ListCover board={wish} style={{ width: 76, borderRadius: radius.md }} />
              ) : (
                <View style={{ width: 76, height: 76, borderRadius: radius.md, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' }}>
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
              {opening && <ActivityIndicator color={colors.accent} />}
            </Card>
          </Pressable>

          <View style={{ gap: 14 }}>
            <Text variant="heading" accessibilityRole="header">
              Made by you
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
              {/* Same shape as a list: a square, then a name and a line underneath. */}
              <Pressable onPress={() => router.push('/list/new')} accessibilityRole="button" accessibilityLabel="New board" style={{ width: '47%' }}>
                <View
                  style={{
                    aspectRatio: 1,
                    borderRadius: radius.lg,
                    borderWidth: 1.5,
                    borderStyle: 'dashed',
                    borderColor: colors.line,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' }}>
                    <PlusIcon color={colors.stamp} size={22} strokeWidth={2.4} />
                  </View>
                </View>
                <Text variant="strong" style={{ marginTop: 8 }}>
                  New board
                </Text>
                <Text variant="tiny">Start a board</Text>
              </Pressable>
            </View>
          </View>

          {savedTrips.length > 0 && (
            <View style={{ gap: 14 }}>
              <Text variant="heading" accessibilityRole="header">
                Friends’ trips
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14 }}>
                {savedTrips.map((id) => (
                  <SavedTripCard key={id} id={id} width={half} />
                ))}
              </View>
            </View>
          )}
        </View>
      )}
    </Screen>
  );
}
