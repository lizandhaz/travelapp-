import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { Text } from '@/components/Text';
import { Chip, Input } from '@/components/ui';
import { GUTTER } from '@/constants/theme';

const QUICK = [1, 2, 3, 4, 5, 7, 10, 14] as const;
const label = (n: number) => (n === 7 ? 'A week' : n === 14 ? 'Two weeks' : `${n} ${n === 1 ? 'night' : 'nights'}`);

/**
 * "How long did you stay?": quick picks (1 night to two weeks) or "Longer…"
 * to type any number of nights up to 365.
 */
export function NightsPicker({
  value,
  onChange,
  onPicked,
  bleed = GUTTER,
  wrap = false,
}: {
  value: number | null;
  onChange: (n: number | null) => void;
  /** Called after a quick pick (not while typing "Longer…"). */
  onPicked?: () => void;
  /** How far the chip row reaches past its box. */
  bleed?: number;
  /** Chips wrap onto lines instead of a sideways row. */
  wrap?: boolean;
}) {
  const isQuick = value != null && (QUICK as readonly number[]).includes(value);
  const [typing, setTyping] = useState(value != null && !isQuick);
  const [text, setText] = useState(value != null && !isQuick ? String(value) : '');

  return (
    <View style={{ gap: 12 }}>
      <View style={wrap ? undefined : { marginHorizontal: -bleed }}>
      <ScrollView horizontal={!wrap} scrollEnabled={!wrap} showsHorizontalScrollIndicator={false} contentContainerStyle={wrap ? { flexDirection: 'row', flexWrap: 'wrap', gap: 8 } : { gap: 8, paddingHorizontal: bleed }}>
        {QUICK.map((n) => (
          <Chip
            key={n}
            label={label(n)}
            accessibilityLabel={`${n} ${n === 1 ? 'night' : 'nights'}`}
            selected={!typing && value === n}
            onPress={() => {
              setTyping(false);
              const next = value === n && !typing ? null : n;
              onChange(next);
              if (next != null) onPicked?.();
            }}
          />
        ))}
        <Chip
          label="Longer…"
          accessibilityLabel="Longer: type the number of nights"
          selected={typing}
          onPress={() => {
            setTyping(true);
            onChange(text ? Number(text) : null);
          }}
        />
      </ScrollView>
      </View>
      {typing && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={{ width: 96 }}>
            <Input
              value={text}
              onChangeText={(t) => {
                const digits = t.replace(/\D/g, '').slice(0, 3);
                setText(digits);
                onChange(digits ? Number(digits) : null);
              }}
              keyboardType="number-pad"
              placeholder="21"
              autoFocus
              accessibilityLabel="Number of nights"
              style={{ textAlign: 'center', paddingVertical: 11 }}
            />
          </View>
          <Text variant="small">nights in total</Text>
        </View>
      )}
    </View>
  );
}
