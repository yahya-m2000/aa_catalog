import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { Toast, ToastTitle, useToast } from '../../components/ui/toast';
import { colors } from '@/theme';

const TOAST_DURATION_MS = 2000;

/**
 * Thin wrapper over gluestack's useToast() that preserves this app's
 * original one-line `showToast(message)` call shape at every call site
 * (Home, Search, Product Detail) instead of inlining `show({ render })`
 * everywhere. Visual: dark pill + checkmark, matching the app's prior
 * hand-rolled Toast.tsx, now using gluestack's real animated lifecycle
 * (SlideInUp) instead of a manual Animated.timing sequence.
 */
export function useAppToast() {
  const toast = useToast();

  const showToast = (message: string) => {
    toast.show({
      placement: 'bottom',
      duration: TOAST_DURATION_MS,
      render: ({ id }) => (
        <Toast
          nativeID={`toast-${id}`}
          action="success"
          variant="solid"
          className="bg-primary rounded-md flex-row items-center gap-sm mx-lg"
        >
          <View className="flex-row items-center gap-sm">
            <Ionicons name="checkmark-circle" size={18} color={colors.success} />
            <ToastTitle className="text-primary-foreground font-sans-semibold">{message}</ToastTitle>
          </View>
        </Toast>
      ),
    });
  };

  return { showToast };
}
