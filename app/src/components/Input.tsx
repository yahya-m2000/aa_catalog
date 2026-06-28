import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

interface InputProps extends TextInputProps {
  label: string;
  errorMessage?: string;
}

export function Input({ label, errorMessage, style, ...textInputProps }: InputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.textMuted}
        style={[styles.input, errorMessage && styles.inputError, style]}
        {...textInputProps}
      />
      {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  input: {
    ...typography.body,
    backgroundColor: colors.surface,
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
  errorMessage: {
    ...typography.caption,
    color: colors.error,
  },
});
