import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { colors } from '@/constants/theme';
import { searchStays, type KnownStay } from '@/lib/knownStays';
import { Text } from '../Text';
import { Input } from '../ui';

/**
 * "Where you stayed": type a name and stays the app knows pop up (ones in the place you went first).
 * Tap one to fill in its name and kind, or just keep typing your own.
 */
export function StayPicker({ value, onChange, onPick, tripPlace }: { value: string; onChange: (name: string) => void; onPick: (stay: KnownStay) => void; tripPlace: string | null }) {
  const [focused, setFocused] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const results = focused && value !== picked ? searchStays(value, tripPlace) : [];

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
        placeholder="Start typing, e.g. Casa Ammos"
        accessibilityLabel="Name of where you stayed"
        autoCorrect={false}
        maxLength={120}
      />
      {results.length > 0 && (
        <View style={{ borderWidth: 1, borderColor: colors.line, borderRadius: 16, backgroundColor: colors.card, overflow: 'hidden' }} accessibilityRole="list">
          {results.map((s, i) => (
            <Pressable
              key={s.name}
              onPress={() => {
                onPick(s);
                setPicked(s.name);
              }}
              accessibilityRole="button"
              accessibilityLabel={`${s.name}, ${s.type} in ${s.place}`}
              style={({ pressed }) => ({ paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: i ? 1 : 0, borderTopColor: colors.line, backgroundColor: pressed ? colors.bg : colors.card })}
            >
              <Text variant="strong" style={{ fontSize: 15 }}>
                {s.name}
              </Text>
              <Text variant="tiny">
                {s.type} · {s.place}
                {s.region && !s.region.startsWith(s.place) ? `, ${s.region}` : ''}
              </Text>
            </Pressable>
          ))}
          <Text variant="tiny" style={{ paddingHorizontal: 14, paddingVertical: 8, borderTopWidth: 1, borderTopColor: colors.line }}>
            Not here? Just keep typing the name.
          </Text>
        </View>
      )}
    </View>
  );
}
