import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { PriceTag } from '@/components/PriceTag';
import { spacing } from '@/theme';
import type { ProductPrice } from '@/types/product';

interface ProductStickyBarProps {
  price: ProductPrice;
  ctaLabel: string;
  disabled?: boolean;
  onPress: () => void;
}

export function ProductStickyBar({ price, ctaLabel, disabled, onPress }: ProductStickyBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="absolute left-0 right-0 bottom-0 flex-row items-center justify-between gap-md px-lg pt-md bg-background border-t border-border"
      style={{ paddingBottom: insets.bottom + spacing.md }}
    >
      <PriceTag price={price} />
      <Button
        label={ctaLabel}
        variant="secondary"
        disabled={disabled}
        onPress={onPress}
        style={{ flexShrink: 0 }}
      />
    </View>
  );
}
