/**
 * Brand tokens, from the owner's palette (Oat Milk, Blush Petal, Terracotta Clay, Sage Whisper, Misty Sky, Olive Grove).
 * Use these, never raw hex values, in components.
 */
export const colors = {
  bg: '#f2ede2', // page background: oat milk
  card: '#ffffff', // cards, inputs, stamp frames
  line: '#e2dacb', // borders, dividers
  sand: '#e6dccb', // quiet fills, placeholders
  mapLand: '#b9c3ad', // dotted land on the travel map: light sage
  ink: '#353b2c', // main text, dark buttons, selected chips/tabs: deep olive charcoal
  muted: '#646858', // secondary text, labels
  stamp: '#e7b9b2', // score stamps, the "+" on the Add button: blush petal
  sage: '#a7b59c', // soft tags (e.g. stay type): sage whisper
  sky: '#b7c6d6', // misty sky: the quieter months in the best-time chart
  accent: '#c47a5c', // terracotta clay: swash under italic words, star, slider fill, shapes, large text
  accentDeep: '#a95d40', // "Save trip" / "I've been" buttons (white text passes contrast)
  accentText: '#9a5236', // small terracotta text: links, taglines, labels (passes contrast)
  olive: '#636b51', // olive grove (a shade deeper so small text passes): stay score stamp, stay pins, saved
  blushSoft: '#f6e1dc', // soft blush fill for cards and bands
  sageSoft: '#e2e8da', // soft sage fill for cards and bands
  skySoft: '#e1e8f0', // soft misty-sky fill for cards and bands
  skyDeep: '#5b7389', // misty sky, deep enough for white initials
  gold: '#b9975b', // hidden-gem pins on place maps
  onDark: '#faf7f0', // text on photos and dark buttons
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
