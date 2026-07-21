import { Image } from 'expo-image';
import { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import { colors } from '@/theme';
import type { ProductImage } from '@/types/product';

interface ProductImageGalleryProps {
  images: ProductImage[];
  activeIndex?: number;
  onIndexChange?: (index: number) => void;
}

export function ProductImageGallery({ images, activeIndex, onIndexChange }: ProductImageGalleryProps) {
  const { width } = useWindowDimensions();
  const [internalIndex, setInternalIndex] = useState(0);
  const listRef = useRef<FlatList<ProductImage>>(null);

  const isControlled = activeIndex !== undefined;
  const currentIndex = isControlled ? activeIndex : internalIndex;

  useEffect(() => {
    if (isControlled && images.length > 0) {
      listRef.current?.scrollToIndex({ index: activeIndex, animated: true });
    }
  }, [activeIndex, isControlled, images.length]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    if (!isControlled) setInternalIndex(index);
    onIndexChange?.(index);
  };

  if (images.length === 0) {
    return <View style={{ width, height: width, backgroundColor: colors.surfaceAlt }} />;
  }

  return (
    <View>
      <FlatList
        ref={listRef}
        data={images}
        keyExtractor={(image, index) => `${image.url}-${index}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
        renderItem={({ item }) => (
          <Image
            source={{ uri: item.url }}
            style={{ width, height: width, backgroundColor: colors.surfaceAlt }}
            contentFit="cover"
            transition={150}
          />
        )}
      />
      {images.length > 1 ? (
        <View className="absolute bottom-md left-0 right-0 flex-row justify-center gap-xs">
          {images.map((image, index) => (
            <View
              key={`${image.url}-${index}`}
              className={`w-1.5 h-1.5 rounded-full ${index === currentIndex ? 'bg-brand-accent' : 'bg-border'}`}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}
