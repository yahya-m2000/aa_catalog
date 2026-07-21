import { Pressable, Text, View } from 'react-native';

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
    <View className="gap-lg">
      {Array.from(groups.entries()).map(([optionName, values]) => (
        <View key={optionName} className="gap-sm">
          <Text className="font-sans-semibold text-[15px] leading-[20px] text-foreground">{optionName}</Text>
          <View className="flex-row flex-wrap gap-sm">
            {values.map((value) => {
              const isSelected = selectedOptions[optionName] === value;
              const isAvailable = isOptionValueAvailable(skus, selectedOptions, optionName, value);
              return (
                <Pressable
                  key={value}
                  disabled={!isAvailable}
                  className={`px-lg py-sm rounded-md border ${
                    isSelected ? 'bg-primary border-primary' : 'bg-background border-border'
                  } ${!isAvailable ? 'opacity-40' : ''}`}
                  onPress={() => onSelectOption(optionName, value)}
                >
                  <Text
                    className={`font-sans text-[15px] leading-[20px] ${
                      isSelected ? 'text-primary-foreground font-sans-semibold' : 'text-muted-foreground'
                    } ${!isAvailable ? 'line-through' : ''}`}
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
