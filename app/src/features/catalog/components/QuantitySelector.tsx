import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

interface QuantitySelectorProps {
  quantity: number;
  maxQuantity?: number;
  onChange: (quantity: number) => void;
}

export function QuantitySelector({ quantity, maxQuantity, onChange }: QuantitySelectorProps) {
  const canIncrement = maxQuantity === undefined || quantity < maxQuantity;
  const canDecrement = quantity > 1;

  return (
    <View style={styles.container}>
      <Pressable
        disabled={!canDecrement}
        style={[styles.button, !canDecrement && styles.buttonDisabled]}
        onPress={() => onChange(quantity - 1)}
      >
        <Text style={styles.buttonLabel}>−</Text>
      </Pressable>
      <Text style={styles.quantity}>{quantity}</Text>
      <Pressable
        disabled={!canIncrement}
        style={[styles.button, !canIncrement && styles.buttonDisabled]}
        onPress={() => onChange(quantity + 1)}
      >
        <Text style={styles.buttonLabel}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonLabel: {
    ...typography.subheading,
    color: colors.textPrimary,
  },
  quantity: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
    minWidth: 24,
    textAlign: 'center',
  },
});
