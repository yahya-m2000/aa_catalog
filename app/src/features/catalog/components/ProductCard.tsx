import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';

import { PriceTag } from '@/components/PriceTag';
import { colors } from '@/theme';
import type { NormalizedProduct } from '@/types/product';

export type ProductCardSize = 'compact' | 'regular' | 'large';

const RAIL_CARD_WIDTH: Record<ProductCardSize, number> = {
  compact: 140,
  regular: 200,
  large: 260,
};

interface ProductCardProps {
  product: NormalizedProduct;
  onPress: (product: NormalizedProduct) => void;
  onAddToBasket: (product: NormalizedProduct) => void;
  badge?: string;
  fixedWidth?: boolean;
  size?: ProductCardSize;
}

export function ProductCard({
  product,
  onPress,
  onAddToBasket,
  badge,
  fixedWidth,
  size = 'regular',
}: ProductCardProps) {
  const primaryImage = product.images.find((image) => image.isPrimary) ?? product.images[0];

  return (
    <Pressable
      className="bg-background border border-border rounded-md overflow-hidden"
      style={[!fixedWidth && { flex: 1 }, fixedWidth && { width: RAIL_CARD_WIDTH[size] }]}
      onPress={() => onPress(product)}
    >
      <View>
        <Image
          source={primaryImage ? { uri: primaryImage.url } : undefined}
          style={{ width: '100%', aspectRatio: 1, backgroundColor: colors.surfaceAlt }}
          contentFit="cover"
          transition={150}
        />
        {badge ? (
          <View className="absolute top-sm left-sm px-sm py-0.5 rounded-full bg-brand-accent">
            <Text className="font-sans-semibold text-[11px] leading-[14px] text-brand-accent-foreground">
              {badge}
            </Text>
          </View>
        ) : null}
      </View>
      <View className="px-md pt-sm pb-md gap-xs">
        <Text className="font-sans text-[12.5px] leading-[16px] text-muted-foreground" numberOfLines={2}>
          {product.title}
        </Text>
        <View className="flex-row items-center justify-between mt-xs">
          <PriceTag price={product.price} compact />
          {fixedWidth ? null : (
            <Pressable
              className="w-7 h-7 rounded-full bg-primary items-center justify-center"
              hitSlop={8}
              onPress={(event) => {
                event.stopPropagation();
                onAddToBasket(product);
              }}
            >
              <Ionicons name="add" size={18} color={colors.white} />
            </Pressable>
          )}
        </View>
      </View>
    </Pressable>
  );
}
