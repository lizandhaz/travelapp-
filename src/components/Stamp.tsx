import { View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

import { colors, fonts } from '@/constants/theme';
import { Text } from './Text';

const SIZES = {
  sm: { w: 52, h: 60, score: 18, label: 8 },
  md: { w: 66, h: 76, score: 24, label: 8 },
  lg: { w: 92, h: 108, score: 36, label: 9 },
};

/** Outline of a postage stamp: a rectangle with half-circle bites along every edge. */
function perforatedPath(w: number, h: number, r: number) {
  const across = Math.max(2, Math.round(w / (3 * r)));
  const down = Math.max(2, Math.round(h / (3 * r)));
  const xs = Array.from({ length: across }, (_, i) => ((i + 0.5) * w) / across);
  const ys = Array.from({ length: down }, (_, i) => ((i + 0.5) * h) / down);
  const bite = (x1: number, y1: number, x2: number, y2: number) => `L${x1},${y1} A${r},${r} 0 0 0 ${x2},${y2} `;
  let d = 'M0,0 ';
  xs.forEach((x) => (d += bite(x - r, 0, x + r, 0)));
  d += `L${w},0 `;
  ys.forEach((y) => (d += bite(w, y - r, w, y + r)));
  d += `L${w},${h} `;
  [...xs].reverse().forEach((x) => (d += bite(x + r, h, x - r, h)));
  d += `L0,${h} `;
  [...ys].reverse().forEach((y) => (d += bite(0, y + r, 0, y - r)));
  return d + 'Z';
}

/**
 * A score shown as a perforated postage stamp. Scores are out of 10.
 * Colour follows the score: 8+ sea, 6–7.9 airmail, under 6 postbox.
 */
export function Stamp({
  score,
  label,
  size = 'md',
  tilt = 0,
}: {
  score: number;
  label?: string;
  size?: keyof typeof SIZES;
  tilt?: number;
}) {
  const s = SIZES[size];
  const tone = score >= 8 ? colors.sea : score >= 6 ? colors.airmail : colors.postbox;
  const shown = Number.isInteger(score) ? String(score) : score.toFixed(1);
  const inset = 8;

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={`${label ? label + ': ' : ''}${shown} out of 10`}
      style={{ width: s.w, height: s.h, transform: [{ rotate: `${tilt}deg` }] }}
    >
      <Svg width={s.w} height={s.h} style={{ position: 'absolute' }}>
        <Path
          d={perforatedPath(s.w - 2, s.h - 2, 3)}
          transform="translate(1,1)"
          fill={colors.card}
          stroke={colors.ink}
          strokeOpacity={0.35}
          strokeWidth={0.75}
        />
        <Rect
          x={inset}
          y={inset}
          width={s.w - inset * 2}
          height={s.h - inset * 2}
          fill="none"
          stroke={tone}
          strokeWidth={1.5}
        />
      </Svg>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontFamily: fonts.displayBold, fontSize: s.score, lineHeight: s.score * 1.05, color: tone }}>
          {shown}
        </Text>
        <Text
          style={{
            fontFamily: fonts.sansSemiBold,
            fontSize: s.label,
            letterSpacing: 1.5,
            color: tone,
            textTransform: 'uppercase',
          }}
        >
          {label ?? '/ 10'}
        </Text>
      </View>
    </View>
  );
}
