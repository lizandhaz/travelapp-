/**
 * Brand tokens, from the owner's "POSTCARD - Branding" palette (Lake Como, ocean breeze, sand dunes, Italian coast).
 * Use these, never raw hex values, in components.
 */
export const colors = {
  bg: '#faf7f2', // page background: ivory
  card: '#ffffff', // cards, inputs, stamp frames
  line: '#e6e1d8', // borders, dividers
  sand: '#e5d5bc', // quiet fills, placeholders: champagne
  mapLand: '#c3c9b4', // dotted land on the travel map: pale sage
  ink: '#2c4250', // main text, dark buttons, selected chips/tabs: deep ocean slate
  muted: '#5f6f78', // secondary text, labels
  stamp: '#b6b184', // score stamps, the "+" on the Add button: soft green
  sage: '#a7b69a', // soft tags (e.g. stay type)
  accent: '#7a8664', // olive: swash under italic words, star, slider fill, shapes, large text
  accentDeep: '#5c6b4c', // "Save trip" button (white text passes contrast)
  accentText: '#56653f', // small olive text: links, taglines, labels (passes contrast)
  sea: '#3f7a90', // Italian ocean blue: stay score stamp, saved / success
  gold: '#b9a36f', // hidden-gem pins on place maps
  onDark: '#faf7f2', // text on photos and dark buttons
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
