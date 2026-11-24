import { Dimensions } from 'react-native';

/**
 * Brand tokens, from the owner's palette (Oat Milk, Blush Petal, Terracotta Clay, Sage Whisper, Misty Sky, Olive Grove).
 * Use these, never raw hex values, in components. Toned down slightly (owner, Nov 2026: "slightly less colourful"):
 * the accents are 20% less saturated and the soft fills sit 35% closer to the oat-milk background.
 */
export const colors = {
  bg: '#f2ede2', // page background: oat milk
  card: '#ffffff', // cards, inputs, stamp frames
  line: '#e2dacb', // borders, dividers
  sand: '#e6dccb', // quiet fills, placeholders
  mapLand: '#b9c3ad', // dotted land on the travel map: light sage
  ink: '#353b2c', // main text, dark buttons, selected chips/tabs: deep olive charcoal
  muted: '#646858', // secondary text, labels
  stamp: '#e2bdb7', // the "+" on the Add button, gem tags: blush petal
  stampPaper: '#dfe3d4', // inside score stamps: soft sage paper (owner Nov 2026: not pink)
  stampInk: '#4f5741', // the number on a score stamp: deep olive
  sage: '#a7b39e', // soft tags (e.g. stay type): sage whisper
  sky: '#bac6d3', // misty sky: the quieter months in the best-time chart
  accent: '#ba7e66', // terracotta clay: swash under italic words, star, slider fill, shapes, large text
  accentDeep: '#9e624a', // "Save trip" / "I've been" buttons (white text passes contrast)
  accentText: '#905640', // small terracotta text: links, taglines, labels (passes contrast)
  olive: '#636b51', // olive grove (a shade deeper so small text passes): stay score stamp, stay pins, saved
  blushSoft: '#f5e5de', // soft blush fill for cards and bands
  sageSoft: '#e8eadd', // soft sage fill for cards and bands
  skySoft: '#e7eaeb', // soft misty-sky fill for cards and bands
  cream: '#fcf8ef', // the "Your score" card on place pages (owner Nov 2026: cream, not pink)
  champagneSoft: '#f3ecde', // soft champagne: the fourth card colour for place pages' hotels and restaurants
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

/**
 * The app is one centred column at most this wide, on iPad and computers too (owner Nov 2026: iPad
 * testing). Screens size photos and grids from appWidth(), never the raw screen width.
 */
export const MAX_WIDTH = 600;
export const appWidth = () => Math.min(Dimensions.get('window').width, MAX_WIDTH);
