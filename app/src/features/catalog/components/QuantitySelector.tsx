import { Pressable, Text, View } from 'react-native';

interface QuantitySelectorProps {
  quantity: number;
  maxQuantity?: number;
  onChange: (quantity: number) => void;
}

export function QuantitySelector({ quantity, maxQuantity, onChange }: QuantitySelectorProps) {
  const canIncrement = maxQuantity === undefined || quantity < maxQuantity;
  const canDecrement = quantity > 1;

  return (
    <View className="flex-row items-center gap-lg">
      <Pressable
        disabled={!canDecrement}
        className={`w-9 h-9 rounded-md bg-background border border-border items-center justify-center ${
          !canDecrement ? 'opacity-40' : ''
        }`}
        onPress={() => onChange(quantity - 1)}
      >
        <Text className="font-sans-medium text-[17px] leading-[22px] text-foreground">−</Text>
      </Pressable>
      <Text className="font-sans-semibold text-[15px] leading-[20px] text-foreground min-w-6 text-center">
        {quantity}
      </Text>
      <Pressable
        disabled={!canIncrement}
        className={`w-9 h-9 rounded-md bg-background border border-border items-center justify-center ${
          !canIncrement ? 'opacity-40' : ''
        }`}
        onPress={() => onChange(quantity + 1)}
      >
        <Text className="font-sans-medium text-[17px] leading-[22px] text-foreground">+</Text>
      </Pressable>
    </View>
  );
}
