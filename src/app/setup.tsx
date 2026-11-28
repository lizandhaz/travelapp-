import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AccentTitle } from '@/components/AccentTitle';
import { PhotoTile } from '@/components/Photo';
import { Text } from '@/components/Text';
import { Button, Chip } from '@/components/ui';
import { appWidth, colors, fonts, GUTTER, radius } from '@/constants/theme';
import { addToBoard, ensureWishList } from '@/lib/boards';
import { sampleCountry } from '@/lib/placeFeatures';
import { places } from '@/lib/sample';
import { EMPTY_START, saveStartTaste, START_TYPES } from '@/lib/startTaste';
import { tasteChanged } from '@/lib/tasteEvents';
import { COMPANIONS, type Companions } from '@/lib/trips';

/**
 * First-time setup (plan Step I, owner Nov 2026): three quick, tap-only steps so a new person's scores and top picks
 * are ranked for them straight away, with no friends needed: the holidays they love, who they usually go with, and
 * places they've been or want to go (Want to go places are saved to their real board). Skippable, and can be retaken
 * from Settings.
 */
type Mark = 'been' | 'want';

export default function Setup() {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const [types, setTypes] = useState<string[]>([]);
  const [who, setWho] = useState<Exclude<Companions, 'work'> | null>(null);
  const [marks, setMarks] = useState<Record<string, Mark>>({});
  const [saving, setSaving] = useState(false);
  const tiles = places.filter((p) => !!p.photo);
  const tileW = Math.floor((appWidth() - GUTTER * 2 - 12) / 2);

  const toggleType = (t: string) => setTypes((ts) => (ts.includes(t) ? ts.filter((x) => x !== t) : [...ts, t]));
  // Tap once: been. Twice: want to go. Three times: neither.
  const cycle = (slug: string) =>
    setMarks((m) => {
      const next = { ...m };
      if (!m[slug]) next[slug] = 'been';
      else if (m[slug] === 'been') next[slug] = 'want';
      else delete next[slug];
      return next;
    });

  async function finish() {
    setSaving(true);
    const been = Object.keys(marks).filter((s) => marks[s] === 'been');
    const want = Object.keys(marks).filter((s) => marks[s] === 'want');
    await saveStartTaste({ types, who, been, done: true });
    if (want.length) {
      try {
        const board = await ensureWishList();
        for (const slug of want) {
          const p = places.find((x) => x.slug === slug);
          if (p) await addToBoard(board, { name: p.name, country: sampleCountry(slug), slug });
        }
      } catch {
        // Saving to Want to go can be done later from any place page.
      }
    }
    tasteChanged();
    router.replace('/');
  }

  async function skip() {
    await saveStartTaste({ ...EMPTY_START, done: true });
    router.replace('/');
  }

  const titles: [string, string, string | undefined][] = [
    ['What holidays do you', 'love', undefined],
    ['Who do you usually', 'go', 'with?'],
    ['Where have you', 'been', undefined],
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: GUTTER, paddingTop: 12 }}>
        <View style={{ flexDirection: 'row', gap: 6 }} accessibilityLabel={`Step ${step + 1} of 3`}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={{ width: i === step ? 22 : 8, height: 8, borderRadius: 4, backgroundColor: i <= step ? colors.accent : colors.line }} />
          ))}
        </View>
        <Pressable onPress={skip} accessibilityRole="button" hitSlop={10}>
          <Text variant="link">Skip for now</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: GUTTER, paddingTop: 24, paddingBottom: 30, gap: 18 }}>
        <AccentTitle before={titles[step][0]} accent={titles[step][1]} after={titles[step][2]} />
        {step === 0 && (
          <>
            <Text variant="bodySoft">Pick as many as you like. Your scores and top picks start from these.</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {START_TYPES.map((t) => (
                <Chip key={t.tag} label={t.label} selected={types.includes(t.tag)} onPress={() => toggleType(t.tag)} accessibilityLabel={`${t.label}${types.includes(t.tag) ? ', chosen' : ''}`} />
              ))}
            </View>
          </>
        )}
        {step === 1 && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {/* Who you holiday with: work trips aren't a holiday style. */}
            {COMPANIONS.filter((c): c is Exclude<(typeof COMPANIONS)[number], readonly ['work', string]> => c[0] !== 'work').map(([id, label]) => (
              <Chip key={id} label={label} selected={who === id} onPress={() => setWho(who === id ? null : id)} />
            ))}
          </View>
        )}
        {step === 2 && (
          <>
            <Text variant="bodySoft">Tap once for somewhere you’ve been, twice for somewhere you want to go.</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              {tiles.map((p) => {
                const m = marks[p.slug];
                return (
                  <Pressable
                    key={p.slug}
                    onPress={() => cycle(p.slug)}
                    accessibilityRole="button"
                    accessibilityLabel={`${p.name}${m === 'been' ? ', been' : m === 'want' ? ', want to go' : ''}. Tap to change`}
                    style={{ width: tileW }}
                  >
                    <PhotoTile photo={p.photo} style={{ width: tileW, height: Math.round(tileW * 0.8), borderRadius: radius.md, borderWidth: m ? 3 : 0, borderColor: m === 'want' ? colors.accent : colors.olive }}>
                      {!!m && (
                        <View style={{ position: 'absolute', top: 8, left: 8, borderRadius: radius.pill, paddingHorizontal: 9, paddingVertical: 3, backgroundColor: m === 'want' ? colors.accentDeep : colors.olive }}>
                          <Text style={{ fontFamily: fonts.sansSemiBold, fontSize: 12, color: colors.onDark }}>{m === 'want' ? '✦ Want to go' : '✓ Been'}</Text>
                        </View>
                      )}
                      <Text numberOfLines={1} style={{ position: 'absolute', left: 10, right: 10, bottom: 8, fontFamily: fonts.displayBold, fontSize: 17, color: colors.onDark }}>
                        {p.name}
                      </Text>
                    </PhotoTile>
                  </Pressable>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>

      <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: GUTTER, paddingTop: 12, paddingBottom: insets.bottom + 14, borderTopWidth: 1, borderTopColor: colors.line }}>
        {step > 0 && <Button title="Back" kind="outline" style={{ flex: 1 }} onPress={() => setStep(step - 1)} />}
        {step < 2 ? (
          <Button title="Next" kind="accent" style={{ flex: 2 }} onPress={() => setStep(step + 1)} />
        ) : (
          <Button title={saving ? 'Saving…' : 'See my picks'} kind="accent" style={{ flex: 2 }} disabled={saving} onPress={finish} />
        )}
      </View>
    </View>
  );
}
