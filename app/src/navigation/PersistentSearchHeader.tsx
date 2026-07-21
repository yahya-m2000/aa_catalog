import { Ionicons } from '@expo/vector-icons';
import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';
import { usePathname, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Keyboard, Pressable, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, Line, LinearGradient, Mask, Pattern, Rect, Stop } from 'react-native-svg';

import { t } from '@/i18n';
import { useRecentSearchesStore } from '@/features/catalog/store/recentSearches.store';
import { useSearchInputStore } from './searchInput.store';
import { colors } from '@/theme';

const STRIPE_SPACING = 12;
const TRANSITION_MS = 450;
const EASING = Easing.bezier(0.4, 0, 0.2, 1);

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedIonicons = Animated.createAnimatedComponent(Ionicons);

// Routes that show a plain titled header (back button + title, no search
// pill) instead of the search pill — transactional flows where "search"
// doesn't make sense mid-task. Still the same physical header component,
// never unmounted, so the transition into/out of these routes animates
// like every other header state instead of jump-cutting to a native header.
const TITLED_ROUTES: { prefix: string; titleKey: string; noBack?: boolean }[] = [
  { prefix: '/checkout/success', titleKey: 'navigation.orderPlaced', noBack: true },
  { prefix: '/checkout/payment', titleKey: 'navigation.paymentInstructions' },
  { prefix: '/checkout', titleKey: 'navigation.checkout' },
  { prefix: '/order-lookup', titleKey: 'navigation.orderLookup' },
];

function findTitledRoute(pathname: string) {
  return TITLED_ROUTES.find((route) => pathname.startsWith(route.prefix));
}

// Routes where the header shows the cardboard/pinstripe treatment instead of glass.
function isCardboardRoute(pathname: string): boolean {
  return pathname.startsWith('/search') || pathname.startsWith('/product/');
}

/**
 * One physical header, mounted once in the root layout above the entire
 * <Stack>, so it never unmounts/remounts across navigation — only its
 * background (glass vs. cardboard) and content (search pill vs. title) change,
 * driven by the current pathname, and those changes cross-fade/ease rather
 * than snap. Every layer that can differ between states is always mounted,
 * stacked, with only opacity/size animated — swapping which JSX tree renders
 * would defeat the cross-fade entirely (this is exactly what caused the
 * jump-cut transition into checkout/order-lookup when those screens used to
 * fall back to expo-router's native header instead of this component).
 */
