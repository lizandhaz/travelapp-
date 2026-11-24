import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Switch, View } from 'react-native';

import { AccentTitle } from '@/components/AccentTitle';
import { BedIcon, BulbIcon, CalendarIcon, ChevronIcon, ForkIcon, ImageIcon, LockIcon, MoonIcon, NoteIcon, PeopleIcon, PinIcon, PlusIcon } from '@/components/Icons';
import { Text } from '@/components/Text';
import { BackButton, Button, Card, Chip, ErrorNotice, Input, Notice, PageTitle, Screen } from '@/components/ui';
import { colors, fonts, GUTTER, radius } from '@/constants/theme';
import { currentMonth, monthYear } from '@/lib/months';
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
import { StayPicker } from './StayPicker';

type ExtraStop = { key: number; place: Place | null; nights: string };

/**
 * "Add a trip" (and editing a trip): the place, then the basics (when, how long, who with) in one card,
 * the score on blush, optional extras as rows that open in place, and a "Just me" switch.
 * Saves through save_trip() in Supabase.
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
  const [stayAgain, setStayAgain] = useState<boolean | null>(initial?.stay?.wouldReturn ?? null);
  const [goBack, setGoBack] = useState<boolean | null>(initial?.wouldReturn ?? null);
  // Best restaurants: one box each, in order (up to 10). Keys keep each box steady as you add or remove.
  const restKey = useRef(1000);
  const [restaurants, setRestaurants] = useState<{ key: number; name: string }[]>(() =>
    (initial?.restaurants.length ? initial.restaurants : ['']).map((name, i) => ({ key: i + 1, name })),
  );
  const [tip, setTip] = useState(initial?.tip ?? '');
  // The question whose page is open (each row opens its own page).
  const [sheet, setSheet] = useState<SheetId | null>(null);
  const close = () => setSheet(null);

  // After the first Save, the "Nearly there" list updates as you fix things.
  const [tried, setTried] = useState(false);
  const [saveError, setSaveError] = useState<{ message: string } | null>(null);
  const [saving, setSaving] = useState<false | 'trip' | { done: number; of: number }>(false);
  // An older trip saved before "How long did you stay?" was asked.
  const needsNights = !!initial && initial.stops[0]?.nights == null && nights == null;

  useEffect(() => {
    fetchPlaces().then(setPlaces);
  }, []);

  function check(): { problems: string[]; input?: TripInput } {
    const p: string[] = [];
    if (!place?.name.trim()) p.push('Where did you go?');
    else if (place.name.trim().length > 80) p.push('That place name is a bit long (80 characters at most).');
    if (!month) p.push('When did you go?');
    else if (month > currentMonth()) p.push("That month is in the future. Trips are for holidays you're back from.");
    if (nights == null) p.push('How long did you stay? Pick the number of nights.');
    else if (nights < 1 || nights > 365) p.push('How long did you stay? 1 to 365 nights.');
    if (score == null) p.push('How was it? Slide to give it a score out of 10.');

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
    }
    if (note.trim().length > 500) p.push('Note: 500 characters at most.');
    if (restaurants.some((r) => r.name.trim().length > 120)) p.push('Restaurant names: 120 characters at most.');
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
        stay: hasStay ? { name: stayName.trim(), type: stayType!, score: stayScore, wouldReturn: stayAgain } : null,
        wouldReturn: goBack,
        restaurants: restaurants.map((r) => r.name.trim()).filter(Boolean),
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
    if (!input) return;
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

  const stopsCount = extras.filter((e) => e.place?.name.trim()).length;
  const named = restaurants.filter((r) => r.name.trim());
  const restSummary = named.length === 1 ? named[0].name.trim() : named.length > 1 ? `${named.length} restaurants` : undefined;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen tabBar={!back}>
        {back && (
          <View style={{ paddingHorizontal: GUTTER, paddingTop: 12 }}>
            <BackButton />
          </View>
        )}
        <PageTitle label={initial ? 'Edit trip' : 'Add a trip'}>
          <AccentTitle before="Where did" accent="you" after="go?" />
        </PageTitle>

        <View style={{ paddingHorizontal: GUTTER, gap: 16 }}>
          <PlacePicker value={place} onChange={setPlace} places={places} accessibilityLabel="Where did you go?" />

          {/* The basics: when, how long, who with. */}
          <Group>
            <SheetRow
              icon={<CalendarIcon color={colors.ink} />}
              title="When did you go?"
              summary={month ? monthYear(month) : undefined}
              required
              open={sheet === 'when'}
              onOpen={() => setSheet('when')}
              onClose={close}
            >
              <MonthPicker
                value={month}
                onChange={(m) => {
                  setMonth(m);
                  close();
                }}
                wrap
              />
            </SheetRow>
            <Divider />
            <SheetRow
              icon={<MoonIcon color={colors.ink} />}
              title="How long did you stay?"
              summary={nights != null ? `${nights} ${nights === 1 ? 'night' : 'nights'}` : needsNights ? 'Add nights' : undefined}
              required
              open={sheet === 'nights'}
              onOpen={() => setSheet('nights')}
              onClose={close}
              saveLabel="Save nights"
            >
              {needsNights && (
                <Text variant="small" style={{ color: colors.accentText }}>
                  Add this to save your changes. Trips added before it was asked don’t have it yet.
                </Text>
              )}
              <NightsPicker value={nights} onChange={setNights} onPicked={close} wrap />
            </SheetRow>
            <Divider />
            <SheetRow
              icon={<PeopleIcon color={colors.ink} />}
              title="Who did you go with?"
              summary={companions ? COMPANIONS.find(([id]) => id === companions)?.[1] : undefined}
              open={sheet === 'who'}
              onOpen={() => setSheet('who')}
              onClose={close}
            >
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {COMPANIONS.map(([id, text]) => (
                  <Chip
                    key={id}
                    label={text}
                    selected={companions === id}
                    onPress={() => {
                      setCompanions(companions === id ? null : id);
                      close();
                    }}
                  />
                ))}
              </View>
            </SheetRow>
          </Group>

          {/* The score. */}
          <Card tone="blush" style={{ padding: PAD, gap: 6 }}>
            <Text variant="heading" accessibilityRole="header" style={{ textAlign: 'center' }}>
              How was it?
            </Text>
            <ScorePicker value={score} onChange={setScore} label="How was it" bare />
            <YesNo question="Would you go back?" value={goBack} onChange={setGoBack} />
          </Card>

          {/* Optional extras: each row opens in place. */}
          <Text variant="label" style={{ marginTop: 8, marginLeft: 4 }}>
            Add more (optional)
          </Text>
          <Group>
            <SheetRow icon={<ImageIcon color={colors.ink} />} title="Add photos" summary={photos.length ? `${photos.length} ${photos.length === 1 ? 'photo' : 'photos'}` : undefined} open={sheet === 'photos'} onOpen={() => setSheet('photos')} onClose={close} saveLabel="Save photos">
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
                      accessibilityLabel={photos.length ? 'Add more photos' : 'Choose photos'}
                      style={{
                        width: PHOTO_SIZE,
                        height: PHOTO_SIZE,
                        borderRadius: radius.md,
                        borderWidth: 1.5,
                        borderStyle: 'dashed',
                        borderColor: colors.line,
                        backgroundColor: colors.bg,
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                      }}
                    >
                      <PlusIcon color={colors.accentDeep} size={20} />
                      <Text variant="small" style={{ color: colors.ink }}>
                        {photos.length ? 'Add more' : `Up to ${MAX_PHOTOS}`}
                      </Text>
                    </Pressable>
                  )}
                </ScrollView>
              </View>
              <Text variant="tiny">
                {photos.length > 1 ? 'Hold a photo, then drag to reorder. The first is the cover. ' : ''}Location data is removed before saving.
              </Text>
            </SheetRow>
            <Divider />
            <SheetRow icon={<NoteIcon color={colors.ink} />} title="Add a note" summary={note.trim() ? 'Added' : undefined} open={sheet === 'note'} onOpen={() => setSheet('note')} onClose={close} saveLabel="Save note">
              <Input
                value={note}
                onChangeText={setNote}
                placeholder="A line about it, e.g. “Long lunches by the sea”"
                accessibilityLabel="Add a note"
                autoFocus
                multiline
                maxLength={500}
                style={{ minHeight: 70, textAlignVertical: 'top' }}
              />
            </SheetRow>
            <Divider />
            <SheetRow icon={<BedIcon color={colors.ink} />} title="Where you stayed" summary={stayName.trim() || undefined} open={sheet === 'stay'} onOpen={() => setSheet('stay')} onClose={close} saveLabel="Save where you stayed">
              <StayPicker
                value={stayName}
                onChange={setStayName}
                onPick={(k) => {
                  setStayName(k.name);
                  setStayType(k.type);
                }}
                tripPlace={place?.name ?? null}
                tripCountry={place?.country ?? null}
                autoFocus
              />
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {STAY_KINDS.map((k) => (
                  <Chip key={k} label={k} selected={stayType === k} onPress={() => setStayType(stayType === k ? null : k)} />
                ))}
              </View>
              <ScorePicker value={stayScore} onChange={setStayScore} label="Stay score (optional)" compact />
              <YesNo question="Would you stay here again?" value={stayAgain} onChange={setStayAgain} />
            </SheetRow>
            <Divider />
            <SheetRow
              icon={<PinIcon color={colors.ink} />}
              title="Other places on this trip"
              summary={stopsCount ? `${stopsCount} ${stopsCount === 1 ? 'place' : 'places'}` : undefined}
              open={sheet === 'places'}
              onOpen={() => setSheet('places')}
              onClose={close}
              saveLabel="Save places"
            >
              {extras.map((e, i) => (
                <View key={e.key} style={{ gap: 10, paddingBottom: 6 }}>
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
                </View>
              ))}
              {extras.length < 9 && (
                <Button title="+ Add a place" kind="outline" onPress={() => setExtras((xs) => [...xs, { key: nextKey.current++, place: null, nights: '' }])} />
              )}
            </SheetRow>
            <Divider />
            <SheetRow
              icon={<ForkIcon color={colors.ink} />}
              title="Best restaurants"
              summary={restSummary}
              open={sheet === 'food'}
              onOpen={() => setSheet('food')}
              onClose={close}
              saveLabel="Save restaurants"
            >
              {restaurants.map((r, i) => (
                <View key={r.key} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Input
                      value={r.name}
                      onChangeText={(t) => setRestaurants((rs) => rs.map((x) => (x.key === r.key ? { ...x, name: t } : x)))}
                      placeholder={i === 0 ? 'Restaurant or café' : 'Another restaurant'}
                      accessibilityLabel={`Restaurant ${i + 1}`}
                      maxLength={120}
                    />
                  </View>
                  {restaurants.length > 1 && (
                    <Pressable
                      onPress={() => setRestaurants((rs) => rs.filter((x) => x.key !== r.key))}
                      accessibilityRole="button"
                      accessibilityLabel={`Remove restaurant ${i + 1}`}
                      hitSlop={8}
                      style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Text style={{ fontFamily: fonts.sansBold, fontSize: 16, lineHeight: 18, color: colors.muted }}>×</Text>
                    </Pressable>
                  )}
                </View>
              ))}
              {restaurants.length < 10 && (
                <Pressable
                  onPress={() => setRestaurants((rs) => [...rs, { key: restKey.current++, name: '' }])}
                  accessibilityRole="button"
                  accessibilityLabel="Add another restaurant"
                  hitSlop={6}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingVertical: 4 }}
                >
                  <PlusIcon color={colors.accentDeep} size={18} />
                  <Text variant="link">Add another restaurant</Text>
                </Pressable>
              )}
            </SheetRow>
            <Divider />
            <SheetRow icon={<BulbIcon color={colors.ink} />} title="Top tip" summary={tip.trim() ? 'Added' : undefined} open={sheet === 'tip'} onOpen={() => setSheet('tip')} onClose={close} saveLabel="Save tip">
              <Input
                value={tip}
                onChangeText={setTip}
                placeholder="Something you wish you'd known"
                accessibilityLabel="Top tip"
                autoFocus
                multiline
                maxLength={280}
                style={{ minHeight: 90, textAlignVertical: 'top' }}
              />
            </SheetRow>
          </Group>

          {/* Who can see it. */}
          <Group>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: PAD }}>
              <LockIcon color={colors.ink} size={22} strokeWidth={1.8} />
              <View style={{ flex: 1 }}>
                <Text variant="strong">Just me</Text>
                <Text variant="tiny">{visibility === 'private' ? 'Only you will ever see this trip.' : 'Your followers can see it. Trips are only shared once you’re home.'}</Text>
              </View>
              <Switch
                value={visibility === 'private'}
                onValueChange={(v) => setVisibility(v ? 'private' : 'friends')}
                trackColor={{ false: colors.line, true: colors.accentDeep }}
                thumbColor={colors.card}
                ios_backgroundColor={colors.line}
                accessibilityLabel="Just me: only you can see this trip"
              />
            </View>
          </Group>

          {problemsNotice}
          <ErrorNotice error={saveError} />

          <View style={{ marginTop: 6 }}>{saveButton}</View>
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}

