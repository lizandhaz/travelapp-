import { router } from 'expo-router';
import { useMemo, useRef, useState, type ComponentRef } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { appWidth, colors, fonts, GUTTER } from '@/constants/theme';
import type { Continent } from '@/lib/countryInfo';
import { positionOf, toMap } from '@/lib/geo';
import { monthYear } from '@/lib/months';
import { formatScore } from '@/lib/score';
import type { Trip, VisitedCountry } from '@/lib/trips';
import { WORLD_LAND_PATH, WORLD_VIEWBOX } from '@/lib/worldMap';
import { ChevronIcon } from './Icons';
import { worldShare } from './profile';
import { Text } from './Text';

/** Countries in the world, the same number behind "% of the world" on You. */
const WORLD = 195;
const HAIRLINE = StyleSheet.hairlineWidth;
const NUMBERS = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven'];

/** Continents with the most countries first; "Elsewhere" (names we don't recognise) always last. */
function byContinent(countries: VisitedCountry[]) {
  const groups = new Map<Continent, VisitedCountry[]>();
  for (const c of countries) groups.set(c.continent, [...(groups.get(c.continent) ?? []), c]);
  return [...groups.entries()]
    .map(([continent, list]) => ({ continent, list: [...list].sort((a, b) => a.name.localeCompare(b.name, 'en')) }))
    .sort((a, b) => Number(a.continent === 'Elsewhere') - Number(b.continent === 'Elsewhere') || b.list.length - a.list.length || a.continent.localeCompare(b.continent));
}

/**
 * Every country you've been to (owner, Nov 2026: "like a page from a travel magazine, not generic tiles"), opened from
 * the Countries / "% of the world" tiles on You. Typography first: the count and share of the world as a serif headline,
 * one quiet line about where it began, a muted map with a terracotta dot for each place, then the countries by continent
 * as plain rows under small headings and hairlines (tap a heading to fold it; tap a country for its trips). It gets the
 * same list the tiles count (`visitedCountries`), so the numbers always match.
 */
