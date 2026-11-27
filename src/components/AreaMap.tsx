import { useEffect, useRef, useState, type ComponentRef } from 'react';
import { Platform, Pressable, View } from 'react-native';
import MapView, { type Region } from 'react-native-maps';

import { colors, fonts } from '@/constants/theme';
import { pinPosition, placeCentres, type MapPin } from '@/lib/placeMaps';
import { Text } from './Text';

/** Pin colours, matching the drawn maps and the key. */
const PIN: Record<string, string> = { Stay: colors.olive, Eat: colors.accent, Do: colors.ink, 'Hidden gem': colors.gold };

/**
 * The real map of a place (Apple Maps on iPhone, in its dark, muted style; Google on Android; both
 * come with Expo Go, no key needed), dressed like the drawn close-up: numbered pins in the app's colours
 * with white name labels. Zoom from the street out to the country and the world. Pins are placed roughly
 * (from the drawing) until real place data arrives. Never shows your own location (privacy default).
 */
export function AreaMap({
  slug,
  name,
  width,
  height,
  pins,
  picked,
  stay,
  focus,
  onPin,
  preview = false,
  onPress,
}: {
  slug: string;
  name: string;
  width: number;
  height: number;
  pins: MapPin[];
  picked: number | null;
  stay: number | null;
  /** A new key glides the map to pin n (or back to the whole place when n is null). */
  focus?: { n: number | null; key: number };
  onPin: (n: number) => void;
  /** A still preview (no zooming or dragging); tapping anywhere calls onPress. */
  preview?: boolean;
  onPress?: () => void;
}) {
  const centre = placeCentres[slug];
  const map = useRef<ComponentRef<typeof MapView>>(null);
  const ratio = width / height;
  const raw = pins.map((p) => ({ ...p, pos: pinPosition(slug, p) }));
  // Start zoomed to fit every pin, with room for the labels (owner, Nov 2026: some pins started off the edge): fit,
  // spread pins that would overlap about 44 points apart, then fit again so the spread pins are all in view too.
  const first: Region | null = centre ? fitPins(raw, ratio, { latitude: centre.at[0], longitude: centre.at[1], latitudeDelta: centre.span * 0.4, longitudeDelta: centre.span * 0.4 * ratio }) : null;
  // Zooming out to fit the spread pins brings them closer again, so spread and fit a second time at that zoom.
  const spread1 = first ? spreadOut(raw, (first.latitudeDelta * 44) / height) : raw;
  const fit1 = first ? fitPins(spread1, ratio, first) : null;
  const spots = fit1 ? spreadOut(raw, (fit1.latitudeDelta * 44) / height) : raw;
  const home: Region | null = fit1 ? fitPins(spots, ratio, fit1) : null;
  // Where the map is looking right now, so the pins drawn on top can follow it as you drag and zoom.
  const [region, setRegion] = useState<Region | null>(home);

  // Glide to a pin (or back to the whole place) when asked.
  const focusKey = focus?.key;
  const focusN = focus?.n ?? null;
  const homeKey = home ? `${home.latitude},${home.longitude},${home.latitudeDelta}` : '';
  useEffect(() => {
    if (focusKey == null || !home) return;
    const spot = spots.find((p) => p.n === focusN);
    const d = Math.min(home.latitudeDelta / 2.5, (centre?.span ?? home.latitudeDelta) * 0.16);
    const target = spot?.pos ? { latitude: spot.pos[0], longitude: spot.pos[1], latitudeDelta: d, longitudeDelta: (d * home.longitudeDelta) / home.latitudeDelta } : home;
    map.current?.animateToRegion(target, 500);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- home and spots follow slug, pins and homeKey
  }, [focusKey, focusN, slug, pins, homeKey]);

  if (!centre || !home) return null;
  const view = region ?? home;
  // Picked and your stay drawn last, so they sit on top.
  const order = [...spots].sort((a, b) => Number(a.n === picked || a.n === stay) - Number(b.n === picked || b.n === stay));
  return (
    <View style={{ width, height }}>
      <MapView
        ref={map}
        style={{ width, height }}
        initialRegion={home}
        mapType={Platform.OS === 'ios' ? 'mutedStandard' : 'standard'}
        // Apple's dark map style (owner, Nov 2026), on the page and full screen alike, whatever the phone's setting.
        userInterfaceStyle="dark"
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsPointsOfInterests={false}
        rotateEnabled={false}
        pitchEnabled={false}
        scrollEnabled={!preview}
        zoomEnabled={!preview}
        onPress={preview ? onPress : undefined}
        onRegionChange={setRegion}
        onRegionChangeComplete={setRegion}
        accessibilityLabel={`Map of ${name}`}
      />
      {/* The pins are the app's own buttons drawn over the map (owner, Nov 2026: tapping the map's own markers was
          unreliable on iPhone), placed from where the map is looking and moved as it moves. Only the number and its
          name label take taps; the rest of the map can be dragged and pinched as normal. */}
      <View pointerEvents={preview ? 'none' : 'box-none'} style={{ position: 'absolute', left: 0, top: 0, width, height, overflow: 'hidden' }}>
        {order.map((s) => {
          if (!s.pos) return null;
          const at = toScreen(s.pos, view, width, height);
          if (at[0] < -80 || at[0] > width + 80 || at[1] < -40 || at[1] > height + 40) return null;
          return (
            <View key={s.n} pointerEvents="box-none" style={{ position: 'absolute', left: at[0] - PIN_BOX / 2, top: at[1] - 15, width: PIN_BOX, alignItems: 'center' }}>
              <Pressable onPress={() => onPin(s.n)} hitSlop={6} accessibilityRole="button" accessibilityLabel={`${s.n}. ${s.name}, ${s.kind}`}>
                <SpotPin n={s.n} name={s.name} colour={PIN[s.kind] ?? colors.ink} picked={picked === s.n} stay={stay === s.n} />
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}

/**
 * A region that shows every pin with some room around it (more below, for the name labels), the right shape for the
 * map. Falls back to the place's own centre when there are fewer than two pins.
 */
function fitPins(spots: { pos: [number, number] | null }[], ratio: number, fallback: Region): Region {
  const ps = spots.map((s) => s.pos).filter((p): p is [number, number] => !!p);
  if (ps.length < 2) return fallback;
  const lats = ps.map((p) => p[0]);
  const lngs = ps.map((p) => p[1]);
  const [minLat, maxLat, minLng, maxLng] = [Math.min(...lats), Math.max(...lats), Math.min(...lngs), Math.max(...lngs)];
  const k = Math.cos((((minLat + maxLat) / 2) * Math.PI) / 180) || 1;
  // Room: 70% more top to bottom (labels hang below the pins), a third more side to side (labels are wide).
  let dLat = (maxLat - minLat) * 1.7 + 0.004;
  let dLng = (maxLng - minLng) * 1.35 + 0.004;
  dLat = Math.max(dLat, (dLng * k) / ratio);
  dLng = (dLat * ratio) / k;
  return { latitude: (minLat + maxLat) / 2 - dLat * 0.07, longitude: (minLng + maxLng) / 2, latitudeDelta: dLat, longitudeDelta: dLng };
}

/** How wide each pin's box is (the label is centred under the number and can be up to this wide). */
const PIN_BOX = 160;

/** A map position → where it sits on screen, for the region the map is showing (Web Mercator, like Apple Maps). */
function toScreen(pos: [number, number], r: Region, width: number, height: number): [number, number] {
  const merc = (lat: number) => Math.log(Math.tan(Math.PI / 4 + (Math.max(-85, Math.min(85, lat)) * Math.PI) / 360));
  const top = merc(r.latitude + r.latitudeDelta / 2);
  const bottom = merc(r.latitude - r.latitudeDelta / 2);
  const x = ((pos[1] - (r.longitude - r.longitudeDelta / 2)) / r.longitudeDelta) * width;
  const y = ((top - merc(pos[0])) / (top - bottom)) * height;
  return [x, y];
}

/** A numbered pin with a white name label under it, like the drawn close-up. */
function SpotPin({ n, name, colour, picked, stay }: { n: number; name: string; colour: string; picked: boolean; stay: boolean }) {
  const ring = stay ? colors.olive : picked ? colors.accentDeep : colors.card;
  return (
    <View style={{ alignItems: 'center' }}>
      <View
        style={{
          width: 30,
          height: 30,
          borderRadius: 15,
          backgroundColor: colour,
          borderWidth: picked || stay ? 3 : 2,
          borderColor: ring,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontFamily: fonts.sansBold, fontSize: 12, lineHeight: 14, color: colors.onDark }}>{n}</Text>
      </View>
      <View style={{ marginTop: 3, backgroundColor: stay ? colors.olive : colors.card, borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2, borderWidth: picked ? 1.5 : 1, borderColor: picked ? colors.accentDeep : colors.line }}>
        <Text numberOfLines={1} style={{ fontFamily: fonts.sansSemiBold, fontSize: 11, color: stay ? colors.onDark : colors.ink, maxWidth: PIN_BOX - 20 }}>
          {stay ? `You’re here · ${name}` : name}
        </Text>
      </View>
    </View>
  );
}

/**
 * Nudges pins that would sit on top of each other apart, so every number can be tapped at the starting zoom (the
 * positions are rough anyway). Lower numbers (your best picks) keep their place; others step round in a small spiral.
 */
function spreadOut<T extends { n: number; pos: [number, number] | null }>(spots: T[], minDeg: number): T[] {
  if (minDeg <= 0) return spots;
  const placed: [number, number][] = [];
  const far = (a: [number, number], b: [number, number]) => {
    const k = Math.cos((a[0] * Math.PI) / 180);
    return Math.hypot(a[0] - b[0], (a[1] - b[1]) * k) >= minDeg;
  };
  return [...spots]
    .sort((a, b) => a.n - b.n)
    .map((s) => {
      if (!s.pos) return s;
      let pos = s.pos;
      const k = Math.cos((s.pos[0] * Math.PI) / 180) || 1;
      for (let i = 0; i < 16 && !placed.every((q) => far(pos, q)); i++) {
        const angle = i * 2.4;
        const r = minDeg * (1 + i * 0.2);
        pos = [s.pos[0] + r * Math.sin(angle), s.pos[1] + (r * Math.cos(angle)) / k];
      }
      placed.push(pos);
      return { ...s, pos };
    });
}
