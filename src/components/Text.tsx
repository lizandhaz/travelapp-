import { Text as RNText, type TextProps, type TextStyle } from 'react-native';

import { colors, fonts } from '@/constants/theme';

const variants = {
  hero: { fontFamily: fonts.display, fontSize: 44, lineHeight: 48, color: colors.ink, letterSpacing: -0.5 },
  title: { fontFamily: fonts.display, fontSize: 30, lineHeight: 36, color: colors.ink, letterSpacing: -0.3 },
  heading: { fontFamily: fonts.display, fontSize: 20, lineHeight: 26, color: colors.ink },
  body: { fontFamily: fonts.sans, fontSize: 16, lineHeight: 23, color: colors.ink },
  bodySoft: { fontFamily: fonts.sans, fontSize: 16, lineHeight: 23, color: colors.inkSoft },
  small: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 20, color: colors.inkSoft },
  tiny: { fontFamily: fonts.sans, fontSize: 12, lineHeight: 16, color: colors.inkSoft },
  label: { fontFamily: fonts.sansMedium, fontSize: 14, lineHeight: 20, color: colors.ink },
  strong: { fontFamily: fonts.sansSemiBold, fontSize: 15, lineHeight: 20, color: colors.ink },
  kicker: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.postbox,
  },
  quote: { fontFamily: fonts.displayItalic, fontSize: 17, lineHeight: 24, color: colors.ink },
  review: { fontFamily: fonts.displayRegular, fontSize: 18, lineHeight: 28, color: colors.ink },
  link: { fontFamily: fonts.sansSemiBold, fontSize: 15, lineHeight: 20, color: colors.airmail },
} satisfies Record<string, TextStyle>;

export type TextVariant = keyof typeof variants;

/** All text in the app goes through this, so fonts and colours stay on-brand. */
export function Text({ variant = 'body', style, ...props }: TextProps & { variant?: TextVariant }) {
  return <RNText {...props} style={[variants[variant], style]} />;
}
