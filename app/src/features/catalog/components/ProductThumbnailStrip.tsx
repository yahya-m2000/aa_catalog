import { Image } from 'expo-image';
import { Pressable, ScrollView } from 'react-native';

import type { ProductImage } from '@/types/product';

interface ProductThumbnailStripProps {
  images: ProductImage[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

const THUMBNAIL_SIZE = 56;

export function ProductThumbnailStrip({ images, activeIndex, onSelect }: ProductThumbnailStripProps) {
  if (images.length <= 1) {
    return null;
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="flex-grow-0 flex-shrink-0 mt-md"
      contentContainerClassName="px-lg gap-sm"
    >
      {images.map((image, index) => (
        <Pressable
          key={`${image.url}-${index}`}
          onPress={() => onSelect(index)}
          className={`rounded-md overflow-hidden border ${
            index === activeIndex ? 'border-2 border-primary' : 'border border-border'
          }`}
          style={{ width: THUMBNAIL_SIZE, height: THUMBNAIL_SIZE }}
        >
          <Image source={{ uri: image.url }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
        </Pressable>
      ))}
    </ScrollView>
  );
}
