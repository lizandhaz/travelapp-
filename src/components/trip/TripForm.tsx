import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useRef, useState, type ComponentRef } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';

import { AccentTitle } from '@/components/AccentTitle';
import { ImageIcon, LockIcon, PlusIcon } from '@/components/Icons';
import { Text } from '@/components/Text';
import { BackButton, Button, Card, Chip, ErrorNotice, Input, Notice, PageTitle, Screen, Segmented } from '@/components/ui';
import { colors, fonts, GUTTER, radius } from '@/constants/theme';
import { currentMonth } from '@/lib/months';
import {
  COMPANIONS,
  deleteTripPhotos,
  MAX_PHOTOS,
  fetchPlaces,
  saveTrip,
  STAY_KINDS,
  uploadTripPhoto,
  type Companions,
  type Place,
  type StayKind,
  type Trip,
  type TripInput,
  type Visibility,
} from '@/lib/trips';
import { useTripPhoto } from '@/lib/useTripPhoto';
import { MonthPicker } from './MonthPicker';
import { NightsPicker } from './NightsPicker';
import { PlacePicker } from './PlacePicker';
import { ScorePicker } from './ScorePicker';

type ExtraStop = { key: number; place: Place | null; nights: string };

/**
 * "Add a trip" (and editing a trip), styled like the prototype: one simple
 * screen, with the optional extras under "Add more detail". Saves through
 * save_trip() in Supabase.
 */
