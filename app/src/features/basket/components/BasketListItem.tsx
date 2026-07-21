import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, Share, Text, View } from 'react-native';

import { t } from '@/i18n';
import { colors } from '@/theme';
import type { BasketItem } from '@/types/basket';
import { splitCurrencyAmount } from '@/utils/format';

interface BasketListItemProps {
  item: BasketItem;
  onChangeQuantity: (quantity: number) => void;
  onRemove: () => void;
}

function formatUSD(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

export function BasketListItem({ item, onChangeQuantity, onRemove }: BasketListItemProps) {
  const options = item.selectedSku?.options ?? [];
  const lineTotal = item.unitPrice.finalAmount * item.quantity;
  const { whole: lineTotalWhole, cents: lineTotalCents } = splitCurrencyAmount(lineTotal);

  const handleDecrement = () => {
    if (item.quantity <= 1) {
      onRemove();
    } else {
      onChangeQuantity(item.quantity - 1);
    }
  };

  const handleShare = () => {
    Share.share({ message: `${item.productTitle} — ${formatUSD(item.unitPrice.finalAmount)}` }).catch(() => {
      // no-op — user cancelling the share sheet is not an error
    });
  };

  return (
    <View className="flex-row gap-md bg-background border border-border rounded-md p-md">
      <View style={{ width: 88, height: 88, borderRadius: 8, overflow: 'hidden', backgroundColor: colors.surfaceAlt }}>
        <Image
          source={{ uri: item.productImageUrl }}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
        />
      </View>
      <View className="flex-1 gap-xs">
        <Text className="font-sans-semibold text-[15px] leading-[20px] text-foreground" numberOfLines={2}>
          {item.productTitle}
        </Text>

        {options.length > 0 ? (
          <Text className="font-sans text-[13px] leading-[18px] text-muted-foreground">
            {options.map((option) => `${option.name}: ${option.value}`).join(' · ')}
          </Text>
        ) : null}

        <View className="flex-row items-baseline justify-between mt-xs">
          <Text className="font-sans text-[13px] leading-[18px] text-muted-foreground">
            {formatUSD(item.unitPrice.finalAmount)} × {item.quantity}
          </Text>
          <Text className="font-sans-bold text-[18px] leading-[24px] text-foreground">
            ${lineTotalWhole}
            <Text className="font-sans-bold text-[13px] leading-[18px] text-foreground">.{lineTotalCents}</Text>
          </Text>
        </View>

        <View className="flex-row items-center justify-between mt-xs">
          <View className="flex-row items-center gap-lg">
            <Pressable
              onPress={handleDecrement}
              hitSlop={8}
              accessibilityLabel={item.quantity <= 1 ? t('basket.remove') : undefined}
            >
              {item.quantity <= 1 ? (
                <Ionicons name="trash-outline" size={20} color={colors.textPrimary} />
              ) : (
                <Ionicons name="remove" size={20} color={colors.textPrimary} />
              )}
            </Pressable>
            <Text className="font-sans-semibold text-[15px] leading-[20px] text-foreground min-w-6 text-center">
              {item.quantity}
            </Text>
            <Pressable onPress={() => onChangeQuantity(item.quantity + 1)} hitSlop={8}>
              <Ionicons name="add" size={20} color={colors.textPrimary} />
            </Pressable>
          </View>
          <Pressable onPress={handleShare} hitSlop={8} accessibilityLabel={t('basket.share')}>
            <Ionicons name="share-outline" size={20} color={colors.textPrimary} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
