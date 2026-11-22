import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { Text } from '@/components/Text';
import { Chip } from '@/components/ui';
import { colors, GUTTER } from '@/constants/theme';
import { addMonths, currentMonth, longMonth, makeMonth, MONTH_NAMES_SHORT, monthYear, yearOf } from '@/lib/months';

/** This month and the 6 before it as chips, or "Earlier…" to pick any past month. */
export function MonthPicker({ value, onChange, bleed = GUTTER }: { value: string | null; onChange: (ym: string) => void; /** How far the chip row reaches past its box (to the card or screen edge). */ bleed?: number }) {
  const now = currentMonth();
  const recent = Array.from({ length: 7 }, (_, i) => addMonths(now, -i));
  const [earlier, setEarlier] = useState(!!value && !recent.includes(value));
  const [year, setYear] = useState(value && !recent.includes(value) ? yearOf(value) : yearOf(now) - 1);

  return (
    <View style={{ gap: 10 }}>
      <View style={{ marginHorizontal: -bleed }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: bleed }}>
          {recent.map((ym) => (
            <Chip
              key={ym}
              label={monthYear(ym)}
              accessibilityLabel={ym === now ? `This month, ${longMonth(ym)}` : longMonth(ym)}
              selected={value === ym}
              onPress={() => {
                setEarlier(false);
                onChange(ym);
              }}
            />
          ))}
          <Chip label="Earlier…" selected={earlier} onPress={() => setEarlier(true)} />
        </ScrollView>
      </View>

      {earlier && (
        <View style={{ gap: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 18 }}>
            <Pressable accessibilityRole="button" accessibilityLabel="Previous year" disabled={year <= 1950} onPress={() => setYear((y) => y - 1)} hitSlop={10}>
              <Text variant="heading" style={{ color: colors.accentText }}>
                ‹
              </Text>
            </Pressable>
            <Text variant="heading" accessibilityLiveRegion="polite">
              {year}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Next year"
              disabled={year >= yearOf(now)}
              onPress={() => setYear((y) => Math.min(y + 1, yearOf(now)))}
              hitSlop={10}
              style={{ opacity: year >= yearOf(now) ? 0.3 : 1 }}
            >
              <Text variant="heading" style={{ color: colors.accentText }}>
                ›
              </Text>
            </Pressable>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {MONTH_NAMES_SHORT.map((name, m) => {
              const ym = makeMonth(year, m);
              // Never a future month, and skip months already shown as chips above.
              if (ym > now || recent.includes(ym)) return null;
              return <Chip key={ym} label={name} accessibilityLabel={`${name} ${year}`} selected={value === ym} onPress={() => onChange(ym)} />;
            })}
          </View>
        </View>
      )}
    </View>
  );
}
