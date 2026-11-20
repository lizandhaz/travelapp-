import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import Svg, { Circle, Defs, G, Path, Pattern, Rect } from 'react-native-svg';

import { colors, fonts, GUTTER, radius } from '@/constants/theme';
import { positionOf, toMap } from '@/lib/geo';
import { placeLabel, type Place } from '@/lib/trips';
import { WORLD_LAND_PATH, WORLD_VIEWBOX } from '@/lib/worldMap';
import { AccentTitle } from './AccentTitle';
import { WishStar } from './lists';
import { Text } from './Text';

const STAR = 'M12 1.5c.6 5.4 2.6 8.4 9.5 10.5-6.9 2.1-8.9 5.1-9.5 10.5-.6-5.4-2.6-8.4-9.5-10.5C9.4 9.9 11.4 6.9 12 1.5z';

export type MapPlace = Place & { href: string | null };
type Show = 'all' | 'been' | 'wish';

/**
 * "Your travel map": a dotted world map with places you've been (terracotta
 * dots, from your trips) and places you want to go (teal stars, from your
 * Want to go list). Roughly placed: never a live location.
 */
export function TravelMap({ been, wish, countries }: { been: MapPlace[]; wish: MapPlace[]; countries: number }) {
  const [show, setShow] = useState<Show>('all');
  const pins = (list: MapPlace[]) =>
    list.flatMap((p) => {
      const pos = positionOf(p);
      return pos ? [{ ...toMap(pos), key: placeLabel(p) }] : [];
    });
  const beenPins = show !== 'wish' ? pins(been) : [];
  const wishPins = show !== 'been' ? pins(wish) : [];
  const describe = (label: string, list: MapPlace[]) => (list.length ? `${label}: ${list.map((p) => p.name).join(', ')}.` : '');

  return (
    <View style={{ paddingHorizontal: GUTTER, marginTop: 30, gap: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 }}>
        <AccentTitle before="Your travel" accent="map" variant="heading" />
        <Text variant="small">
          {countries} of 195 {countries === 1 ? 'country' : 'countries'}
        </Text>
      </View>

      <View accessibilityRole="tablist" accessibilityLabel="Show on the map" style={{ flexDirection: 'row', gap: 8 }}>
        {(
          [
            ['all', 'All'],
            ['been', `Been · ${been.length}`],
            ['wish', `Want to go · ${wish.length}`],
          ] as const
        ).map(([id, label]) => {
          const on = show === id;
          return (
            <Pressable
              key={id}
              onPress={() => setShow(id)}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              style={{ borderRadius: radius.pill, borderWidth: 1, borderColor: on ? colors.ink : colors.line, backgroundColor: on ? colors.ink : colors.card, paddingHorizontal: 14, paddingVertical: 7 }}
            >
              <Text style={{ fontFamily: fonts.sansMedium, fontSize: 13, color: on ? colors.onDark : colors.ink }}>{label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={{ borderRadius: radius.xl, borderWidth: 1, borderColor: colors.line, overflow: 'hidden', backgroundColor: colors.card }}>
        <View accessible accessibilityRole="image" accessibilityLabel={`World map. ${describe('Been', show === 'wish' ? [] : been)} ${describe('Want to go', show === 'been' ? [] : wish)}`.trim()}>
          <Svg viewBox={`0 0 ${WORLD_VIEWBOX.width} ${WORLD_VIEWBOX.height}`} style={{ width: '100%', aspectRatio: WORLD_VIEWBOX.width / WORLD_VIEWBOX.height }}>
            <Defs>
              <Pattern id="tm-dots" width="2.4" height="2.4" patternUnits="userSpaceOnUse">
                <Circle cx="1.2" cy="1.2" r="0.85" fill={colors.mapLand} />
              </Pattern>
            </Defs>
            <Rect x="0" y="0" width={WORLD_VIEWBOX.width} height={WORLD_VIEWBOX.height} fill={colors.bg} />
            <Path d={WORLD_LAND_PATH} fill="url(#tm-dots)" />
            {wishPins.map((p) => (
              <G key={'w' + p.key} transform={`translate(${p.x} ${p.y})`}>
                <Circle r={4.2} fill={colors.teal} opacity={0.12} />
                <Path d={STAR} transform="scale(0.36) translate(-12 -12)" fill={colors.teal} />
              </G>
            ))}
            {beenPins.map((p) => (
              <G key={'b' + p.key} transform={`translate(${p.x} ${p.y})`}>
                <Circle r={4.6} fill={colors.terracotta} opacity={0.16} />
                <Circle r={2.2} fill={colors.terracotta} stroke={colors.card} strokeWidth={0.8} />
              </G>
            ))}
          </Svg>
        </View>

        <View style={{ padding: 14, paddingTop: 6, gap: 12 }}>
          {show !== 'wish' && (
            <ChipRow
              title="Been"
              icon={<View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.terracotta }} />}
              places={been}
              empty="Add a trip and it’ll appear here."
              tone="been"
            />
          )}
          {show !== 'been' && (
            <ChipRow title="Want to go" icon={<WishStar size={10} />} places={wish} empty="Save places to your Want to go list from any place page." tone="wish" />
          )}
        </View>
      </View>
    </View>
  );
}

function ChipRow({ title, icon, places, empty, tone }: { title: string; icon: React.ReactNode; places: MapPlace[]; empty: string; tone: 'been' | 'wish' }) {
  return (
    <View style={{ gap: 7 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        {icon}
        <Text variant="label">{title}</Text>
      </View>
      {places.length === 0 ? (
        <Text variant="tiny">{empty}</Text>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
          {places.map((p) => (
            <Pressable
              key={placeLabel(p)}
              disabled={!p.href}
              onPress={() => p.href && router.push(p.href as never)}
              accessibilityRole={p.href ? 'link' : 'text'}
              accessibilityLabel={placeLabel(p)}
              style={{
                borderRadius: radius.pill,
                paddingHorizontal: 12,
                paddingVertical: 5,
                backgroundColor: tone === 'wish' ? colors.mint + '40' : colors.card,
                borderWidth: tone === 'wish' ? 0 : 1,
                borderColor: colors.line,
              }}
            >
              <Text style={{ fontFamily: fonts.sansMedium, fontSize: 12, color: colors.ink }}>{p.name}</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
