import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';

import { PriceTag } from '@/components/PriceTag';
import { colors, spacing } from '@/theme';
import type { NormalizedProduct } from '@/types/product';

const TILE_COUNT = 4;
const COLUMNS = 2;

interface ProductGridSectionProps {
  label: string;
  products: NormalizedProduct[];
  onProductPress: (product: NormalizedProduct) => void;
  onSeeAll?: () => void;
}

function chunk<T>(items: T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    rows.push(items.slice(i, i + size));
  }
  return rows;
}

export function ProductGridSection({ label, products, onProductPress, onSeeAll }: ProductGridSectionProps) {
  const tiles = products.slice(0, TILE_COUNT);

  if (tiles.length === 0) {
    return null;
  }

  const rows = chunk(tiles, COLUMNS);

  return (
    <View className="mb-xl px-lg">
      <View className="flex-row items-center justify-between mb-md">
        <Text className="font-display text-[19px] leading-[24px] text-foreground tracking-tight">{label}</Text>
        {onSeeAll ? (
          <Pressable onPress={onSeeAll}>
            <Text className="font-sans-semibold text-[13px] leading-[18px] text-muted-foreground">See all</Text>
          </Pressable>
        ) : null}
      </View>
      <View className="gap-md">
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} className="flex-row gap-md">
            {row.map((product) => {
              const primaryImage = product.images.find((image) => image.isPrimary) ?? product.images[0];
              return (
                <Pressable
                  key={product.id}
                  className="flex-1 bg-background border border-border rounded-md overflow-hidden"
                  onPress={() => onProductPress(product)}
                >
                  <Image
                    source={primaryImage ? { uri: primaryImage.url } : undefined}
                    style={{ width: '100%', aspectRatio: 1, backgroundColor: colors.surfaceAlt }}
                    contentFit="cover"
                    transition={150}
                  />
                  <View className="px-sm pt-xs pb-sm gap-xs">
                    <Text className="font-sans text-[12.5px] leading-[16px] text-muted-foreground" numberOfLines={2}>
                      {product.title}
                    </Text>
                    <PriceTag price={product.price} compact />
                  </View>
                </Pressable>
              );
            })}
            {row.length < COLUMNS ? <View style={{ flex: 1, marginLeft: spacing.md }} /> : null}
          </View>
        ))}
      </View>
    </View>
  );
}
