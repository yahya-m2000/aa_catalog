import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import { useTabBarTranslateY } from './tabBarVisibility';
import { colors } from '@/theme';

const TAB_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  index: 'home-outline',
  basket: 'cart-outline',
  settings: 'cog-outline',
};

export function AnimatedTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const translateY = useTabBarTranslateY();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      className="absolute left-0 right-0 bottom-0"
      style={[animatedStyle]}
      pointerEvents="box-none"
    >
      <BlurView
        intensity={80}
        tint="light"
        className="flex-row border-t border-border"
        style={{ paddingBottom: insets.bottom }}
      >
        <View className="absolute inset-0 bg-background" style={{ opacity: 0.85 }} pointerEvents="none" />
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const iconName = TAB_ICONS[route.name] ?? 'ellipse-outline';

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.title ?? route.name}
              onPress={onPress}
              className="flex-1 items-center justify-center pt-md pb-sm"
            >
              <Ionicons name={iconName} size={28} color={isFocused ? colors.textPrimary : colors.textMuted} />
            </Pressable>
          );
        })}
      </BlurView>
    </Animated.View>
  );
}
