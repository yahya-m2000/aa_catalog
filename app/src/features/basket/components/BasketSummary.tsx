import { Text, View } from 'react-native';

import { t } from '@/i18n';
import type { BasketTotals } from '@/types/basket';
import { splitCurrencyAmount } from '@/utils/format';

interface BasketSummaryProps {
  totals: BasketTotals;
  compact?: boolean;
}

function formatUSD(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

function SplitTotal({ amount }: { amount: number }) {
  const { whole, cents } = splitCurrencyAmount(amount);
  return (
    <Text className="font-sans-bold text-[18px] leading-[24px] text-foreground">
      ${whole}
      <Text className="font-sans-bold text-[13px] leading-[18px] text-foreground">.{cents}</Text>
    </Text>
  );
}

export function BasketSummary({ totals, compact }: BasketSummaryProps) {
  if (compact) {
    return (
      <View className="gap-0.5">
        <Text className="font-sans text-[13px] leading-[18px] text-muted-foreground">{t('basket.total')}</Text>
        <SplitTotal amount={totals.finalTotalUSD} />
      </View>
    );
  }

  return (
    <View className="gap-sm">
      <View className="flex-row justify-between">
        <Text className="font-sans text-[15px] leading-[20px] text-muted-foreground">{t('basket.subtotal')}</Text>
        <Text className="font-sans text-[15px] leading-[20px] text-foreground">
          {formatUSD(totals.subtotalUSD)}
        </Text>
      </View>
      <View className="flex-row justify-between">
        <Text className="font-sans text-[15px] leading-[20px] text-muted-foreground">
          {t('basket.serviceAndMarkup')}
        </Text>
        <Text className="font-sans text-[15px] leading-[20px] text-foreground">
          {formatUSD(totals.markupTotalUSD)}
        </Text>
      </View>
      <View className="flex-row justify-between mt-xs pt-sm border-t border-border">
        <Text className="font-sans-semibold text-[15px] leading-[20px] text-foreground">{t('basket.total')}</Text>
        <SplitTotal amount={totals.finalTotalUSD} />
      </View>
    </View>
  );
}
