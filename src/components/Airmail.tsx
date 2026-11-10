import { View } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';

import { colors } from '@/constants/theme';

const WIDTH = 900; // wider than any phone; extra is clipped
const STRIPE = [colors.postbox, colors.card, colors.airmail, colors.card];
const BANDS = [8, 6, 8, 6];

/** The red/blue diagonal stripe from airmail envelopes. Used as a thin top edge. */
export function Airmail({ height = 6 }: { height?: number }) {
  const polys: { points: string; fill: string }[] = [];
  let x = -height;
  let i = 0;
  while (x < WIDTH) {
    const w = BANDS[i % 4];
    polys.push({
      points: `${x},${height} ${x + w},${height} ${x + w + height},0 ${x + height},0`,
      fill: STRIPE[i % 4],
    });
    x += w;
    i++;
  }
  return (
    <View style={{ height, overflow: 'hidden', backgroundColor: colors.card }} accessibilityElementsHidden>
      <Svg width={WIDTH} height={height}>
        {polys.map((p, k) => (
          <Polygon key={k} points={p.points} fill={p.fill} />
        ))}
      </Svg>
    </View>
  );
}
