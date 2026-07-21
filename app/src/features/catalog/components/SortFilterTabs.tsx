import { Pressable, ScrollView, Text } from 'react-native';

import { t } from '@/i18n';
import type { ProductSortOption } from '@/services/api/products.api';

interface SortOptionConfig {
  value: ProductSortOption;
  label: string;
}

interface SortFilterTabsProps {
  selected: ProductSortOption;
  onSelect: (sort: ProductSortOption) => void;
}

export function SortFilterTabs({ selected, onSelect }: SortFilterTabsProps) {
  const SORT_OPTIONS: SortOptionConfig[] = [
    { value: 'relevance', label: t('home.sortRelevance') },
    { value: 'price_asc', label: t('home.sortPriceAsc') },
    { value: 'price_desc', label: t('home.sortPriceDesc') },
    { value: 'newest', label: t('home.sortNewest') },
    { value: 'popular', label: t('home.sortPopular') },
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="flex-grow-0 flex-shrink-0"
      contentContainerClassName="px-lg gap-sm items-center"
    >
      {SORT_OPTIONS.map((option) => {
        const isActive = option.value === selected;
        return (
          <Pressable
            key={option.value}
            className={`px-md py-sm rounded-full border ${
              isActive ? 'bg-primary border-primary' : 'bg-background border-border'
            }`}
            onPress={() => onSelect(option.value)}
          >
            <Text
              className={`font-sans text-[13px] leading-[18px] ${
                isActive ? 'text-primary-foreground font-sans-semibold' : 'text-muted-foreground'
              }`}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
