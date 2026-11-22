import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { colors } from '@/constants/theme';
import { searchStays, type KnownStay } from '@/lib/knownStays';
import { Text } from '../Text';
import { Input } from '../ui';

/**
 * "Where you stayed": as soon as the box is open, well-known stays in the trip's place show (Tenerife →
 * Bahía del Duque, The Ritz-Carlton, Abama…), and each letter narrows them, with matches anywhere else
 * after. Tap one to fill in its name and kind, or just keep typing your own.
 */
export function StayPicker({
  value,
  onChange,
  onPick,
  tripPlace,
  tripCountry = null,
  autoFocus = false,
}: {
  value: string;
  onChange: (name: string) => void;
  onPick: (stay: KnownStay) => void;
  tripPlace: string | null;
  tripCountry?: string | null;
  autoFocus?: boolean;
}) {
  const [focused, setFocused] = useState(autoFocus);
  const [picked, setPicked] = useState<string | null>(null);
  const results = focused && value !== picked ? searchStays(value, tripPlace, 8, tripCountry) : [];
  const popular = !value.trim();

  return (
    <View style={{ gap: 6 }}>
      <Input
        value={value}
        onChangeText={(t) => {
          onChange(t);
          setPicked(null);
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
        placeholder="Hotel, villa, B&B or hostel"
        accessibilityLabel="Name of where you stayed"
        autoCorrect={false}
        autoFocus={autoFocus}
        maxLength={80}
      />
      {results.length > 0 && (
        <View style={{ borderWidth: 1, borderColor: colors.line, borderRadius: 16, backgroundColor: colors.card, overflow: 'hidden' }} accessibilityRole="list">
          {popular && (
            <Text variant="label" style={{ paddingHorizontal: 14, paddingTop: 12, paddingBottom: 4 }}>
              {`Popular in ${results[0].place}`}
            </Text>
          )}
          {results.map((s, i) => (
            <Pressable
              key={s.name}
              onPress={() => {
                onPick(s);
                setPicked(s.name);
              }}
              accessibilityRole="button"
              accessibilityLabel={`${s.name}, ${s.label ?? s.type} in ${s.place}`}
              style={({ pressed }) => ({
                paddingHorizontal: 14,
                paddingVertical: 10,
                borderTopWidth: i || popular ? 1 : 0,
                borderTopColor: colors.line,
                backgroundColor: pressed ? colors.bg : colors.card,
              })}
            >
              <Text variant="strong" style={{ fontSize: 15 }}>
                {s.name}
              </Text>
              <Text variant="tiny">
                {s.label ?? s.type} · {s.place}
                {s.region && !s.region.startsWith(s.place) ? `, ${s.region}` : ''}
              </Text>
            </Pressable>
          ))}
          <Text variant="tiny" style={{ paddingHorizontal: 14, paddingVertical: 8, borderTopWidth: 1, borderTopColor: colors.line }}>
            {popular ? 'Or type the name of where you stayed.' : 'Not here? Just keep typing the name.'}
          </Text>
        </View>
      )}
    </View>
  );
}
