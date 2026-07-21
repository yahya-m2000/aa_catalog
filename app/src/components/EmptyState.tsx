import { Ionicons } from '@expo/vector-icons';

import { Text } from './Text';
import { VStack } from '../../components/ui/vstack';
import { colors } from '@/theme';

interface EmptyStateProps {
  title: string;
  message?: string;
}

export function EmptyState({ title, message }: EmptyStateProps) {
  return (
    <VStack className="flex-1 items-center justify-center p-xl" space="sm">
      <Ionicons name="file-tray-outline" size={40} color={colors.textMuted} style={{ marginBottom: 4 }} />
      <Text variant="subheading" style={{ textAlign: 'center' }}>
        {title}
      </Text>
      {message ? (
        <Text variant="body" color={colors.textSecondary} style={{ textAlign: 'center' }}>
          {message}
        </Text>
      ) : null}
    </VStack>
  );
}
