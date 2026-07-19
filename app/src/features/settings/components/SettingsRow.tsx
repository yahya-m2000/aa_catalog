import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/Text';
import { colors, spacing } from '@/theme';

interface SettingsRowProps {
  label: string;
  value?: string;
  onPress?: () => void;
}

export function SettingsRow({ label, value, onPress }: SettingsRowProps) {
  const Container = onPress ? Pressable : View;

  return (
    <Container style={styles.row} onPress={onPress}>
      <Text variant="body" color={onPress ? colors.accent : colors.textPrimary}>
        {label}
      </Text>
      {value ? (
        <Text variant="body" color={colors.textMuted}>
          {value}
        </Text>
      ) : null}
    </Container>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
});
