import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Link } from 'expo-router';
import { useRef, useState, type ComponentRef } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';

import { Airmail } from '@/components/Airmail';
import { Postmark } from '@/components/Postmark';
import { Stamp } from '@/components/Stamp';
import { Text } from '@/components/Text';
import { Button, Card, Chip, Field, Header, Input, Notice, Screen } from '@/components/ui';
import { colors, fonts, GUTTER } from '@/constants/theme';
import { STAY_TYPES, destinations, formatMonth, type StayType } from '@/lib/data';

type Draft = {
  place: string;
  country: string;
  month: string;
  year: string;
  destinationScore: number | null;
  stayName: string;
  stayType: StayType | null;
  stayScore: number | null;
  headline: string;
  review: string;
  food: string[];
  tips: string[];
  home: boolean;
};

const EMPTY: Draft = {
  place: '',
  country: '',
  month: '',
  year: '',
  destinationScore: null,
  stayName: '',
  stayType: null,
  stayScore: null,
  headline: '',
  review: '',
  food: ['', '', ''],
  tips: ['', '', ''],
  home: false,
};

/**
 * "Log a holiday". For now it checks the answers and shows a preview.
 * Step 2 of docs/plan.md saves it to Supabase.
 */
export default function Log() {
  const [d, setD] = useState<Draft>(EMPTY);
  const [photos, setPhotos] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setD((prev) => ({ ...prev, [key]: value }));
  const setListItem = (key: 'food' | 'tips', i: number, value: string) =>
    setD((prev) => ({ ...prev, [key]: prev[key].map((v, j) => (j === i ? value : v)) }));
  const tripMonth = d.year.length === 4 && d.month ? `${d.year}-${d.month.padStart(2, '0')}` : '';
  const suggestions =
    d.place.trim().length > 0
      ? destinations.filter((x) => x.name.toLowerCase().startsWith(d.place.trim().toLowerCase()) && x.name !== d.place).slice(0, 3)
      : [];

  function validate(): string[] {
    const errs: string[] = [];
    if (!d.place.trim()) errs.push('Where did you go?');
    const m = Number(d.month);
    if (!tripMonth || m < 1 || m > 12) errs.push('Add the month and year you went.');
    else {
      const now = new Date();
      const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      if (tripMonth > thisMonth) errs.push("That month is in the future. Postcard is for trips you're back from.");
    }
    if (!d.destinationScore) errs.push('Give the destination a score out of 10.');
    if (!d.stayName.trim()) errs.push('Where did you stay?');
    if (!d.stayType) errs.push('What kind of place was it?');
    if (!d.stayScore) errs.push('Give your stay a score out of 10.');
    if (!d.home) errs.push("Tick to confirm you're back home. We never post while you're away.");
    return errs;
  }

  async function pickPhotos() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: 6,
      exif: false, // never read location data from photos
      quality: 0.8,
    });
    if (!result.canceled) setPhotos(result.assets.slice(0, 6).map((a) => a.uri));
  }

  if (submitted) {
    return (
      <Screen tabBar>
        <Header title="Log a holiday" kicker="Welcome home" />
        <View style={{ paddingHorizontal: GUTTER, gap: 20 }}>
          <Card>
            <Airmail height={8} />
            <View style={{ padding: 20 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Postmark place={d.place} date={formatMonth(tripMonth)} size={72} />
                <Stamp score={d.destinationScore!} label="Place" size="lg" tilt={5} />
              </View>
              <Text variant="title" style={{ marginTop: 16, fontSize: 24 }}>
                {d.headline || `${d.place}, rated`}
              </Text>
              <Text variant="small" style={{ marginTop: 4 }}>
                {d.stayName} ({d.stayType}) · {d.stayScore}/10
              </Text>
            </View>
          </Card>
          <Notice tone="info">
            <Text variant="body" style={{ fontSize: 14 }}>
              <Text variant="strong">Preview only.</Text> Saving holidays comes in the next step, so nothing has been saved yet.
            </Text>
          </Notice>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Button
              title="Log another"
              kind="secondary"
              style={{ flex: 1 }}
              onPress={() => {
                setD(EMPTY);
                setPhotos([]);
                setSubmitted(false);
              }}
            />
            <Link href="/" asChild>
              <Button title="Back home" style={{ flex: 1 }} />
            </Link>
          </View>
        </View>
      </Screen>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen tabBar ref={scroll}>
        <Header title="Log a holiday" kicker="Welcome home" />
        <Text variant="bodySoft" style={{ paddingHorizontal: GUTTER, marginTop: -8, marginBottom: 24 }}>
          Rate the place and where you stayed, out of 10.
        </Text>

        <View style={{ paddingHorizontal: GUTTER, gap: 28 }}>
          <Section title="The place">
            <Field label="Where did you go?">
              <Input value={d.place} onChangeText={(t) => set('place', t)} placeholder="e.g. Lisbon" accessibilityLabel="Where did you go?" />
              {suggestions.length > 0 && (
                <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                  {suggestions.map((x) => (
                    <Chip
                      key={x.slug}
                      label={`${x.name}, ${x.country}`}
                      selected={false}
                      onPress={() => setD((p) => ({ ...p, place: x.name, country: x.country }))}
                    />
                  ))}
                </View>
              )}
            </Field>
            <Field label="Country">
              <Input value={d.country} onChangeText={(t) => set('country', t)} accessibilityLabel="Country" />
            </Field>
            <Field label="When did you go?">
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Input
                  value={d.month}
                  onChangeText={(t) => set('month', t.replace(/\D/g, '').slice(0, 2))}
                  placeholder="MM"
                  keyboardType="number-pad"
                  accessibilityLabel="Month you went"
                  style={{ flex: 1, textAlign: 'center' }}
                />
                <Input
                  value={d.year}
                  onChangeText={(t) => set('year', t.replace(/\D/g, '').slice(0, 4))}
                  placeholder="YYYY"
                  keyboardType="number-pad"
                  accessibilityLabel="Year you went"
                  style={{ flex: 1.5, textAlign: 'center' }}
                />
              </View>
            </Field>
            <ScorePicker label="Destination score" value={d.destinationScore} onChange={(v) => set('destinationScore', v)} />
          </Section>

          <Section title="Where you stayed">
            <Field label="Name of the place">
              <Input value={d.stayName} onChangeText={(t) => set('stayName', t)} placeholder="e.g. Casa do Miradouro" accessibilityLabel="Name of the place you stayed" />
            </Field>
            <Field label="Type of stay">
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {STAY_TYPES.map((t) => (
                  <Chip key={t} label={t} selected={d.stayType === t} onPress={() => set('stayType', t)} />
                ))}
              </View>
            </Field>
            <ScorePicker label="Stay score" value={d.stayScore} onChange={(v) => set('stayScore', v)} />
          </Section>

          <Section title="Tell your friends">
            <Field label="Headline">
              <Input value={d.headline} onChangeText={(t) => set('headline', t)} placeholder="Pastéis for breakfast, lunch and tea" accessibilityLabel="Headline" />
            </Field>
            <Field label="How was it?">
              <Input
                value={d.review}
                onChangeText={(t) => set('review', t)}
                multiline
                accessibilityLabel="How was it?"
                style={{ minHeight: 100, textAlignVertical: 'top' }}
              />
            </Field>
            <Field label="Food picks">
              {d.food.map((v, i) => (
                <Input
                  key={i}
                  value={v}
                  onChangeText={(t) => setListItem('food', i, t)}
                  placeholder={i === 0 ? 'Restaurant, café or dish' : ''}
                  accessibilityLabel={`Food pick ${i + 1}`}
                />
              ))}
            </Field>
            <Field label="Top tips">
              {d.tips.map((v, i) => (
                <Input
                  key={i}
                  value={v}
                  onChangeText={(t) => setListItem('tips', i, t)}
                  placeholder={i === 0 ? "Something you wish you'd known" : ''}
                  accessibilityLabel={`Top tip ${i + 1}`}
                />
              ))}
            </Field>
            <Field label="Photos" hint="Up to 6. Location data in photos is never used.">
              <Button title={photos.length ? 'Choose different photos' : 'Choose photos'} kind="dark" onPress={pickPhotos} />
              {photos.length > 0 && (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {photos.map((uri) => (
                    <Image key={uri} source={{ uri }} style={{ width: '31%', aspectRatio: 1, borderRadius: 4 }} contentFit="cover" />
                  ))}
                </View>
              )}
            </Field>
          </Section>

          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: d.home }}
            onPress={() => set('home', !d.home)}
          >
            <Card style={{ padding: 16, flexDirection: 'row', gap: 12 }}>
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 4,
                  borderWidth: 1.5,
                  borderColor: d.home ? colors.postbox : colors.inkSoft,
                  backgroundColor: d.home ? colors.postbox : 'transparent',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 1,
                }}
              >
                {d.home && <Text style={{ color: colors.card, fontFamily: fonts.sansBold, fontSize: 14 }}>✓</Text>}
              </View>
              <Text variant="body" style={{ flex: 1, fontSize: 14 }}>
                <Text variant="strong">I&apos;m back home.</Text> Postcard never shares where you are right now, only where you&apos;ve been.
              </Text>
            </Card>
          </Pressable>

          {errors.length > 0 && (
            <Notice>
              <Text variant="strong" style={{ color: colors.postbox }}>
                Nearly there:
              </Text>
              {errors.map((e) => (
                <Text key={e} variant="body" style={{ fontSize: 14 }}>
                  • {e}
                </Text>
              ))}
            </Notice>
          )}

          <Button
            title="Send postcard"
            onPress={() => {
              const errs = validate();
              setErrors(errs);
              if (errs.length === 0) {
                setSubmitted(true);
                scroll.current?.scrollTo({ y: 0, animated: false });
              }
            }}
          />
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 16 }}>
      <Text variant="heading">{title}</Text>
      {children}
    </View>
  );
}

function ScorePicker({ label, value, onChange }: { label: string; value: number | null; onChange: (v: number) => void }) {
  return (
    <View style={{ gap: 8 }} accessibilityRole="radiogroup" accessibilityLabel={`${label}, out of 10`}>
      <Text variant="label">
        {label} <Text variant="small">(out of 10)</Text>
      </Text>
      <View style={{ flexDirection: 'row', gap: 4 }}>
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
          const on = value === n;
          return (
            <Pressable
              key={n}
              accessibilityRole="radio"
              accessibilityState={{ checked: on }}
              accessibilityLabel={`${n}`}
              onPress={() => onChange(n)}
              style={{
                flex: 1,
                height: 42,
                borderRadius: 4,
                borderWidth: 1,
                borderColor: on ? colors.postbox : colors.sand,
                backgroundColor: on ? colors.postbox : colors.card,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontFamily: fonts.display, fontSize: 16, color: on ? colors.card : colors.inkSoft }}>{n}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