export function CountriesSheet({ visible, onClose, countries, trips }: { visible: boolean; onClose: () => void; countries: VisitedCountry[]; trips: Trip[] }) {
  const width = appWidth() - GUTTER * 2;
  const n = countries.length;
  const groups = useMemo(() => byContinent(countries), [countries]);
  const tripsById = useMemo(() => new Map(trips.map((t) => [t.id, t])), [trips]);
  const [folded, setFolded] = useState<Set<string>>(() => new Set());
  const [open, setOpen] = useState<string | null>(null);
  const scroller = useRef<ComponentRef<typeof ScrollView>>(null);
  const sectionY = useRef(new Map<string, number>());

  // "Five continents so far. It started with Hvar, in 2023."
  const continents = groups.filter((g) => g.continent !== 'Elsewhere').length;
  const firstTrip = useMemo(() => [...trips].sort((a, b) => a.month.localeCompare(b.month) || a.createdAt.localeCompare(b.createdAt))[0], [trips]);
  const story = [
    continents ? `${NUMBERS[continents] ?? continents} ${continents === 1 ? 'continent' : 'continents'} so far.` : null,
    firstTrip?.stops[0] ? `It started with ${firstTrip.stops[0].name}, in ${firstTrip.month.slice(0, 4)}.` : null,
  ]
    .filter(Boolean)
    .join(' ');
  const headSize = width < 340 ? 34 : 42;

  const goTo = (continent: string) => {
    const y = sectionY.current.get(continent);
    if (y != null) scroller.current?.scrollTo({ y: Math.max(0, y - 8), animated: true });
  };
  const openTrip = (id: string) => {
    onClose();
    router.push(`/trip/${id}`);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: GUTTER, paddingTop: 18, paddingBottom: 4 }}>
          <Text variant="label">Your world</Text>
          <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close" hitSlop={12}>
            <Text variant="link">Close</Text>
          </Pressable>
        </View>

        <ScrollView ref={scroller} contentContainerStyle={{ paddingHorizontal: GUTTER, paddingBottom: 56 }}>
          {n === 0 ? (
            <View style={{ paddingTop: 36 }}>
              <Text style={{ fontFamily: fonts.displayItalic, fontSize: headSize, lineHeight: Math.round(headSize * 1.12), color: colors.ink }}>No stamps yet.</Text>
              <Text variant="body" style={{ color: colors.muted, marginTop: 10, maxWidth: 300 }}>
                Your first trip starts the map.
              </Text>
              <WorldMap width={width} trips={[]} />
              <Pressable
                onPress={() => {
                  onClose();
                  router.push('/add');
                }}
                accessibilityRole="link"
                hitSlop={8}
                style={{ alignSelf: 'flex-start', marginTop: 8 }}
              >
                <Text variant="link" style={{ fontSize: 16 }}>
                  Add a trip →
                </Text>
              </Pressable>
            </View>
          ) : (
            <>
              {/* The headline: the count, then the share of the world in terracotta italic. */}
              <View accessible accessibilityRole="header" accessibilityLabel={`${n} ${n === 1 ? 'country' : 'countries'}, ${worldShare(n)} of the world`} style={{ paddingTop: 28 }}>
                <Text style={{ fontFamily: fonts.display, fontSize: headSize, lineHeight: Math.round(headSize * 1.12), color: colors.ink, letterSpacing: -0.6 }}>
                  {n} {n === 1 ? 'country' : 'countries'}.
                </Text>
                <Text style={{ fontFamily: fonts.displayItalic, fontSize: headSize, lineHeight: Math.round(headSize * 1.12), color: colors.accentText, letterSpacing: -0.6 }}>
                  {worldShare(n)} of the world.
                </Text>
              </View>
              {!!story && (
                <Text variant="body" style={{ color: colors.muted, marginTop: 14, maxWidth: 320 }}>
                  {story}
                </Text>
              )}

              <WorldMap width={width} trips={trips} />

              {/* An index of the continents: tap one to jump to it. */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: 14, rowGap: 6, marginBottom: 18 }}>
                {groups.map((g) => (
                  <Pressable key={g.continent} onPress={() => goTo(g.continent)} accessibilityRole="link" accessibilityLabel={`${g.continent}, ${g.list.length}. Jump to it`} hitSlop={6}>
                    <Text variant="label" style={{ color: colors.ink }}>
                      {g.continent} <Text variant="label" style={{ color: colors.accentText }}>{g.list.length}</Text>
                    </Text>
                  </Pressable>
                ))}
              </View>

              {groups.map((g) => {
                const shut = folded.has(g.continent);
                return (
                  <View key={g.continent} onLayout={(e) => sectionY.current.set(g.continent, e.nativeEvent.layout.y)} style={{ borderTopWidth: HAIRLINE, borderTopColor: colors.ink, paddingTop: 2 }}>
                    <Pressable
                      onPress={() =>
                        setFolded((f) => {
                          const next = new Set(f);
                          if (next.has(g.continent)) next.delete(g.continent);
                          else next.add(g.continent);
                          return next;
                        })
                      }
                      accessibilityRole="button"
                      accessibilityState={{ expanded: !shut }}
                      accessibilityLabel={`${g.continent}, ${g.list.length} ${g.list.length === 1 ? 'country' : 'countries'}`}
                      style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14 }}
                    >
                      <Text variant="label" style={{ flex: 1, color: colors.ink }}>
                        {g.continent}
                      </Text>
                      <Text style={{ fontFamily: fonts.display, fontSize: 15, color: colors.muted, marginRight: 8, fontVariant: ['tabular-nums'] }}>{g.list.length}</Text>
                      <View style={{ transform: [{ rotate: shut ? '0deg' : '90deg' }] }}>
                        <ChevronIcon color={colors.muted} size={12} strokeWidth={2} />
                      </View>
                    </Pressable>
                    {!shut &&
                      g.list.map((c, i) => (
                        <CountryRow
                          key={c.name}
                          country={c}
                          first={i === 0}
                          open={open === c.name}
                          onToggle={() => setOpen(open === c.name ? null : c.name)}
                          trips={c.tripIds.map((id) => tripsById.get(id)).filter((t): t is Trip => !!t)}
                          onTrip={openTrip}
                        />
                      ))}
                    {!shut && <View style={{ height: 18 }} />}
                  </View>
                );
              })}

              <View style={{ borderTopWidth: HAIRLINE, borderTopColor: colors.line, paddingTop: 22, marginTop: 6 }}>
                <Text style={{ fontFamily: fonts.displayItalic, fontSize: 17, lineHeight: 24, color: colors.muted }}>
                  {n >= WORLD ? 'Every country in the world. Remarkable.' : `${WORLD} countries in the world. ${WORLD - n} still to go.`}
                </Text>
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

