import { useEffect, useRef, useState, type ComponentRef } from 'react';
import { Platform, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

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
  const home = centre ? { latitude: centre.at[0], longitude: centre.at[1], latitudeDelta: centre.span * 0.4, longitudeDelta: centre.span * 0.4 * ratio } : null;
  // Names show once you zoom in (and always on the picked pin). Each pin's tap area is its whole drawing, so at the
  // starting zoom a neighbour's name label used to cover numbers and swallow taps (owner, Nov 2026).
  const [zoomedIn, setZoomedIn] = useState(false);
  const spots = spreadOut(
    pins.map((p) => ({ ...p, pos: pinPosition(slug, p) })),
    // About 40 points apart on screen at the starting zoom.
    home ? (home.latitudeDelta * 40) / height : 0,
  );

  // Glide to a pin (or back to the whole place) when asked.
  const focusKey = focus?.key;
  const focusN = focus?.n ?? null;
  useEffect(() => {
    if (focusKey == null || !centre) return;
    const pin = pins.find((p) => p.n === focusN);
    const pos = pin ? pinPosition(slug, pin) : null;
    const d = centre.span * 0.4;
    const region = pos
      ? { latitude: pos[0], longitude: pos[1], latitudeDelta: d / 2.5, longitudeDelta: (d / 2.5) * ratio }
      : { latitude: centre.at[0], longitude: centre.at[1], latitudeDelta: d, longitudeDelta: d * ratio };
    map.current?.animateToRegion(region, 500);
  }, [focusKey, focusN, slug, pins, centre, ratio]);

  if (!centre || !home) return null;
  return (
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
      onRegionChangeComplete={(r) => home && setZoomedIn(r.latitudeDelta < home.latitudeDelta * 0.45)}
      // Belt and braces (owner, Nov 2026: some numbers didn't respond): the map also reports which pin was tapped.
      onMarkerPress={(e) => {
        const n = Number(e.nativeEvent.id);
        if (!preview && Number.isFinite(n)) onPin(n);
      }}
      accessibilityLabel={`Map of ${name}`}
    >
      {spots.map((s) =>
        s.pos ? (
          <Marker
            // A new key redraws the marker when it's picked, becomes your stay or its name shows.
            key={`${s.n}-${picked === s.n}-${stay === s.n}-${zoomedIn}`}
            identifier={String(s.n)}
            coordinate={{ latitude: s.pos[0], longitude: s.pos[1] }}
            anchor={{ x: 0.5, y: 0.2 }}
            // The picked pin sits on top; otherwise lower numbers (your best picks) sit above higher ones, so a
            // neighbour's name label never covers a number you're trying to tap.
            zIndex={picked === s.n ? 1000 : 500 - s.n}
            tracksViewChanges={false}
            onPress={() => (preview ? onPress?.() : onPin(s.n))}
            onSelect={() => (preview ? undefined : onPin(s.n))}
            accessibilityLabel={`${s.n}. ${s.name}, ${s.kind}`}
          >
            <SpotPin n={s.n} name={s.name} colour={PIN[s.kind] ?? colors.ink} picked={picked === s.n} stay={stay === s.n} label={zoomedIn || picked === s.n || stay === s.n} />
          </Marker>
        ) : null,
      )}
    </MapView>
  );
}

/** A numbered pin with a white name label, like the drawn close-up. */
function SpotPin({ n, name, colour, picked, stay, label }: { n: number; name: string; colour: string; picked: boolean; stay: boolean; label: boolean }) {
  const ring = stay ? colors.olive : picked ? colors.accentDeep : colors.card;
  return (
    <View style={{ alignItems: 'center' }}>
      <View
        style={{
          width: 28,
          height: 28,
          borderRadius: 14,
          backgroundColor: colour,
          borderWidth: picked || stay ? 3 : 2,
          borderColor: ring,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontFamily: fonts.sansBold, fontSize: 12, lineHeight: 14, color: colors.onDark }}>{n}</Text>
      </View>
      {label && (
      <View style={{ marginTop: 3, backgroundColor: stay ? colors.olive : colors.card, borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2, borderWidth: 1, borderColor: colors.line }}>
        <Text numberOfLines={1} style={{ fontFamily: fonts.sansSemiBold, fontSize: 11, color: stay ? colors.onDark : colors.ink, maxWidth: 140 }}>
          {stay ? `You’re here · ${name}` : name}
        </Text>
      </View>
      )}
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
