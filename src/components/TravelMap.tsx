import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import Svg, { Circle, Defs, G, Line, LinearGradient, Path, Rect, Stop, Text as SvgText } from 'react-native-svg';

import { colors, fonts, GUTTER, radius } from '@/constants/theme';
import { positionOf, toMap } from '@/lib/geo';
import { placeLabel, type Place } from '@/lib/trips';
import { WORLD_LAND_PATH, WORLD_VIEWBOX } from '@/lib/worldMap';
import { AccentTitle } from './AccentTitle';
import { WishStar } from './lists';
import { Text } from './Text';

const STAR = 'M12 1.5c.6 5.4 2.6 8.4 9.5 10.5-6.9 2.1-8.9 5.1-9.5 10.5-.6-5.4-2.6-8.4-9.5-10.5C9.4 9.9 11.4 6.9 12 1.5z';
const W = WORLD_VIEWBOX.width;
const H = WORLD_VIEWBOX.height;
// A taller frame than the world itself (extra sea above and below), so the map isn't a thin strip.
const ASPECT = 1.8;
const FULL = { x: 0, y: (H - W / ASPECT) / 2, w: W, h: W / ASPECT };

export type MapPlace = Place & { href: string | null };
type Show = 'all' | 'been' | 'wish';
type Pin = { x: number; y: number; key: string; name: string; kind: 'been' | 'wish' };

/** The part of the world to show: just around your places (zoomed in), or everything. */
function frame(pins: Pin[], whole: boolean) {
  if (whole || pins.length === 0) return FULL;
  const xs = pins.map((p) => p.x);
  const ys = pins.map((p) => p.y);
  let w = Math.max(Math.max(...xs) - Math.min(...xs) + 70, 80); // room around the pins and labels; never closer than ~4.5×
  let h = Math.max(...ys) - Math.min(...ys) + 40;
  if (w / h < ASPECT) w = h * ASPECT;
  else h = w / ASPECT;
  if (w > W * 0.85) return FULL;
  const cx = (Math.max(...xs) + Math.min(...xs)) / 2;
  const cy = (Math.max(...ys) + Math.min(...ys)) / 2;
  return { x: Math.min(W - w, Math.max(0, cx - w / 2)), y: Math.min(FULL.y + FULL.h - h, Math.max(FULL.y, cy - h / 2)), w, h };
}

/**
 * Where to write each place's name: to the right of its pin, or left, above or
 * below if that would overlap another name or pin. Names that don't fit anywhere
 * are left off (they're still listed under the map).
 */
function placeLabels(pins: Pin[], view: { x: number; y: number; w: number; h: number }, z: number) {
  const size = 10.5 / z;
  const gap = 10 / z;
  type Box = { x1: number; y1: number; x2: number; y2: number };
  const taken: Box[] = pins.map((p) => ({ x1: p.x - 6 / z, y1: p.y - 6 / z, x2: p.x + 6 / z, y2: p.y + 6 / z }));
  const hits = (b: Box) => taken.some((t) => b.x1 < t.x2 && b.x2 > t.x1 && b.y1 < t.y2 && b.y2 > t.y1);
  const inside = (b: Box) => b.x1 >= view.x + 2 / z && b.x2 <= view.x + view.w - 2 / z && b.y1 >= view.y + 2 / z && b.y2 <= view.y + view.h - 2 / z;
  const out: { pin: Pin; x: number; y: number; anchor: 'start' | 'end' | 'middle' }[] = [];
  // Places you've been first, so they get the best spots.
  for (const pin of [...pins].sort((a, b) => (a.kind === b.kind ? 0 : a.kind === 'been' ? -1 : 1))) {
    const w = pin.name.length * size * 0.56;
    const options = [
      { x: pin.x + gap, y: pin.y + size * 0.35, anchor: 'start' as const, box: { x1: pin.x + gap, x2: pin.x + gap + w } },
      { x: pin.x - gap, y: pin.y + size * 0.35, anchor: 'end' as const, box: { x1: pin.x - gap - w, x2: pin.x - gap } },
      { x: pin.x, y: pin.y - gap, anchor: 'middle' as const, box: { x1: pin.x - w / 2, x2: pin.x + w / 2 } },
      { x: pin.x, y: pin.y + gap + size * 0.7, anchor: 'middle' as const, box: { x1: pin.x - w / 2, x2: pin.x + w / 2 } },
    ];
    for (const o of options) {
      const b = { ...o.box, y1: o.y - size * 0.8, y2: o.y + size * 0.2 };
      if (inside(b) && !hits(b)) {
        taken.push(b);
        out.push({ pin, x: o.x, y: o.y, anchor: o.anchor });
        break;
      }
    }
  }
  return out;
}

/**
 * "Your travel map": a world map with places you've been (terracotta
 * pins, from your trips) and places you want to go (teal stars, from your
 * Want to go list). It zooms to your places, with "Whole world" to see it all.
 * Roughly placed: never a live location.
 */