export function TripForm({
  initial,
  startPlace,
  onSaved,
  back,
}: {
  initial?: Trip;
  /** Where you went, when coming from a place page's "I've been". */
  startPlace?: Place;
  onSaved: (id: string) => void;
  back?: boolean;
}) {
  const [places, setPlaces] = useState<Place[]>([]);
  const [place, setPlace] = useState<Place | null>(initial?.stops[0] ?? startPlace ?? null);
  const [month, setMonth] = useState<string | null>(initial?.month ?? null);
  const [score, setScore] = useState<number | null>(initial?.score ?? null);
  const [nights, setNights] = useState<number | null>(initial?.stops[0]?.nights ?? null);
  const [visibility, setVisibility] = useState<Visibility>(initial?.visibility ?? 'friends');
  const [companions, setCompanions] = useState<Companions | null>(initial?.companions ?? null);
  const [note, setNote] = useState(initial?.note ?? '');
  // Photos, in order (the first is the cover): ones already saved with the trip,
  // and newly picked ones, which are only uploaded when you save.
  const photoKey = useRef(1000);
  const [photos, setPhotos] = useState<PhotoItem[]>(() => (initial?.photoPaths ?? []).map((path, i) => ({ key: i + 1, path })));
  const [home, setHome] = useState(false);
  // The photo being dragged (hold, then drag): its key, where the finger started, and how far it's moved.
  const [drag, setDrag] = useState<{ key: number; x0: number; dx: number } | null>(null);
  const movePhoto = (key: number, to: number) =>
    setPhotos((ps) => {
      const from = ps.findIndex((p) => p.key === key);
      if (from < 0 || to < 0 || to >= ps.length || to === from) return ps;
      const next = [...ps];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  function dragTo(pageX: number) {
    if (!drag) return;
    const from = photos.findIndex((p) => p.key === drag.key);
    const dx = pageX - drag.x0;
    const to = Math.max(0, Math.min(photos.length - 1, Math.round(from + dx / PHOTO_SLOT)));
    if (to !== from) {
      movePhoto(drag.key, to);
      // The photo now sits in a new slot: keep it under your finger.
      const x0 = drag.x0 + (to - from) * PHOTO_SLOT;
      setDrag({ ...drag, x0, dx: pageX - x0 });
    } else {
      setDrag({ ...drag, dx });
    }
  }

  // Keys for extra-stop rows: existing stops use 1, 2, 3…; new rows count up from 100.
  const nextKey = useRef(100);
  const [extras, setExtras] = useState<ExtraStop[]>(() =>
    (initial?.stops.slice(1) ?? []).map((s, i) => ({ key: i + 1, place: s, nights: s.nights ? String(s.nights) : '' })),
  );
  const [stayName, setStayName] = useState(initial?.stay?.name ?? '');
  const [stayType, setStayType] = useState<StayKind | null>(initial?.stay?.type ?? null);
  const [stayScore, setStayScore] = useState<number | null>(initial?.stay?.score ?? null);
  const [meal, setMeal] = useState(initial?.meal ?? '');
  const [tip, setTip] = useState(initial?.tip ?? '');
  const [more, setMore] = useState(!!initial && (initial.stops.length > 1 || !!initial.stay || !!initial.meal || !!initial.tip));

  // After the first Save, the "Nearly there" list updates as you fix things.
  const [tried, setTried] = useState(false);
  const [saveError, setSaveError] = useState<{ message: string } | null>(null);
  const [saving, setSaving] = useState<false | 'trip' | { done: number; of: number }>(false);
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const nightsY = useRef(0);
  const formY = useRef(0);
  // An older trip saved before "How long did you stay?" was asked.
  const needsNights = !!initial && initial.stops[0]?.nights == null && nights == null;

  useEffect(() => {
    fetchPlaces().then(setPlaces);
  }, []);

  const isThisMonth = month === currentMonth();

  function check(): { problems: string[]; input?: TripInput } {
    const p: string[] = [];
    if (!place?.name.trim()) p.push('Where did you go?');
    else if (place.name.trim().length > 80) p.push('That place name is a bit long (80 characters at most).');
    if (!month) p.push('When did you go?');
    else if (month > currentMonth()) p.push("That month is in the future. Trips are for holidays you're back from.");
    if (nights == null) p.push('How long did you stay? Pick the number of nights.');
    else if (nights < 1 || nights > 365) p.push('How long did you stay? 1 to 365 nights.');
    if (score == null) p.push('How was it? Slide to give it a score out of 10.');
    if (isThisMonth && !home) p.push("Tick “I'm back home”. Trips are only shared once you're home.");

    const stops = extras.filter((e) => e.place?.name.trim());
    stops.forEach((e) => {
      if (e.nights && !/^\d+$/.test(e.nights)) p.push(`Nights in ${e.place!.name} should be a number.`);
      else if (e.nights && (Number(e.nights) < 1 || Number(e.nights) > 365)) p.push(`Nights in ${e.place!.name} should be 1 to 365.`);
    });
    if (stops.length > 9) p.push('Up to 9 extra stops, please.');

    const hasStay = !!(stayName.trim() || stayType || stayScore != null);
    if (hasStay) {
      if (!stayName.trim()) p.push('What was the name of the place you stayed?');
      if (!stayType) p.push('What kind of place did you stay in?');
      if (stayScore == null) p.push('Give where you stayed a score out of 10.');
    }
    if (note.trim().length > 500) p.push('Note: 500 characters at most.');
    if (meal.trim().length > 120) p.push('Best meal: 120 characters at most.');
    if (tip.trim().length > 280) p.push('Top tip: 280 characters at most.');
    if (p.length) return { problems: p };

    return {
      problems: [],
      input: {
        id: initial?.id,
        month: month!,
        score: score!,
        visibility,
        stops: [
          { ...place!, nights: nights! },
          ...stops.map((e) => ({ ...e.place!, nights: e.nights ? Number(e.nights) : null })),
        ],
        stay: hasStay ? { name: stayName.trim(), type: stayType!, score: stayScore! } : null,
        meal: meal.trim() || null,
        tip: tip.trim() || null,
        companions,
        note: note.trim() || null,
        photoPaths: [], // filled in by save() once new photos are uploaded
      },
    };
  }

  const problems = tried ? check().problems : [];

  async function save() {
    setSaveError(null);
    setTried(true);
    const { input } = check();
    if (!input) {
      // Missing nights is easy to miss on older trips: jump to that question.
      if (nights == null) scroll.current?.scrollTo({ y: Math.max(0, formY.current + nightsY.current - 20), animated: true });
      return;
    }
    const uploaded: string[] = [];
    try {
      const fresh = photos.filter((p) => p.uri).length;
      const paths: string[] = [];
      for (const p of photos) {
        if (p.path) paths.push(p.path);
        else if (p.uri) {
          setSaving({ done: uploaded.length + 1, of: fresh });
          const path = await uploadTripPhoto(p.uri, p.width);
          uploaded.push(path);
          paths.push(path);
        }
      }
      input.photoPaths = paths;
      setSaving('trip');
      const id = await saveTrip(input);
      // Tidy up photos the trip no longer uses.
      await deleteTripPhotos((initial?.photoPaths ?? []).filter((p) => !paths.includes(p)));
      onSaved(id);
    } catch (e) {
      await deleteTripPhotos(uploaded);
      setSaveError({ message: e instanceof Error ? e.message : 'Something went wrong. Please try again.' });
    } finally {
      setSaving(false);
    }
  }

  const roomFor = MAX_PHOTOS - photos.length;
  async function pickPhotos() {
    if (roomFor <= 0) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: roomFor,
      orderedSelection: true,
      exif: false, // never read location data from photos
      quality: 0.8,
    });
    if (result.canceled) return;
    const picked = result.assets.slice(0, roomFor).map((a) => ({ key: photoKey.current++, uri: a.uri, width: a.width }));
    setPhotos((ps) => [...ps, ...picked].slice(0, MAX_PHOTOS));
  }

  const saveTitle =
    typeof saving === 'object'
      ? `Saving photo ${saving.done} of ${saving.of}…`
      : saving
        ? 'Saving…'
        : initial
          ? 'Save changes'
          : 'Save trip';
  const problemsNotice =
    problems.length > 0 ? (
            <Notice>
        <Text variant="strong" style={{ color: colors.accentText }}>
          Nearly there:
        </Text>
        {problems.map((p) => (
          <Text key={p} variant="body" style={{ fontSize: 14 }}>
            • {p}
          </Text>
        ))}
      </Notice>
    ) : null;
  const saveButton = <Button title={saveTitle} kind="accent" size="lg" onPress={save} disabled={!!saving} />;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen tabBar={!back} ref={scroll}>
        {back && (
          <View style={{ paddingHorizontal: GUTTER, paddingTop: 12 }}>
            <BackButton />
          </View>
        )}
        <PageTitle label={initial ? 'Edit trip' : 'Add a trip'}>
          <AccentTitle before="Where did" accent="you" after="go?" />
        </PageTitle>

        <View style={{ paddingHorizontal: GUTTER, gap: 28 }} onLayout={(e) => (formY.current = e.nativeEvent.layout.y)}>
          <PlacePicker value={place} onChange={setPlace} places={places} accessibilityLabel="Where did you go?" />

          <Question title="When did you go?">
            <MonthPicker value={month} onChange={setMonth} />
          </Question>

          <View onLayout={(e) => (nightsY.current = e.nativeEvent.layout.y)}>
          <Question title="How long did you stay?">
            {needsNights && (
              <Text variant="small" style={{ color: colors.accentText }}>
                Add this to save your changes. Trips added before it was asked don’t have it yet.
              </Text>
            )}
            <NightsPicker value={nights} onChange={setNights} />
          </Question>
          </View>

          <Question title="How was it?">
            <ScorePicker value={score} onChange={setScore} label="How was it" />
          </Question>

          <Question title="Who did you go with?">
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {COMPANIONS.map(([id, text]) => (
                <Chip key={id} label={text} selected={companions === id} onPress={() => setCompanions(companions === id ? null : id)} />
              ))}
            </View>
          </Question>

          <Question title="Add photos" note={`optional, up to ${MAX_PHOTOS}`}>
            <View style={{ marginHorizontal: -GUTTER }}>
              <ScrollView
                horizontal
                scrollEnabled={!drag}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: PHOTO_GAP, paddingHorizontal: GUTTER, paddingVertical: 6 }}
              >
                {photos.map((p, i) => (
                  <PhotoThumb
                    key={p.key}
                    item={p}
                    cover={i === 0 && photos.length > 1}
                    index={i}
                    count={photos.length}
                    dragX={drag?.key === p.key ? drag.dx : null}
                    onDragStart={(x) => setDrag({ key: p.key, x0: x, dx: 0 })}
                    onDragMove={dragTo}
                    onDragEnd={() => setDrag(null)}
                    onMove={(to) => movePhoto(p.key, to)}
                    onRemove={() => setPhotos((ps) => ps.filter((x) => x.key !== p.key))}
                  />
                ))}
                {roomFor > 0 && (
                  <Pressable
                    onPress={pickPhotos}
                    accessibilityRole="button"
                    accessibilityLabel={photos.length ? 'Add more photos' : 'Add photos'}
                    style={{
                      width: PHOTO_SIZE,
                      height: PHOTO_SIZE,
                      borderRadius: radius.md,
                      borderWidth: 1.5,
                      borderStyle: 'dashed',
                      borderColor: colors.line,
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                    }}
                  >
                    <ImageIcon color={colors.ink} />
                    <Text variant="small" style={{ color: colors.ink }}>
                      {photos.length ? 'Add more' : 'Add'}
                    </Text>
                  </Pressable>
                )}
              </ScrollView>
            </View>
            <Text variant="tiny">
              {photos.length > 1 ? 'Hold a photo, then drag it to change the order. The first one is the cover. ' : ''}Only you can see your photos. Location data is removed before saving.
            </Text>
          </Question>

          <Question title="Add a note" note="optional">
            <Input
              value={note}
              onChangeText={setNote}
              placeholder="A line about it, e.g. “Long lunches by the sea”"
              accessibilityLabel="Add a note"
              multiline
              maxLength={500}
              style={{ minHeight: 70, textAlignVertical: 'top' }}
            />
          </Question>

          <View style={{ gap: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <LockIcon color={colors.muted} />
              <Text variant="label">Who can see this</Text>
            </View>
            <Segmented
              label="Who can see this"
              value={visibility}
              onChange={setVisibility}
              options={[
                ['friends', 'Friends'],
                ['private', 'Just me'],
              ]}
            />
            <Text variant="tiny">
              {visibility === 'friends'
                ? 'Change it any time. Trips are only shared once you’re home, and friends arrive in the app soon.'
                : 'Only you will ever see this trip.'}
            </Text>
          </View>

          {isThisMonth && (
            <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: home }} onPress={() => setHome(!home)}>
              <Card style={{ padding: 16, flexDirection: 'row', gap: 12 }}>
                <View
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 6,
                    borderWidth: 1.5,
                    borderColor: home ? colors.ink : colors.muted,
                    backgroundColor: home ? colors.ink : 'transparent',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: 1,
                  }}
                >
                  {home && <Text style={{ color: colors.onDark, fontFamily: fonts.sansBold, fontSize: 14 }}>✓</Text>}
                </View>
                <Text variant="body" style={{ flex: 1, fontSize: 14 }}>
                  <Text variant="strong">I&apos;m back home.</Text> We never share where you are right now, only where you&apos;ve been.
                </Text>
              </Card>
            </Pressable>
          )}

          {problemsNotice}
          <ErrorNotice error={saveError} />

          {saveButton}

          <Pressable accessibilityRole="button" accessibilityState={{ expanded: more }} onPress={() => setMore((m) => !m)}>
            <Card style={{ padding: 18, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text variant="strong">Add more detail</Text>
                <Text variant="small">Other places and nights, where you stayed, best meal, a tip. You can do this later.</Text>
              </View>
              <View style={{ transform: [{ rotate: more ? '45deg' : '0deg' }] }}>
                <PlusIcon color={colors.ink} size={20} strokeWidth={1.8} />
              </View>
            </Card>
          </Pressable>

          {more && (
            <View style={{ gap: 28 }}>
              <Question title="Other places on this trip" note="with nights in each">
                {extras.map((e, i) => (
                  <Card key={e.key} style={{ padding: 12, gap: 10 }}>
                    <PlacePicker
                      value={e.place}
                      onChange={(p) => setExtras((xs) => xs.map((x) => (x.key === e.key ? { ...x, place: p } : x)))}
                      places={places}
                      placeholder="Another place"
                      accessibilityLabel={`Extra stop ${i + 1}`}
                    />
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <View style={{ width: 96 }}>
                        <Input
                          value={e.nights}
                          onChangeText={(t) => setExtras((xs) => xs.map((x) => (x.key === e.key ? { ...x, nights: t.replace(/\D/g, '').slice(0, 3) } : x)))}
                          keyboardType="number-pad"
                          placeholder="0"
                          accessibilityLabel={`Nights at extra stop ${i + 1}`}
                          style={{ textAlign: 'center', paddingVertical: 11 }}
                        />
                      </View>
                      <Text variant="small" style={{ flex: 1 }}>
                        nights
                      </Text>
                      <Pressable accessibilityRole="button" accessibilityLabel={`Remove extra stop ${i + 1}`} onPress={() => setExtras((xs) => xs.filter((x) => x.key !== e.key))} hitSlop={8}>
                        <Text variant="link">Remove</Text>
                      </Pressable>
                    </View>
                  </Card>
                ))}
                {extras.length < 9 && (
                  <Button title="+ Add a place" kind="outline" onPress={() => setExtras((xs) => [...xs, { key: nextKey.current++, place: null, nights: '' }])} />
                )}
              </Question>

              <Question title="Where you stayed">
                <Input value={stayName} onChangeText={setStayName} placeholder="e.g. Casa Ammos" accessibilityLabel="Name of where you stayed" />
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {STAY_KINDS.map((k) => (
                    <Chip key={k} label={k} selected={stayType === k} onPress={() => setStayType(stayType === k ? null : k)} />
                  ))}
                </View>
                <ScorePicker value={stayScore} onChange={setStayScore} label="Stay score" compact />
              </Question>

              <Question title="Best meal">
                <Input value={meal} onChangeText={setMeal} placeholder="Restaurant, café or dish" accessibilityLabel="Best meal" maxLength={120} />
              </Question>

              <Question title="Top tip">
                <Input
                  value={tip}
                  onChangeText={setTip}
                  placeholder="Something you wish you'd known"
                  accessibilityLabel="Top tip"
                  multiline
                  maxLength={280}
                  style={{ minHeight: 90, textAlignVertical: 'top' }}
                />
              </Question>

              {problemsNotice}
              {saveButton}
            </View>
          )}

          <Text variant="tiny">Your location is never shared live.</Text>
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}

type PhotoItem = { key: number; path?: string; uri?: string; width?: number };

const PHOTO_SIZE = 110;
const PHOTO_GAP = 12;
const PHOTO_SLOT = PHOTO_SIZE + PHOTO_GAP;
const HOLD_MS = 280;

/**
 * One photo in the form: a saved one (shown through a private link) or a newly picked one.
 * Hold it for a moment and it lifts up; then drag it left or right to move it.
 */
function PhotoThumb({
  item,
  cover,
  index,
  count,
  dragX,
  onDragStart,
  onDragMove,
  onDragEnd,
  onMove,
  onRemove,
}: {
  item: PhotoItem;
  cover: boolean;
  index: number;
  count: number;
  /** How far it's been dragged, while it's the one being dragged. */
  dragX: number | null;
  onDragStart: (pageX: number) => void;
  onDragMove: (pageX: number) => void;
  onDragEnd: () => void;
  onMove: (to: number) => void;
  onRemove: () => void;
}) {
  const savedUrl = useTripPhoto(item.path);
  const uri = item.uri ?? savedUrl;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holding = useRef(false);
  const start = useRef({ x: 0, y: 0 });
  const lifted = dragX != null;

  const stopTimer = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };
  const finish = () => {
    stopTimer();
    if (holding.current) onDragEnd();
    holding.current = false;
  };

  return (
    <View
      style={{
        zIndex: lifted ? 10 : 0,
        borderRadius: radius.md,
        transform: [{ translateX: dragX ?? 0 }, { scale: lifted ? 1.07 : 1 }],
        shadowColor: colors.ink,
        shadowOpacity: lifted ? 0.28 : 0,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
        elevation: lifted ? 8 : 0,
      }}
    >
      <View
        accessible
        accessibilityRole="image"
        accessibilityLabel={`Photo ${index + 1} of ${count}${index === 0 ? ', the cover' : ''}`}
        accessibilityActions={count > 1 ? [{ name: 'moveLeft', label: 'Move left' }, { name: 'moveRight', label: 'Move right' }, { name: 'makeCover', label: 'Make cover' }] : undefined}
        onAccessibilityAction={(e) => {
          if (e.nativeEvent.actionName === 'moveLeft') onMove(index - 1);
          if (e.nativeEvent.actionName === 'moveRight') onMove(index + 1);
          if (e.nativeEvent.actionName === 'makeCover') onMove(0);
        }}
        onStartShouldSetResponder={() => count > 1}
        onResponderGrant={(e) => {
          start.current = { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY };
          holding.current = false;
          stopTimer();
          timer.current = setTimeout(() => {
            holding.current = true;
            onDragStart(start.current.x);
          }, HOLD_MS);
        }}
        onResponderMove={(e) => {
          const { pageX, pageY } = e.nativeEvent;
          if (!holding.current) {
            // Moved before the hold finished: that's a scroll, not a drag.
            if (Math.abs(pageX - start.current.x) > 8 || Math.abs(pageY - start.current.y) > 8) stopTimer();
            return;
          }
          onDragMove(pageX);
        }}
        onResponderRelease={finish}
        onResponderTerminate={finish}
        // Once it's lifted, keep hold of the finger so the page doesn't scroll instead.
        onResponderTerminationRequest={() => !holding.current}
        style={{
          width: PHOTO_SIZE,
          height: PHOTO_SIZE,
          borderRadius: radius.md,
          overflow: 'hidden',
          backgroundColor: colors.sand,
          borderWidth: lifted ? 3 : 0,
          borderColor: colors.accent,
        }}
      >
        {/* The picture ignores touches so the card gets them (and browsers don't start dragging the image). */}
        {uri && <Image source={{ uri }} style={{ width: '100%', height: '100%' }} contentFit="cover" pointerEvents="none" />}
      </View>
      {cover && !lifted && (
        <View pointerEvents="none" style={{ position: 'absolute', left: 6, bottom: 6, backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 999, paddingHorizontal: 7, paddingVertical: 2 }}>
          <Text style={{ fontFamily: fonts.sansSemiBold, fontSize: 10, color: colors.ink }}>Cover</Text>
        </View>
      )}
      {!lifted && (
        <Pressable
          onPress={onRemove}
          accessibilityRole="button"
          accessibilityLabel={`Remove photo ${index + 1}`}
          hitSlop={8}
          style={{ position: 'absolute', top: 6, right: 6, width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(44,66,80,0.75)', alignItems: 'center', justifyContent: 'center' }}
        >
          <Text style={{ color: colors.onDark, fontFamily: fonts.sansBold, fontSize: 14, lineHeight: 16 }}>×</Text>
        </Pressable>
      )}
    </View>
  );
}

function Question({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 12 }}>
      <Text variant="heading" accessibilityRole="header">
        {title}
        {note ? <Text variant="small"> ({note})</Text> : null}
      </Text>
      {children}
    </View>
  );
}
