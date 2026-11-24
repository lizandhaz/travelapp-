import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LockIcon, PencilIcon, PlusIcon, ShareIcon } from '@/components/Icons';
import { photoForItem, placeSlugForItem, WishStar } from '@/components/lists';
import { PhotoFill, Shade } from '@/components/Photo';
import { ScoreStamp } from '@/components/ScoreStamp';
import { Text } from '@/components/Text';
import { PlacePicker } from '@/components/trip/PlacePicker';
import { BackButton, Button, Card, ErrorNotice, IconCircle, Notice, Screen } from '@/components/ui';
import { colors, fonts, GUTTER, radius } from '@/constants/theme';
import { addToBoard, deleteBoard, fetchBoard, fetchSharedWishes, findOnBoard, placesOn, removeFromBoard, shareBoard, type Board, type BoardItem } from '@/lib/boards';
import { photos, type PhotoName } from '@/lib/photos';
import { InviteSheet } from '@/components/InviteSheet';
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
  // "Add a place" opens a sheet with the search box at the top, so the keyboard never covers the suggestions.
  const [searching, setSearching] = useState(false);
  const [shared, setShared] = useState<Record<string, { id: string; name: string }[]>>({});
  const [inviting, setInviting] = useState<BoardItem | null>(null);
  const [opened, setOpened] = useState<BoardItem | null>(null);

  const load = useCallback(
    () =>
      fetchBoard(id)
        .then((b) => {
          setBoard(b);
          setError(null);
          if (b?.kind === 'wish') fetchSharedWishes().then(setShared);
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
      setNote(`${placeLabel(place)} is already on this board.`);
      return;
    }
    setBusy(true);
    try {
      await addToBoard(board.id, place);
      setAdding(null);
      setPickerKey((k) => k + 1);
      setNote(null);
      setSearching(false);
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
            <Text variant="body">That board couldn’t be found. It may have been deleted.</Text>
          ) : (
            <ActivityIndicator color={colors.accent} />
          )}
        </View>
      </Screen>
    );
  }

  const isWish = board.kind === 'wish';
  // Places as photo cards; hotels, restaurants and so on sit under their place (tap the place),
  // or on their own below if their place isn't on this board.
  const placeItems = placesOn(board.items);
  const spots = board.items.filter((i) => i.kind !== 'place');
  const key = (s: string | null) => (s ?? '').trim().toLowerCase();
  const spotsIn = (place: BoardItem) => spots.filter((x) => (x.parentSlug && x.parentSlug === placeSlugForItem(place)) || key(x.parentName) === key(place.name));
  const loose = spots.filter((x) => !placeItems.some((pl) => spotsIn(pl).includes(x)));
  const looseGroups = [...new Set(loose.map((x) => x.parentName ?? ''))].map((parent) => ({ parent, items: loose.filter((x) => (x.parentName ?? '') === parent) }));
  const n = placeItems.length;
  const screenW = Math.min(Dimensions.get('window').width, 480);
  const tileW = (screenW - GUTTER * 2 - 12) / 2;

  return (
    <Screen noTopInset>
      {/* Cover: the list's places as a photo collage, with the name on it */}
      <View style={{ minHeight: screenW * 0.92, backgroundColor: colors.sand, paddingTop: insets.top + 10, paddingBottom: 22, justifyContent: 'space-between' }}>
        <Cover items={board.items} cover={board.cover} isWish={isWish} name={board.name} />
        <View style={{ paddingHorizontal: GUTTER, flexDirection: 'row', justifyContent: 'space-between' }}>
          <BackButton onPhoto />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <IconCircle label="Share this board" onPress={share} style={{ borderWidth: 0 }}>
              <ShareIcon color={colors.ink} />
            </IconCircle>
            <IconCircle label="Edit this board" onPress={() => router.push({ pathname: '/list/new', params: { id: board.id } })} style={{ borderWidth: 0 }}>
              <PencilIcon color={colors.ink} />
            </IconCircle>
          </View>
        </View>
        <View style={{ paddingHorizontal: GUTTER, marginTop: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            {isWish && <WishStar size={12} color={colors.onDark} />}
            <Text variant="label" style={{ color: colors.onDark, opacity: 0.95 }}>
              {isWish ? 'Your wish board' : 'Your board'}
            </Text>
          </View>
          <Text accessibilityRole="header" style={{ fontFamily: fonts.displayBold, fontSize: 42, lineHeight: 46, color: colors.onDark, marginTop: 2 }}>
            {board.name}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <Text variant="small" style={{ color: colors.onDark }}>
              {n} {n === 1 ? 'place' : 'places'}
              {spots.length ? ` · ${spots.length} ${spots.length === 1 ? 'spot' : 'spots'}` : ''} ·
            </Text>
            {board.visibility === 'private' && <LockIcon color={colors.onDark} size={12} />}
            <Text variant="small" style={{ color: colors.onDark }}>
              {board.visibility === 'friends' ? 'Followers can see' : 'Just me'}
            </Text>
          </View>
        </View>
      </View>

      {/* A small "+ Add a place" at the top of the board (owner, Nov 2026); it opens the search sheet. */}
      <View style={{ paddingHorizontal: GUTTER, marginTop: 16, flexDirection: 'row', justifyContent: 'flex-end' }}>
        <Pressable
          onPress={() => setSearching(true)}
          accessibilityRole="button"
          accessibilityLabel="Add a place to this board"
          hitSlop={8}
          style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, paddingHorizontal: 14, paddingVertical: 8, opacity: pressed ? 0.8 : 1 })}
        >
          <PlusIcon color={colors.accentText} size={16} strokeWidth={2.2} />
          <Text variant="small" style={{ color: colors.accentText, fontFamily: fonts.sansSemiBold }}>
            Add a place
          </Text>
        </Pressable>
      </View>

      {/* Places */}
      <View style={{ paddingHorizontal: GUTTER, marginTop: 12 }}>
        {n === 0 && spots.length === 0 ? (
          <Card style={{ padding: 24, alignItems: 'center', gap: 10 }}>
            <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: colors.sage + '40', alignItems: 'center', justifyContent: 'center' }}>
              <WishStar size={24} />
            </View>
            <Text variant="subheading">Nothing here yet</Text>
            <Text variant="small" style={{ textAlign: 'center' }}>
              Tap “Add a place” above, or tap {isWish ? '“Want to go”' : '“Save to a board”'} on any place page.
            </Text>
          </Card>
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, rowGap: 14 }}>
            {placeItems.map((item) => (
              <PlaceTile
                key={item.id}
                item={item}
                width={tileW}
                onRemove={() => remove(item.id)}
                spotCount={spotsIn(item).length}
                onOpenSpots={() => setOpened(item)}
                withPeople={shared[item.id]?.map((p) => p.name)}
                onInvite={isWish ? () => setInviting(item) : undefined}
              />
            ))}
          </View>
        )}
      </View>

      {/* Hotels, restaurants and more whose place isn't on this board */}
      {looseGroups.length > 0 && (
        <View style={{ paddingHorizontal: GUTTER, marginTop: 24, gap: 12 }}>
          <Text variant="heading">Hotels, restaurants & more</Text>
          {looseGroups.map((g) => (
            <Card key={g.parent} style={{ paddingHorizontal: 14, paddingVertical: 6 }}>
              {!!g.parent && (
                <Text variant="label" style={{ paddingTop: 8 }}>
                  In {g.parent}
                </Text>
              )}
              {g.items.map((x) => (
                <SpotRow key={x.id} item={x} onRemove={() => remove(x.id)} />
              ))}
            </Card>
          ))}
        </View>
      )}

      {/* A place's saved hotels, restaurants and things to do */}
      <Modal visible={!!opened} transparent animationType="fade" onRequestClose={() => setOpened(null)}>
        <Pressable onPress={() => setOpened(null)} accessibilityLabel="Close" style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' }}>
          <Pressable onPress={() => {}} style={{ backgroundColor: colors.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: GUTTER, paddingBottom: 36, gap: 10 }}>
            {!!opened && (
              <>
                <Text variant="heading">Saved in {opened.name}</Text>
                <Card style={{ paddingHorizontal: 14, paddingVertical: 4 }}>
                  {spotsIn(opened).map((x) => (
                    <SpotRow key={x.id} item={x} onRemove={() => remove(x.id)} />
                  ))}
                </Card>
                {!!placeSlugForItem(opened) && (
                  <Button
                    title={`Open ${opened.name}`}
                    kind="dark"
                    onPress={() => {
                      const slug = placeSlugForItem(opened);
                      setOpened(null);
                      if (slug) router.push(`/place/${slug}`);
                    }}
                  />
                )}
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {!!inviting && (
        <InviteSheet
          itemId={inviting.id}
          place={inviting.name}
          visible
          already={shared[inviting.id]?.map((p) => p.id)}
          onClose={() => setInviting(null)}
          onDone={() => {
            setInviting(null);
            fetchSharedWishes().then(setShared);
          }}
        />
      )}

      <View style={{ paddingHorizontal: GUTTER, marginTop: 10 }}>
        <ErrorNotice error={error} />
      </View>

      {!isWish && (
        <View style={{ paddingHorizontal: GUTTER, marginTop: 26, alignItems: 'center' }}>
          {!confirming ? (
            <Pressable onPress={() => setConfirming(true)} accessibilityRole="button" hitSlop={10}>
              <Text variant="link">Delete this board</Text>
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

      <Modal visible={searching} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setSearching(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: colors.bg }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: GUTTER, paddingTop: 18, paddingBottom: 10 }}>
            <Text variant="heading">Add a place</Text>
            {/* "Cancel", not "Done": closing never adds anything (owner, Nov 2026). */}
            <Pressable onPress={() => setSearching(false)} accessibilityRole="button" accessibilityLabel="Cancel without adding" hitSlop={10}>
              <Text variant="link">Cancel</Text>
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={{ paddingHorizontal: GUTTER, gap: 12, paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
            <PlacePicker key={pickerKey} value={adding} onChange={setAdding} places={places} accessibilityLabel="Search for a place to add" autoFocus />
            {!!note && <Text variant="small">{note}</Text>}
            <Button title="Add to board" kind="dark" disabled={busy || !adding?.name.trim()} onPress={add} />
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </Screen>
  );
}

/** The cover: one photo, or a collage of up to three; a soft gradient with a star or letter when there are none. */
function Cover({ items, cover, isWish, name }: { items: BoardItem[]; cover: string | null; isWish: boolean; name: string }) {
  if (cover && cover in photos) {
    return (
      <>
        <PhotoFill photo={cover as PhotoName} />
        <LinearGradient colors={['rgba(0,0,0,0.28)', 'transparent']} style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 120 }} />
        <Shade strength={0.62} />
      </>
    );
  }
  const photosOf = placesOn(items).map(photoForItem).filter((p): p is NonNullable<typeof p> => !!p);
  const unique = [...new Set(photosOf)].slice(0, 3);
  if (unique.length === 0) {
    return (
      <>
        <LinearGradient colors={isWish ? [colors.olive, colors.ink] : [colors.accent, colors.ink]} style={{ position: 'absolute', inset: 0 }} />
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
function PlaceTile({
  item,
  width,
  onRemove,
  spotCount = 0,
  onOpenSpots,
  withPeople,
  onInvite,
}: {
  item: BoardItem;
  width: number;
  onRemove: () => void;
  spotCount?: number;
  onOpenSpots?: () => void;
  withPeople?: string[];
  onInvite?: () => void;
}) {
  const slug = placeSlugForItem(item);
  const photo = photoForItem(item);
  const taste = useTaste();
  const score = slug ? taste.forSlug(slug)?.score : null; // your personal score
  return (
    <View style={{ width }}>
      <Pressable
        disabled={!slug && !spotCount}
        onPress={() => (spotCount && onOpenSpots ? onOpenSpots() : slug && router.push(`/place/${slug}`))}
        accessibilityRole={slug || spotCount ? 'link' : 'text'}
        accessibilityLabel={`${placeLabel(item)}${spotCount ? `, ${spotCount} saved ${spotCount === 1 ? 'spot' : 'spots'}` : ''}${withPeople?.length ? `, going with ${withPeople.join(' and ')}` : ''}`}
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
            {spotCount > 0 && (
              <View style={{ alignSelf: 'flex-start', backgroundColor: colors.card, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2, marginBottom: 6 }}>
                <Text style={{ fontFamily: fonts.sansSemiBold, fontSize: 11, color: colors.ink }}>
                  {spotCount} saved {spotCount === 1 ? 'spot' : 'spots'}
                </Text>
              </View>
            )}
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
        accessibilityLabel={`Remove ${item.name} from this board`}
        style={{ position: 'absolute', top: 10, right: 10, width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center' }}
      >
        <Text style={{ fontFamily: fonts.sansSemiBold, fontSize: 16, lineHeight: 18, color: colors.ink }}>×</Text>
      </Pressable>
      {(!!withPeople?.length || onInvite) && (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginTop: 6 }}>
          <Text variant="tiny" numberOfLines={1} style={{ flex: 1, color: withPeople?.length ? colors.olive : colors.muted }}>
            {withPeople?.length ? `With ${withPeople.join(', ')}` : 'Just you'}
          </Text>
          {!!onInvite && (
            <Pressable onPress={onInvite} accessibilityRole="button" accessibilityLabel={`Invite people to ${item.name}`} hitSlop={8}>
              <Text variant="small" style={{ color: colors.accentText, fontFamily: fonts.sansSemiBold }}>
                + Invite
              </Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

const KIND_LABEL: Record<string, string> = { stay: 'Stay', eat: 'Eat', do: 'Do', gem: 'Hidden gem' };

/** A saved hotel, restaurant or thing to do: tap to open its place; × to remove. */
function SpotRow({ item, onRemove }: { item: BoardItem; onRemove: () => void }) {
  const slug = item.parentSlug ?? item.slug;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 }}>
      <Pressable
        disabled={!slug}
        onPress={() => slug && router.push(`/place/${slug}`)}
        accessibilityRole={slug ? 'link' : 'text'}
        accessibilityLabel={`${item.name}, ${KIND_LABEL[item.kind] ?? ''}${item.parentName ? ` in ${item.parentName}` : ''}`}
        style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 }}
      >
        <View style={{ backgroundColor: colors.sageSoft, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 }}>
          <Text style={{ fontFamily: fonts.sansSemiBold, fontSize: 11, color: colors.ink }}>{KIND_LABEL[item.kind] ?? 'Spot'}</Text>
        </View>
        <Text variant="strong" numberOfLines={1} style={{ flex: 1, fontSize: 15 }}>
          {item.name}
        </Text>
      </Pressable>
      <Pressable onPress={onRemove} accessibilityRole="button" accessibilityLabel={`Remove ${item.name} from this board`} hitSlop={8}>
        <Text style={{ fontFamily: fonts.sansSemiBold, fontSize: 18, color: colors.muted }}>×</Text>
      </Pressable>
    </View>
  );
}
