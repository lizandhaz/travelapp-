import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { colors, fonts } from '@/constants/theme';
import { formatScore } from '@/lib/score';
import { Text } from './Text';

const SIZES = { sm: 44, md: 58, lg: 76, xl: 96 };

/** Outline of a postage stamp: a rectangle with half-circle bites along every edge. */
export function perforatedPath(w: number, h: number, r: number) {
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
 * A score in a small perforated stamp: dark number on soft green (or white on ocean blue
 * for a stay). Always one decimal place, out of 10.
 */
export function ScoreStamp({
  score,
  size = 'md',
  tone = 'stamp',
  label,
}: {
  score: number;
  size?: keyof typeof SIZES;
  tone?: 'stamp' | 'sea';
  label?: string;
}) {
  const s = SIZES[size];
  const inset = Math.max(4, s * 0.09);
  const shown = formatScore(score);
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={`${label ? label + ': ' : ''}${shown} out of 10`}
      style={{ width: s, height: s }}
    >
      <Svg width={s} height={s} style={{ position: 'absolute' }}>
        <Path d={perforatedPath(s - 2, s - 2, Math.max(2, s * 0.045))} transform="translate(1,1)" fill={colors.card} stroke={colors.ink} strokeOpacity={0.12} strokeWidth={0.75} />
      </Svg>
      <View
        style={{
          position: 'absolute',
          left: inset,
          top: inset,
          right: inset,
          bottom: inset,
          backgroundColor: tone === 'stamp' ? colors.stamp : colors.sea,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontFamily: fonts.display, fontSize: s * 0.36, color: tone === 'stamp' ? colors.ink : colors.onDark, fontVariant: ['tabular-nums'] }}>
          {shown}
        </Text>
      </View>
    </View>
  );
}
