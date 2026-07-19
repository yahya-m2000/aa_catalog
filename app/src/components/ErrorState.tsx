import { StyleSheet, View } from 'react-native';

import { Button } from './Button';
import { Text } from './Text';
import { t } from '@/i18n';
import { colors, spacing } from '@/theme';

interface ErrorStateProps {
  title: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorState({ title, message, onRetry, retryLabel = t('common.tryAgain') }: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <Text variant="subheading" style={styles.title}>
        {title}
      </Text>
      {message ? (
        <Text variant="body" color={colors.textSecondary} style={styles.message}>
          {message}
        </Text>
      ) : null}
      {onRetry ? <Button label={retryLabel} onPress={onRetry} style={styles.button} /> : null}
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
    textAlign: 'center',
  },
  message: {
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  button: {
    marginTop: spacing.lg,
  },
});
