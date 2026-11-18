import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useRef, useState, type ComponentRef } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';

import { Text } from '@/components/Text';
import { Button, Card, Chip, ErrorNotice, Header, Input, Notice, Screen } from '@/components/ui';
import { colors, fonts, GUTTER } from '@/constants/theme';
import { currentMonth } from '@/lib/months';
import {
  fetchPlaces,
  saveTrip,
  STAY_KINDS,
  type Place,
  type StayKind,
  type Trip,
  type TripInput,
  type Visibility,
} from '@/lib/trips';
import { MonthPicker } from './MonthPicker';
import { PlacePicker } from './PlacePicker';
import { ScorePicker } from './ScorePicker';

type ExtraStop = { key: number; place: Place | null; nights: string };

/**
 * "Add a trip" (and editing a trip). One simple screen; the optional extras sit
 * under "Add more detail". Saves through save_trip() in Supabase.
 */
export function TripForm({
  initial,
  onSaved,
  title,
  back,
}: {
  initial?: Trip;
  onSaved: (id: string) => void;
  title: string;
  back?: string;
}) {
  const [places, setPlaces] = useState<Place[]>([]);
  const [place, setPlace] = useState<Place | null>(initial?.stops[0] ?? null);
  const [month, setMonth] = useState<string | null>(initial?.month ?? null);
  const [score, setScore] = useState<number | null>(initial?.score ?? null);
  const [visibility, setVisibility] = useState<Visibility>(initial?.visibility ?? 'friends');
  const [photo, setPhoto] = useState<string | null>(null);
  const [home, setHome] = useState(false);

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
  const [more, setMore] = useState(
    !!initial && (initial.stops.length > 1 || !!initial.stay || !!initial.meal || !!initial.tip),
  );

  // After the first Save, the "Nearly there" list updates as you fix things.
  const [tried, setTried] = useState(false);
  const [saveError, setSaveError] = useState<{ message: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);

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
    if (!score) p.push('How was it? Tap a score from 1 to 10.');
    if (isThisMonth && !home) p.push("Tick “I'm back home”. Trips are only shared once you're home.");

    const stops = extras.filter((e) => e.place?.name.trim());
    stops.forEach((e) => {
      if (e.nights && !/^\d+$/.test(e.nights)) p.push(`Nights in ${e.place!.name} should be a number.`);
      else if (e.nights && (Number(e.nights) < 1 || Number(e.nights) > 365)) p.push(`Nights in ${e.place!.name} should be 1 to 365.`);
    });
    if (stops.length > 9) p.push('Up to 9 extra stops, please.');

    const hasStay = !!(stayName.trim() || stayType || stayScore);
    if (hasStay) {
      if (!stayName.trim()) p.push('What was the name of the place you stayed?');
      if (!stayType) p.push('What kind of place did you stay in?');
      if (!stayScore) p.push('Give where you stayed a score from 1 to 10.');
    }
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
          { ...place!, nights: initial?.stops[0]?.nights ?? null },
          ...stops.map((e) => ({ ...e.place!, nights: e.nights ? Number(e.nights) : null })),
        ],
        stay: hasStay ? { name: stayName.trim(), type: stayType!, score: stayScore! } : null,
        meal: meal.trim() || null,
        tip: tip.trim() || null,
      },
    };
  }

  const problems = tried ? check().problems : [];

  async function save() {
    setSaveError(null);
    setTried(true);
    const { input } = check();
    if (!input) return;
    setSaving(true);
    try {
      const id = await saveTrip(input);
      onSaved(id);
    } catch (e) {
      setSaveError({ message: e instanceof Error ? e.message : 'Something went wrong. Please try again.' });
    } finally {
      setSaving(false);
    }
  }

  async function pickPhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: false,
      exif: false, // never read location data from photos
      quality: 0.8,
    });
    if (!result.canceled) setPhoto(result.assets[0]?.uri ?? null);
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen tabBar={!back} ref={scroll}>
        <Header title={title} kicker={initial ? 'Edit trip' : 'Welcome home'} back={back} />

        <View style={{ paddingHorizontal: GUTTER, gap: 28 }}>
          <Question title="Where did you go?">
            <PlacePicker value={place} onChange={setPlace} places={places} accessibilityLabel="Where did you go?" />
          </Question>

          <Question title="When did you go?">
            <MonthPicker value={month} onChange={setMonth} />
          </Question>

          <Question title="How was it?">
            <ScorePicker value={score} onChange={setScore} label="How was it" />
          </Question>

          <Question title="Who can see this?">
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Chip label="Friends" selected={visibility === 'friends'} onPress={() => setVisibility('friends')} />
              <Chip label="Just me" selected={visibility === 'private'} onPress={() => setVisibility('private')} />
            </View>
            <Text variant="tiny">
              {visibility === 'friends'
                ? 'Your friends will see this once friends arrive in the app. For now it’s only visible to you.'
                : 'Only you will ever see this trip.'}
            </Text>
          </Question>

          <Question title="Photo" note="optional">
            {photo ? (
              <View style={{ gap: 8 }}>
                <Image source={{ uri: photo }} style={{ width: '100%', aspectRatio: 4 / 3, borderRadius: 6 }} contentFit="cover" />
                <View style={{ flexDirection: 'row', gap: 16 }}>
                  <Pressable onPress={pickPhoto} accessibilityRole="button" hitSlop={8}>
                    <Text variant="link">Change photo</Text>
                  </Pressable>
                  <Pressable onPress={() => setPhoto(null)} accessibilityRole="button" hitSlop={8}>
                    <Text variant="link" style={{ color: colors.postbox }}>
                      Remove
                    </Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <Button title="Choose a photo" kind="secondary" onPress={pickPhoto} />
            )}
            <Text variant="tiny">Preview only for now: photos aren’t saved with the trip yet.</Text>
          </Question>

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ expanded: more }}
            onPress={() => setMore((m) => !m)}
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 }}
          >
            <Text variant="heading">Add more detail</Text>
            <Text variant="link">{more ? 'Hide' : 'Show'}</Text>
          </Pressable>

          {more && (
            <View style={{ gap: 28, marginTop: -12 }}>
              <Question title="Extra stops" note="other places on the same trip">
                {extras.map((e, i) => (
                  <Card key={e.key} style={{ padding: 12, gap: 8 }}>
                    <PlacePicker
                      value={e.place}
                      onChange={(p) => setExtras((xs) => xs.map((x) => (x.key === e.key ? { ...x, place: p } : x)))}
                      places={places}
                      placeholder="Another place"
                      accessibilityLabel={`Extra stop ${i + 1}`}
                    />
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <Input
                        value={e.nights}
                        onChangeText={(t) =>
                          setExtras((xs) => xs.map((x) => (x.key === e.key ? { ...x, nights: t.replace(/\D/g, '').slice(0, 3) } : x)))
                        }
                        keyboardType="number-pad"
                        placeholder="Nights"
                        accessibilityLabel={`Nights at extra stop ${i + 1}`}
                        style={{ width: 90, textAlign: 'center' }}
                      />
                      <Text variant="small" style={{ flex: 1 }}>
                        nights
                      </Text>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Remove extra stop ${i + 1}`}
                        onPress={() => setExtras((xs) => xs.filter((x) => x.key !== e.key))}
                        hitSlop={8}
                      >
                        <Text variant="link" style={{ color: colors.postbox }}>
                          Remove
                        </Text>
                      </Pressable>
                    </View>
                  </Card>
                ))}
                {extras.length < 9 && (
                  <Button
                    title="+ Add a stop"
                    kind="secondary"
                    onPress={() => setExtras((xs) => [...xs, { key: nextKey.current++, place: null, nights: '' }])}
                  />
                )}
              </Question>

              <Question title="Where you stayed">
                <Input value={stayName} onChangeText={setStayName} placeholder="e.g. Casa Azul" accessibilityLabel="Name of where you stayed" />
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
                  style={{ minHeight: 80, textAlignVertical: 'top' }}
                />
              </Question>
            </View>
          )}

          {isThisMonth && (
            <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: home }} onPress={() => setHome(!home)}>
              <Card style={{ padding: 16, flexDirection: 'row', gap: 12 }}>
                <View
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 4,
                    borderWidth: 1.5,
                    borderColor: home ? colors.postbox : colors.inkSoft,
                    backgroundColor: home ? colors.postbox : 'transparent',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: 1,
                  }}
                >
                  {home && <Text style={{ color: colors.card, fontFamily: fonts.sansBold, fontSize: 14 }}>✓</Text>}
                </View>
                <Text variant="body" style={{ flex: 1, fontSize: 14 }}>
                  <Text variant="strong">I&apos;m back home.</Text> We never share where you are right now, only where
                  you&apos;ve been.
                </Text>
              </Card>
            </Pressable>
          )}

          {problems.length > 0 && (
            <Notice>
              <Text variant="strong" style={{ color: colors.postbox }}>
                Nearly there:
              </Text>
              {problems.map((p) => (
                <Text key={p} variant="body" style={{ fontSize: 14 }}>
                  • {p}
                </Text>
              ))}
            </Notice>
          )}
          <ErrorNotice error={saveError} />

          <Button title={saving ? 'Saving…' : initial ? 'Save changes' : 'Save trip'} onPress={save} disabled={saving} />
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}

function Question({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 12 }}>
      <Text variant="heading">
        {title}
        {note ? <Text variant="small"> ({note})</Text> : null}
      </Text>
      {children}
    </View>
  );
}
