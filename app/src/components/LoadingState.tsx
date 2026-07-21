import { Text } from './Text';
import { Spinner } from '../../components/ui/spinner';
import { VStack } from '../../components/ui/vstack';
import { colors } from '@/theme';

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message }: LoadingStateProps) {
  return (
    <VStack className="flex-1 items-center justify-center p-xl" space="md">
      <Spinner size="large" color={colors.textPrimary} />
      {message ? (
        <Text variant="body" color={colors.textSecondary} style={{ textAlign: 'center' }}>
          {message}
        </Text>
      ) : null}
    </VStack>
  );
}
