import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Linking, ScrollView, View } from 'react-native';

import { Text } from '@/components/Text';
import { useRecentSearchesStore } from '@/features/catalog/store/recentSearches.store';
import { SettingsRow } from '@/features/settings/components/SettingsRow';
import { colors, spacing } from '@/theme';
import { t } from '@/i18n';

const SUPPORT_EMAIL = 'support@example.com';

export function SettingsScreen() {
  const router = useRouter();
  const clearSearches = useRecentSearchesStore((state) => state.clearSearches);
  const [clearConfirmation, setClearConfirmation] = useState(false);

  const handleContactSupport = () => {
    Linking.openURL(`mailto:${SUPPORT_EMAIL}`);
  };

  const handleClearRecentSearches = () => {
    clearSearches();
    setClearConfirmation(true);
  };

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: spacing.lg }}>
      <View className="mb-xl">
        <Text
          variant="captionStrong"
          color={colors.textMuted}
          style={{ textTransform: 'uppercase', marginBottom: spacing.sm, marginLeft: spacing.xs }}
        >
          {t('settings.sectionOrders')}
        </Text>
        <SettingsRow
          label={t('orderLookup.settingsLinkLabel')}
          onPress={() => router.push('/order-lookup')}
          isLast
        />
      </View>

      <View className="mb-xl">
        <Text
          variant="captionStrong"
          color={colors.textMuted}
          style={{ textTransform: 'uppercase', marginBottom: spacing.sm, marginLeft: spacing.xs }}
        >
          {t('settings.sectionPreferences')}
        </Text>
        <SettingsRow label={t('settings.currencyLabel')} value={t('settings.currencyValue')} />
        <SettingsRow label={t('settings.languageLabel')} value={t('settings.languageValue')} isLast />
      </View>

      <View className="mb-xl">
        <Text
          variant="captionStrong"
          color={colors.textMuted}
          style={{ textTransform: 'uppercase', marginBottom: spacing.sm, marginLeft: spacing.xs }}
        >
          {t('settings.sectionData')}
        </Text>
        <SettingsRow
          label={t('settings.savedDeliveryDetailsLabel')}
          value={t('settings.savedDeliveryDetailsValue')}
        />
        <SettingsRow
          label={t('settings.clearRecentSearchesLabel')}
          onPress={handleClearRecentSearches}
          isLast
        />
        {clearConfirmation ? (
          <Text variant="caption" color={colors.success} style={{ paddingTop: spacing.sm }}>
            {t('settings.clearRecentSearchesConfirmation')}
          </Text>
        ) : null}
      </View>

      <View className="mb-xl">
        <Text
          variant="captionStrong"
          color={colors.textMuted}
          style={{ textTransform: 'uppercase', marginBottom: spacing.sm, marginLeft: spacing.xs }}
        >
          {t('settings.sectionAbout')}
        </Text>
        <SettingsRow label={t('settings.contactSupportLabel')} onPress={handleContactSupport} />
        <SettingsRow label={t('settings.termsLabel')} />
        <SettingsRow
          label={t('settings.appVersionLabel')}
          value={Constants.expoConfig?.version ?? '1.0.0'}
          isLast
        />
      </View>
    </ScrollView>
  );
}
