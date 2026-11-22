import Svg, { Circle, Path, Rect } from 'react-native-svg';

type P = { color: string; size?: number; strokeWidth?: number };
const base = (size: number) => ({ width: size, height: size, viewBox: '0 0 24 24', fill: 'none' as const });
const line = (color: string, w: number) => ({ stroke: color, strokeWidth: w, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const });

export const HomeIcon = ({ color, size = 22, strokeWidth = 1.8 }: P) => (
  <Svg {...base(size)}><Path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" {...line(color, strokeWidth)} /></Svg>
);
export const CompassIcon = ({ color, size = 22, strokeWidth = 1.8 }: P) => (
  <Svg {...base(size)}><Circle cx={12} cy={12} r={9} {...line(color, strokeWidth)} /><Path d="m15.5 8.5-2 5-5 2 2-5z" {...line(color, strokeWidth)} /></Svg>
);
export const PlusIcon = ({ color, size = 22, strokeWidth = 2.2 }: P) => (
  <Svg {...base(size)}><Path d="M12 5v14M5 12h14" {...line(color, strokeWidth)} /></Svg>
);
export const HeartIcon = ({ color, size = 22, strokeWidth = 1.8 }: P) => (
  <Svg {...base(size)}><Path d="M12 20s-7-4.4-9-9a4.8 4.8 0 0 1 9-3 4.8 4.8 0 0 1 9 3c-2 4.6-9 9-9 9z" {...line(color, strokeWidth)} /></Svg>
);
export const PersonIcon = ({ color, size = 22, strokeWidth = 1.8 }: P) => (
  <Svg {...base(size)}><Circle cx={12} cy={8} r={4} {...line(color, strokeWidth)} /><Path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" {...line(color, strokeWidth)} /></Svg>
);
/** A person with a small plus: find and add friends. */
export const AddPersonIcon = ({ color, size = 20, strokeWidth = 1.8 }: P) => (
  <Svg {...base(size)}><Circle cx={10} cy={8} r={4} {...line(color, strokeWidth)} /><Path d="M2.5 21c1.4-3.8 4.2-6 7.5-6 1.6 0 3 .4 4.2 1.2M19 14v6M16 17h6" {...line(color, strokeWidth)} /></Svg>
);
export const SearchIcon = ({ color, size = 20, strokeWidth = 1.8 }: P) => (
  <Svg {...base(size)}><Circle cx={11} cy={11} r={7} {...line(color, strokeWidth)} /><Path d="m20 20-3.5-3.5" {...line(color, strokeWidth)} /></Svg>
);
/** Paper plane: Postcards. */
export const SendIcon = ({ color, size = 20, strokeWidth = 1.8 }: P) => (
  <Svg {...base(size)}><Path d="M21 3 10 14M21 3l-7 18-4-7-7-4z" {...line(color, strokeWidth)} /></Svg>
);
export const SlidersIcon = ({ color, size = 20, strokeWidth = 1.8 }: P) => (
  <Svg {...base(size)}><Path d="M4 7h10M18 7h2M4 17h4M12 17h8" {...line(color, strokeWidth)} /><Circle cx={16} cy={7} r={2} {...line(color, strokeWidth)} /><Circle cx={10} cy={17} r={2} {...line(color, strokeWidth)} /></Svg>
);
export const ImageIcon = ({ color, size = 22, strokeWidth = 1.8 }: P) => (
  <Svg {...base(size)}><Rect x={3} y={4} width={18} height={16} rx={2} {...line(color, strokeWidth)} /><Circle cx={9} cy={10} r={1.6} {...line(color, strokeWidth)} /><Path d="m4 18 5-5 4 4 3-3 4 4" {...line(color, strokeWidth)} /></Svg>
);
export const LockIcon = ({ color, size = 13, strokeWidth = 2 }: P) => (
  <Svg {...base(size)}><Rect x={5} y={11} width={14} height={10} rx={2} {...line(color, strokeWidth)} /><Path d="M8 11V8a4 4 0 0 1 8 0v3" {...line(color, strokeWidth)} /></Svg>
);
export const BackIcon = ({ color, size = 20, strokeWidth = 2 }: P) => (
  <Svg {...base(size)}><Path d="m15 5-7 7 7 7" {...line(color, strokeWidth)} /></Svg>
);
export const ChevronIcon = ({ color, size = 16, strokeWidth = 2 }: P) => (
  <Svg {...base(size)}><Path d="m9 5 7 7-7 7" {...line(color, strokeWidth)} /></Svg>
);
/** Share: a box with an arrow up. */
export const ShareIcon = ({ color, size = 20, strokeWidth = 1.8 }: P) => (
  <Svg {...base(size)}><Path d="M12 3v12M8 7l4-4 4 4M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" {...line(color, strokeWidth)} /></Svg>
);
/** Pencil: edit. */
export const PencilIcon = ({ color, size = 19, strokeWidth = 1.8 }: P) => (
  <Svg {...base(size)}><Path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z" {...line(color, strokeWidth)} /><Path d="m13.5 6.5 4 4" {...line(color, strokeWidth)} /></Svg>
);
