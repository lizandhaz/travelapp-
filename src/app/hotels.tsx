import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';

import { AccentTitle } from '@/components/AccentTitle';
import { Text } from '@/components/Text';
import { BackButton, Button, Chip, PageTitle, Screen } from '@/components/ui';
import { colors, fonts, GUTTER, radius } from '@/constants/theme';
import { getHotelPrefs, saveHotelPrefs } from '@/lib/hotelPrefs';
import { BUDGETS, EMPTY_HOTEL_PREFS, PICK_BRANDS, STYLE_LABEL, type HotelBudget, type HotelPrefs, type HotelStyle } from '@/lib/hotels';

const STYLES = Object.keys(STYLE_LABEL) as HotelStyle[];
const BUDGET_KEYS = Object.keys(BUDGETS) as HotelBudget[];

/**
 * "Hotels you love" (owner, Nov 2026: "I love Ikos resorts, Four Seasons etc, something that's luxury but not too
 * expensive"): brands you love, your budget a night and what you look for in a hotel. Every hotel's score uses it
 * (lib/hotels.ts): brands you love and ones like them go up, and so do hotels within your budget. All taps, all optional.
 * Opened from Settings → Your taste and from "Where to stay" on a place page.
 */
export default function HotelsYouLove() {
  const [prefs, setPrefs] = useState<HotelPrefs | null>(null);
  const [saving, setSaving] = useState(false);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    getHotelPrefs().then((p) => mounted.current && setPrefs(p));
    return () => {
      mounted.current = false;
    };
  }, []);

  const p = prefs ?? EMPTY_HOTEL_PREFS;
  const toggleBrand = (id: string) => setPrefs({ ...p, brands: p.brands.includes(id) ? p.brands.filter((b) => b !== id) : [...p.brands, id] });
  const toggleStyle = (s: HotelStyle) => setPrefs({ ...p, styles: p.styles.includes(s) ? p.styles.filter((x) => x !== s) : [...p.styles, s] });
  const anything = p.brands.length > 0 || p.styles.length > 0 || !!p.budget;

  async function save() {
    setSaving(true);
    await saveHotelPrefs(p);
    if (!mounted.current) return;
    setSaving(false);
    if (router.canGoBack()) router.back();
    else router.replace('/');
  }

  return (
    <Screen>
      <View style={{ paddingHorizontal: GUTTER, paddingTop: 12 }}>
        <BackButton />
      </View>
      <PageTitle label="Your taste">
        <AccentTitle before="Hotels you" accent="love" />
      </PageTitle>

      <View style={{ paddingHorizontal: GUTTER, gap: 30, paddingBottom: 40 }}>
        <View style={{ gap: 12 }}>
          <Text variant="label" accessibilityRole="header">
            Brands you love
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {PICK_BRANDS.map((b) => (
              <Chip key={b.id} label={b.name} selected={p.brands.includes(b.id)} onPress={() => toggleBrand(b.id)} />
            ))}
          </View>
        </View>

        <View style={{ gap: 12 }}>
          <Text variant="label" accessibilityRole="header">
            Your budget a night
          </Text>
          <View style={{ gap: 8 }} accessibilityRole="radiogroup">
            {BUDGET_KEYS.map((k) => {
              const on = p.budget === k;
              return (
                <Pressable
                  key={k}
                  onPress={() => setPrefs({ ...p, budget: on ? null : k })}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: on }}
                  accessibilityLabel={`${BUDGETS[k].label}, ${BUDGETS[k].sub}`}
                  accessibilityHint={on ? 'Tap again to clear' : undefined}
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    padding: 14,
                    borderRadius: radius.lg,
                    borderWidth: on ? 2 : 1,
                    borderColor: on ? colors.olive : colors.line,
                    backgroundColor: on ? colors.sageSoft : pressed ? colors.sand : colors.card,
                  })}
                >
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={{ fontFamily: fonts.sansSemiBold, fontSize: 16, color: colors.ink }}>{BUDGETS[k].label}</Text>
                    <Text variant="small">{BUDGETS[k].sub}</Text>
                  </View>
                  <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: on ? 0 : 1.5, borderColor: colors.muted, backgroundColor: on ? colors.olive : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                    {on && <Text style={{ color: colors.onDark, fontFamily: fonts.sansSemiBold, fontSize: 13, lineHeight: 16 }}>✓</Text>}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={{ gap: 12 }}>
          <Text variant="label" accessibilityRole="header">
            What you look for
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {STYLES.map((s) => (
              <Chip key={s} label={STYLE_LABEL[s]} selected={p.styles.includes(s)} onPress={() => toggleStyle(s)} />
            ))}
          </View>
        </View>

        <View style={{ gap: 12 }}>
          <Button title={saving ? 'Saving…' : 'Save'} kind="accent" size="lg" onPress={save} disabled={saving || !prefs} />
          {anything && (
            <Pressable onPress={() => setPrefs(EMPTY_HOTEL_PREFS)} accessibilityRole="button" hitSlop={8} style={{ alignSelf: 'center', padding: 6 }}>
              <Text variant="link">Clear all</Text>
            </Pressable>
          )}
          <Text variant="tiny" style={{ textAlign: 'center' }}>
            Kept on this phone. Every hotel’s score uses it straight away.
          </Text>
        </View>
      </View>
    </Screen>
  );
}
