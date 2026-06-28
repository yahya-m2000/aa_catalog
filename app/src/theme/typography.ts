export const typography = {
  heading: {
    fontSize: 22,
    fontWeight: '700' as const,
    lineHeight: 28,
  },
  subheading: {
    fontSize: 17,
    fontWeight: '600' as const,
    lineHeight: 22,
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  bodyStrong: {
    fontSize: 15,
    fontWeight: '600' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 18,
  },
  price: {
    fontSize: 18,
    fontWeight: '700' as const,
    lineHeight: 24,
  },
} as const;

export type TypographyToken = keyof typeof typography;
