import { Image } from 'expo-image';
import { useState } from 'react';
import { PanResponder, Pressable, View, type GestureResponderEvent } from 'react-native';

import { colors, fonts } from '@/constants/theme';
import type { MapPin } from '@/lib/placeMaps';
import { Text } from './Text';

/** The map pictures are drawn on a 400 × 250 grid. */
const MAP_W = 400;
const MAP_H = 250;
const MAX_ZOOM = 4;

type View3 = { zoom: number; tx: number; ty: number };

/**
 * A place's illustrated map you can zoom and move around: pinch (on a phone) or use + and −,
 * drag to look around once zoomed in, and tap a pin. `picked` gets a terracotta ring and `stay`
 * an olive one ("You're staying here"). Change `focus` (any new value) to glide to a pin.
 */
export function ZoomMap({
  image,
  pins,
  width,
  label,
  picked,
  stay,
  focus,
  onPin,
}: {
  image: number;
  pins: MapPin[];
  width: number;
  label: string;
  picked: number | null;
  stay: number | null;
  /** { n, zoom, key }: centre on pin n at this zoom; a new key moves the map again. */
  focus?: { n: number | null; zoom: number; key: number };
  onPin: (n: number) => void;
}) {
  const height = Math.round((width * MAP_H) / MAP_W);
  const [view, setView] = useState<View3>({ zoom: 1, tx: 0, ty: 0 });
  // Pinch, drag and zoom maths live in one object made once, outside React's render.
  const [gesture] = useState(() => new MapGesture(setView));
  gesture.resize(width, height);

  // Glide to a pin when asked (adjusting during render, not in an effect).
  const [lastFocus, setLastFocus] = useState<number | null>(null);
  if (focus && focus.key !== lastFocus) {
    setLastFocus(focus.key);
    const pin = pins.find((p) => p.n === focus.n);
    gesture.show(pin?.at ? gesture.centreOn(pin.at, focus.zoom) : { zoom: 1, tx: 0, ty: 0 });
  }

  const { zoom, tx, ty } = view;
  const unit = (width / MAP_W) * zoom; // map units → points
  const ring = (n: number | null, colour: string, text?: string) => {
    const pin = pins.find((p) => p.n === n);
    if (!pin?.at) return null;
    const r = Math.max(12, 12 * unit);
    const cx = tx + pin.at[0] * unit;
    const cy = ty + (pin.at[1] - 14) * unit;
    return (
      <View pointerEvents="none" style={{ position: 'absolute', left: cx - r, top: cy - r, width: r * 2, height: r * 2, borderRadius: r, borderWidth: 3, borderColor: colour }}>
        {!!text && (
          <View style={{ position: 'absolute', top: r * 2 + 2, left: r - 34, width: 68, alignItems: 'center' }}>
            <Text style={{ fontFamily: fonts.sansBold, fontSize: 10, color: colors.onDark, backgroundColor: colour, borderRadius: 6, paddingHorizontal: 5, overflow: 'hidden' }}>{text}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={{ width, height, overflow: 'hidden', backgroundColor: colors.sand }} {...gesture.handlers}>
      {/* pointerEvents none: otherwise the browser starts dragging the picture itself and cancels the gesture. */}
      <View pointerEvents="none" style={{ position: 'absolute', left: tx, top: ty, width: width * zoom, height: height * zoom }}>
        <Image source={image} style={{ width: '100%', height: '100%' }} contentFit="cover" accessibilityLabel={label} />
      </View>

      {/* Tap targets on each pin. */}
      {pins.map((p) =>
        p.at ? (
          <Pressable
            key={p.n}
            onPress={() => onPin(p.n)}
            accessibilityRole="button"
            accessibilityLabel={`${p.n}. ${p.name}, ${p.kind}`}
            hitSlop={4}
            style={{ position: 'absolute', left: tx + p.at[0] * unit - 16, top: ty + (p.at[1] - 14) * unit - 16, width: 32, height: 32, borderRadius: 16 }}
          />
        ) : null,
      )}
      {ring(stay, colors.olive, stay != null ? 'You’re here' : undefined)}
      {picked !== stay && ring(picked, colors.accentDeep)}

      {/* Zoom buttons. */}
      <View style={{ position: 'absolute', right: 8, bottom: 8, gap: 6 }}>
        <ZoomButton label="+" a11y="Zoom in" disabled={zoom >= MAX_ZOOM} onPress={() => gesture.zoomBy(1.6)} />
        <ZoomButton label="−" a11y="Zoom out" disabled={zoom <= 1} onPress={() => gesture.zoomBy(1 / 1.6)} />
      </View>
    </View>
  );
}

function ZoomButton({ label, a11y, disabled, onPress }: { label: string; a11y: string; disabled: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={a11y}
      accessibilityState={{ disabled }}
      style={({ pressed }) => ({
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.card,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: disabled ? 0.45 : pressed ? 0.8 : 1,
        shadowColor: colors.ink,
        shadowOpacity: 0.15,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
      })}
    >
      <Text style={{ fontFamily: fonts.sansBold, fontSize: 20, lineHeight: 22, color: colors.ink }}>{label}</Text>
    </Pressable>
  );
}

/** The map's pinch, drag and zoom: keeps the current view and tells React when it changes. */
class MapGesture {
  private width = 0;
  private height = 0;
  private view: View3 = { zoom: 1, tx: 0, ty: 0 };
  private start: { v: View3; dist: number | null; x: number; y: number } = { v: this.view, dist: null, x: 0, y: 0 };
  private onChange: (v: View3) => void;
  readonly handlers: ReturnType<typeof PanResponder.create>['panHandlers'];

  constructor(onChange: (v: View3) => void) {
    this.onChange = onChange;
    const spread = (e: GestureResponderEvent) => {
      const [a, b] = e.nativeEvent.touches;
      return a && b ? Math.hypot(a.pageX - b.pageX, a.pageY - b.pageY) : null;
    };
    this.handlers = PanResponder.create({
      // Once zoomed in, the map owns presses so you can drag it (a pin's tap still wins, as it's on top).
      onStartShouldSetPanResponder: (e) => e.nativeEvent.touches.length === 2 || this.view.zoom > 1,
      // Take over from a pin's tap as soon as you start dragging (or pinching).
      onMoveShouldSetPanResponderCapture: (e, g) => e.nativeEvent.touches.length === 2 || (this.view.zoom > 1 && Math.abs(g.dx) + Math.abs(g.dy) > 6),
      onMoveShouldSetPanResponder: (e, g) => e.nativeEvent.touches.length === 2 || (this.view.zoom > 1 && Math.abs(g.dx) + Math.abs(g.dy) > 6),
      onPanResponderGrant: (e) => {
        this.start = { v: this.view, dist: spread(e), x: e.nativeEvent.pageX, y: e.nativeEvent.pageY };
      },
      onPanResponderMove: (e, g) => {
        const d = spread(e);
        if (d) {
          // Two fingers: pinch to zoom about the middle.
          if (this.start.dist == null) this.start = { ...this.start, v: this.view, dist: d };
          this.show(this.zoomAbout(this.start.v, (this.start.v.zoom * d) / (this.start.dist ?? d)));
        } else if (this.view.zoom > 1) {
          // Measured from where the finger went down (steadier than the gesture's own totals on the web).
          const s = this.start.v;
          this.show({ zoom: this.view.zoom, tx: s.tx + (e.nativeEvent.pageX - this.start.x), ty: s.ty + (e.nativeEvent.pageY - this.start.y) });
        }
      },
      onPanResponderRelease: () => {
        this.start = { ...this.start, v: this.view, dist: null };
      },
      onPanResponderTerminationRequest: () => false,
    }).panHandlers;
  }

  resize(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  private clamp(v: View3): View3 {
    const zoom = Math.min(MAX_ZOOM, Math.max(1, v.zoom));
    return {
      zoom,
      tx: Math.min(0, Math.max(this.width - this.width * zoom, v.tx)),
      ty: Math.min(0, Math.max(this.height - this.height * zoom, v.ty)),
    };
  }

  show(v: View3) {
    this.view = this.clamp(v);
    this.onChange(this.view);
  }

  /** Zoom about a point in the window (the middle unless given), keeping that point still. */
  zoomAbout(from: View3, zoom: number, fx = this.width / 2, fy = this.height / 2): View3 {
    const z = Math.min(MAX_ZOOM, Math.max(1, zoom));
    return { zoom: z, tx: fx - (fx - from.tx) * (z / from.zoom), ty: fy - (fy - from.ty) * (z / from.zoom) };
  }

  zoomBy(factor: number) {
    this.show(this.zoomAbout(this.view, this.view.zoom * factor));
  }

  centreOn(at: [number, number], zoom: number): View3 {
    return { zoom, tx: this.width / 2 - (at[0] / MAP_W) * this.width * zoom, ty: this.height / 2 - ((at[1] - 12) / MAP_H) * this.height * zoom };
  }
}
