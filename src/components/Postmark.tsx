import { useId } from 'react';
import Svg, { Circle, Defs, G, Path, Text as SvgText, TextPath } from 'react-native-svg';

import { colors } from '@/constants/theme';

/**
 * A round ink postmark showing where and when a trip happened.
 * Always the trip month: never a live date or location.
 */
export function Postmark({
  place,
  date,
  size = 88,
  waves = true,
}: {
  place: string;
  date: string;
  size?: number;
  waves?: boolean;
}) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const top = `pm${id}`;
  const vbWidth = waves ? 168 : 88;

  return (
    <Svg
      width={(size * vbWidth) / 88}
      height={size}
      viewBox={`0 0 ${vbWidth} 88`}
      opacity={0.8}
      style={{ transform: [{ rotate: '-8deg' }] }}
      accessibilityLabel={`Postmarked ${place}, ${date}`}
    >
      <Defs>
        <Path id={top} d="M 14,44 A 30,30 0 0 1 74,44" />
      </Defs>
      <G fill="none" stroke={colors.airmail}>
        <Circle cx={44} cy={44} r={40} strokeWidth={2} />
        <Circle cx={44} cy={44} r={23} strokeWidth={1} />
        {waves &&
          [30, 40, 50, 60].map((y) => (
            <Path key={y} d={`M 86,${y} q 10,-6 20,0 t 20,0 t 20,0 t 20,0`} strokeWidth={2} strokeLinecap="round" />
          ))}
      </G>
      <SvgText fill={colors.airmail} fontSize={8.5} fontWeight="700" letterSpacing={1.2}>
        <TextPath href={`#${top}`} startOffset="50%" textAnchor="middle">
          {place.toUpperCase()}
        </TextPath>
      </SvgText>
      <SvgText x={44} y={47.5} fill={colors.airmail} fontSize={9} fontWeight="700" textAnchor="middle">
        {date.toUpperCase()}
      </SvgText>
      <SvgText x={44} y={75} fill={colors.airmail} fontSize={7} fontWeight="700" textAnchor="middle" letterSpacing={2}>
        ★ POSTCARD ★
      </SvgText>
    </Svg>
  );
}
