import { FlatList, Pressable, Text, View } from 'react-native';

import { ProductCard, type ProductCardSize } from './ProductCard';
import { spacing } from '@/theme';
import type { NormalizedProduct } from '@/types/product';

interface ProductRailProps {
  label: string;
  badge?: string;
  products: NormalizedProduct[];
  onProductPress: (product: NormalizedProduct) => void;
  onAddToBasket: (product: NormalizedProduct) => void;
  onSeeAll?: () => void;
  cardSize?: ProductCardSize;
}

export function ProductRail({
  label,
  badge,
  products,
  onProductPress,
  onAddToBasket,
  onSeeAll,
  cardSize = 'regular',
}: ProductRailProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <View className="mb-xl">
      <View className="flex-row items-center justify-between px-lg mb-md">
        <Text className="font-display text-[19px] leading-[24px] text-foreground tracking-tight">{label}</Text>
        {onSeeAll ? (
          <Pressable onPress={onSeeAll}>
            <Text className="font-sans-semibold text-[13px] leading-[18px] text-muted-foreground">See all</Text>
          </Pressable>
        ) : null}
      </View>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0, flexShrink: 0 }}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.md }}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={onProductPress}
            onAddToBasket={onAddToBasket}
            badge={badge}
            fixedWidth
            size={cardSize}
          />
        )}
      />
    </View>
  );
}
