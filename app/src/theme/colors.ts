export const colors = {
  background: '#0A0A0A',
  surface: '#161616',
  surfaceAlt: '#1F1F1F',
  border: '#2A2A2A',

  textPrimary: '#FFFFFF',
  textSecondary: '#A3A3A3',
  textMuted: '#6B6B6B',

  purple: '#7C3AED',
  purpleLight: '#A78BFA',
  purpleDark: '#5B21B6',

  white: '#FFFFFF',
  black: '#000000',

  success: '#22C55E',
  error: '#EF4444',
} as const;

export type ColorToken = keyof typeof colors;