export function PersistentSearchHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);

  const query = useSearchInputStore((state) => state.query);
  const setQuery = useSearchInputStore((state) => state.setQuery);
  const submit = useSearchInputStore((state) => state.submit);
  const addSearch = useRecentSearchesStore((state) => state.addSearch);

  const titledRoute = findTitledRoute(pathname);
  const titled = titledRoute !== undefined;
  const cardboard = !titled && isCardboardRoute(pathname);
  const showBack = titledRoute
    ? !titledRoute.noBack
    : pathname !== '/' && pathname !== '/basket' && pathname !== '/settings';

  const progress = useSharedValue(cardboard ? 1 : 0);
  const backProgress = useSharedValue(showBack ? 1 : 0);
  const titleProgress = useSharedValue(titled ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(cardboard ? 1 : 0, { duration: TRANSITION_MS, easing: EASING });
  }, [cardboard, progress]);

  useEffect(() => {
    backProgress.value = withTiming(showBack ? 1 : 0, { duration: TRANSITION_MS, easing: EASING });
  }, [showBack, backProgress]);

  useEffect(() => {
    titleProgress.value = withTiming(titled ? 1 : 0, { duration: TRANSITION_MS, easing: EASING });
  }, [titled, titleProgress]);

  const cardboardLayerStyle = useAnimatedStyle(() => ({ opacity: progress.value }));

  const pillStyle = useAnimatedStyle(() => ({
    opacity: 1 - titleProgress.value,
    borderColor: interpolateColor(progress.value, [0, 1], [colors.border, colors.cardboard]),
    borderWidth: 1 - progress.value,
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleProgress.value,
  }));

  const iconColorProps = useAnimatedProps(() => ({
    color: interpolateColor(progress.value, [0, 1], [colors.textPrimary, colors.cardboardText]),
  }));

  const backButtonStyle = useAnimatedStyle(() => ({
    width: 22 * backProgress.value,
    marginRight: 8 * backProgress.value,
    opacity: backProgress.value,
    transform: [{ scale: 0.5 + 0.5 * backProgress.value }],
  }));

  const handleSubmit = () => {
    const trimmed = query.trim();
    if (trimmed) addSearch(trimmed);
    Keyboard.dismiss();
    if (pathname.startsWith('/search')) {
      submit(trimmed);
    } else {
      router.push(trimmed ? { pathname: '/search', params: { q: trimmed } } : '/search');
    }
  };

  const handleFocus = () => {
    if (!pathname.startsWith('/search')) {
      router.push('/search');
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View className="overflow-hidden">
      {/*
        No native blur here — expo-blur's Android blur (dimezisBlurView, and
        every other RN blur library, all wrapping the same underlying
        Dimezis/BlurView) needs a react-native-screens Screen ancestor to
        sample cleanly. This header lives above the whole <Stack> (that's
        what lets it persist across navigation without remounting), so it
        has no Screen ancestor — any native blur here ends up sampling the
        whole app-window root instead, which corrupts as screens swap
        underneath it during navigation. This is a layered-gradient "frosted
        glass" illusion instead: a soft white wash + a subtle top highlight,
        immune to corruption since it never samples the live view tree.
      */}
      <View
        pointerEvents="none"
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        className="border-b border-border"
      >
        <View className="absolute inset-0 bg-background" style={{ opacity: 0.9 }} />
        <ExpoLinearGradient
          colors={['#FFFFFFCC', '#FFFFFF66', '#FFFFFF00']}
          locations={[0, 0.6, 1]}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '60%' }}
        />
      </View>

      <Animated.View
        pointerEvents="none"
        style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: colors.cardboard }, cardboardLayerStyle]}
      >
        <Svg width="100%" height={140} style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
          <Defs>
            <Pattern id="stripes" patternUnits="userSpaceOnUse" width={STRIPE_SPACING} height={STRIPE_SPACING}>
              <Rect width={STRIPE_SPACING} height={STRIPE_SPACING} fill={colors.cardboard} />
              <Line
                x1={STRIPE_SPACING / 2}
                y1="0"
                x2={STRIPE_SPACING / 2}
                y2={STRIPE_SPACING}
                stroke={colors.cardboardStripe}
                strokeWidth={3}
                strokeOpacity={0.6}
              />
            </Pattern>
            <LinearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#FFFFFF" stopOpacity={1} />
              <Stop offset="0.75" stopColor="#FFFFFF" stopOpacity={0.35} />
              <Stop offset="1" stopColor="#FFFFFF" stopOpacity={0} />
            </LinearGradient>
            <Mask id="fadeMask">
              <Rect width="100%" height="100%" fill="url(#fade)" />
            </Mask>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#stripes)" mask="url(#fadeMask)" />
        </Svg>
      </Animated.View>

      <View className="flex-row items-center px-lg pb-md" style={{ paddingTop: insets.top }}>
        <Animated.View style={[{ overflow: 'hidden' }, backButtonStyle]}>
          <Pressable onPress={handleBack} hitSlop={8}>
            <AnimatedIonicons name="chevron-back" size={22} animatedProps={iconColorProps} />
          </Pressable>
        </Animated.View>

        <View className="flex-1">
          <AnimatedPressable
            style={pillStyle}
            className="flex-row items-center rounded-full px-lg bg-background"
            onPress={() => inputRef.current?.focus()}
            pointerEvents={titled ? 'none' : 'auto'}
          >
            <AnimatedIonicons name="search" size={22} animatedProps={iconColorProps} className="mr-sm" />
            <TextInput
              ref={inputRef}
              value={query}
              onChangeText={setQuery}
              onFocus={handleFocus}
              onSubmitEditing={handleSubmit}
              placeholder={t('home.searchPlaceholder')}
              placeholderTextColor={colors.textSecondary}
              className="flex-1 py-lg font-sans-medium text-[17px] leading-[22px] text-foreground"
              returnKeyType="search"
              autoCorrect={false}
            />
            {query.length > 0 ? (
              <Pressable onPress={() => setQuery('')} hitSlop={8}>
                <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
              </Pressable>
            ) : null}
          </AnimatedPressable>

          <Animated.View
            style={[
              { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', paddingLeft: 12 },
              titleStyle,
            ]}
            pointerEvents="none"
          >
            <Text className="font-sans-bold text-[20px] leading-[26px]" style={{ color: colors.textPrimary }}>
              {titledRoute ? t(titledRoute.titleKey) : ''}
            </Text>
          </Animated.View>
        </View>
      </View>
    </View>
  );
}
