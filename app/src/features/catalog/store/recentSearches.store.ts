import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const MAX_RECENT_SEARCHES = 10;

interface RecentSearchesState {
  searches: string[];
  addSearch: (query: string) => void;
  clearSearches: () => void;
}

export const useRecentSearchesStore = create<RecentSearchesState>()(
  persist(
    (set) => ({
      searches: [],
      addSearch: (query) =>
        set((state) => {
          const trimmed = query.trim();
          if (!trimmed) return state;
          const withoutDuplicate = state.searches.filter(
            (existing) => existing.toLowerCase() !== trimmed.toLowerCase(),
          );
          return { searches: [trimmed, ...withoutDuplicate].slice(0, MAX_RECENT_SEARCHES) };
        }),
      clearSearches: () => set({ searches: [] }),
    }),
    {
      name: 'recent-searches',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
