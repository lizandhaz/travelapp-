import { Text as RNText, type TextProps, type TextStyle } from 'react-native';

import { colors, fonts } from '@/constants/theme';

const variants = {
  hero: { fontFamily: fonts.display, fontSize: 40, lineHeight: 44, color: colors.ink, letterSpacing: -0.5 },
  title: { fontFamily: fonts.display, fontSize: 32, lineHeight: 38, color: colors.ink, letterSpacing: -0.4 },
  heading: { fontFamily: fonts.display, fontSize: 22, lineHeight: 28, color: colors.ink, letterSpacing: -0.2 },
  subheading: { fontFamily: fonts.display, fontSize: 18, lineHeight: 23, color: colors.ink },
  body: { fontFamily: fonts.sans, fontSize: 16, lineHeight: 23, color: colors.ink },
  bodySoft: { fontFamily: fonts.sans, fontSize: 16, lineHeight: 23, color: colors.muted },
  small: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 20, color: colors.muted },
  tiny: { fontFamily: fonts.sans, fontSize: 12, lineHeight: 16, color: colors.muted },
  label: { fontFamily: fonts.sansSemiBold, fontSize: 11, lineHeight: 14, letterSpacing: 1.8, textTransform: 'uppercase', color: colors.muted },
  kicker: { fontFamily: fonts.sansSemiBold, fontSize: 11, lineHeight: 14, letterSpacing: 1.8, textTransform: 'uppercase', color: colors.terracottaText },
  strong: { fontFamily: fonts.sansSemiBold, fontSize: 15, lineHeight: 20, color: colors.ink },
  quote: { fontFamily: fonts.displayRegular, fontSize: 19, lineHeight: 26, color: colors.ink },
  link: { fontFamily: fonts.sansSemiBold, fontSize: 14, lineHeight: 20, color: colors.terracottaText },
  score: { fontFamily: fonts.display, fontSize: 30, lineHeight: 34, color: colors.ink, fontVariant: ['tabular-nums'] },
} satisfies Record<string, TextStyle>;

export type TextVariant = keyof typeof variants;

/** All text in the app goes through this, so fonts and colours stay on-brand. */
export function Text({ variant = 'body', style, ...props }: TextProps & { variant?: TextVariant }) {
  return <RNText {...props} style={[variants[variant], style]} />;
}
