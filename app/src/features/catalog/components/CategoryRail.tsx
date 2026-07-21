import { Pressable, ScrollView, Text, View } from 'react-native';

export interface CategoryRailItem {
  label: string;
}

interface CategoryRailProps {
  categories: CategoryRailItem[];
  onSelect: (category: string) => void;
}

function initials(label: string): string {
  return label.trim().slice(0, 1).toUpperCase();
}

const CIRCLE_SIZE = 52;

export function CategoryRail({ categories, onSelect }: CategoryRailProps) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="flex-grow-0 flex-shrink-0 mb-xl"
      contentContainerClassName="px-lg gap-lg"
    >
      {categories.map((category) => (
        <Pressable
          key={category.label}
          className="items-center"
          style={{ width: CIRCLE_SIZE + 16 }}
          onPress={() => onSelect(category.label)}
        >
          <View
            className="bg-primary items-center justify-center mb-xs"
            style={{ width: CIRCLE_SIZE, height: CIRCLE_SIZE, borderRadius: CIRCLE_SIZE / 2 }}
          >
            <Text className="font-display-bold text-[19px] leading-[24px] text-primary-foreground">
              {initials(category.label)}
            </Text>
          </View>
          <Text
            className="font-sans text-[12px] leading-[16px] text-muted-foreground text-center"
            numberOfLines={1}
          >
            {category.label}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}
