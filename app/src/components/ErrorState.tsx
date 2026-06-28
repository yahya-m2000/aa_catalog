import { Pressable, StyleSheet, Text, View } from 'react-native';

import { t } from '@/i18n';
import { colors, radius, spacing, typography } from '@/theme';

interface ErrorStateProps {
  title: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorState({ title, message, onRetry, retryLabel = t('common.tryAgain') }: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {onRetry ? (
        <Pressable style={styles.button} onPress={onRetry}>
          <Text style={styles.buttonLabel}>{retryLabel}</Text>
        </Pressable>
      ) : null}
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
  button: {
    marginTop: spacing.lg,
    backgroundColor: colors.purple,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  buttonLabel: {
    ...typography.bodyStrong,
    color: colors.white,
  },
});
