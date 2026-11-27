import { router } from 'expo-router';
import { Modal, Pressable, ScrollView, View } from 'react-native';

import { colors, GUTTER, radius } from '@/constants/theme';
import type { Continent } from '@/lib/countryInfo';
import type { VisitedCountry } from '@/lib/trips';
import { AccentTitle } from './AccentTitle';
import { worldShare } from './profile';
import { Text } from './Text';
import { Button, TONES, toneFill } from './ui';

/** Countries in the world, the same number behind "% of the world" on You. */
const WORLD = 195;

/** Continents with the most countries first; "Elsewhere" (names we don't recognise) always last. */
function byContinent(countries: VisitedCountry[]) {
  const groups = new Map<Continent, VisitedCountry[]>();
  for (const c of countries) groups.set(c.continent, [...(groups.get(c.continent) ?? []), c]);
  return [...groups.entries()]
    .map(([continent, list]) => ({ continent, list: list.sort((a, b) => a.name.localeCompare(b.name, 'en')) }))
    .sort((a, b) => Number(a.continent === 'Elsewhere') - Number(b.continent === 'Elsewhere') || b.list.length - a.list.length || a.continent.localeCompare(b.continent));
}

/**
 * Every country you've been to (owner, Nov 2026), opened from the Countries / "% of the world" tiles on You.
 * It's given the same list the tiles count (`visitedCountries`), so the numbers always match.
 */
export function CountriesSheet({ visible, onClose, countries }: { visible: boolean; onClose: () => void; countries: VisitedCountry[] }) {
  const n = countries.length;
  const share = worldShare(n);
  const groups = byContinent(countries);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: GUTTER, paddingTop: 18, paddingBottom: 6 }}>
          <Text variant="label">Countries you’ve been to</Text>
          <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close" hitSlop={10}>
            <Text variant="link">Close</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: GUTTER, paddingBottom: 48 }}>
          <AccentTitle before="Your" accent="world" />

          {n === 0 ? (
            <View style={{ alignItems: 'center', marginTop: 36, paddingHorizontal: 12, gap: 10 }}>
              <Text style={{ fontSize: 56, lineHeight: 68 }} accessibilityElementsHidden importantForAccessibility="no">
                🌍
              </Text>
              <Text variant="heading" style={{ textAlign: 'center' }}>
                Your first stamp is waiting
              </Text>
              <Text variant="small" style={{ textAlign: 'center' }}>
                Add a trip and every country you visit will be collected here, flag and all.
              </Text>
              <Button
                title="Add a trip"
                style={{ marginTop: 10, alignSelf: 'stretch' }}
                onPress={() => {
                  onClose();
                  router.push('/add');
                }}
              />
            </View>
          ) : (
            <>
              {/* Summary: the count, the share of the world and a bar that fills as you go. */}
              <View
                accessible
                accessibilityLabel={`${n} ${n === 1 ? 'country' : 'countries'}, ${share} of the world`}
                style={{ marginTop: 16, borderRadius: radius.lg, backgroundColor: colors.skySoft, padding: 18, gap: 12 }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap', columnGap: 10 }}>
                  <Text variant="title" style={{ fontSize: 40, lineHeight: 46 }}>
                    {n}
                  </Text>
                  <Text variant="subheading">{n === 1 ? 'country' : 'countries'}</Text>
                  <Text variant="subheading" style={{ color: colors.muted }}>
                    · {share} of the world
                  </Text>
                </View>
                <View style={{ height: 8, borderRadius: 4, backgroundColor: colors.bg, overflow: 'hidden' }}>
                  <View style={{ width: `${Math.max(2, Math.min(100, (n / WORLD) * 100))}%`, height: 8, borderRadius: 4, backgroundColor: colors.action }} />
                </View>
                <Text variant="tiny">
                  {n} of {WORLD} countries
                </Text>
              </View>

              {/* How many in each continent. */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
                {groups.map((g, i) => (
                  <View key={g.continent} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: radius.pill, backgroundColor: toneFill(TONES[i % TONES.length]), paddingHorizontal: 12, paddingVertical: 6 }}>
                    <Text variant="strong" style={{ fontSize: 13, lineHeight: 17 }}>
                      {g.continent}
                    </Text>
                    <Text variant="small" style={{ fontSize: 13, lineHeight: 17 }}>
                      {g.list.length}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Each continent's countries, A to Z, with their flags and where you went. */}
              {groups.map((g) => (
                <View key={g.continent} style={{ marginTop: 26 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text variant="subheading">{g.continent}</Text>
                    <Text variant="tiny">
                      {g.list.length} {g.list.length === 1 ? 'country' : 'countries'}
                    </Text>
                  </View>
                  <View style={{ borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, overflow: 'hidden' }}>
                    {g.list.map((c, i) => (
                      <View
                        key={c.name}
                        accessible
                        accessibilityLabel={`${c.name}${c.places.length ? `: ${c.places.join(', ')}` : ''}. ${c.trips} ${c.trips === 1 ? 'trip' : 'trips'}`}
                        style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 14, paddingVertical: 12, borderTopWidth: i ? 1 : 0, borderTopColor: colors.line }}
                      >
                        <Text style={{ fontSize: 28, lineHeight: 34 }}>{c.flag}</Text>
                        <View style={{ flex: 1 }}>
                          <Text variant="strong">{c.name}</Text>
                          {c.places.length > 0 && (
                            <Text variant="tiny" numberOfLines={1}>
                              {c.places.join(' · ')}
                            </Text>
                          )}
                        </View>
                        <Text variant="tiny" style={{ color: colors.accentText }}>
                          {c.trips} {c.trips === 1 ? 'trip' : 'trips'}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}
