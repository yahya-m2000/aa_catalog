import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/theme';

interface EmptyStateProps {
  title: string;
  message?: string;
}

export function EmptyState({ title, message }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  title: {
    ...typography.subheading,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});
