import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';

import { SearchIcon } from '@/components/Icons';
import { Text } from '@/components/Text';
import { Card, Input } from '@/components/ui';
import { colors, fonts, radius } from '@/constants/theme';
import { countryInfo } from '@/lib/countryInfo';
import { plain } from '@/lib/knownPlaces';
import { places as samplePlaces } from '@/lib/sample';
import { parsePlace, placeLabel, type Place } from '@/lib/trips';

/** Places with their own page in the app: they come first when names tie, so a trip connects to its page. */
const WITH_PAGE = new Set(samplePlaces.map((p) => plain(p.name)));

/**
 * Suggestions for what you've typed ("Lis" → Lisbon, Portugal): the name itself, then names starting with it, then
 * other words in the name, then countries. Ties go to places with a page in the app, then the list's own order (popular
 * holiday places, countries, then towns and cities by size). "Sintra, Portugal" narrows by country.
 */
export function rankPlaces(places: Place[], text: string, limit = 6, skip: Place[] = []): Place[] {
  const q = plain(text);
  if (!q) return [];
  const taken = new Set(skip.map((p) => `${plain(p.name)}|${plain(p.country)}`));
  const [qName, qCountry] = q.split(',').map((x) => x.trim());
  const ranked: [number, number, Place][] = [];
  places.forEach((p, i) => {
    if (taken.has(`${plain(p.name)}|${plain(p.country)}`)) return;
    const name = plain(p.name);
    const country = plain(p.country);
    if (qCountry !== undefined && qCountry && !country.startsWith(qCountry)) return;
    let rank = -1;
    if (name === qName) rank = 0;
    else if (name.startsWith(qName)) rank = 1;
    else if (name.split(/[\s-]+/).some((w) => w.startsWith(qName))) rank = 2;
    else if (qCountry === undefined && qName.length >= 3 && country.startsWith(qName)) rank = 3;
    if (rank >= 0) ranked.push([rank * 2 + (WITH_PAGE.has(name) ? 0 : 1), i, p]);
  });
  return ranked
    .sort((a, b) => a[0] - b[0] || a[1] - b[1])
    .slice(0, limit)
    .map(([, , p]) => p);
}

/** The suggestion list: a flag, the place, and its country underneath, so two places with one name are easy to tell apart. */
function Suggestions({ items, text, exact, onPick }: { items: Place[]; text: string; exact: boolean; onPick: (p: Place) => void }) {
  return (
    <Card>
      {items.map((p, i) => {
        const info = countryInfo(p.country || p.name);
        const isCountry = plain(p.name) === plain(p.country);
        return (
          <Pressable
            key={placeLabel(p)}
            accessibilityRole="button"
            accessibilityLabel={`Choose ${placeLabel(p)}${isCountry ? ', the whole country' : ''}`}
            onPress={() => onPick(p)}
            style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 12, paddingVertical: 10, borderTopWidth: i ? 1 : 0, borderTopColor: colors.sand, backgroundColor: pressed ? colors.sageSoft : 'transparent' })}
          >
            <Text style={{ fontSize: 22, lineHeight: 28 }} accessibilityElementsHidden importantForAccessibility="no">
              {info.flag}
            </Text>
            <View style={{ flex: 1 }}>
              <Text variant="strong">{p.name}</Text>
              <Text variant="tiny">{isCountry ? 'Country' : p.country || 'Somewhere new'}</Text>
            </View>
          </Pressable>
        );
      })}
      {!exact && (
        <Pressable
          accessibilityRole="button"
          onPress={() => onPick(parsePlace(text))}
          style={({ pressed }) => ({ paddingHorizontal: 12, paddingVertical: 11, borderTopWidth: items.length ? 1 : 0, borderTopColor: colors.sand, backgroundColor: pressed ? colors.sageSoft : 'transparent' })}
        >
          <Text variant="link">Use “{text.trim()}”</Text>
          <Text variant="tiny">Not in our list? That’s fine. Add the country after a comma, e.g. “Sintra, Portugal”</Text>
        </Pressable>
      )}
    </Card>
  );
}

/**
 * "Search or type a place" (one place, e.g. adding a place to a board). Suggestions come from `places`; anything else
 * you type is used as-is ("Sintra, Portugal" becomes place + country).
 */
