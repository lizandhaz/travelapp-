import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { placeSlugForItem, PlaceThumb, WishStar } from '@/components/lists';
import { Text } from '@/components/Text';
import { PlacePicker } from '@/components/trip/PlacePicker';
import { BackButton, Button, Card, ErrorNotice, Notice, Screen } from '@/components/ui';
import { colors, fonts, GUTTER } from '@/constants/theme';
import { addToBoard, boardMeta, deleteBoard, fetchBoard, findOnBoard, removeFromBoard, shareBoard, type Board } from '@/lib/boards';
import { countryOf } from '@/lib/knownPlaces';
import { fetchPlaces, placeLabel, type Place } from '@/lib/trips';

/** One of your lists: its places, add a place, share, rename and delete. */
export default function ListScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [board, setBoard] = useState<Board | null | undefined>(undefined);
  const [error, setError] = useState<{ message: string } | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [adding, setAdding] = useState<Place | null>(null);
  const [pickerKey, setPickerKey] = useState(0);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  const load = useCallback(
    () =>
      fetchBoard(id)
        .then((b) => {
          setBoard(b);
          setError(null);
        })
        .catch((e: Error) => setError({ message: e.message })),
    [id],
  );

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );
  useEffect(() => {
    fetchPlaces().then(setPlaces);
  }, []);

  async function add() {
    if (!board || !adding?.name.trim()) return;
    const place = { ...adding, country: countryOf(adding) };
    if (findOnBoard(board, place)) {
      setNote(`${placeLabel(place)} is already on this list.`);
      return;
    }
    setBusy(true);
    try {
      await addToBoard(board.id, place);
      setAdding(null);
      setPickerKey((k) => k + 1);
      setNote(null);
      await load();
    } catch (e) {
      setError({ message: e instanceof Error ? e.message : 'Something went wrong.' });
    } finally {
      setBusy(false);
    }
  }

  async function remove(itemId: string) {
    if (!board) return;
    setBoard({ ...board, items: board.items.filter((i) => i.id !== itemId) }); // feels instant
    try {
      await removeFromBoard(itemId);
    } catch (e) {
      setError({ message: e instanceof Error ? e.message : 'Something went wrong.' });
      load();
    }
  }

  async function share() {
    if (!board) return;
    const ok = await shareBoard(board);
    setNote(ok ? null : 'Sharing isn’t available on this device.');
  }

  async function removeList() {
    if (!board) return;
    setBusy(true);
    try {
      await deleteBoard(board.id);
      router.back();
    } catch (e) {
      setError({ message: e instanceof Error ? e.message : 'Something went wrong.' });
      setBusy(false);
    }
  }

  if (!board) {
    return (
      <Screen>
        <View style={{ padding: GUTTER, paddingTop: 14, gap: 16 }}>
          <BackButton />
          {error ? (
            <Text variant="body">{error.message}</Text>
          ) : board === null ? (
            <Text variant="body">That list couldn’t be found. It may have been deleted.</Text>
          ) : (
            <ActivityIndicator color={colors.terracotta} />
          )}
        </View>
      </Screen>
    );
  }

  const isWish = board.kind === 'wish';

  return (
    <Screen>
      <View style={{ paddingHorizontal: GUTTER, paddingTop: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <BackButton />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Button title="Share" kind="outline" size="sm" onPress={share} accessibilityHint="Send this list to friends by message or email" />
          <Button title="Edit" kind="outline" size="sm" onPress={() => router.push({ pathname: '/list/new', params: { id: board.id } })} />
        </View>
      </View>

      <View style={{ paddingHorizontal: GUTTER, marginTop: 18, gap: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {isWish && <WishStar size={18} />}
          <Text variant="title" accessibilityRole="header" style={{ flexShrink: 1 }}>
            {board.name}
          </Text>
        </View>
        <Text variant="small">{boardMeta(board)}</Text>
      </View>

      <View style={{ paddingHorizontal: GUTTER, marginTop: 20, gap: 10 }}>
        <Text variant="label">Add a place</Text>
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <PlacePicker key={pickerKey} value={adding} onChange={setAdding} places={places} accessibilityLabel="Add a place" />
          </View>
          <Button title={busy ? '…' : 'Add'} disabled={busy || !adding?.name.trim()} onPress={add} style={{ paddingHorizontal: 18 }} />
        </View>
        {!!note && <Text variant="small">{note}</Text>}
        <ErrorNotice error={error} />
      </View>

      <View style={{ paddingHorizontal: GUTTER, marginTop: 22, gap: 10 }}>
        {board.items.length === 0 ? (
          <Card style={{ padding: 18 }}>
            <Text variant="body">No places yet. Add one above, or tap “Save to a list” on any place page.</Text>
          </Card>
        ) : (
          board.items.map((item) => {
            const slug = placeSlugForItem(item);
            return (
              <Card key={item.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10 }}>
                <Pressable
                  style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 }}
                  disabled={!slug}
                  onPress={() => slug && router.push(`/place/${slug}`)}
                  accessibilityRole={slug ? 'link' : 'text'}
                  accessibilityLabel={placeLabel(item)}
                >
                  <PlaceThumb item={item} />
                  <View style={{ flex: 1 }}>
                    <Text variant="strong" numberOfLines={1}>
                      {item.name}
                    </Text>
                    {!!item.country && <Text variant="tiny">{item.country}</Text>}
                  </View>
                </Pressable>
                <Pressable
                  onPress={() => remove(item.id)}
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${item.name} from this list`}
                  style={{ width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}
                >
                  <Text style={{ fontFamily: fonts.sans, fontSize: 20, lineHeight: 22, color: colors.muted }}>×</Text>
                </Pressable>
              </Card>
            );
          })
        )}
      </View>

      {!isWish && (
        <View style={{ paddingHorizontal: GUTTER, marginTop: 30 }}>
          {!confirming ? (
            <Button title="Delete list" kind="outline" onPress={() => setConfirming(true)} />
          ) : (
            <Notice>
              <Text variant="strong">Delete “{board.name}”?</Text>
              <Text variant="small" style={{ marginBottom: 12 }}>
                The list and the places on it will be removed. Your trips aren’t affected. This can’t be undone.
              </Text>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <Button title="Keep it" kind="outline" style={{ flex: 1 }} onPress={() => setConfirming(false)} />
                <Button title={busy ? 'Deleting…' : 'Delete'} kind="accent" style={{ flex: 1 }} disabled={busy} onPress={removeList} />
              </View>
            </Notice>
          )}
        </View>
      )}
    </Screen>
  );
}
