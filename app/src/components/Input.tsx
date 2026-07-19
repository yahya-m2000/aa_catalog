import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { Text } from './Text';
import { colors, radius, spacing, typography } from '@/theme';

interface InputProps extends TextInputProps {
  label: string;
  errorMessage?: string;
}

export function Input({ label, errorMessage, style, ...textInputProps }: InputProps) {
  return (
    <View style={styles.container}>
      <Text variant="caption" color={colors.textSecondary}>
        {label}
      </Text>
      <TextInput
        placeholderTextColor={colors.textMuted}
        style={[styles.input, errorMessage && styles.inputError, style]}
        {...textInputProps}
      />
      {errorMessage ? (
        <Text variant="caption" color={colors.error}>
          {errorMessage}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  input: {
    ...typography.body,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    color: colors.textPrimary,
  },
  inputError: {
    borderColor: colors.error,
  },
});