/** A small, muted world: land in warm sand, a terracotta dot for each place you've been. No frame, no legend. */
function WorldMap({ width, trips }: { width: number; trips: Trip[] }) {
  const dots = useMemo(() => {
    const seen = new Set<string>();
    return trips.flatMap((t) =>
      t.stops.flatMap((s) => {
        const pos = positionOf(s);
        if (!pos) return [];
        const { x, y } = toMap(pos);
        const key = `${Math.round(x)}|${Math.round(y)}`;
        if (seen.has(key)) return [];
        seen.add(key);
        return [{ x, y, key }];
      }),
    );
  }, [trips]);
  // Leave out the far south (Antarctica) so the map sits a little taller on the page.
  const view = { x: 0, y: 4, w: WORLD_VIEWBOX.width, h: WORLD_VIEWBOX.height - 20 };
  return (
    <View accessible accessibilityRole="image" accessibilityLabel={dots.length ? `World map with ${dots.length} ${dots.length === 1 ? 'place' : 'places'} marked` : 'An empty world map'} style={{ marginVertical: 26 }}>
      <Svg width={width} height={(width * view.h) / view.w} viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`}>
        <Path d={WORLD_LAND_PATH} fill={colors.sand} />
        {dots.map((d) => (
          <Circle key={d.key} cx={d.x} cy={d.y} r={2.3} fill={colors.accent} stroke={colors.bg} strokeWidth={0.7} />
        ))}
      </Svg>
    </View>
  );
}

/**
 * One country: its flag, the name in serif, the places beneath, and the year you first went on the right. Tap it for
 * its trips (place, month and score), each opening the trip.
 */
function CountryRow({ country: c, first, open, onToggle, trips, onTrip }: { country: VisitedCountry; first: boolean; open: boolean; onToggle: () => void; trips: Trip[]; onTrip: (id: string) => void }) {
  return (
    <View style={{ borderTopWidth: first ? 0 : HAIRLINE, borderTopColor: colors.line, marginLeft: 30 }}>
      <Pressable
        onPress={onToggle}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={`${c.name}${c.places.length ? `: ${c.places.join(', ')}` : ''}. First visited ${c.first.slice(0, 4)}. ${c.trips} ${c.trips === 1 ? 'trip' : 'trips'}`}
        accessibilityHint={open ? 'Hides the trips' : 'Shows the trips'}
        style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 11, opacity: pressed ? 0.6 : 1 })}
      >
        <Text style={{ position: 'absolute', left: -30, top: 12, fontSize: 18, lineHeight: 22 }} accessibilityElementsHidden importantForAccessibility="no">
          {c.flag}
        </Text>
        <View style={{ flex: 1, paddingRight: 12 }}>
          <Text style={{ fontFamily: fonts.displayRegular, fontSize: 19, lineHeight: 24, color: colors.ink }}>{c.name}</Text>
          {c.places.length > 0 && (
            <Text variant="tiny" numberOfLines={open ? undefined : 1} style={{ marginTop: 1 }}>
              {c.places.join(' · ')}
            </Text>
          )}
        </View>
        <View style={{ alignItems: 'flex-end', paddingTop: 3 }}>
          <Text style={{ fontFamily: fonts.sansMedium, fontSize: 13, color: colors.muted, fontVariant: ['tabular-nums'] }}>{c.first.slice(0, 4)}</Text>
          {c.trips > 1 && <Text variant="tiny">{c.trips} trips</Text>}
        </View>
      </Pressable>
      {open && (
        <View style={{ paddingBottom: 12, gap: 2 }}>
          {trips.map((t) => (
            <Pressable
              key={t.id}
              onPress={() => onTrip(t.id)}
              accessibilityRole="link"
              accessibilityLabel={`${t.stops[0]?.name ?? 'Trip'}, ${monthYear(t.month)}, ${formatScore(t.score)} out of 10. Open the trip`}
              style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'baseline', gap: 8, paddingVertical: 6, opacity: pressed ? 0.6 : 1 })}
            >
              <Text variant="small" style={{ color: colors.ink, flexShrink: 1 }} numberOfLines={1}>
                {t.stops[0]?.name}
              </Text>
              <Text variant="small" style={{ flex: 1 }} numberOfLines={1}>
                {monthYear(t.month)}
              </Text>
              <Text style={{ fontFamily: fonts.display, fontSize: 15, color: colors.accentText, fontVariant: ['tabular-nums'] }}>{formatScore(t.score)}</Text>
              <Text variant="small" style={{ color: colors.accentText }}>
                →
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}
