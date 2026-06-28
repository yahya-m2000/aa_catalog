import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/theme';

interface SettingsRowProps {
  label: string;
  value?: string;
  onPress?: () => void;
}

export function SettingsRow({ label, value, onPress }: SettingsRowProps) {
  const Container = onPress ? Pressable : View;

  return (
    <Container style={styles.row} onPress={onPress}>
      <Text style={styles.label}>{label}</Text>
      {value ? <Text style={styles.value}>{value}</Text> : null}
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
  label: {
    ...typography.body,
    color: colors.textPrimary,
  },
  value: {
    ...typography.body,
    color: colors.textMuted,
  },
});
