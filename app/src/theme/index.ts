import { colors as palettes } from './colors';

/**
 * The app only ever reads the light palette today - there is no dark-mode
 * toggle. `palettes.light` / `palettes.dark` remain available (see
 * `./colors`) for when that becomes a real, owner-approved feature; this
 * flat `colors` export is the one every screen/component should import.
 */
export const colors = palettes.light;
export { colors as palettes } from './colors';

export { spacing, radius } from './spacing';
export { typography, fontFamily } from './typography';
export { shadow } from './shadow';

export type { ColorToken, ColorScheme } from './colors';
export type { SpacingToken, RadiusToken } from './spacing';
export type { TypographyToken } from './typography';
