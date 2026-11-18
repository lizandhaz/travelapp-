import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/Text';
import { Card, Input } from '@/components/ui';
import { colors } from '@/constants/theme';
import { parsePlace, placeLabel, type Place } from '@/lib/trips';

/**
 * "Search or type a place". Suggestions come from `places`; anything else you
 * type is used as-is ("Sintra, Portugal" becomes place + country).
 */
export function PlacePicker({
  value,
  onChange,
  places,
  placeholder = 'Search or type a place',
  accessibilityLabel,
}: {
  value: Place | null;
  onChange: (p: Place | null) => void;
  places: Place[];
  placeholder?: string;
  accessibilityLabel: string;
}) {
  const [text, setText] = useState(value ? placeLabel(value) : '');
  const [focused, setFocused] = useState(false);

  const q = text.trim().toLowerCase();
  const suggestions = useMemo(() => {
    if (!q) return [];
    return places
      .filter((p) => placeLabel(p).toLowerCase().includes(q))
      .sort((a, b) => Number(!a.name.toLowerCase().startsWith(q)) - Number(!b.name.toLowerCase().startsWith(q)))
      .slice(0, 5);
  }, [places, q]);
  const exact = suggestions.some((p) => placeLabel(p).toLowerCase() === q);

  function choose(p: Place) {
    setText(placeLabel(p));
    onChange(p);
    setFocused(false);
  }

  function type(t: string) {
    setText(t);
    if (!t.trim()) return onChange(null);
    const typed = parsePlace(t);
    // "lisbon" on its own → the known Lisbon, Portugal
    const known = !typed.country && places.find((p) => p.name.toLowerCase() === typed.name.toLowerCase());
    onChange(known || typed);
  }

  return (
    <View style={{ gap: 6 }}>
      <Input
        value={text}
        onChangeText={type}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
        placeholder={placeholder}
        accessibilityLabel={accessibilityLabel}
        autoCorrect={false}
        returnKeyType="done"
      />
      {focused && q.length > 0 && (suggestions.length > 0 || !exact) && (
        <Card>
          {suggestions.map((p, i) => (
            <Pressable
              key={placeLabel(p)}
              accessibilityRole="button"
              accessibilityLabel={`Choose ${placeLabel(p)}`}
              onPress={() => choose(p)}
              style={{ paddingHorizontal: 12, paddingVertical: 11, borderTopWidth: i ? 1 : 0, borderTopColor: colors.sand }}
            >
              <Text variant="strong">{p.name}</Text>
              {!!p.country && <Text variant="tiny">{p.country}</Text>}
            </Pressable>
          ))}
          {!exact && (
            <Pressable
              accessibilityRole="button"
              onPress={() => choose(parsePlace(text))}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 11,
                borderTopWidth: suggestions.length ? 1 : 0,
                borderTopColor: colors.sand,
              }}
            >
              <Text variant="link" style={{ fontSize: 14 }}>
                Use “{text.trim()}”
              </Text>
              <Text variant="tiny">Tip: add the country after a comma, e.g. “Sintra, Portugal”</Text>
            </Pressable>
          )}
        </Card>
      )}
    </View>
  );
}
