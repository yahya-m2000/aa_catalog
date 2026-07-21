import { createContext, useContext, useRef } from 'react';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { useSharedValue, withTiming, type SharedValue } from 'react-native-reanimated';

const HIDE_THRESHOLD = 12;

export const TabBarVisibilityContext = createContext<SharedValue<number> | null>(null);

export function useTabBarTranslateY(): SharedValue<number> {
  const value = useContext(TabBarVisibilityContext);
  if (!value) {
    throw new Error('useTabBarTranslateY must be used within TabBarVisibilityContext.Provider');
  }
  return value;
}

export function useTabBarVisibilityValue(): SharedValue<number> {
  return useSharedValue(0);
}

export function useTabBarScrollHandler(barHeight: number) {
  const translateY = useTabBarTranslateY();
  const lastOffset = useRef(0);
  const accumulated = useRef(0);
  const currentlyHidden = useRef(false);

  return (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const delta = offsetY - lastOffset.current;
    lastOffset.current = offsetY;

    if (offsetY <= 0) {
      accumulated.current = 0;
      if (currentlyHidden.current) {
        translateY.value = withTiming(0, { duration: 200 });
        currentlyHidden.current = false;
      }
      return;
    }

    // Reset the accumulator whenever direction flips, so a change in
    // direction is picked up immediately rather than being cancelled out
    // by distance scrolled the other way beforehand.
    if ((delta > 0 && accumulated.current < 0) || (delta < 0 && accumulated.current > 0)) {
      accumulated.current = 0;
    }
    accumulated.current += delta;

    if (accumulated.current > HIDE_THRESHOLD && !currentlyHidden.current) {
      translateY.value = withTiming(barHeight, { duration: 200 });
      currentlyHidden.current = true;
      accumulated.current = 0;
    } else if (accumulated.current < -HIDE_THRESHOLD && currentlyHidden.current) {
      translateY.value = withTiming(0, { duration: 200 });
      currentlyHidden.current = false;
      accumulated.current = 0;
    }
  };
}
