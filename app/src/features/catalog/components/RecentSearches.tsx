import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { t } from '@/i18n';
import { colors } from '@/theme';

interface RecentSearchesProps {
  searches: string[];
  onSelect: (query: string) => void;
  onRemove: (query: string) => void;
}

export function RecentSearches({ searches, onSelect, onRemove }: RecentSearchesProps) {
  if (searches.length === 0) {
    return (
      <View className="flex-1 items-center justify-center py-xxxl gap-md">
        <Ionicons name="time-outline" size={32} color={colors.textMuted} className="opacity-60" />
        <Text className="font-sans text-[15px] leading-[20px] text-muted-foreground text-center">
          {t('home.recentSearchesEmpty')}
        </Text>
      </View>
    );
  }

  return (
    <View className="pt-sm">
      <Text className="font-sans-semibold text-[13px] leading-[18px] text-muted-foreground uppercase mb-sm">
        {t('home.recentSearchesHeading')}
      </Text>
      {searches.map((query, index) => (
        <View
          key={query}
          className={`flex-row items-center ${index === searches.length - 1 ? '' : 'border-b border-border'}`}
        >
          <Pressable className="flex-1 flex-row items-center gap-md py-md" onPress={() => onSelect(query)}>
            <Ionicons name="time-outline" size={18} color={colors.textMuted} />
            <Text className="font-sans text-[15px] leading-[20px] text-foreground flex-1" numberOfLines={1}>
              {query}
            </Text>
          </Pressable>
          <Pressable className="py-md pl-md" hitSlop={8} onPress={() => onRemove(query)}>
            <Ionicons name="close" size={18} color={colors.textMuted} />
          </Pressable>
        </View>
      ))}
    </View>
  );
}
