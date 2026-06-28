import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';
import type { ProductSku } from '@/types/product';

interface VariantSelectorProps {
  skus: ProductSku[];
  selectedOptions: Record<string, string>;
  onSelectOption: (optionName: string, value: string) => void;
}

function getOptionGroups(skus: ProductSku[]): Map<string, string[]> {
  const groups = new Map<string, string[]>();
  for (const sku of skus) {
    for (const option of sku.options) {
      const values = groups.get(option.name) ?? [];
      if (!values.includes(option.value)) values.push(option.value);
      groups.set(option.name, values);
    }
  }
  return groups;
}

function isOptionValueAvailable(
  skus: ProductSku[],
  selectedOptions: Record<string, string>,
  optionName: string,
  optionValue: string,
): boolean {
  const candidateOptions = { ...selectedOptions, [optionName]: optionValue };
  return skus.some(
    (sku) =>
      sku.inventory > 0 &&
      Object.entries(candidateOptions).every((entry) =>
        sku.options.some((option) => option.name === entry[0] && option.value === entry[1]),
      ),
  );
}

export function VariantSelector({ skus, selectedOptions, onSelectOption }: VariantSelectorProps) {
  const groups = getOptionGroups(skus);

  if (groups.size === 0) return null;

  return (
    <View style={styles.container}>
      {Array.from(groups.entries()).map(([optionName, values]) => (
        <View key={optionName} style={styles.group}>
          <Text style={styles.groupLabel}>{optionName}</Text>
          <View style={styles.optionsRow}>
            {values.map((value) => {
              const isSelected = selectedOptions[optionName] === value;
              const isAvailable = isOptionValueAvailable(skus, selectedOptions, optionName, value);
              return (
                <Pressable
                  key={value}
                  disabled={!isAvailable}
                  style={[
                    styles.option,
                    isSelected && styles.optionSelected,
                    !isAvailable && styles.optionDisabled,
                  ]}
                  onPress={() => onSelectOption(optionName, value)}
                >
                  <Text
                    style={[
                      styles.optionLabel,
                      isSelected && styles.optionLabelSelected,
                      !isAvailable && styles.optionLabelDisabled,
                    ]}
                  >
                    {value}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  group: {
    gap: spacing.sm,
  },
  groupLabel: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  option: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  optionSelected: {
    borderColor: colors.purple,
    backgroundColor: colors.purple,
  },
  optionDisabled: {
    opacity: 0.4,
  },
  optionLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  optionLabelSelected: {
    color: colors.white,
    fontWeight: '600',
  },
  optionLabelDisabled: {
    textDecorationLine: 'line-through',
  },
});
