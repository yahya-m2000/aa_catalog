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
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import '../../globals.css';
import { GluestackUIProvider } from '../../components/ui/gluestack-ui-provider';
import { PersistentSearchHeader } from '@/navigation/PersistentSearchHeader';
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
    <GluestackUIProvider mode="light">
      <SafeAreaProvider>
        {/* color-scheme: light — the app is light-only for now (see theme/colors.ts) */}
        <StatusBar style="dark" />
        <PersistentSearchHeader />
        <View style={{ flex: 1 }}>
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: colors.background },
              headerTintColor: colors.textPrimary,
              headerTitleStyle: { fontFamily: 'InterTight_600SemiBold' },
              contentStyle: { backgroundColor: colors.background },
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="search"
              options={{ headerShown: false, animation: 'fade_from_bottom', animationDuration: 220 }}
            />
            <Stack.Screen name="product/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="checkout" options={{ headerShown: false }} />
            <Stack.Screen name="checkout/success" options={{ headerShown: false }} />
            <Stack.Screen name="checkout/payment" options={{ headerShown: false }} />
            <Stack.Screen name="order-lookup" options={{ headerShown: false }} />
          </Stack>
        </View>
      </SafeAreaProvider>
    </GluestackUIProvider>
  );
}
