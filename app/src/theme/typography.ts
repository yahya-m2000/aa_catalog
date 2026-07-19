/**
 * Body copy uses Inter; display/heading copy uses Inter Tight - mirrors the
 * aagroup-web reference's `--font-sans` / `--font-display` split. Font
 * files are loaded via expo-font in the root layout (see app/_layout.tsx);
 * these family names must match the keys passed to `useFonts`.
 */
export const fontFamily = {
  sans: 'Inter_400Regular',
  sansMedium: 'Inter_500Medium',
  sansSemiBold: 'Inter_600SemiBold',
  sansBold: 'Inter_700Bold',
  display: 'InterTight_600SemiBold',
  displayBold: 'InterTight_700Bold',
} as const;

export const typography = {
  display: {
    fontFamily: fontFamily.displayBold,
    fontSize: 26,
    fontWeight: '700' as const,
    lineHeight: 32,
  },
  heading: {
    fontFamily: fontFamily.display,
    fontSize: 22,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  subheading: {
    fontFamily: fontFamily.display,
    fontSize: 17,
    fontWeight: '600' as const,
    lineHeight: 22,
  },
  body: {
    fontFamily: fontFamily.sans,
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  bodyStrong: {
    fontFamily: fontFamily.sansSemiBold,
    fontSize: 15,
    fontWeight: '600' as const,
    lineHeight: 20,
  },
  caption: {
    fontFamily: fontFamily.sans,
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 18,
  },
  captionStrong: {
    fontFamily: fontFamily.sansSemiBold,
    fontSize: 13,
    fontWeight: '600' as const,
    lineHeight: 18,
  },
  price: {
    fontFamily: fontFamily.displayBold,
    fontSize: 18,
    fontWeight: '700' as const,
    lineHeight: 24,
  },
} as const;

export type TypographyToken = keyof typeof typography;
