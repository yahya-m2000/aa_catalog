import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/Text';
import { colors } from '@/theme';

interface SettingsRowProps {
  label: string;
  value?: string;
  onPress?: () => void;
  isLast?: boolean;
}

export function SettingsRow({ label, value, onPress, isLast }: SettingsRowProps) {
  const Container = onPress ? Pressable : View;

  return (
    <Container
      className={`flex-row items-center justify-between py-lg ${isLast ? '' : 'border-b border-border'}`}
      onPress={onPress}
    >
      <Text variant="body" color={colors.textPrimary}>
        {label}
      </Text>
      <View className="flex-row items-center gap-sm">
        {value ? (
          <Text variant="body" color={colors.textMuted}>
            {value}
          </Text>
        ) : null}
        {onPress ? <Ionicons name="chevron-forward" size={18} color={colors.textMuted} /> : null}
      </View>
    </Container>
  );
}
