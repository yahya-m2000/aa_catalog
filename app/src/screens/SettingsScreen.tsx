import Constants from 'expo-constants';
import { useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text } from 'react-native';

import { useRecentSearchesStore } from '@/features/catalog/store/recentSearches.store';
import { SettingsRow } from '@/features/settings/components/SettingsRow';
import { colors, spacing, typography } from '@/theme';
import { t } from '@/i18n';

const SUPPORT_EMAIL = 'support@example.com';

export function SettingsScreen() {
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SettingsRow label={t('settings.currencyLabel')} value={t('settings.currencyValue')} />
      <SettingsRow label={t('settings.languageLabel')} value={t('settings.languageValue')} />
      <SettingsRow label={t('settings.contactSupportLabel')} onPress={handleContactSupport} />
      <SettingsRow
        label={t('settings.savedDeliveryDetailsLabel')}
        value={t('settings.savedDeliveryDetailsValue')}
      />
      <SettingsRow label={t('settings.clearRecentSearchesLabel')} onPress={handleClearRecentSearches} />
      {clearConfirmation ? (
        <Text style={styles.confirmation}>{t('settings.clearRecentSearchesConfirmation')}</Text>
      ) : null}
      <SettingsRow label={t('settings.termsLabel')} />
      <SettingsRow label={t('settings.appVersionLabel')} value={Constants.expoConfig?.version ?? '1.0.0'} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  confirmation: {
    ...typography.caption,
    color: colors.success,
    paddingVertical: spacing.sm,
  },
});
