import { Text as RNText, StyleSheet, type TextProps as RNTextProps } from 'react-native';

import { colors, typography, type TypographyToken } from '@/theme';

interface TextProps extends RNTextProps {
  variant?: TypographyToken;
  color?: string;
}

/**
 * Typography-aware Text primitive (plan §9's "Supporting components"). Wraps
 * RN's Text with a theme variant so screens don't hand-roll `...typography.x`
 * spreads inline. Defaults to `body` on the primary text color.
 */
export function Text({ variant = 'body', color = colors.textPrimary, style, ...rest }: TextProps) {
  return <RNText style={[styles.base, typography[variant], { color }, style]} {...rest} />;
}

const styles = StyleSheet.create({
  base: {
    // typography[variant] supplies fontFamily/fontSize/fontWeight/lineHeight
  },
});
