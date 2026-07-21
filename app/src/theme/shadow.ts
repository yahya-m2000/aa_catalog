import { colors } from './colors';

/**
 * No shadow/elevation token existed anywhere in the app - cards were
 * border-only and shared the page's flat visual weight. One subtle shadow
 * is enough to separate cards from the background (Home overhaul, 2026-07-20).
 */
export const shadow = {
  card: {
    shadowColor: colors.light.textPrimary,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { height: 2, width: 0 },
    elevation: 2,
  },
} as const;
