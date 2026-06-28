import { Tabs } from 'expo-router';

import { t } from '@/i18n';
import { colors } from '@/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.textPrimary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarActiveTintColor: colors.purpleLight,
        tabBarInactiveTintColor: colors.textMuted,
      }}
    >
      <Tabs.Screen name="index" options={{ title: t('navigation.home') }} />
      <Tabs.Screen name="basket" options={{ title: t('navigation.basket') }} />
      <Tabs.Screen name="settings" options={{ title: t('navigation.settings') }} />
    </Tabs>
  );
}