type SheetId = 'when' | 'nights' | 'who' | 'photos' | 'note' | 'stay' | 'places' | 'food' | 'tip';
/** Padding inside the form's cards. */
const PAD = 18;

/** A white card holding a few rows, with thin lines between them. */
function Group({ children }: { children: React.ReactNode }) {
  return <View style={{ backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, overflow: 'hidden' }}>{children}</View>;
}

function Divider() {
  return <View style={{ height: 1, backgroundColor: colors.line, marginLeft: PAD + 36 }} />;
}

/**
 * One question as a row (icon, title, your answer, chevron). Tapping it opens the question on its own page,
 * sliding up from the bottom. Answers are kept as you go; "Save …" (or swiping the page down) closes it.
 */
function SheetRow({
  icon,
  title,
  summary,
  required = false,
  open,
  onOpen,
  onClose,
  saveLabel,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  summary?: string;
  /** Not answered yet: shows "Choose" in terracotta. */
  required?: boolean;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  /** The button at the bottom of the page ("Save note"); pages that close when you pick have none. */
  saveLabel?: string;
  children: React.ReactNode;
}) {
  const long = !!summary && title.length + summary.length > 30;
  return (
    <>
      <Pressable
        onPress={onOpen}
        accessibilityRole="button"
        accessibilityLabel={summary ? `${title}, ${summary}` : title}
        style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: PAD, paddingVertical: 17, backgroundColor: pressed ? colors.bg : 'transparent' })}
      >
        <View style={{ width: 22, alignItems: 'center' }}>{icon}</View>
        <View style={{ flex: 1 }}>
          <Text variant="body" numberOfLines={1} style={{ fontFamily: fonts.sansMedium }}>
            {title}
          </Text>
          {/* A long answer goes under the title, so neither gets squashed. */}
          {!!summary && long && (
            <Text variant="small" numberOfLines={1} style={{ color: colors.accentText, marginTop: 1 }}>
              {summary}
            </Text>
          )}
        </View>
        {summary && !long ? (
          <Text variant="small" numberOfLines={1} style={{ color: colors.ink, fontFamily: fonts.sansSemiBold }}>
            {summary}
          </Text>
        ) : summary ? null : required ? (
          <Text variant="small" style={{ color: colors.accentText }}>
            Choose
          </Text>
        ) : null}
        <ChevronIcon color={colors.muted} />
      </Pressable>
      <Modal visible={open} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: colors.bg }}>
          <View style={{ alignItems: 'center', paddingTop: 10 }}>
            <View style={{ width: 40, height: 5, borderRadius: 3, backgroundColor: colors.line }} />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: GUTTER, paddingTop: 16, paddingBottom: 6 }}>
            <View style={{ width: 22, alignItems: 'center' }}>{icon}</View>
            <Text variant="heading" accessibilityRole="header" style={{ flex: 1 }}>
              {title}
            </Text>
          </View>
          <ScrollView contentContainerStyle={{ padding: GUTTER, gap: 14, paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
          {saveLabel && (
            <View style={{ paddingHorizontal: GUTTER, paddingTop: 8, paddingBottom: 30 }}>
              <Button title={saveLabel} kind="dark" size="lg" onPress={onClose} />
            </View>
          )}
        </KeyboardAvoidingView>
      </Modal>
    </>
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
          style={{ position: 'absolute', top: 6, right: 6, width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(53,59,44,0.75)', alignItems: 'center', justifyContent: 'center' }}
        >
          <Text style={{ color: colors.onDark, fontFamily: fonts.sansBold, fontSize: 14, lineHeight: 16 }}>×</Text>
        </Pressable>
      )}
    </View>
  );
}

/**
 * "Would you go back?": Yes / No chips (owner, Nov 2026). Optional: tap the chosen one again to clear it.
 * Friends then see how many would go back to a place or a stay.
 */
function YesNo({ question, value, onChange }: { question: string; value: boolean | null; onChange: (v: boolean | null) => void }) {
  return (
    <View style={{ marginTop: 10, alignItems: 'center', gap: 8 }} accessibilityRole="radiogroup" accessibilityLabel={question}>
      <Text variant="strong">{question}</Text>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Chip label="Yes" selected={value === true} onPress={() => onChange(value === true ? null : true)} />
        <Chip label="No" selected={value === false} onPress={() => onChange(value === false ? null : false)} />
      </View>
    </View>
  );
}
