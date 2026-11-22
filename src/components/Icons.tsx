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
export const HeartIcon = ({ color, size = 22, strokeWidth = 1.8, filled = false }: P & { filled?: boolean }) => (
  <Svg {...base(size)}><Path d="M12 20s-7-4.4-9-9a4.8 4.8 0 0 1 9-3 4.8 4.8 0 0 1 9 3c-2 4.6-9 9-9 9z" {...line(color, strokeWidth)} fill={filled ? color : 'none'} /></Svg>
);
/** A speech bubble: comments. */
export const CommentIcon = ({ color, size = 22, strokeWidth = 1.8 }: P) => (
  <Svg {...base(size)}><Path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-9l-5 4v-4H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" {...line(color, strokeWidth)} /></Svg>
);
/** A bookmark: save to a list. */
export const BookmarkIcon = ({ color, size = 22, strokeWidth = 1.8, filled = false }: P & { filled?: boolean }) => (
  <Svg {...base(size)}><Path d="M6 3h12v18l-6-4.5L6 21z" {...line(color, strokeWidth)} fill={filled ? color : 'none'} /></Svg>
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
/** Calendar: when you went. */
export const CalendarIcon = ({ color, size = 22, strokeWidth = 1.8 }: P) => (
  <Svg {...base(size)}><Rect x={3.5} y={5} width={17} height={15.5} rx={2.5} {...line(color, strokeWidth)} /><Path d="M3.5 10h17M8 3v4M16 3v4" {...line(color, strokeWidth)} /></Svg>
);
/** Crescent moon: nights. */
export const MoonIcon = ({ color, size = 22, strokeWidth = 1.8 }: P) => (
  <Svg {...base(size)}><Path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" {...line(color, strokeWidth)} /></Svg>
);
/** Two people: who you went with. */
export const PeopleIcon = ({ color, size = 22, strokeWidth = 1.8 }: P) => (
  <Svg {...base(size)}><Circle cx={9} cy={8} r={3.5} {...line(color, strokeWidth)} /><Path d="M2.5 20c1-3.6 3.6-5.5 6.5-5.5s5.5 1.9 6.5 5.5M15.5 4.8a3.5 3.5 0 0 1 0 6.4M18 14.8c1.7.8 2.9 2.5 3.5 5.2" {...line(color, strokeWidth)} /></Svg>
);
/** A bed: where you stayed. */
export const BedIcon = ({ color, size = 22, strokeWidth = 1.8 }: P) => (
  <Svg {...base(size)}><Path d="M3 19V6M3 15h18v4M21 15v-3a3 3 0 0 0-3-3h-7v6" {...line(color, strokeWidth)} /><Circle cx={7} cy={11} r={2} {...line(color, strokeWidth)} /></Svg>
);
/** A map pin: another place on the trip. */
export const PinIcon = ({ color, size = 22, strokeWidth = 1.8 }: P) => (
  <Svg {...base(size)}><Path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" {...line(color, strokeWidth)} /><Circle cx={12} cy={9.5} r={2.5} {...line(color, strokeWidth)} /></Svg>
);
/** Fork and knife: best meal. */
export const ForkIcon = ({ color, size = 22, strokeWidth = 1.8 }: P) => (
  <Svg {...base(size)}><Path d="M7 3v18M4 3v5a3 3 0 0 0 6 0V3M17 21V3c-2.2 1.5-3 4-3 7v3h3" {...line(color, strokeWidth)} /></Svg>
);
/** A light bulb: top tip. */
export const BulbIcon = ({ color, size = 22, strokeWidth = 1.8 }: P) => (
  <Svg {...base(size)}><Path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z" {...line(color, strokeWidth)} /></Svg>
);
/** A page with a pencil line: a note. */
export const NoteIcon = ({ color, size = 22, strokeWidth = 1.8 }: P) => (
  <Svg {...base(size)}><Path d="M13 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7" {...line(color, strokeWidth)} /><Path d="m18 3 3 3-8 8h-3v-3z" {...line(color, strokeWidth)} /></Svg>
);
