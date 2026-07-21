/**
 * Design tokens adapted from the aagroup-web brand reference (../aagroup-web).
 * Monochrome-first, light background, near-black primary, purple accent
 * reserved for one primary CTA per screen (e.g. "Add to Basket", "Submit
 * Order") - never a default link/button color.
 *
 * Structured as `light`/`dark` variant objects so a future dark mode can be
 * added without restructuring call sites - but only `colors.light` is ever
 * read today. There is no dark-mode toggle in the app; `dark` exists purely
 * as an architecture placeholder and currently mirrors `light`'s shape.
 */

interface ColorPalette {
  background: string;
  surface: string;
  surfaceAlt: string;
  border: string;

  textPrimary: string;
  textSecondary: string;
  textMuted: string;

  accent: string;
  accentHover: string;
  accentForeground: string;

  white: string;
  black: string;

  success: string;
  error: string;

  // Cardboard/kraft-paper palette — used only by the persistent top search
  // header (TopSearchHeader), never elsewhere. Deliberately outside the
  // monochrome+purple system since it's a distinct "shipping box" motif.
  cardboard: string;
  cardboardStripe: string;
  cardboardText: string;
}

const light: ColorPalette = {
  background: '#FFFFFF',
  surface: '#F4F2F9', // washed-purple tint - card/alt-section bg
  surfaceAlt: '#F2F0F6', // washed-purple tint, slightly deeper - muted/section band bg
  border: '#E3E3E3',

  textPrimary: '#0C0C0C', // near-black
  textSecondary: '#606060', // ash-gray
  textMuted: '#959595', // stone

  accent: '#3B1893', // brand purple - sparing use only
  accentHover: '#2F1376',
  accentForeground: '#FFFFFF',

  white: '#FFFFFF',
  black: '#0C0C0C',

  cardboard: '#C19A6B', // kraft-paper brown
  cardboardStripe: '#8B6339', // darker brown pinstripe
  cardboardText: '#3E2A17', // deep brown, legible on cardboard

  success: '#22C55E',
  error: '#EF4444',
};

// Placeholder only - not read anywhere yet. No dark-mode UI ships this run;
// this keeps the same shape as `light` so a future dark palette is a
// same-shape fill-in, not a refactor.
const dark: ColorPalette = { ...light };

export const colors = {
  light,
  dark,
} as const;

export type ColorToken = keyof ColorPalette;
export type ColorScheme = keyof typeof colors;
