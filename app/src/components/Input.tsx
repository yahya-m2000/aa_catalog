import type { TextInputProps } from 'react-native';
import { View } from 'react-native';

import { Text } from './Text';
import { Input as GSInput, InputField } from '../../components/ui/input';
import { colors } from '@/theme';

interface InputProps extends TextInputProps {
  label: string;
  errorMessage?: string;
}

export function Input({ label, errorMessage, style, ...textInputProps }: InputProps) {
  return (
    <View className="gap-xs">
      <Text variant="caption" color={colors.textSecondary}>
        {label}
      </Text>
      <GSInput
        className={`bg-background border rounded-md h-auto px-lg py-md ${
          errorMessage ? 'border-destructive' : 'border-border'
        }`}
      >
        <InputField
          placeholderTextColor={colors.textMuted}
          className="text-foreground text-base font-sans py-0"
          style={style}
          {...textInputProps}
        />
      </GSInput>
      {errorMessage ? (
        <Text variant="caption" color={colors.error}>
          {errorMessage}
        </Text>
      ) : null}
    </View>
  );
}
