import { Tabs } from 'expo-router';

import { AnimatedTabBar } from '@/navigation/AnimatedTabBar';
import { TabBarVisibilityContext, useTabBarVisibilityValue } from '@/navigation/tabBarVisibility';

export default function TabsLayout() {
  const tabBarTranslateY = useTabBarVisibilityValue();

  return (
    <TabBarVisibilityContext.Provider value={tabBarTranslateY}>
      <Tabs tabBar={(props) => <AnimatedTabBar {...props} />} screenOptions={{ headerShown: false }}>
        <Tabs.Screen name="index" />
        <Tabs.Screen name="basket" />
        <Tabs.Screen name="settings" />
      </Tabs>
    </TabBarVisibilityContext.Provider>
  );
}