export function TravelMap({ been, wish, countries }: { been: MapPlace[]; wish: MapPlace[]; countries: number }) {
  const [show, setShow] = useState<Show>('all');
  const [whole, setWhole] = useState(false);

  const pins = useMemo(() => {
    const toPins = (list: MapPlace[], kind: Pin['kind']) =>
      list.flatMap((p) => {
        const pos = positionOf(p);
        return pos ? [{ ...toMap(pos), key: kind + placeLabel(p), name: p.name, kind }] : [];
      });
    return [...(show !== 'been' ? toPins(wish, 'wish') : []), ...(show !== 'wish' ? toPins(been, 'been') : [])];
  }, [been, wish, show]);

  const view = frame(pins, whole);
  const z = W / view.w; // how far we're zoomed in; pins and labels keep the same size on screen
  const labels = pins.length <= 16;
  const describe = (label: string, list: MapPlace[]) => (list.length ? `${label}: ${list.map((p) => p.name).join(', ')}.` : '');
  const zoomable = pins.length > 0 && frame(pins, false).w < W;
  // Sizes in screen pixels: the map is about as many pixels wide as the world is units wide.

  return (
    <View style={{ paddingHorizontal: GUTTER, marginTop: 30, gap: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 }}>
        <AccentTitle before="Your travel" accent="map" variant="heading" />
        <Text variant="small">
          {countries} of 195 {countries === 1 ? 'country' : 'countries'}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <View accessibilityRole="tablist" accessibilityLabel="Show on the map" style={{ flexDirection: 'row', gap: 8, flex: 1, flexWrap: 'wrap' }}>
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
        {zoomable && (
          <Pressable onPress={() => setWhole((w) => !w)} accessibilityRole="button" accessibilityLabel={whole ? 'Zoom to my places' : 'Show the whole world'} hitSlop={8}>
            <Text variant="link">{whole ? 'Zoom in' : 'Whole world'}</Text>
          </Pressable>
        )}
      </View>

      <View
        style={{
          borderRadius: radius.xl,
          borderWidth: 1,
          borderColor: colors.line,
          overflow: 'hidden',
          backgroundColor: colors.card,
          shadowColor: colors.ink,
          shadowOpacity: 0.06,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
          elevation: 1,
        }}
      >
        <View accessible accessibilityRole="image" accessibilityLabel={`World map. ${describe('Been', show === 'wish' ? [] : been)} ${describe('Want to go', show === 'been' ? [] : wish)}`.trim()}>
          <Svg viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`} style={{ width: '100%', aspectRatio: ASPECT }}>
            <Defs>
              <LinearGradient id="tm-sea" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={colors.card} />
                <Stop offset="1" stopColor={colors.bg} />
              </LinearGradient>
            </Defs>
            <Rect x="0" y={FULL.y} width={W} height={FULL.h} fill="url(#tm-sea)" />
            {/* The equator and tropics, faintly */}
            {[toMap([0, 0]).y, toMap([23.4, 0]).y, toMap([-23.4, 0]).y].map((y, i) => (
              <Line key={i} x1="0" x2={W} y1={y} y2={y} stroke={colors.line} strokeWidth={0.6 / z} strokeDasharray={`${2 / z} ${2 / z}`} />
            ))}
            <Path d={WORLD_LAND_PATH} fill={colors.mapLand} fillOpacity={0.62} stroke={colors.card} strokeWidth={0.5 / z} strokeLinejoin="round" />

            {pins.map((p) =>
              p.kind === 'wish' ? (
                <G key={p.key} transform={`translate(${p.x} ${p.y}) scale(${1 / z})`}>
                  <Circle r={9} fill={colors.teal} opacity={0.14} />
                  <Path d={STAR} transform="scale(0.62) translate(-12 -12)" fill={colors.teal} stroke={colors.card} strokeWidth={1.4} />
                </G>
              ) : (
                <G key={p.key} transform={`translate(${p.x} ${p.y}) scale(${1 / z})`}>
                  <Circle r={9} fill={colors.terracotta} opacity={0.16} />
                  <Circle r={4.4} fill={colors.terracotta} stroke={colors.card} strokeWidth={1.6} />
                </G>
              ),
            )}

            {labels &&
              placeLabels(pins, view, z).map(({ pin, x, y, anchor }) => {
                const props = { x, y, fontSize: 10.5 / z, fontFamily: fonts.sansSemiBold, textAnchor: anchor };
                return (
                  <G key={'l' + pin.key}>
                    <SvgText {...props} stroke={colors.card} strokeWidth={3 / z} strokeLinejoin="round" fill={colors.card}>
                      {pin.name}
                    </SvgText>
                    <SvgText {...props} fill={pin.kind === 'wish' ? colors.teal : colors.ink}>
                      {pin.name}
                    </SvgText>
                  </G>
                );
              })}
          </Svg>

        </View>

        <View style={{ padding: 14, paddingTop: 12, gap: 12, borderTopWidth: 1, borderTopColor: colors.line }}>
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
            <ChipRow title="Want to go" icon={<WishStar size={10} />} places={wish} empty="Tap “Want to go” on any place page to add it here." tone="wish" />
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
