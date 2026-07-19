export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

// 8px is the standard card/input radius per the aagroup-web reference
// (`--radius: 0.5rem`). Buttons always use `full` (fully rounded pill).
export const radius = {
  sm: 8,
  md: 8,
  lg: 8,
  full: 999,
} as const;

export type SpacingToken = keyof typeof spacing;
export type RadiusToken = keyof typeof radius;
