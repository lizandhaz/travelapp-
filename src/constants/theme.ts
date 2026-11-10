/**
 * Postcard brand tokens. Use these, never raw hex values, in components.
 * (Photo-placeholder gradients in sample data are the one exception.)
 */
export const colors = {
  paper: '#f6efe3', // page background: postcard card stock
  card: '#fffbf4', // cards, inputs, stamp backgrounds
  sand: '#e8d9bf', // borders, dividers, quiet fills
  ink: '#1f2a44', // main text
  inkSoft: '#5b6478', // secondary text
  postbox: '#b5392a', // primary actions, unread dots, kickers, scores under 6
  airmail: '#2f5d8a', // links, postmarks, scores 6–7.9
  sea: '#3e7c7a', // scores 8+, success
  sun: '#e2a43b', // food-pick tags, highlights (fills only, never text)
} as const;

/** Font family names, loaded in src/app/_layout.tsx. */
export const fonts = {
  display: 'Fraunces-SemiBold', // headings
  displayBold: 'Fraunces-Bold', // scores
  displayRegular: 'Fraunces-Regular', // reviews
  displayItalic: 'Fraunces-Italic', // tips, quotes, asides
  sans: 'DMSans-Regular', // body
  sansMedium: 'DMSans-Medium', // labels
  sansSemiBold: 'DMSans-SemiBold', // buttons, names
  sansBold: 'DMSans-Bold',
} as const;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
export const radius = { sm: 4, md: 8, pill: 999 } as const;

/** Side padding for every screen. */
export const GUTTER = 16;
