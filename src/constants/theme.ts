/**
 * Brand tokens, matching the design prototype ("XYZX without planning").
 * Use these, never raw hex values, in components.
 */
export const colors = {
  bg: '#fbf9f5', // page background: warm off-white
  card: '#ffffff', // cards, inputs, stamp frames
  line: '#ece5db', // borders, dividers
  sand: '#e9dec8', // quiet fills, placeholders
  mapLand: '#d5c2a5', // dotted land on the travel map
  ink: '#13264a', // main text, navy buttons, selected chips/tabs
  muted: '#66708a', // secondary text, labels
  peach: '#f6b096', // score stamps, the "+" on the Add button
  mint: '#96c7b8', // soft tags (e.g. stay type)
  terracotta: '#cc754a', // accents: swash under italic words, star, shapes, large text
  terracottaDeep: '#b05e37', // "Save trip" button (white text passes contrast)
  terracottaText: '#a9552c', // small terracotta text: links, taglines, labels (passes contrast)
  teal: '#2e7a7d', // stay score stamp, success
  onDark: '#fffaf5', // text on photos and navy
} as const;

/** Font family names, loaded in src/app/_layout.tsx. */
export const fonts = {
  display: 'Fraunces-SemiBold',
  displayBold: 'Fraunces-Bold',
  displayRegular: 'Fraunces-Regular',
  displayItalic: 'Fraunces-Italic',
  sans: 'DMSans-Regular',
  sansMedium: 'DMSans-Medium',
  sansSemiBold: 'DMSans-SemiBold',
  sansBold: 'DMSans-Bold',
} as const;

export const radius = { sm: 8, md: 16, lg: 20, xl: 24, pill: 999 } as const;

/** Side padding for every screen. */
export const GUTTER = 20;
