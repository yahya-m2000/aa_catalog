import { StyleSheet, View, type ViewProps } from 'react-native';

import { colors, radius, spacing } from '@/theme';

interface CardProps extends ViewProps {
  padded?: boolean;
}

/** 8px-radius surface primitive for grouped content (cards, summaries, list rows). */
export function Card({ padded = true, style, ...rest }: CardProps) {
  return <View style={[styles.base, padded && styles.padded, style]} {...rest} />;
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  padded: {
    padding: spacing.lg,
  },
});
