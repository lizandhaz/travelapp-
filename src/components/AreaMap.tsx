import { useEffect, useRef, type ComponentRef } from 'react';
import { Platform, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import { colors, fonts } from '@/constants/theme';
import { pinLatLng, placeCentres, type MapPin } from '@/lib/placeMaps';
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
  const spots = pins.map((p) => ({ ...p, pos: p.at ? pinLatLng(slug, p.at) : null }));
  const ratio = width / height;
  const home = centre ? { latitude: centre.at[0], longitude: centre.at[1], latitudeDelta: centre.span * 0.4, longitudeDelta: centre.span * 0.4 * ratio } : null;

  // Glide to a pin (or back to the whole place) when asked.
  const focusKey = focus?.key;
  const focusN = focus?.n ?? null;
  useEffect(() => {
    if (focusKey == null || !centre) return;
    const pin = pins.find((p) => p.n === focusN);
    const pos = pin?.at ? pinLatLng(slug, pin.at) : null;
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
      accessibilityLabel={`Map of ${name}`}
    >
      {spots.map((s) =>
        s.pos ? (
          <Marker
            // A new key redraws the marker when it's picked or becomes your stay.
            key={`${s.n}-${picked === s.n}-${stay === s.n}`}
            coordinate={{ latitude: s.pos[0], longitude: s.pos[1] }}
            anchor={{ x: 0.5, y: 0.2 }}
            tracksViewChanges={false}
            onPress={() => (preview ? onPress?.() : onPin(s.n))}
            accessibilityLabel={`${s.n}. ${s.name}, ${s.kind}`}
          >
            <SpotPin n={s.n} name={s.name} colour={PIN[s.kind] ?? colors.ink} picked={picked === s.n} stay={stay === s.n} />
          </Marker>
        ) : null,
      )}
    </MapView>
  );
}

/** A numbered pin with a white name label, like the drawn close-up. */
function SpotPin({ n, name, colour, picked, stay }: { n: number; name: string; colour: string; picked: boolean; stay: boolean }) {
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
      <View style={{ marginTop: 3, backgroundColor: stay ? colors.olive : colors.card, borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2, borderWidth: 1, borderColor: colors.line }}>
        <Text numberOfLines={1} style={{ fontFamily: fonts.sansSemiBold, fontSize: 11, color: stay ? colors.onDark : colors.ink, maxWidth: 140 }}>
          {stay ? `You’re here · ${name}` : name}
        </Text>
      </View>
    </View>
  );
}
