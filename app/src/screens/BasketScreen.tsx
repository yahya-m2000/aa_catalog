import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { BasketListItem } from '@/features/basket/components/BasketListItem';
import { BasketSummary } from '@/features/basket/components/BasketSummary';
import { useBasketStore } from '@/features/basket/store/basket.store';
import { t } from '@/i18n';
import { colors, spacing } from '@/theme';
import { calculateBasketTotals } from '@/utils/pricing/pricing';

function basketItemKey(productId: string, skuId: string | undefined): string {
  return `${productId}::${skuId ?? ''}`;
}

export function BasketScreen() {
  const router = useRouter();
  const items = useBasketStore((state) => state.items);
  const updateQuantity = useBasketStore((state) => state.updateQuantity);
  const removeItem = useBasketStore((state) => state.removeItem);

  const totals = useMemo(() => calculateBasketTotals(items), [items]);

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState title={t('basket.emptyTitle')} message={t('basket.emptyMessage')} />
        <Button
          label={t('basket.browseProducts')}
          variant="secondary"
          style={styles.browseButton}
          onPress={() => router.push('/')}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => basketItemKey(item.productId, item.selectedSku?.skuId)}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => (
          <BasketListItem
            item={item}
            onChangeQuantity={(quantity) => updateQuantity(item.productId, item.selectedSku?.skuId, quantity)}
            onRemove={() => removeItem(item.productId, item.selectedSku?.skuId)}
          />
        )}
      />
      <View style={styles.footer}>
        <BasketSummary totals={totals} />
        <Button label={t('basket.checkout')} variant="secondary" onPress={() => router.push('/checkout')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: spacing.lg,
  },
  separator: {
    height: spacing.md,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    gap: spacing.lg,
  },
  browseButton: {
    marginTop: spacing.lg,
    alignSelf: 'center',
  },
});
