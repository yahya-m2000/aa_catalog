import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { t } from '@/i18n';
import { colors } from '@/theme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.textPrimary,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="product/[id]" options={{ title: t('navigation.product') }} />
        <Stack.Screen name="checkout" options={{ title: t('navigation.checkout') }} />
        <Stack.Screen
          name="checkout/success"
          options={{ title: t('navigation.orderPlaced'), headerLeft: () => null }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
