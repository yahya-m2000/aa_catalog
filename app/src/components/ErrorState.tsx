import { Ionicons } from '@expo/vector-icons';

import { Button } from './Button';
import { Text } from './Text';
import { VStack } from '../../components/ui/vstack';
import { t } from '@/i18n';
import { colors } from '@/theme';

interface ErrorStateProps {
  title: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorState({ title, message, onRetry, retryLabel = t('common.tryAgain') }: ErrorStateProps) {
  return (
    <VStack className="flex-1 items-center justify-center p-xl" space="sm">
      <Ionicons name="alert-circle-outline" size={40} color={colors.error} style={{ marginBottom: 4 }} />
      <Text variant="subheading" style={{ textAlign: 'center' }}>
        {title}
      </Text>
      {message ? (
        <Text variant="body" color={colors.textSecondary} style={{ textAlign: 'center' }}>
          {message}
        </Text>
      ) : null}
      {onRetry ? <Button label={retryLabel} onPress={onRetry} style={{ marginTop: 16 }} /> : null}
    </VStack>
  );
}
