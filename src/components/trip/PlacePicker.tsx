import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/Text';
import { SearchIcon } from '@/components/Icons';
import { Card, Input } from '@/components/ui';
import { colors } from '@/constants/theme';
import { plain } from '@/lib/knownPlaces';
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

  const q = plain(text);
  // Best matches first: the name itself, then names starting with what you typed, then the
  // rest (towns, regions and countries containing it). Ties keep the list's order: popular
  // holiday places, then countries, then towns and cities by size.
  const suggestions = useMemo(() => {
    if (!q) return [];
    const [qName, qCountry] = q.split(',').map((x) => x.trim());
    const ranked: [number, number, Place][] = [];
    places.forEach((p, i) => {
      const name = plain(p.name);
      const country = plain(p.country);
      if (qCountry !== undefined && qCountry && !country.startsWith(qCountry)) return;
      let rank = -1;
      if (name === qName) rank = 0;
      else if (name.startsWith(qName)) rank = 1;
      else if (name.split(/[\s-]+/).some((w) => w.startsWith(qName))) rank = 2;
      else if (qCountry === undefined && qName.length >= 3 && country.startsWith(qName)) rank = 3;
      if (rank >= 0) ranked.push([rank, i, p]);
    });
    return ranked
      .sort((a, b) => a[0] - b[0] || a[1] - b[1])
      .slice(0, 6)
      .map(([, , p]) => p);
  }, [places, q]);
  const exact = suggestions.some((p) => plain(placeLabel(p)) === q);

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
    const known = !typed.country && places.find((p) => plain(p.name) === plain(typed.name));
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
        icon={<SearchIcon color={colors.muted} />}
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
              {!!p.country && p.country !== p.name && <Text variant="tiny">{p.country}</Text>}
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
              <Text variant="link">
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