export function PlacePicker({
  value,
  onChange,
  places,
  placeholder = 'Search or type a place',
  accessibilityLabel,
  autoFocus = false,
}: {
  value: Place | null;
  onChange: (p: Place | null) => void;
  places: Place[];
  placeholder?: string;
  accessibilityLabel: string;
  /** Open the keyboard straight away (in the board's search sheet). */
  autoFocus?: boolean;
}) {
  const [text, setText] = useState(value ? placeLabel(value) : '');
  const [focused, setFocused] = useState(false);
  const q = plain(text);
  const suggestions = useMemo(() => rankPlaces(places, text), [places, text]);
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
        autoFocus={autoFocus}
        returnKeyType="done"
        icon={<SearchIcon color={colors.muted} />}
      />
      {focused && q.length > 0 && (suggestions.length > 0 || !exact) && <Suggestions items={suggestions} text={text} exact={exact} onPick={choose} />}
    </View>
  );
}

/**
 * "Where did you go?" (owner, Nov 2026): one search that suggests places as you type. Each pick becomes a chip with its
 * flag (× removes it) and the box clears for the next stop, so a multi-stop trip is just a few picks. The first chip is
 * the main place. Places not in our list are kept as typed (🌍). Return adds the top suggestion.
 */
export function StopsPicker({ value, onChange, places, max = 10 }: { value: Place[]; onChange: (stops: Place[]) => void; places: Place[]; max?: number }) {
  const [text, setText] = useState('');
  const [focused, setFocused] = useState(false);
  const q = plain(text);
  const suggestions = useMemo(() => rankPlaces(places, text, 6, value), [places, text, value]);
  const exact = suggestions.some((p) => plain(placeLabel(p)) === q || plain(p.name) === q);
  const full = value.length >= max;

  function add(p: Place) {
    if (!p.name.trim() || full) return;
    onChange([...value, { name: p.name.trim(), country: p.country.trim() }]);
    setText('');
  }

  return (
    <View style={{ gap: 10 }}>
      {value.length > 0 && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }} accessibilityLabel={`Places on this trip: ${value.map(placeLabel).join(', ')}`}>
          {value.map((p, i) => (
            <View
              key={`${placeLabel(p)}-${i}`}
              style={{ maxWidth: '100%', flexDirection: 'row', alignItems: 'center', gap: 7, paddingLeft: 10, paddingRight: 6, paddingVertical: 6, borderRadius: radius.pill, backgroundColor: i === 0 ? colors.sageSoft : colors.card, borderWidth: 1, borderColor: i === 0 ? colors.sage : colors.line }}
            >
              <Text style={{ fontSize: 16, lineHeight: 20 }} accessibilityElementsHidden importantForAccessibility="no">
                {countryInfo(p.country || p.name).flag}
              </Text>
              {/* A long name shortens with "…" instead of pushing the chip off the screen (overnight audit). */}
              <Text style={{ fontFamily: fonts.sansSemiBold, fontSize: 14, color: colors.ink, flexShrink: 1 }} numberOfLines={1}>
                {p.name}
              </Text>
              {!!p.country && plain(p.country) !== plain(p.name) && (
                <Text variant="tiny" numberOfLines={1} style={{ flexShrink: 0, maxWidth: 96 }}>
                  {p.country}
                </Text>
              )}
              <Pressable
                onPress={() => onChange(value.filter((_, j) => j !== i))}
                accessibilityRole="button"
                accessibilityLabel={`Remove ${placeLabel(p)}`}
                hitSlop={11}
                style={({ pressed }) => ({ width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: pressed ? colors.line : 'transparent' })}
              >
                <Text style={{ fontSize: 15, lineHeight: 18, color: colors.muted }}>×</Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}
      {!full && (
        <Input
          value={text}
          onChangeText={setText}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          onSubmitEditing={() => text.trim() && add(suggestions[0] ?? parsePlace(text))}
          placeholder={value.length ? 'Add another place' : 'Search a city, region or country'}
          accessibilityLabel={value.length ? 'Add another place on this trip' : 'Where did you go?'}
          autoCorrect={false}
          returnKeyType="done"
          blurOnSubmit={false}
          icon={<SearchIcon color={colors.muted} />}
        />
      )}
      {focused && q.length > 0 && (suggestions.length > 0 || !exact) && <Suggestions items={suggestions} text={text} exact={exact} onPick={add} />}
    </View>
  );
}
