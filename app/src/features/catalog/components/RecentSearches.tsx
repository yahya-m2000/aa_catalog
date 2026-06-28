import { Pressable, StyleSheet, Text, View } from 'react-native';

import { t } from '@/i18n';
import { colors, radius, spacing, typography } from '@/theme';

interface RecentSearchesProps {
  searches: string[];
  onSelect: (query: string) => void;
}

export function RecentSearches({ searches, onSelect }: RecentSearchesProps) {
  if (searches.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{t('home.recentSearchesEmpty')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>{t('home.recentSearchesHeading')}</Text>
      <View style={styles.chipRow}>
        {searches.map((query) => (
          <Pressable key={query} style={styles.chip} onPress={() => onSelect(query)}>
            <Text style={styles.chipLabel}>{query}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
  },
  heading: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
