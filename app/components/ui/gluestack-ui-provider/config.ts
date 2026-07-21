import { vars } from 'nativewind';

// Ported 1:1 from src/theme/colors.ts (hex -> RGB triple for NativeWind's
// `rgb(var(--x) / <alpha-value>)` convention). This app is light-only today;
// `dark` mirrors `light` as an architecture placeholder, matching
// src/theme/colors.ts's own `dark = { ...light }` convention.
//
// `--primary` maps to this app's near-black textPrimary (the default action
// color), NOT the brand purple - `--brand-accent` carries the purple,
// reserved for one primary CTA per screen per the existing design rule.
export const colors = {
  light: {
    '--background': '255 255 255',
    '--card': '244 242 249',
    '--card-foreground': '12 12 12',
    '--muted': '242 240 246',
    '--muted-foreground': '149 149 149',
    '--popover': '255 255 255',
    '--popover-foreground': '12 12 12',
    '--border': '227 227 227',
    '--input': '227 227 227',
    '--ring': '227 227 227',
    '--foreground': '12 12 12',
    '--primary': '12 12 12',
    '--primary-foreground': '255 255 255',
    '--secondary': '96 96 96',
    '--secondary-foreground': '255 255 255',
    '--destructive': '239 68 68',
    '--destructive-foreground': '255 255 255',
    '--success': '34 197 94',
    '--success-foreground': '255 255 255',
    '--accent': '242 240 246',
    '--accent-foreground': '12 12 12',
    '--brand-accent': '59 24 147',
    '--brand-accent-hover': '47 19 118',
    '--brand-accent-foreground': '255 255 255',
  },
  dark: {
    '--background': '255 255 255',
    '--card': '244 242 249',
    '--card-foreground': '12 12 12',
    '--muted': '242 240 246',
    '--muted-foreground': '149 149 149',
    '--popover': '255 255 255',
    '--popover-foreground': '12 12 12',
    '--border': '227 227 227',
    '--input': '227 227 227',
    '--ring': '227 227 227',
    '--foreground': '12 12 12',
    '--primary': '12 12 12',
    '--primary-foreground': '255 255 255',
    '--secondary': '96 96 96',
    '--secondary-foreground': '255 255 255',
    '--destructive': '239 68 68',
    '--destructive-foreground': '255 255 255',
    '--success': '34 197 94',
    '--success-foreground': '255 255 255',
    '--accent': '242 240 246',
    '--accent-foreground': '12 12 12',
    '--brand-accent': '59 24 147',
    '--brand-accent-hover': '47 19 118',
    '--brand-accent-foreground': '255 255 255',
  },
};

// Config for nativewind vars() - used by provider
export const config = {
  light: vars(colors.light),
  dark: vars(colors.dark),
};
