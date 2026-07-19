import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  InterTight_600SemiBold,
  InterTight_700Bold,
} from '@expo-google-fonts/inter-tight';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { t } from '@/i18n';
import { colors } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => {
  // no-op — safe to ignore if it's already hidden or unsupported on this platform
});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    InterTight_600SemiBold,
    InterTight_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {
        // no-op
      });
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      {/* color-scheme: light — the app is light-only for now (see theme/colors.ts) */}
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.textPrimary,
          headerTitleStyle: { fontFamily: 'InterTight_600SemiBold' },
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
        <Stack.Screen name="checkout/payment" options={{ title: t('navigation.paymentInstructions') }} />
        <Stack.Screen name="order-lookup" options={{ title: t('navigation.orderLookup') }} />
      </Stack>
    </SafeAreaProvider>
  );
}
