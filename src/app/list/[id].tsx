import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LockIcon, PencilIcon, PlusIcon, ShareIcon } from '@/components/Icons';
import { photoForItem, placeSlugForItem, WishStar } from '@/components/lists';
import { PhotoFill, Shade } from '@/components/Photo';
import { ScoreStamp } from '@/components/ScoreStamp';
import { Text } from '@/components/Text';
import { PlacePicker } from '@/components/trip/PlacePicker';
import { BackButton, Button, Card, ErrorNotice, IconCircle, Notice, Screen } from '@/components/ui';
import { colors, fonts, GUTTER, radius } from '@/constants/theme';
import { addToBoard, deleteBoard, fetchBoard, findOnBoard, removeFromBoard, shareBoard, type Board, type BoardItem } from '@/lib/boards';
import { countryOf } from '@/lib/knownPlaces';
import { useTaste } from '@/lib/taste';
import { fetchPlaces, placeLabel, type Place } from '@/lib/trips';

/** One of your lists: a photo cover, its places as photo cards, add a place, share, edit and delete. */
export default function ListScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
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
            <ActivityIndicator color={colors.accent} />
          )}
        </View>
      </Screen>
    );
  }

  const isWish = board.kind === 'wish';
  const n = board.items.length;
  const screenW = Math.min(Dimensions.get('window').width, 480);
  const tileW = (screenW - GUTTER * 2 - 12) / 2;

  return (
    <Screen noTopInset>
      {/* Cover: the list's places as a photo collage, with the name on it */}
      <View style={{ height: screenW * 0.92, backgroundColor: colors.sand }}>
        <Cover items={board.items} isWish={isWish} name={board.name} />
        <View style={{ position: 'absolute', top: insets.top + 10, left: GUTTER, right: GUTTER, flexDirection: 'row', justifyContent: 'space-between' }}>
          <BackButton onPhoto />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <IconCircle label="Share this list" onPress={share} style={{ borderWidth: 0 }}>
              <ShareIcon color={colors.ink} />
            </IconCircle>
            <IconCircle label="Edit this list" onPress={() => router.push({ pathname: '/list/new', params: { id: board.id } })} style={{ borderWidth: 0 }}>
              <PencilIcon color={colors.ink} />
            </IconCircle>
          </View>
        </View>
        <View style={{ position: 'absolute', left: GUTTER, right: GUTTER, bottom: 22 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            {isWish && <WishStar size={12} color={colors.onDark} />}
            <Text variant="label" style={{ color: colors.onDark, opacity: 0.95 }}>
              {isWish ? 'Your wish list' : 'Your list'}
            </Text>
          </View>
          <Text accessibilityRole="header" style={{ fontFamily: fonts.displayBold, fontSize: 42, lineHeight: 46, color: colors.onDark, marginTop: 2 }}>
            {board.name}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <Text variant="small" style={{ color: colors.onDark }}>
              {n} {n === 1 ? 'place' : 'places'} ·
            </Text>
            {board.visibility === 'private' && <LockIcon color={colors.onDark} size={12} />}
            <Text variant="small" style={{ color: colors.onDark }}>
              {board.visibility === 'friends' ? 'Friends can see' : 'Just me'}
            </Text>
          </View>
        </View>
      </View>

      {/* Places */}
      <View style={{ paddingHorizontal: GUTTER, marginTop: 22 }}>
        {n === 0 ? (
          <Card style={{ padding: 24, alignItems: 'center', gap: 10 }}>
            <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: colors.sage + '40', alignItems: 'center', justifyContent: 'center' }}>
              <WishStar size={24} />
            </View>
            <Text variant="subheading">Nothing here yet</Text>
            <Text variant="small" style={{ textAlign: 'center' }}>
              Add a place below, or tap {isWish ? '“Want to go”' : '“Save to a list”'} on any place page.
            </Text>
          </Card>
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, rowGap: 14 }}>
            {board.items.map((item) => (
              <PlaceTile key={item.id} item={item} width={tileW} onRemove={() => remove(item.id)} />
            ))}
          </View>
        )}
      </View>

      {/* Add a place */}
      <Card style={{ marginHorizontal: GUTTER, marginTop: 22, padding: 14, gap: 10 }}>
        <Text variant="label">Add a place</Text>
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <PlacePicker key={pickerKey} value={adding} onChange={setAdding} places={places} accessibilityLabel="Add a place" />
          </View>
          <Pressable
            onPress={add}
            disabled={busy || !adding?.name.trim()}
            accessibilityRole="button"
            accessibilityLabel="Add"
            style={{
              width: 52,
              height: 52,
              borderRadius: 26,
              backgroundColor: adding?.name.trim() ? colors.ink : colors.line,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {busy ? <ActivityIndicator color={colors.onDark} /> : <PlusIcon color={adding?.name.trim() ? colors.stamp : colors.muted} size={22} />}
          </Pressable>
        </View>
        {!!note && <Text variant="small">{note}</Text>}
      </Card>
      <View style={{ paddingHorizontal: GUTTER, marginTop: 10 }}>
        <ErrorNotice error={error} />
      </View>

      {!isWish && (
        <View style={{ paddingHorizontal: GUTTER, marginTop: 26, alignItems: 'center' }}>
          {!confirming ? (
            <Pressable onPress={() => setConfirming(true)} accessibilityRole="button" hitSlop={10}>
              <Text variant="link">Delete this list</Text>
            </Pressable>
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

/** The cover: one photo, or a collage of up to three; a soft gradient with a star or letter when there are none. */
function Cover({ items, isWish, name }: { items: BoardItem[]; isWish: boolean; name: string }) {
  const photos = items.map(photoForItem).filter((p): p is NonNullable<typeof p> => !!p);
  const unique = [...new Set(photos)].slice(0, 3);
  if (unique.length === 0) {
    return (
      <>
        <LinearGradient colors={isWish ? [colors.sea, colors.ink] : [colors.accent, colors.ink]} style={{ position: 'absolute', inset: 0 }} />
        <View style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center', opacity: 0.25 }}>
          {isWish ? <WishStar size={120} color={colors.onDark} /> : <Text style={{ fontFamily: fonts.displayBold, fontSize: 160, color: colors.onDark }}>{name.trim()[0]?.toUpperCase()}</Text>}
        </View>
        <Shade strength={0.35} />
      </>
    );
  }
  return (
    <>
      <View style={{ position: 'absolute', inset: 0, flexDirection: 'row', gap: 2 }}>
        <View style={{ flex: 2 }}>
          <PhotoFill photo={unique[0]} />
        </View>
        {unique.length > 1 && (
          <View style={{ flex: 1, gap: 2 }}>
            {unique.slice(1).map((p) => (
              <View key={p} style={{ flex: 1 }}>
                <PhotoFill photo={p} />
              </View>
            ))}
          </View>
        )}
      </View>
      <LinearGradient colors={['rgba(0,0,0,0.28)', 'transparent']} style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 120 }} />
      <Shade strength={0.62} />
    </>
  );
}

/** A place on the list as a photo card: name on the photo, its score if we know it, and × to remove. */
function PlaceTile({ item, width, onRemove }: { item: BoardItem; width: number; onRemove: () => void }) {
  const slug = placeSlugForItem(item);
  const photo = photoForItem(item);
  const taste = useTaste();
  const score = slug ? taste.forSlug(slug)?.score : null; // your personal score
  return (
    <View style={{ width }}>
      <Pressable
        disabled={!slug}
        onPress={() => slug && router.push(`/place/${slug}`)}
        accessibilityRole={slug ? 'link' : 'text'}
        accessibilityLabel={placeLabel(item)}
        style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
      >
        <View style={{ height: width * 1.22, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.sand }}>
          {photo ? (
            <PhotoFill photo={photo} />
          ) : (
            <LinearGradient colors={[colors.stamp, colors.accentDeep]} style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontFamily: fonts.displayBold, fontSize: 56, color: colors.card, opacity: 0.9 }}>{item.name.trim()[0]?.toUpperCase()}</Text>
            </LinearGradient>
          )}
          <Shade strength={0.72} />
          {score != null && (
            <View style={{ position: 'absolute', top: 10, left: 10 }}>
              <ScoreStamp score={score} size="sm" />
            </View>
          )}
          <View style={{ position: 'absolute', left: 12, right: 12, bottom: 12 }}>
            <Text numberOfLines={2} style={{ fontFamily: fonts.display, fontSize: 19, lineHeight: 22, color: colors.onDark }}>
              {item.name}
            </Text>
            {!!item.country && item.country !== item.name && (
              <Text variant="tiny" style={{ color: colors.onDark, opacity: 0.9, marginTop: 2 }}>
                {item.country}
              </Text>
            )}
          </View>
        </View>
      </Pressable>
      <Pressable
        onPress={onRemove}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={`Remove ${item.name} from this list`}
        style={{ position: 'absolute', top: 10, right: 10, width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center' }}
      >
        <Text style={{ fontFamily: fonts.sansSemiBold, fontSize: 16, lineHeight: 18, color: colors.ink }}>×</Text>
      </Pressable>
    </View>
  );
}
