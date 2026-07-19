import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { t } from '@/i18n';
import type { ProductSortOption } from '@/services/api/products.api';
import { colors, radius, spacing, typography } from '@/theme';

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
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {SORT_OPTIONS.map((option) => {
        const isActive = option.value === selected;
        return (
          <Pressable
            key={option.value}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => onSelect(option.value)}
          >
            <Text style={[styles.label, isActive && styles.labelActive]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 0,
    flexShrink: 0,
  },
  content: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    alignItems: 'center',
  },
  tab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabActive: {
    backgroundColor: colors.textPrimary,
    borderColor: colors.textPrimary,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  labelActive: {
    color: colors.white,
    fontWeight: '600',
  },
});
