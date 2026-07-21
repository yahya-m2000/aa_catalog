import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import { colors, spacing } from '@/theme';

interface HeroBannerProps {
  title: string;
  subtitle: string;
  ctaLabel: string;
  imageUrl?: string;
  onPress: () => void;
}

export function HeroBanner({ title, subtitle, ctaLabel, imageUrl, onPress }: HeroBannerProps) {
  return (
    <Pressable
      className="mb-xl rounded-md overflow-hidden bg-primary"
      style={{ aspectRatio: 4 / 5, marginLeft: spacing.lg, marginRight: spacing.lg }}
      onPress={onPress}
    >
      <Image
        source={imageUrl ? { uri: imageUrl } : undefined}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
        transition={150}
      />
      <LinearGradient
        colors={['#00000000', '#00000066', '#000000CC']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />
      <View className="flex-1 justify-end p-xl">
        <Text variant="display" style={styles.title}>
          {title}
        </Text>
        <Text variant="body" style={styles.subtitle}>
          {subtitle}
        </Text>
        <Button label={ctaLabel} variant="secondary" onPress={onPress} style={styles.cta} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.white,
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: colors.white,
    opacity: 0.85,
    marginBottom: spacing.lg,
  },
  cta: {
    alignSelf: 'flex-start',
  },
});
