import Svg, { Circle, Path, Rect } from 'react-native-svg';

type P = { color: string; size?: number; strokeWidth?: number };
const base = (size: number) => ({ width: size, height: size, viewBox: '0 0 24 24', fill: 'none' as const });
const line = (color: string, w: number) => ({
  stroke: color,
  strokeWidth: w,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

export function HomeIcon({ color, size = 22, strokeWidth = 1.8 }: P) {
  return (
    <Svg {...base(size)}>
      <Path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" {...line(color, strokeWidth)} />
    </Svg>
  );
}
export function CompassIcon({ color, size = 22, strokeWidth = 1.8 }: P) {
  return (
    <Svg {...base(size)}>
      <Circle cx={12} cy={12} r={9} {...line(color, strokeWidth)} />
      <Path d="m15.5 8.5-2 5-5 2 2-5z" {...line(color, strokeWidth)} />
    </Svg>
  );
}
export function PlusIcon({ color, size = 22, strokeWidth = 2.4 }: P) {
  return (
    <Svg {...base(size)}>
      <Path d="M12 5v14M5 12h14" {...line(color, strokeWidth)} />
    </Svg>
  );
}
export function EnvelopeIcon({ color, size = 22, strokeWidth = 1.8 }: P) {
  return (
    <Svg {...base(size)}>
      <Rect x={3} y={5} width={18} height={14} rx={1.5} {...line(color, strokeWidth)} />
      <Path d="m3.5 6 8.5 7 8.5-7" {...line(color, strokeWidth)} />
    </Svg>
  );
}
export function PersonIcon({ color, size = 22, strokeWidth = 1.8 }: P) {
  return (
    <Svg {...base(size)}>
      <Circle cx={12} cy={8} r={4} {...line(color, strokeWidth)} />
      <Path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" {...line(color, strokeWidth)} />
    </Svg>
  );
}
