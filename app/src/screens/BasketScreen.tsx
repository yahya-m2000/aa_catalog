import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { FlatList, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { BasketListItem } from '@/features/basket/components/BasketListItem';
import { BasketSummary } from '@/features/basket/components/BasketSummary';
import { useBasketStore } from '@/features/basket/store/basket.store';
import { t } from '@/i18n';
import { spacing } from '@/theme';
import { calculateBasketTotals } from '@/utils/pricing/pricing';

const TAB_BAR_HEIGHT = 64;
const FOOTER_HEIGHT = 88;

function basketItemKey(productId: string, skuId: string | undefined): string {
  return `${productId}::${skuId ?? ''}`;
}

export function BasketScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const items = useBasketStore((state) => state.items);
  const updateQuantity = useBasketStore((state) => state.updateQuantity);
  const removeItem = useBasketStore((state) => state.removeItem);

  const totals = useMemo(() => calculateBasketTotals(items), [items]);
  const tabBarHeight = TAB_BAR_HEIGHT + insets.bottom;

  if (items.length === 0) {
    return (
      <View className="flex-1 bg-background">
        <EmptyState title={t('basket.emptyTitle')} message={t('basket.emptyMessage')} />
        <Button
          label={t('basket.browseProducts')}
          variant="secondary"
          style={{ marginTop: spacing.lg, alignSelf: 'center', marginBottom: tabBarHeight }}
          onPress={() => router.push('/')}
        />
      </View>
    );
  }

  const footerHeight = FOOTER_HEIGHT + insets.bottom;

  return (
    <View className="flex-1 bg-background">
      <FlatList
        data={items}
        keyExtractor={(item) => basketItemKey(item.productId, item.selectedSku?.skuId)}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: footerHeight + tabBarHeight, gap: spacing.md }}
        renderItem={({ item }) => (
          <BasketListItem
            item={item}
            onChangeQuantity={(quantity) => updateQuantity(item.productId, item.selectedSku?.skuId, quantity)}
            onRemove={() => removeItem(item.productId, item.selectedSku?.skuId)}
          />
        )}
      />
      <View
        className="absolute left-0 right-0 gap-md px-lg pt-md bg-background border-t border-border"
        style={{ bottom: tabBarHeight, paddingBottom: spacing.md }}
      >
        <BasketSummary totals={totals} compact />
        <Button
          label={t('basket.checkout')}
          variant="secondary"
          textClassName="text-[17px] font-sans-bold"
          style={{ alignSelf: 'stretch', height: 52, justifyContent: 'center' }}
          onPress={() => router.push('/checkout')}
        />
      </View>
    </View>
  );
}
