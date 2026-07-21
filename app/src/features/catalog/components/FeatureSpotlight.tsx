import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';

import { PriceTag } from '@/components/PriceTag';
import { colors } from '@/theme';
import type { NormalizedProduct } from '@/types/product';

interface FeatureSpotlightProps {
  label: string;
  product: NormalizedProduct;
  onPress: (product: NormalizedProduct) => void;
}

export function FeatureSpotlight({ label, product, onPress }: FeatureSpotlightProps) {
  const primaryImage = product.images.find((image) => image.isPrimary) ?? product.images[0];

  return (
    <View className="mb-xl px-lg">
      <Text className="font-display text-[19px] leading-[24px] text-foreground tracking-tight mb-md">{label}</Text>
      <Pressable
        className="bg-background border border-border rounded-md overflow-hidden"
        onPress={() => onPress(product)}
      >
        <Image
          source={primaryImage ? { uri: primaryImage.url } : undefined}
          style={{ width: '100%', aspectRatio: 16 / 9, backgroundColor: colors.surfaceAlt }}
          contentFit="cover"
          transition={150}
        />
        <View className="p-lg gap-xs">
          <Text className="font-sans text-[13px] leading-[18px] text-muted-foreground" numberOfLines={2}>
            {product.title}
          </Text>
          <View className="mt-xs">
            <PriceTag price={product.price} />
          </View>
        </View>
      </Pressable>
    </View>
  );
}
